create type public.engagement_status as enum ('planning', 'fieldwork', 'review', 'completed', 'frozen');
create type public.materiality_status as enum ('draft', 'senior_review', 'partner_review', 'approved', 'rejected');
create type public.risk_level as enum ('low', 'medium', 'high');
create type public.misstatement_type as enum ('known', 'likely', 'projected');
create type public.misstatement_status as enum ('open', 'corrected', 'uncorrected', 'waived');
create type public.audit_event_type as enum ('created', 'updated', 'submitted_for_review', 'returned', 'approved', 'rejected', 'frozen');

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  client_name text not null,
  engagement_code text not null,
  financial_year text not null,
  reporting_framework text not null default 'Ind AS',
  status public.engagement_status not null default 'planning',
  partner_name text,
  freeze_target date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, engagement_code)
);
grant select, insert, update, delete on public.engagements to authenticated;
grant all on public.engagements to service_role;
alter table public.engagements enable row level security;
create policy "Users can manage their own engagements" on public.engagements for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create table public.engagement_members (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  user_id uuid not null,
  display_name text not null,
  role_title text not null,
  created_at timestamptz not null default now(),
  unique(engagement_id, user_id)
);
grant select, insert, update, delete on public.engagement_members to authenticated;
grant all on public.engagement_members to service_role;
alter table public.engagement_members enable row level security;
create policy "Engagement owners can manage members" on public.engagement_members for all to authenticated using (exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid())) with check (exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()));
create policy "Members can view their assignment" on public.engagement_members for select to authenticated using (user_id = auth.uid());

create table public.materiality_assessments (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  prepared_by uuid not null,
  reviewed_by uuid,
  approved_by uuid,
  status public.materiality_status not null default 'draft',
  benchmark_name text not null,
  benchmark_amount numeric(18,2) not null default 0,
  benchmark_percentage numeric(8,5) not null default 0,
  benchmark_rationale text not null default '',
  inherent_risk public.risk_level not null default 'medium',
  control_risk public.risk_level not null default 'medium',
  detection_risk public.risk_level not null default 'medium',
  overall_materiality numeric(18,2) not null default 0,
  performance_materiality numeric(18,2) not null default 0,
  clearly_trivial_threshold numeric(18,2) not null default 0,
  judgement_rationale text not null default '',
  current_version integer not null default 1,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(engagement_id)
);
grant select, insert, update, delete on public.materiality_assessments to authenticated;
grant all on public.materiality_assessments to service_role;
alter table public.materiality_assessments enable row level security;
create policy "Engagement users can view materiality" on public.materiality_assessments for select to authenticated using (exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()) or exists (select 1 from public.engagement_members m where m.engagement_id = engagement_id and m.user_id = auth.uid()));
create policy "Engagement owners can create materiality" on public.materiality_assessments for insert to authenticated with check (prepared_by = auth.uid() and exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()));
create policy "Preparers can update draft materiality" on public.materiality_assessments for update to authenticated using (prepared_by = auth.uid() and status in ('draft', 'rejected') and exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid())) with check (prepared_by = auth.uid() and status in ('draft', 'senior_review', 'partner_review', 'rejected'));
create policy "Owners can remove unapproved materiality" on public.materiality_assessments for delete to authenticated using (status <> 'approved' and exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()));

create table public.materiality_versions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.materiality_assessments(id) on delete cascade,
  version_number integer not null,
  snapshot jsonb not null,
  status public.materiality_status not null,
  actor_id uuid not null,
  rationale text not null default '',
  created_at timestamptz not null default now(),
  unique(assessment_id, version_number)
);
grant select, insert on public.materiality_versions to authenticated;
grant all on public.materiality_versions to service_role;
alter table public.materiality_versions enable row level security;
create policy "Engagement users can view materiality versions" on public.materiality_versions for select to authenticated using (exists (select 1 from public.materiality_assessments a join public.engagements e on e.id = a.engagement_id where a.id = assessment_id and (e.owner_id = auth.uid() or a.prepared_by = auth.uid() or a.reviewed_by = auth.uid() or a.approved_by = auth.uid())));
create policy "Assessment users can create materiality versions" on public.materiality_versions for insert to authenticated with check (actor_id = auth.uid() and exists (select 1 from public.materiality_assessments a join public.engagements e on e.id = a.engagement_id where a.id = assessment_id and e.owner_id = auth.uid()));

