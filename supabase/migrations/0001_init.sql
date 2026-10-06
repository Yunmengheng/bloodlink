-- =============================================================================
-- BloodLink KH — initial schema
--
-- Safe to run more than once: every object uses IF NOT EXISTS or is dropped
-- first, so re-running will not error or destroy data.
--
-- Privacy model in one line: blood_requests is world-readable and therefore
-- holds NO contact information; contact details live in request_contacts and
-- responses, which are locked down by Row Level Security.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.blood_type as enum ('O-','O+','A-','A+','B-','B+','AB-','AB+');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.urgency as enum ('critical','urgent','standard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('open','fulfilled','cancelled');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- updated_at trigger helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- donors — one row per user who is willing to donate.
-- Contact details here are NEVER public. They are copied onto a response row
-- only when the donor chooses to offer help.
-- -----------------------------------------------------------------------------
create table if not exists public.donors (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text        not null check (length(btrim(full_name)) between 1 and 100),
  blood_type         public.blood_type not null,
  district           text        not null,
  phone              text        check (phone is null or length(btrim(phone)) between 6 and 20),
  telegram_username  text        check (telegram_username is null or telegram_username ~ '^[A-Za-z0-9_]{5,32}$'),
  last_donation_date date,
  is_available       boolean     not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- A donor nobody can reach is useless, so require at least one channel.
  constraint donors_contact_present check (
    coalesce(nullif(btrim(phone), ''), nullif(btrim(telegram_username), '')) is not null
  )
);

drop trigger if exists donors_set_updated_at on public.donors;
create trigger donors_set_updated_at
  before update on public.donors
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- blood_requests — PUBLICLY READABLE. No contact columns may ever be added here.
-- -----------------------------------------------------------------------------
create table if not exists public.blood_requests (
  id                  uuid primary key default gen_random_uuid(),
  requester_id        uuid not null references auth.users (id) on delete cascade,
  patient_blood_type  public.blood_type not null,
  units_needed        int  not null check (units_needed between 1 and 10),
  hospital            text not null check (length(btrim(hospital)) between 1 and 120),
  district            text not null,
  urgency             public.urgency not null default 'standard',
  needed_by           date,
  note                text check (note is null or length(note) <= 300),
  status              public.request_status not null default 'open',
  responses_count     int  not null default 0 check (responses_count >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists blood_requests_set_updated_at on public.blood_requests;
create trigger blood_requests_set_updated_at
  before update on public.blood_requests
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- request_contacts — how to reach the requester. Separate table so that the
-- public read policy on blood_requests cannot possibly expose it.
-- -----------------------------------------------------------------------------
create table if not exists public.request_contacts (
  request_id        uuid primary key references public.blood_requests (id) on delete cascade,
  contact_name      text not null check (length(btrim(contact_name)) between 1 and 100),
  phone             text check (phone is null or length(btrim(phone)) between 6 and 20),
  telegram_username text check (telegram_username is null or telegram_username ~ '^[A-Za-z0-9_]{5,32}$'),

  constraint request_contacts_contact_present check (
    coalesce(nullif(btrim(phone), ''), nullif(btrim(telegram_username), '')) is not null
  )
);

-- -----------------------------------------------------------------------------
-- responses — a donor offering to help. Donor details are SNAPSHOT at response
-- time, so later profile edits cannot silently change what the family already
-- saw, and deleting a donor profile does not blank out an active offer.
-- -----------------------------------------------------------------------------
create table if not exists public.responses (
  id             uuid primary key default gen_random_uuid(),
  request_id     uuid not null references public.blood_requests (id) on delete cascade,
  donor_id       uuid not null references auth.users (id) on delete cascade,
  donor_name     text not null,
  donor_phone    text,
  donor_telegram text,
  donor_blood_type public.blood_type not null,
  message        text check (message is null or length(message) <= 200),
  created_at     timestamptz not null default now(),

  unique (request_id, donor_id)
);

-- -----------------------------------------------------------------------------
-- Keep blood_requests.responses_count in sync.
--
-- security definer because the donor inserting a response has no UPDATE
-- privilege on someone else's request row. search_path is pinned to '' and
-- every name is schema-qualified, so the function cannot be hijacked by a
-- caller-controlled search_path.
-- -----------------------------------------------------------------------------
create or replace function public.sync_responses_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.blood_requests
       set responses_count = responses_count + 1
     where id = new.request_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.blood_requests
       set responses_count = greatest(responses_count - 1, 0)
     where id = old.request_id;
    return old;
  end if;
  return null;
end;
$$;

revoke all on function public.sync_responses_count() from public, anon, authenticated;

drop trigger if exists responses_sync_count_insert on public.responses;
create trigger responses_sync_count_insert
  after insert on public.responses
  for each row execute function public.sync_responses_count();

drop trigger if exists responses_sync_count_delete on public.responses;
create trigger responses_sync_count_delete
  after delete on public.responses
  for each row execute function public.sync_responses_count();

-- -----------------------------------------------------------------------------
-- Indexes for the feed and matching queries
-- -----------------------------------------------------------------------------
create index if not exists blood_requests_feed_idx
  on public.blood_requests (status, urgency, created_at desc);
create index if not exists blood_requests_blood_type_idx
  on public.blood_requests (patient_blood_type) where status = 'open';
create index if not exists blood_requests_district_idx
  on public.blood_requests (district) where status = 'open';
create index if not exists blood_requests_requester_idx
  on public.blood_requests (requester_id, created_at desc);
create index if not exists responses_request_idx on public.responses (request_id);
create index if not exists responses_donor_idx   on public.responses (donor_id);
create index if not exists donors_available_idx
  on public.donors (blood_type) where is_available;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.donors           enable row level security;
alter table public.blood_requests   enable row level security;
alter table public.request_contacts enable row level security;
alter table public.responses        enable row level security;

-- donors: strictly your own row, in every direction.
drop policy if exists donors_select_own on public.donors;
create policy donors_select_own on public.donors
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists donors_insert_own on public.donors;
create policy donors_insert_own on public.donors
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists donors_update_own on public.donors;
create policy donors_update_own on public.donors
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- blood_requests: readable by everyone, writable only by the owner.
drop policy if exists blood_requests_select_all on public.blood_requests;
create policy blood_requests_select_all on public.blood_requests
  for select to anon, authenticated using (true);

drop policy if exists blood_requests_insert_own on public.blood_requests;
create policy blood_requests_insert_own on public.blood_requests
  for insert to authenticated with check (requester_id = (select auth.uid()));

drop policy if exists blood_requests_update_own on public.blood_requests;
create policy blood_requests_update_own on public.blood_requests
  for update to authenticated
  using (requester_id = (select auth.uid()))
  with check (requester_id = (select auth.uid()));

-- request_contacts: the owner, or a donor who has responded to that request.
drop policy if exists request_contacts_select on public.request_contacts;
create policy request_contacts_select on public.request_contacts
  for select to authenticated using (
    exists (
      select 1 from public.blood_requests r
       where r.id = request_contacts.request_id
         and r.requester_id = (select auth.uid())
    )
    or exists (
      select 1 from public.responses resp
       where resp.request_id = request_contacts.request_id
         and resp.donor_id = (select auth.uid())
    )
  );

drop policy if exists request_contacts_insert_own on public.request_contacts;
create policy request_contacts_insert_own on public.request_contacts
  for insert to authenticated with check (
    exists (
      select 1 from public.blood_requests r
       where r.id = request_contacts.request_id
         and r.requester_id = (select auth.uid())
    )
  );

drop policy if exists request_contacts_update_own on public.request_contacts;
create policy request_contacts_update_own on public.request_contacts
  for update to authenticated
  using (
    exists (
      select 1 from public.blood_requests r
       where r.id = request_contacts.request_id
         and r.requester_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.blood_requests r
       where r.id = request_contacts.request_id
         and r.requester_id = (select auth.uid())
    )
  );

-- responses: visible to the donor who made it and to the request owner.
drop policy if exists responses_select on public.responses;
create policy responses_select on public.responses
  for select to authenticated using (
    donor_id = (select auth.uid())
    or exists (
      select 1 from public.blood_requests r
       where r.id = responses.request_id
         and r.requester_id = (select auth.uid())
    )
  );

drop policy if exists responses_insert_own on public.responses;
create policy responses_insert_own on public.responses
  for insert to authenticated with check (donor_id = (select auth.uid()));

-- Only the donor may withdraw. A requester cannot delete someone's offer.
drop policy if exists responses_delete_own on public.responses;
create policy responses_delete_own on public.responses
  for delete to authenticated using (donor_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Public stats for the home page.
--
-- security definer so it can count rows the caller cannot read (donors is
-- private). It returns three integers and nothing else — no row can leak
-- through it.
-- -----------------------------------------------------------------------------
create or replace function public.get_public_stats()
returns table (open_requests int, registered_donors int, fulfilled_requests int)
language sql
security definer
stable
set search_path = ''
as $$
  select
    (select count(*)::int from public.blood_requests where status = 'open'),
    (select count(*)::int from public.donors),
    (select count(*)::int from public.blood_requests where status = 'fulfilled');
$$;

revoke all on function public.get_public_stats() from public;
grant execute on function public.get_public_stats() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Which blood types are needed right now. Aggregate only — no request rows.
-- (blood_requests is public anyway, so this is convenience, not a privacy
-- boundary.)
-- -----------------------------------------------------------------------------
create or replace function public.get_needed_blood_types()
returns table (blood_type public.blood_type, request_count int)
language sql
security invoker
stable
set search_path = ''
as $$
  select patient_blood_type, count(*)::int
    from public.blood_requests
   where status = 'open'
   group by patient_blood_type
   order by count(*) desc;
$$;

grant execute on function public.get_needed_blood_types() to anon, authenticated;
