-- Grants that Supabase applies to public tables by default. RLS is what
-- actually restricts access; without these grants every check would fail for
-- the wrong reason.
grant all on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Fixtures: a requester, a donor who responds, and a donor who does not.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111','requester@test.kh'),
  ('22222222-2222-2222-2222-222222222222','donor-responded@test.kh'),
  ('33333333-3333-3333-3333-333333333333','donor-silent@test.kh')
on conflict do nothing;

insert into public.donors (id, full_name, blood_type, district, phone) values
  ('22222222-2222-2222-2222-222222222222','Donor B','O-','daun_penh','012345678'),
  ('33333333-3333-3333-3333-333333333333','Donor C','A+','sen_sok','087654321')
on conflict do nothing;

insert into public.blood_requests
  (id, requester_id, patient_blood_type, units_needed, hospital, district, urgency)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111',
   'A+',3,'Calmette Hospital','daun_penh','critical')
on conflict do nothing;

-- A deliberately recognisable value, so a leak is obvious in test output.
insert into public.request_contacts (request_id, contact_name, phone)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Sok Dara','0999SECRET')
on conflict do nothing;

insert into public.responses
  (request_id, donor_id, donor_name, donor_phone, donor_blood_type)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222',
   'Donor B','012345678','O-')
on conflict do nothing;
