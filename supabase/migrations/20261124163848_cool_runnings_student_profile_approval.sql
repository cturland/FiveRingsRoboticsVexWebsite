-- Keep approval scoped to the roster admins for the table being changed.
create function private.moderate_cr_team_profile()
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
    execute format('select exists (select 1 from public.%I)', tg_argv[0]) into is_admin;
    if not is_admin then
      new.is_approved := false;
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.moderate_cr_team_profile() from public, anon, authenticated;

alter table public.cr_team_profiles add column is_approved boolean not null default true;
alter table public.cr_team_profiles alter column is_approved set default false;

create or replace view public.cr_published_team_profiles with (security_barrier = true) as
select id, name, roles, bio, is_current_member, photo_path is not null as has_photo
from public.cr_team_profiles
where is_approved;

create view public.cr_published_team_profile_photos with (security_barrier = true) as
select id, photo_path from public.cr_team_profiles where is_approved;
revoke all on public.cr_published_team_profile_photos from public, anon, authenticated;
grant select on public.cr_published_team_profile_photos to service_role;
revoke select on public.cr_team_profiles from service_role;

create trigger moderate_team_profile
before insert or update on public.cr_team_profiles
for each row execute function private.moderate_cr_team_profile('cr_roster_admins');

alter policy "Members can read their own profile" on public.cr_team_profiles
using (lower(email) = lower(auth.jwt() ->> 'email') and ((select public.has_cr_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'));

alter policy "Members can create their own profile" on public.cr_team_profiles
with check (email = lower(auth.jwt() ->> 'email') and ((select public.has_cr_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'));

alter policy "Members can edit their own profile" on public.cr_team_profiles
using (lower(email) = lower(auth.jwt() ->> 'email') and ((select public.has_cr_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'))
with check (email = lower(auth.jwt() ->> 'email') and ((select public.has_cr_team_site_access()) or split_part(lower(email), '@', 2) = 'islstudent.ch'));

create policy "cr students can upload their profile photos" on storage.objects
for insert to authenticated with check (
  bucket_id = 'cool-runnings-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "cr students can read their profile photos" on storage.objects
for select to authenticated using (
  bucket_id = 'cool-runnings-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch'
  and owner_id = (select auth.uid())::text
);

create policy "cr students can delete their profile photos" on storage.objects
for delete to authenticated using (
  bucket_id = 'cool-runnings-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch'
  and owner_id = (select auth.uid())::text
);


