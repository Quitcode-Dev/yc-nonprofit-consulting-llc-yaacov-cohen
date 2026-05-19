import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, assertRole, assertOrgAccess } from '@/lib/auth/authorize';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Encryption helpers (AES-256-GCM)
// Requires ENCRYPTION_KEY env var: 64 hex chars (32 bytes)
// ---------------------------------------------------------------------------
function getEncryptionKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY env var must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store as iv:tag:ciphertext (all hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
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
// GET /api/organizations/[id]/bloomerang
// Returns connection status and sync metadata (no key material)
// ---------------------------------------------------------------------------
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    assertOrgAccess(profile, orgId);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bloomerang_configs')
    .select('api_key_encrypted, last_synced_at, last_sync_status, synced_record_count')
    .eq('organization_id', orgId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    has_key: !!data?.api_key_encrypted,
    last_synced_at: data?.last_synced_at ?? null,
    last_sync_status: data?.last_sync_status ?? null,
    synced_record_count: data?.synced_record_count ?? 0,
    // Return last 4 chars of decrypted key so UI can show masked value
    key_suffix: data?.api_key_encrypted
      ? (() => {
          try {
            const plain = decrypt(data.api_key_encrypted);
            return plain.slice(-4);
          } catch {
            return null;
          }
        })()
      : null,
  });
}

// ---------------------------------------------------------------------------
// POST /api/organizations/[id]/bloomerang
// Validates the supplied API key against Bloomerang, saves on success
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

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

  let body: { api_key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { api_key } = body;
  if (!api_key || typeof api_key !== 'string' || !api_key.trim()) {
    return NextResponse.json({ error: 'api_key is required' }, { status: 400 });
  }

  const trimmedKey = api_key.trim();

  // ── Validate key against Bloomerang ──────────────────────────────────────
  let bloomerangStatus: 'connected' | 'invalid_key' | 'connection_failed';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10 s timeout

    let bloomerangRes: Response;
    try {
      bloomerangRes = await fetch('https://api.bloomerang.co/v2/constituents?take=1', {
        method: 'GET',
        headers: { 'X-API-KEY': trimmedKey },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (bloomerangRes.ok) {
      bloomerangStatus = 'connected';
    } else if (bloomerangRes.status === 401 || bloomerangRes.status === 403) {
      bloomerangStatus = 'invalid_key';
    } else {
      bloomerangStatus = 'connection_failed';
    }
  } catch {
    bloomerangStatus = 'connection_failed';
  }

  if (bloomerangStatus !== 'connected') {
    return NextResponse.json({ status: bloomerangStatus }, { status: 200 });
  }

  // ── Encrypt and upsert ───────────────────────────────────────────────────
  let encryptedKey: string;
  try {
    encryptedKey = encrypt(trimmedKey);
  } catch (err) {
    console.error('Encryption error:', err);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = await createClient();
  const { error: upsertError } = await supabase
    .from('bloomerang_configs')
    .upsert(
      {
        organization_id: orgId,
        api_key_encrypted: encryptedKey,
      },
      { onConflict: 'organization_id' }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Return last 4 chars so UI can show masked value
  const keySuffix = trimmedKey.slice(-4);

  return NextResponse.json({ status: 'connected', key_suffix: keySuffix });
}
