# Security and privacy model

BloodLink KH exists because the current way of finding blood donors in Cambodia —
posting on Facebook — puts a family's phone number in front of strangers. If this
app leaked contact details, it would be worse than the problem it replaces. So the
privacy rules are enforced in the database itself, not only in the UI.

Every claim on this page is verified by an automated test suite:
[`supabase/tests/`](../supabase/tests/README.md), **23 checks, all passing**.

## The one-sentence design

`blood_requests` is readable by the whole internet, so it contains **no contact
information at all**. Contact details live in two separate tables that Row Level
Security locks down.

| Table | Who can read it |
| ----- | --------------- |
| `blood_requests` | Everyone, including signed-out visitors |
| `request_contacts` | The requester, plus any donor who has responded to that request |
| `donors` | Only the donor themself |
| `responses` | The donor who made it, plus the owner of the request |

Row Level Security is enabled on all four tables. With RLS on and no matching
policy, Postgres denies by default — so a table we forget to write a policy for
fails closed, not open.

## Policy by policy, in plain English

### `donors`

- **select / insert / update — your own row only** (`id = auth.uid()`).

A donor's phone number and Telegram handle are the most sensitive data here.
No policy allows anyone to read another person's donor row, so there is no way to
enumerate donors, and no "browse donors" feature can be built by accident. There
is deliberately **no delete policy**: profiles disappear only when the underlying
`auth.users` row is deleted, via `on delete cascade`.

### `blood_requests`

- **select — anyone** (`anon` and `authenticated`). This is the public feed.
- **insert — signed in, and only as yourself** (`requester_id = auth.uid()`).
  You cannot post a request in someone else's name.
- **update — the owner only.** This is what gates "mark fulfilled" and "cancel".
- **No delete policy.** Requests are cancelled, not erased, so a donor who already
  offered to help does not have the record vanish from under them.

Because this table is world-readable, the rule for future work is simple: **never
add a contact column here.** Doing so would publish it.

### `request_contacts`

- **select — the request owner, OR a donor with a response on that request.**
  This is the heart of the app. A donor sees the family's phone number only after
  choosing to help; before that, the row is invisible.
- **insert / update — the request owner only.**
- **No delete policy** (the row cascades away with its request).

### `responses`

- **select — the donor who made it, OR the owner of the request.** A donor cannot
  see who else offered to help, which keeps one donor's details away from another.
- **insert — only as yourself** (`donor_id = auth.uid()`). You cannot fabricate an
  offer in someone else's name to unlock their contact details.
- **delete — the donor only.** A requester cannot delete an offer; only the donor
  can withdraw it.
- `unique (request_id, donor_id)` stops duplicate offers inflating the count.

Donor details on a response are a **snapshot** taken at the moment of responding.
If a donor later edits or deletes their profile, the family keeps the contact
details they were already given, and an offer never silently changes.

## Functions

### `get_public_stats()` — `security definer`

The home page shows three numbers: open requests, registered donors, requests
fulfilled. Counting donors requires reading a table nobody is allowed to read, so
this function runs with the definer's rights. It is safe because it **returns only
three integers** — it has no parameters, so there is nothing to inject, and no row
can travel through it. `EXECUTE` is revoked from `public` and granted explicitly to
`anon` and `authenticated`.

### `sync_responses_count()` — `security definer` trigger

Keeps `blood_requests.responses_count` accurate. It must be `security definer`
because a donor has no `UPDATE` privilege on someone else's request row.

Both functions set `search_path = ''` and schema-qualify every name. Without that,
a caller could point `search_path` at a schema of their own and substitute a
malicious `blood_requests` table, which a `security definer` function would then
operate on with elevated rights.

`EXECUTE` on the trigger function is revoked. Postgres does not re-check `EXECUTE`
when firing a trigger, so ordinary inserts still work — the test suite verifies
exactly this, because getting it wrong would have broken every response.

## Defence in depth: the server re-checks everything

RLS is the last line, not the only one. Every Server Action independently verifies,
on the server, that the user is signed in, owns what they are editing, and — for a
response — that `canDonate()` passes, `isEligible()` passes, the donor is available,
the request is still open, and they have not already responded. All input is parsed
with Zod before it reaches the database.

A client that tampers with a form gets rejected by the Server Action; if it somehow
got past that, RLS would still reject it.

## Confirmation: no policy leaks contact data

Reviewed against the test results:

- No policy on `blood_requests` exposes a contact column, because the table has none.
- `request_contacts` is readable only via ownership or an existing response row.
  Verified: a signed-in donor who has **not** responded reads **0 rows**, including
  when querying the contact phone value directly.
- `donors` is readable only by `id = auth.uid()`. Verified: donor B reads 0 rows of
  donor C's profile, and a requester reads 0 rows of the donors table.
- `responses` carries donor contact snapshots and is readable only by that donor or
  the request owner. Verified: an unrelated donor reads 0 rows.
- `anon` reads 0 rows from `request_contacts`, `donors` and `responses`.

## Known limitations

- **A donor can unlock a contact by responding.** That is the intended trade: the
  family is asking for help. The mitigation is that responding is attributable —
  the family sees exactly who did it — and the donor can be reported out of band.
- **No rate limiting yet.** A determined signed-in user could respond to many
  requests to harvest contacts. A per-user daily response cap is the obvious next
  step; see Future work in the README.
- **Email/password auth only**, using Supabase's built-in flows. Email confirmation
  is enabled by default and should stay on.
- **`MIN_DAYS_BETWEEN_DONATIONS` is not medical advice.** It is a scheduling hint
  that must be confirmed against National Blood Transfusion Center guidance; the
  hospital decides eligibility at screening.
