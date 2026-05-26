import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/getAuthenticatedUser';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ImportRow {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  capacity?: string;
  [key: string]: string | undefined;
}

interface ImportError {
  row: number;
  reason: string;
}

// Map a raw CSV row through the user-supplied column→field mappings
function applyMappings(
  rawRow: Record<string, string>,
  mappings: Record<string, string>,
): ImportRow {
  const mapped: ImportRow = {};
  for (const [csvCol, platformField] of Object.entries(mappings)) {
    if (platformField === 'skip') continue;
    const value = rawRow[csvCol]?.trim() ?? '';
    if (value) mapped[platformField] = value;
  }
  return mapped;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: orgId } = await context.params;

  // ── 1. Auth ──────────────────────────────────────────────────────────────
  let profile: Awaited<ReturnType<typeof getAuthenticatedUser>>['profile'];
  try {
    const auth = await getAuthenticatedUser();
    profile = auth.profile;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = profile?.role as string | undefined;
  if (role !== 'super_admin' && role !== 'org_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // org_admin may only import into their own org
  if (role === 'org_admin' && profile?.organization_id !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let body: { mappings?: Record<string, string>; rows?: Record<string, string>[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { mappings, rows } = body;

  if (!mappings || typeof mappings !== 'object') {
    return NextResponse.json({ error: 'mappings is required' }, { status: 400 });
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'rows is required and must be a non-empty array' }, { status: 400 });
  }

  // ── 3. Validate required fields are mapped ───────────────────────────────
  const mappedFields = Object.values(mappings);
  if (!mappedFields.includes('first_name') || !mappedFields.includes('last_name')) {
    return NextResponse.json(
      { error: 'first_name and last_name mappings are required' },
      { status: 400 },
    );
  }

  // ── 4. Process rows ──────────────────────────────────────────────────────
  const supabase = await createClient();

  // Fetch existing emails for this org to detect duplicates
  const { data: existingDonors } = await supabase
    .from('donors')
    .select('email')
    .eq('organization_id', orgId)
    .not('email', 'is', null);

  const existingEmails = new Set(
    (existingDonors ?? []).map((d: { email: string }) => d.email?.toLowerCase()).filter(Boolean),
  );

  const toInsert: object[] = [];
  const errors: ImportError[] = [];
  let records_skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // 1-based + header row
    const raw = rows[i];
    const mapped = applyMappings(raw, mappings);

    // Required field validation
    if (!mapped.first_name) {
      errors.push({ row: rowNumber, reason: 'Missing required field: first_name' });
      continue;
    }
    if (!mapped.last_name) {
      errors.push({ row: rowNumber, reason: 'Missing required field: last_name' });
      continue;
    }

    // Email duplicate check
    if (mapped.email) {
      const emailLower = mapped.email.toLowerCase();
      if (existingEmails.has(emailLower)) {
        records_skipped++;
        continue;
      }
      existingEmails.add(emailLower); // prevent intra-batch duplicates
    }

    // Capacity coercion
    let capacity: number | null = null;
    if (mapped.capacity) {
      // Strip currency symbols / commas
      const cleaned = mapped.capacity.replace(/[$,\s]/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed >= 0) {
        capacity = parsed;
      } else {
        errors.push({ row: rowNumber, reason: `Invalid capacity value: "${mapped.capacity}"` });
        continue;
      }
    }

    toInsert.push({
      organization_id: orgId,
      first_name: mapped.first_name,
      last_name: mapped.last_name,
      name: `${mapped.first_name} ${mapped.last_name}`,
      email: mapped.email ?? null,
      phone: mapped.phone ?? null,
      capacity: capacity,
      total_score: 0,
    });
  }

  // ── 5. Bulk insert ───────────────────────────────────────────────────────
  let records_created = 0;

  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('donors')
      .insert(toInsert)
      .select('id');

    if (insertError) {
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 500 },
      );
    }

    records_created = inserted?.length ?? 0;
  }

  // ── 6. Log the import ────────────────────────────────────────────────────
  await supabase.from('import_logs').insert({
    organization_id: orgId,
    source: 'csv',
    records_created,
    records_skipped,
    error_count: errors.length,
    imported_by: profile?.id ?? null,
  });

  // ── 7. Return results ────────────────────────────────────────────────────
  return NextResponse.json({ records_created, records_skipped, errors });
}
