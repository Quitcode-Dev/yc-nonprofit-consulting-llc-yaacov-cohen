import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';
import { createDecipheriv } from 'crypto';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Decryption helper (mirrors parent route)
// ---------------------------------------------------------------------------
function getEncryptionKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY env var must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

function decrypt(stored: string): string {
  const key = getEncryptionKey();
  const [ivHex, tagHex, dataHex] = stored.split(':');
  if (!ivHex || !tagHex || !dataHex) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final('utf8');
}

// ---------------------------------------------------------------------------
// Bloomerang API helpers
// ---------------------------------------------------------------------------
interface BloomerangConstituent {
  Id: number;
  FirstName?: string;
  LastName?: string;
  PrimaryEmail?: { Value?: string };
  PrimaryPhone?: { Value?: string };
}

interface BloomerangTransaction {
  Id: number;
  AccountId: number; // constituent Id
  Date: string;
  Amount: number;
  Type?: string;
}

interface BloomerangListResponse<T> {
  Total: number;
  Results: T[];
}

async function fetchAllConstituents(apiKey: string): Promise<BloomerangConstituent[]> {
  const all: BloomerangConstituent[] = [];
  const take = 50;
  let skip = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(
        `https://api.bloomerang.co/v2/constituents?take=${take}&skip=${skip}`,
        { headers: { 'X-API-KEY': apiKey }, signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error(`Bloomerang constituents API error: ${res.status}`);
    }

    const body = (await res.json()) as BloomerangListResponse<BloomerangConstituent>;
    all.push(...body.Results);

    if (all.length >= body.Total || body.Results.length === 0) break;
    skip += take;
  }

  return all;
}

async function fetchAllTransactions(apiKey: string): Promise<BloomerangTransaction[]> {
  const all: BloomerangTransaction[] = [];
  const take = 50;
  let skip = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(
        `https://api.bloomerang.co/v2/transactions?take=${take}&skip=${skip}`,
        { headers: { 'X-API-KEY': apiKey }, signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error(`Bloomerang transactions API error: ${res.status}`);
    }

    const body = (await res.json()) as BloomerangListResponse<BloomerangTransaction>;
    all.push(...body.Results);

    if (all.length >= body.Total || body.Results.length === 0) break;
    skip += take;
  }

  return all;
}

