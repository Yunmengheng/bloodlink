-- Minimal stand-in for what Supabase provides, so the migration can be tested
-- exactly as written: the anon/authenticated roles, the auth schema, auth.users,
-- and auth.uid() reading the request.jwt.claims GUC the way Supabase does.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

grant usage on schema public to anon, authenticated, service_role;

create schema if not exists auth;
create table auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '')::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
