-- Enable extension for UUID generation
create extension if not exists pgcrypto;

-- =========================================
-- Tables
-- =========================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_name text,
  contact_email text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('super_admin','org_admin','solicitor')),
  organization_id uuid references public.organizations(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  is_used boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.donors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assigned_solicitor_id uuid references public.user_profiles(id) on delete set null,

  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text,

  donor_type text,
  lifecycle_stage text,
  capacity_rating text,
  affinity_rating text,
  wealth_indicator text,
  notes text,
  tags text[],

  last_contact_date date,
  last_gift_date date,
  next_action_date date,

  lifetime_giving numeric(12,2) default 0,
  annual_giving numeric(12,2) default 0,
  gift_count integer default 0,
  score integer default 0,

  is_major_donor boolean default false,
  is_planned_giving_prospect boolean default false,
  is_corporate_contact boolean default false,
  is_foundation_contact boolean default false,
  is_board_member boolean default false,
  is_volunteer boolean default false,
  is_event_attendee boolean default false,
  is_lybunt boolean default false,
  is_sybunt boolean default false,
  is_deceased boolean default false,
  do_not_contact boolean default false,

  bloomerang_id text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.scoring_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  field_name text not null,
  is_enabled boolean default true,
  point_value integer default 0,
  unique (organization_id, field_name)
);

create table if not exists public.tier_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tier_name text not null,
  min_score integer not null,
  max_score integer not null,
  moves_needed integer not null default 0
);

create table if not exists public.move_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  is_global boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.moves (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  donor_id uuid not null references public.donors(id) on delete cascade,
  solicitor_id uuid not null references public.user_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  move_idea_id uuid references public.move_ideas(id) on delete set null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending','completed')),
  completion_notes text,
  completed_at timestamptz,
  follow_up_move_id uuid references public.moves(id) on delete set null,
  parent_move_id uuid references public.moves(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  category text not null check (category in ('bug_report','feature_request','question')),
  title text not null,
  description text not null,
  attachment_url text,
  status text not null default 'new' check (status in ('new','reviewed','resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.import_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  import_type text not null check (import_type in ('csv','bloomerang')),
  records_created integer default 0,
  records_updated integer default 0,
  records_skipped integer default 0,
  errors jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.bloomerang_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  api_key_encrypted text not null,
  last_synced_at timestamptz,
  last_sync_status text check (last_sync_status in ('success','failed')),
  synced_record_count integer default 0
);

create table if not exists public.donation_history (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  amount decimal(12,2) not null,
  donation_date date not null,
  bloomerang_transaction_id text,
  created_at timestamptz default now()
);

-- =========================================
-- Indexes
-- =========================================

create index if not exists idx_donors_organization_id on public.donors(organization_id);
create index if not exists idx_donors_assigned_solicitor_id on public.donors(assigned_solicitor_id);
create index if not exists idx_moves_organization_id on public.moves(organization_id);
create index if not exists idx_moves_solicitor_id on public.moves(solicitor_id);
create index if not exists idx_moves_donor_id on public.moves(donor_id);
create index if not exists idx_feedback_user_id on public.feedback(user_id);
create index if not exists idx_scoring_configs_organization_id on public.scoring_configs(organization_id);

-- =========================================
-- RLS
-- =========================================

alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.donors enable row level security;
alter table public.scoring_configs enable row level security;
alter table public.tier_configs enable row level security;
alter table public.move_ideas enable row level security;
alter table public.moves enable row level security;
alter table public.feedback enable row level security;
alter table public.import_logs enable row level security;
alter table public.bloomerang_configs enable row level security;
alter table public.donation_history enable row level security;

-- =========================================
-- Service role policies (permissive full access)
-- =========================================

drop policy if exists "service_role_all_organizations" on public.organizations;
create policy "service_role_all_organizations"
on public.organizations
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_user_profiles" on public.user_profiles;
create policy "service_role_all_user_profiles"
on public.user_profiles
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_invitations" on public.invitations;
create policy "service_role_all_invitations"
on public.invitations
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_donors" on public.donors;
create policy "service_role_all_donors"
on public.donors
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_scoring_configs" on public.scoring_configs;
create policy "service_role_all_scoring_configs"
on public.scoring_configs
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_tier_configs" on public.tier_configs;
create policy "service_role_all_tier_configs"
on public.tier_configs
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_move_ideas" on public.move_ideas;
create policy "service_role_all_move_ideas"
on public.move_ideas
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_moves" on public.moves;
create policy "service_role_all_moves"
on public.moves
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_feedback" on public.feedback;
create policy "service_role_all_feedback"
on public.feedback
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_import_logs" on public.import_logs;
create policy "service_role_all_import_logs"
on public.import_logs
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_bloomerang_configs" on public.bloomerang_configs;
create policy "service_role_all_bloomerang_configs"
on public.bloomerang_configs
as permissive
for all
to public
using (true);

drop policy if exists "service_role_all_donation_history" on public.donation_history;
create policy "service_role_all_donation_history"
on public.donation_history
as permissive
for all
to public
using (true);