create table public.misstatements (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  assessment_id uuid references public.materiality_assessments(id) on delete set null,
  reference_code text not null,
  description text not null,
  audit_area text not null,
  misstatement_type public.misstatement_type not null default 'known',
  status public.misstatement_status not null default 'open',
  gross_amount numeric(18,2) not null default 0,
  tax_effect numeric(18,2) not null default 0,
  net_amount numeric(18,2) not null default 0,
  corrected_amount numeric(18,2) not null default 0,
  management_response text,
  conclusion text,
  identified_by uuid not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.misstatements to authenticated;
grant all on public.misstatements to service_role;
alter table public.misstatements enable row level security;
create policy "Engagement users can manage misstatements" on public.misstatements for all to authenticated using (exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()) or exists (select 1 from public.engagement_members m where m.engagement_id = engagement_id and m.user_id = auth.uid())) with check (identified_by = auth.uid() or exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()) or exists (select 1 from public.engagement_members m where m.engagement_id = engagement_id and m.user_id = auth.uid()));

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  user_id uuid not null,
  work_date date not null default current_date,
  audit_area text not null,
  description text not null,
  hours numeric(6,2) not null default 0,
  billable boolean not null default true,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (hours > 0 and hours <= 24)
);
grant select, insert, update, delete on public.time_entries to authenticated;
grant all on public.time_entries to service_role;
alter table public.time_entries enable row level security;
create policy "Users can view engagement hours" on public.time_entries for select to authenticated using (user_id = auth.uid() or exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()) or exists (select 1 from public.engagement_members m where m.engagement_id = engagement_id and m.user_id = auth.uid()));
create policy "Users can log their own hours" on public.time_entries for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid() or exists (select 1 from public.engagement_members m where m.engagement_id = engagement_id and m.user_id = auth.uid())));
create policy "Users can edit their own draft hours" on public.time_entries for update to authenticated using (user_id = auth.uid() and status = 'draft') with check (user_id = auth.uid());
create policy "Users can remove their own draft hours" on public.time_entries for delete to authenticated using (user_id = auth.uid() and status = 'draft');

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  actor_id uuid not null,
  event_type public.audit_event_type not null,
  entity_type text not null,
  entity_id uuid,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_events to authenticated;
grant all on public.audit_events to service_role;
alter table public.audit_events enable row level security;
create policy "Engagement users can view audit events" on public.audit_events for select to authenticated using (exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()) or exists (select 1 from public.engagement_members m where m.engagement_id = engagement_id and m.user_id = auth.uid()));
create policy "Engagement users can record audit events" on public.audit_events for insert to authenticated with check (actor_id = auth.uid() and (exists (select 1 from public.engagements e where e.id = engagement_id and e.owner_id = auth.uid()) or exists (select 1 from public.engagement_members m where m.engagement_id = engagement_id and m.user_id = auth.uid())));

create or replace function public.update_updated_at_column() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
create trigger engagements_updated_at before update on public.engagements for each row execute function public.update_updated_at_column();
create trigger materiality_assessments_updated_at before update on public.materiality_assessments for each row execute function public.update_updated_at_column();
create trigger misstatements_updated_at before update on public.misstatements for each row execute function public.update_updated_at_column();
create trigger time_entries_updated_at before update on public.time_entries for each row execute function public.update_updated_at_column();

create or replace function public.prevent_approved_materiality_change() returns trigger language plpgsql set search_path = public as $$ begin if old.status = 'approved' then raise exception 'Approved materiality versions are immutable'; end if; return new; end; $$;
create trigger materiality_approval_lock before update or delete on public.materiality_assessments for each row execute function public.prevent_approved_materiality_change();

create index engagements_owner_idx on public.engagements(owner_id);
create index materiality_versions_assessment_idx on public.materiality_versions(assessment_id, version_number desc);
create index misstatements_engagement_status_idx on public.misstatements(engagement_id, status);
create index time_entries_engagement_date_idx on public.time_entries(engagement_id, work_date desc);
create index audit_events_engagement_created_idx on public.audit_events(engagement_id, created_at desc);