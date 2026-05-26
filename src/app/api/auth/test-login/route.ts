import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const TEST_PASSWORD = 'TestDemo2024!!';
const DEMO_ORG_NAME = 'Demo Nonprofit';

type TestRole = 'super_admin' | 'org_admin';

const TEST_USERS: Record<TestRole, { email: string; full_name: string; db_role: string }> = {
  super_admin: { email: 'demo-superadmin@testlogin.dev', full_name: 'Super Admin', db_role: 'super_admin' },
  org_admin:   { email: 'demo-orgadmin@testlogin.dev',   full_name: 'Org Admin',   db_role: 'organization_admin' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureAuthUser(adminClient: SupabaseClient<any>, email: string): Promise<string | null> {
  const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error('[test-login] listUsers error:', listError.message);
    return null;
  }
  const existing = (listData?.users ?? []).find((u: { email?: string }) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error('[test-login] createUser error:', error.message);
    return null;
  }
  return data.user?.id ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedDemoData(adminClient: SupabaseClient<any>, orgId: string, orgAdminRoleId: string) {
  const now = new Date();

  // Move ideas
  for (const idea of [
    { name: 'Personal Thank You Call', methods: ['Phone'], purpose: ['Stewardship'], types: ['Feel Good'] },
    { name: 'Coffee Meeting',           methods: ['In Person'], purpose: ['Cultivation'], types: ['Relationship Building'] },
    { name: 'Site Visit',               methods: ['In Person'], purpose: ['Cultivation'], types: ['Relationship Building'] },
    { name: 'Send Impact Report',       methods: ['Email'],     purpose: ['Stewardship'], types: ['Information Sharing'] },
    { name: 'Major Gift Ask',           methods: ['In Person'], purpose: ['Solicitation'], types: ['Ask'] },
  ]) {
    const { error } = await adminClient.from('move_ideas').insert(
      { organization_id: orgId, is_global: false, ...idea } as never
    );
    if (error) console.error('[test-login] move_idea insert error:', error.message);
  }

  // Donors — only columns that actually exist on the table
  const donorRows = [
    { first_name: 'Margaret', last_name: 'Thornton', name: 'Margaret Thornton', email: 'margaret.thornton@example.com', total_score: 95, is_board_member: true, has_donor_advised_fund: false, is_parent: false, is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: false, is_community_builder: false },
    { first_name: 'Robert',   last_name: 'Calloway', name: 'Robert Calloway',   email: 'robert.calloway@example.com',   total_score: 88, is_board_member: false, has_donor_advised_fund: false, is_parent: false, is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: true, is_community_builder: false },
    { first_name: 'Patricia', last_name: 'Huang',    name: 'Patricia Huang',    email: 'patricia.huang@example.com',    total_score: 82, is_board_member: false, has_donor_advised_fund: true,  is_parent: false, is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: false, is_community_builder: false },
    { first_name: 'David',    last_name: 'Mercer',   name: 'David Mercer',      email: 'david.mercer@example.com',      total_score: 74, is_board_member: true,  has_donor_advised_fund: false, is_parent: true,  is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: false, is_community_builder: false },
    { first_name: 'Susan',    last_name: 'Papadopoulos', name: 'Susan Papadopoulos', email: 'susan.p@example.com',      total_score: 68, is_board_member: false, has_donor_advised_fund: false, is_parent: false, is_grandparent: false, is_alumni: true,  is_program_attendee: true,  is_organization_volunteer: false, is_community_builder: false },
    { first_name: 'James',    last_name: 'Whitfield', name: 'James Whitfield',  email: 'james.whitfield@example.com',   total_score: 65, is_board_member: false, has_donor_advised_fund: false, is_parent: true,  is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: true, is_community_builder: true },
    { first_name: 'Linda',    last_name: 'Nakamura',  name: 'Linda Nakamura',   email: 'linda.nakamura@example.com',    total_score: 58, is_board_member: false, has_donor_advised_fund: false, is_parent: false, is_grandparent: true,  is_alumni: false, is_program_attendee: false, is_organization_volunteer: false, is_community_builder: false },
    { first_name: 'Thomas',   last_name: 'Rivera',    name: 'Thomas Rivera',    email: 'thomas.rivera@example.com',     total_score: 52, is_board_member: false, has_donor_advised_fund: false, is_parent: false, is_grandparent: false, is_alumni: true,  is_program_attendee: true,  is_organization_volunteer: true, is_community_builder: false },
    { first_name: 'Barbara',  last_name: 'Osei',      name: 'Barbara Osei',     email: 'barbara.osei@example.com',      total_score: 45, is_board_member: false, has_donor_advised_fund: false, is_parent: false, is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: false, is_community_builder: true },
    { first_name: 'Michael',  last_name: 'Fitzgerald', name: 'Michael Fitzgerald', email: 'michael.fitz@example.com',  total_score: 38, is_board_member: false, has_donor_advised_fund: false, is_parent: true,  is_grandparent: false, is_alumni: false, is_program_attendee: true,  is_organization_volunteer: false, is_community_builder: false },
    { first_name: 'Karen',    last_name: 'Stanton',   name: 'Karen Stanton',    email: 'karen.stanton@example.com',     total_score: 28, is_board_member: false, has_donor_advised_fund: false, is_parent: false, is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: false, is_community_builder: false },
    { first_name: 'Christopher', last_name: 'Abebe',  name: 'Christopher Abebe', email: 'chris.abebe@example.com',     total_score: 15, is_board_member: false, has_donor_advised_fund: false, is_parent: false, is_grandparent: false, is_alumni: false, is_program_attendee: false, is_organization_volunteer: false, is_community_builder: false },
  ];

  const { data: insertedDonors, error: donorsError } = await adminClient
    .from('donors')
    .insert(donorRows.map((d) => ({ ...d, organization_id: orgId })) as never[])
    .select('id');

  if (donorsError) {
    console.error('[test-login] donors insert error:', donorsError.message);
    return;
  }

  const donorIds: string[] = ((insertedDonors ?? []) as { id: string }[]).map((d) => d.id);
  if (!donorIds.length) return;

  // Donations
  const { error: donErr } = await adminClient.from('donations').insert([
    { donor_id: donorIds[0], amount: 25000, donated_at: '2024-01-15', donation_type: 'Gift', organization_id: orgId },
    { donor_id: donorIds[0], amount: 25000, donated_at: '2023-01-10', donation_type: 'Gift', organization_id: orgId },
    { donor_id: donorIds[1], amount: 18000, donated_at: '2024-03-01', donation_type: 'Gift', organization_id: orgId },
    { donor_id: donorIds[2], amount: 15000, donated_at: '2024-02-14', donation_type: 'Gift', organization_id: orgId },
    { donor_id: donorIds[3], amount: 8000,  donated_at: '2024-04-22', donation_type: 'Gift', organization_id: orgId },
    { donor_id: donorIds[4], amount: 6000,  donated_at: '2024-05-10', donation_type: 'Gift', organization_id: orgId },
  ] as never[]);
  if (donErr) console.error('[test-login] donations insert error:', donErr.message);

  const futureDate = (days: number) => {
    const d = new Date(now); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0];
  };
  const pastDate = (days: number) => {
    const d = new Date(now); d.setDate(d.getDate() - days); return d.toISOString().split('T')[0];
  };
  const pastISO = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

  const { error: movesErr } = await adminClient.from('moves').insert([
    { name: 'Quarterly stewardship call',           donor_id: donorIds[0], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: futureDate(5),  is_completed: false },
    { name: 'Coffee meeting — planned giving',       donor_id: donorIds[1], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: futureDate(12), is_completed: false },
    { name: 'Send annual impact report',             donor_id: donorIds[2], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: futureDate(3),  is_completed: false },
    { name: 'Major gift ask meeting',                donor_id: donorIds[3], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: futureDate(20), is_completed: false },
    { name: 'Site visit — new building project',     donor_id: donorIds[4], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: futureDate(30), is_completed: false },
    { name: 'Personal thank you call',               donor_id: donorIds[5], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: futureDate(8),  is_completed: false },
    { name: 'Year-end gift conversation',            donor_id: donorIds[0], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: pastDate(14), is_completed: true, completed_at: pastISO(14), completion_notes: 'Donor confirmed $25k renewal. Very enthusiastic about the new program.' },
    { name: 'Board recruitment discussion',          donor_id: donorIds[3], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: pastDate(21), is_completed: true, completed_at: pastISO(21), completion_notes: 'David agreed to join the advisory committee.' },
    { name: 'Volunteer appreciation lunch',          donor_id: donorIds[5], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: pastDate(7),  is_completed: true, completed_at: pastISO(7),  completion_notes: 'Great engagement. James plans to bring a colleague to next event.' },
    { name: 'Cultivation event follow-up',           donor_id: donorIds[6], assigned_to: orgAdminRoleId, organization_id: orgId, due_date: pastDate(5),  is_completed: true, completed_at: pastISO(5),  completion_notes: 'Sent handwritten note. Linda expressed interest in a facility tour.' },
  ] as never[]);
  if (movesErr) console.error('[test-login] moves insert error:', movesErr.message);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as TestRole | null;

    if (!role || !TEST_USERS[role]) {
      return NextResponse.json(
        { error: 'Invalid role. Use: super_admin or org_admin' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Ensure demo org exists ──────────────────────────────────────────────
    let orgId: string;
    const { data: existingOrg, error: orgLookupError } = await adminClient
      .from('organizations')
      .select('id')
      .eq('name', DEMO_ORG_NAME)
      .maybeSingle();

    if (orgLookupError) {
      console.error('[test-login] org lookup error:', orgLookupError.message);
      return NextResponse.json({ error: 'DB error looking up organization' }, { status: 500 });
    }

    if (existingOrg) {
      orgId = existingOrg.id;
    } else {
      const { data: newOrg, error: orgInsertError } = await adminClient
        .from('organizations')
        .insert({ name: DEMO_ORG_NAME, slug: 'demo-nonprofit' } as never)
        .select('id')
        .single();

      if (orgInsertError || !newOrg) {
        console.error('[test-login] org insert error:', orgInsertError?.message);
        return NextResponse.json({ error: 'Failed to create demo organization' }, { status: 500 });
      }
      orgId = newOrg.id;
    }

    // ── Ensure both test users exist (auth + user_roles) ───────────────────
    const roleIds: Record<TestRole, string> = {} as Record<TestRole, string>;

    for (const [appRole, info] of Object.entries(TEST_USERS) as [TestRole, (typeof TEST_USERS)[TestRole]][]) {
      // Auth user
      const authId = await ensureAuthUser(adminClient, info.email);
      if (!authId) {
        return NextResponse.json({ error: `Failed to create auth user for ${appRole}` }, { status: 500 });
      }

      // user_roles record
      const { data: existingRole } = await adminClient
        .from('user_roles')
        .select('id')
        .eq('user_id', authId)
        .maybeSingle();

      if (existingRole) {
        roleIds[appRole] = existingRole.id;
      } else {
        const { data: newRole, error: roleInsertError } = await adminClient
          .from('user_roles')
          .insert({
            user_id: authId,
            // super_admin must have organization_id = null per DB constraint
            organization_id: info.db_role === 'super_admin' ? null : orgId,
            role: info.db_role,
            email: info.email,
            full_name: info.full_name,
            is_active: true,
          } as never)
          .select('id')
          .single();

        if (roleInsertError || !newRole) {
          console.error('[test-login] user_roles insert error:', roleInsertError?.message);
          return NextResponse.json({ error: `Failed to create user_role for ${appRole}` }, { status: 500 });
        }
        roleIds[appRole] = newRole.id;
      }
    }

    // ── Seed demo data if org has no donors yet ─────────────────────────────
    const { count: donorCount } = await adminClient
      .from('donors')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    if ((donorCount ?? 0) === 0) {
      await seedDemoData(adminClient, orgId, roleIds.org_admin);
    }

    // Return credentials so the client can sign in directly (same path as regular login)
    return NextResponse.json({
      email: TEST_USERS[role].email,
      password: TEST_PASSWORD,
    });
  } catch (err) {
    console.error('[test-login] unhandled error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
