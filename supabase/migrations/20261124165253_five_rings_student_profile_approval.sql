-- Keep existing public profiles live and default all future submissions to pending.
alter table public.team_profiles add column is_approved boolean not null default true;
alter table public.team_profiles alter column is_approved set default false;

create or replace view public.published_team_profiles with (security_barrier = true) as
select id, name, roles, bio, is_current_member, photo_path is not null as has_photo
from public.team_profiles
where is_approved;

create view public.published_team_profile_photos with (security_barrier = true) as
select id, photo_path
from public.team_profiles
where is_approved;

revoke all on public.published_team_profile_photos from public, anon, authenticated;
grant select on public.published_team_profile_photos to service_role;
-- Older deployments queried the raw table with this role for public photos.
revoke select on public.team_profiles from service_role;

create function private.moderate_team_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.is_approved := false;
  elsif not exists (select 1 from public.gallery_admins where email = lower(auth.jwt() ->> 'email')) then
    new.is_approved := false;
  end if;
  return new;
end;
$$;
revoke all on function private.moderate_team_profile() from public, anon, authenticated;

create trigger moderate_team_profile
before insert or update on public.team_profiles
for each row execute function private.moderate_team_profile();

alter policy "Members can insert their own team profile" on public.team_profiles
with check (
  email = lower(auth.jwt() ->> 'email')
  and (
    (select public.has_team_site_access())
    or split_part(email, '@', 2) = 'islstudent.ch'
  )
);

alter policy "Members can update their own team profile" on public.team_profiles
using (
  lower(email) = lower(auth.jwt() ->> 'email')
  and (
    (select public.has_team_site_access())
    or split_part(lower(email), '@', 2) = 'islstudent.ch'
  )
)
with check (
  email = lower(auth.jwt() ->> 'email')
  and (
    (select public.has_team_site_access())
    or split_part(email, '@', 2) = 'islstudent.ch'
  )
);

alter policy "Members can upload to their own folder" on storage.objects
with check (
  bucket_id in ('gallery-uploads', 'team-profile-photos')
  and (
    (select public.has_team_site_access())
    or (bucket_id = 'team-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch')
  )
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

alter policy "Owners and admins can delete team site photos" on storage.objects
using (
  bucket_id in ('gallery-uploads', 'team-profile-photos')
  and (
    (
      owner_id = (select auth.uid())::text
      and (
        (select public.has_team_site_access())
        or (bucket_id = 'team-profile-photos' and split_part(lower(auth.jwt() ->> 'email'), '@', 2) = 'islstudent.ch')
      )
    )
    or exists (select 1 from public.gallery_admins where email = lower(auth.jwt() ->> 'email'))
  )
);
