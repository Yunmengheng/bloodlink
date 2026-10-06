# RLS test suite

These tests prove the privacy model holds, rather than assuming the policies are
right. Every check runs as `anon` or `authenticated` with a JWT claim set, which
is exactly how PostgREST executes a request from the app.

They run against a throwaway local Postgres, so they never touch your real
project and cost nothing to run.

## Running them

Requires a local Postgres (`brew install postgresql`).

```bash
# 1. Start a throwaway cluster
initdb -D /tmp/bl-pg -U postgres --auth=trust
pg_ctl -D /tmp/bl-pg -o "-p 55433 -k /tmp -c listen_addresses=127.0.0.1" -l /tmp/bl-pg.log start

# 2. Create the database and the Supabase stand-ins (roles, auth.users, auth.uid)
psql -h 127.0.0.1 -p 55433 -U postgres -c "create database bloodlink;"
psql -h 127.0.0.1 -p 55433 -U postgres -d bloodlink -f supabase/tests/supabase-shim.sql

# 3. Apply the migration under test
psql -h 127.0.0.1 -p 55433 -U postgres -d bloodlink -f supabase/migrations/0001_init.sql

# 4. Grant table privileges the way Supabase does, then seed and run
psql -h 127.0.0.1 -p 55433 -U postgres -d bloodlink -f supabase/tests/seed-fixtures.sql
./supabase/tests/rls-test.sh

# 5. Tear down
pg_ctl -D /tmp/bl-pg stop && rm -rf /tmp/bl-pg
```

## What is covered

| Area | Checks |
| ---- | ------ |
| Public feed | anon can read requests; cannot read contacts, donors or responses |
| Requester contact | owner yes, responding donor yes, non-responding donor no |
| Donor profiles | own row only; invisible to other donors and to requesters |
| Responses | donor and request owner only |
| Writes | cannot respond as another user, cannot edit another user's request, only the donor can withdraw, duplicates rejected |
| Trigger | `responses_count` increments and decrements correctly **as a non-superuser** |

The trigger check matters: `sync_responses_count()` is `security definer` with
`EXECUTE` revoked, and this confirms that revoking does not break inserts for
ordinary users (Postgres does not re-check `EXECUTE` when firing a trigger).