// ---------------------------------------------------------------------------
// POST /api/organizations/[id]/bloomerang/sync
// ---------------------------------------------------------------------------
export async function POST(_request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

  // ── Auth ──────────────────────────────────────────────────────────────────
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    assertRole(profile, ['super_admin', 'org_admin']);
    assertOrgAccess(profile, orgId);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createClient();

  // ── Fetch bloomerang config ───────────────────────────────────────────────
  const { data: config, error: configError } = await supabase
    .from('bloomerang_configs')
    .select('api_key_encrypted')
    .eq('organization_id', orgId)
    .maybeSingle();

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 });
  }

  if (!config?.api_key_encrypted) {
    return NextResponse.json(
      { error: 'No Bloomerang API key configured for this organization' },
      { status: 400 }
    );
  }

  let apiKey: string;
  try {
    apiKey = decrypt(config.api_key_encrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // ── Sync ──────────────────────────────────────────────────────────────────
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsSkipped = 0;
  const errors: { reason: string }[] = [];

  // Map bloomerang_id -> internal donor id (populated during constituent sync)
  const bloomerangIdToDonorId = new Map<number, string>();

  try {
    // ── 1. Fetch all constituents ───────────────────────────────────────────
    const constituents = await fetchAllConstituents(apiKey);

    for (const c of constituents) {
      const firstName = c.FirstName?.trim() ?? '';
      const lastName = c.LastName?.trim() ?? '';

      if (!firstName && !lastName) {
        recordsSkipped++;
        errors.push({
          reason: `Constituent Id=${c.Id} skipped: missing both FirstName and LastName`,
        });
        continue;
      }

      const email = c.PrimaryEmail?.Value?.trim() ?? null;
      const phone = c.PrimaryPhone?.Value?.trim() ?? null;

      // Check for existing donor by bloomerang_id
      const { data: existing, error: lookupError } = await supabase
        .from('donors')
        .select('id')
        .eq('organization_id', orgId)
        .eq('bloomerang_id', c.Id)
        .maybeSingle();

      if (lookupError) {
        errors.push({ reason: `Constituent Id=${c.Id} lookup error: ${lookupError.message}` });
        continue;
      }

      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from('donors')
          .update({
            first_name: firstName || null,
            last_name: lastName || null,
            name: [firstName, lastName].filter(Boolean).join(' ') || null,
            email,
            phone,
          } as never)
          .eq('id', existing.id);

        if (updateError) {
          errors.push({ reason: `Constituent Id=${c.Id} update error: ${updateError.message}` });
          continue;
        }

        bloomerangIdToDonorId.set(c.Id, existing.id);
        recordsUpdated++;
      } else {
        // Insert
        const { data: inserted, error: insertError } = await supabase
          .from('donors')
          .insert({
            organization_id: orgId,
            bloomerang_id: c.Id,
            first_name: firstName || null,
            last_name: lastName || null,
            name: [firstName, lastName].filter(Boolean).join(' ') || null,
            email,
            phone,
            total_score: 0,
          } as never)
          .select('id')
          .single();

        if (insertError) {
          errors.push({ reason: `Constituent Id=${c.Id} insert error: ${insertError.message}` });
          continue;
        }

        bloomerangIdToDonorId.set(c.Id, inserted.id);
        recordsCreated++;
      }
    }

    // ── 2. Fetch and store transactions ────────────────────────────────────
    const transactions = await fetchAllTransactions(apiKey);

    for (const t of transactions) {
      const donorId = bloomerangIdToDonorId.get(t.AccountId);
      if (!donorId) {
        // Constituent was skipped or not found — skip transaction silently
        continue;
      }

      const { error: txError } = await supabase
        .from('donations')
        .insert(
          {
            donor_id: donorId,
            organization_id: orgId,
            amount: t.Amount,
            donated_at: t.Date,
            donation_type: t.Type ?? null,
          } as never
        );

      if (txError) {
        errors.push({
          reason: `Transaction Id=${t.Id} upsert error: ${txError.message}`,
        });
      }
    }

    // ── 3. Update bloomerang_configs ───────────────────────────────────────
    const syncedCount = recordsCreated + recordsUpdated;
    await supabase
      .from('bloomerang_configs')
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: 'success',
        synced_record_count: syncedCount,
      })
      .eq('organization_id', orgId);

    // ── 4. Create import_log entry ─────────────────────────────────────────
    await supabase.from('import_logs').insert({
      organization_id: orgId,
      type: 'bloomerang',
      records_created: recordsCreated,
      records_updated: recordsUpdated,
      records_skipped: recordsSkipped,
      error_count: errors.length,
      status: 'success',
    });

    return NextResponse.json({
      records_created: recordsCreated,
      records_updated: recordsUpdated,
      records_skipped: recordsSkipped,
      errors,
    });
  } catch (err) {
    console.error('Bloomerang sync error:', err);

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    // Update bloomerang_configs to failed
    await supabase
      .from('bloomerang_configs')
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: 'failed',
      })
      .eq('organization_id', orgId);

    // Create import_log entry for failure
    await supabase.from('import_logs').insert({
      organization_id: orgId,
      type: 'bloomerang',
      records_created: recordsCreated,
      records_updated: recordsUpdated,
      records_skipped: recordsSkipped,
      error_count: errors.length + 1,
      status: 'failed',
    });

    return NextResponse.json(
      {
        error: errorMessage,
        records_created: recordsCreated,
        records_updated: recordsUpdated,
        records_skipped: recordsSkipped,
        errors: [...errors, { reason: errorMessage }],
      },
      { status: 500 }
    );
  }
}
