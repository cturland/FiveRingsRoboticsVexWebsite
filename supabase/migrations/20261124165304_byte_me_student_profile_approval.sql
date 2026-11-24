-- Keep approval scoped to the roster admins for the table being changed.
create function private.moderate_bm_team_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  is_admin boolean;
begin
  if tg_op = 'INSERT' then
    new.is_approved := false;
  else
    select exists (select 1 from public.bm_roster_admins where email = lower(auth.jwt() ->> 'email')) into is_admin;
    if not is_admin then
      new.is_approved := false;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.moderate_bm_team_profile() from public, anon, authenticated;

alter table public.bm_team_profiles add column is_approved boolean not null default true;
alter table public.bm_team_profiles alter column is_approved set default false;

create or replace view public.bm_published_team_profiles with (security_barrier = true) as
select id, name, roles, bio, is_current_member, photo_path is not null as has_photo
from public.bm_team_profiles
where is_approved;

create view public.bm_published_team_profile_photos with (security_barrier = true) as
select id, photo_path from public.bm_team_profiles where is_approved;
revoke all on public.bm_published_team_profile_photos from public, anon, authenticated;
grant select on public.bm_published_team_profile_photos to service_role;
revoke select on public.bm_team_profiles from service_role;

create trigger moderate_team_profile
before insert or update on public.bm_team_profiles
for each row execute function private.moderate_bm_team_profile('bm_roster_admins');

alter policy "Members can read their own profile" on public.bm_team_profiles
using (lower(email) = lower(auth.jwt() ->> 'email') and ((select public.has_bm_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'));

alter policy "Members can create their own profile" on public.bm_team_profiles
with check (email = lower(auth.jwt() ->> 'email') and ((select public.has_bm_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'));

alter policy "Members can edit their own profile" on public.bm_team_profiles
using (lower(email) = lower(auth.jwt() ->> 'email') and ((select public.has_bm_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'))
with check (email = lower(auth.jwt() ->> 'email') and ((select public.has_bm_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'));

create policy "bm students can upload their profile photos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'byte-me-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "bm students can read their profile photos" on storage.objects
for select to authenticated using (
  bucket_id = 'byte-me-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch'
  and owner_id = (select auth.uid())::text
);

create policy "bm students can delete their profile photos" on storage.objects
for delete to authenticated using (
  bucket_id = 'byte-me-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch'
  and owner_id = (select auth.uid())::text
);



