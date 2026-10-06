#!/bin/bash
# RLS test suite. Each check runs as anon or authenticated with a JWT claim,
# exactly as PostgREST would, and asserts the row count the policy should allow.
PSQL="/opt/homebrew/bin/psql -q -h 127.0.0.1 -p 55433 -U postgres -d bloodlink -t -A"
REQUESTER=11111111-1111-1111-1111-111111111111
DONOR_B=22222222-2222-2222-2222-222222222222   # responded
DONOR_C=33333333-3333-3333-3333-333333333333   # did not respond
PASS=0; FAIL=0

# as <role> <uid|-> <sql>  -> runs sql with that identity
as() {
  local role="$1" uid="$2" sql="$3"
  if [ "$uid" = "-" ]; then
    $PSQL -c "begin; set local role $role; $sql; rollback;" 2>&1 | grep -vE '^(BEGIN|SET|ROLLBACK|COMMIT|INSERT|UPDATE|DELETE|SELECT|$)' | tail -1
  else
    $PSQL -c "begin; set local role $role; set local request.jwt.claims = '{\"sub\":\"$uid\"}'; $sql; rollback;" 2>&1 | grep -vE '^(BEGIN|SET|ROLLBACK|COMMIT|INSERT|UPDATE|DELETE|SELECT|$)' | tail -1
  fi
}

check() { # check <desc> <expected> <actual>
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf "  \033[32mPASS\033[0m  %s\n" "$1"
  else FAIL=$((FAIL+1)); printf "  \033[31mFAIL\033[0m  %s (expected '%s', got '%s')\n" "$1" "$2" "$3"; fi
}

echo "PUBLIC FEED — anonymous visitors"
check "anon CAN read blood_requests" 1 "$(as anon - 'select count(*) from public.blood_requests')"
check "anon CANNOT read request_contacts" 0 "$(as anon - 'select count(*) from public.request_contacts')"
check "anon CANNOT read donors" 0 "$(as anon - 'select count(*) from public.donors')"
check "anon CANNOT read responses" 0 "$(as anon - 'select count(*) from public.responses')"
check "anon CAN call get_public_stats" 1 "$(as anon - 'select count(*) from public.get_public_stats()')"

echo
echo "REQUESTER CONTACT — the core privacy rule"
check "owner CAN read own request_contacts" 1 "$(as authenticated $REQUESTER 'select count(*) from public.request_contacts')"
check "donor who RESPONDED can read contacts" 1 "$(as authenticated $DONOR_B 'select count(*) from public.request_contacts')"
check "donor who did NOT respond CANNOT" 0 "$(as authenticated $DONOR_C 'select count(*) from public.request_contacts')"
check "the secret phone never leaks to a non-responder" 0 "$(as authenticated $DONOR_C "select count(*) from public.request_contacts where phone = '0999SECRET'")"

echo
echo "DONOR PROFILES — never visible to anyone else"
check "donor CAN read own profile" 1 "$(as authenticated $DONOR_B 'select count(*) from public.donors')"
check "donor CANNOT read another donor's profile" 0 "$(as authenticated $DONOR_B "select count(*) from public.donors where id = '$DONOR_C'")"
check "requester CANNOT browse the donor table" 0 "$(as authenticated $REQUESTER 'select count(*) from public.donors')"

echo
echo "RESPONSES — visible to the donor and the request owner only"
check "request owner CAN see responses" 1 "$(as authenticated $REQUESTER 'select count(*) from public.responses')"
check "responding donor CAN see own response" 1 "$(as authenticated $DONOR_B 'select count(*) from public.responses')"
check "unrelated donor CANNOT see responses" 0 "$(as authenticated $DONOR_C 'select count(*) from public.responses')"

echo
echo "WRITES — ownership enforced on insert, update and delete"
check "donor CANNOT respond as someone else" "ERROR" "$(as authenticated $DONOR_C "insert into public.responses (request_id, donor_id, donor_name, donor_blood_type) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','$DONOR_B','Fake','O-')" | grep -o ERROR | head -1)"
check "non-owner CANNOT update a request" 0 "$(as authenticated $DONOR_C "update public.blood_requests set status='cancelled' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; select count(*) from public.blood_requests where status='cancelled'")"
check "owner CAN mark own request fulfilled" 1 "$(as authenticated $REQUESTER "update public.blood_requests set status='fulfilled' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; select count(*) from public.blood_requests where status='fulfilled'")"
check "requester CANNOT delete a donor's response" 1 "$(as authenticated $REQUESTER "delete from public.responses; select count(*) from public.responses")"
check "donor CAN withdraw own response" 0 "$(as authenticated $DONOR_B "delete from public.responses; select count(*) from public.responses")"
check "duplicate response is rejected" "ERROR" "$(as authenticated $DONOR_B "insert into public.responses (request_id, donor_id, donor_name, donor_blood_type) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','$DONOR_B','Donor B','O-')" | grep -o ERROR | head -1)"

echo
echo "TRIGGER — responses_count stays in sync for a non-superuser"
check "authenticated INSERT fires the count trigger" 2 "$(as authenticated $DONOR_C "insert into public.responses (request_id, donor_id, donor_name, donor_blood_type) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','$DONOR_C','Donor C','A+'); select responses_count from public.blood_requests")"
check "authenticated DELETE decrements it" 0 "$(as authenticated $DONOR_B "delete from public.responses where donor_id='$DONOR_B'; select responses_count from public.blood_requests")"

echo
echo "────────────────────────────────────────"
printf "  %d passed, %d failed\n" $PASS $FAIL
[ $FAIL -eq 0 ] || exit 1
