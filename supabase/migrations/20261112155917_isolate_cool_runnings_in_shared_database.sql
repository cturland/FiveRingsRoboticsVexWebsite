-- Cool Runnings has its own roster, permissions and media in the existing database.
-- Five Rings tables and the shared reaction leaderboard are unchanged.
create table private.cr_team_members (
  email text primary key check (
    email = lower(btrim(email)) and split_part(email, '@', 2) in ('isl.ch', 'islstudent.ch')
  )
);
create table public.cr_roster_admins (
  email text primary key check (
    email = lower(btrim(email)) and split_part(email, '@', 2) in ('isl.ch', 'islstudent.ch')
  ),
  can_moderate_gallery boolean not null default false
);
create table public.cr_team_profiles (like public.team_profiles including all);
create table public.cr_gallery_submissions (like public.gallery_submissions including all);

alter table private.cr_team_members enable row level security;
alter table public.cr_roster_admins enable row level security;
alter table public.cr_team_profiles enable row level security;
alter table public.cr_gallery_submissions enable row level security;

revoke all on private.cr_team_members, public.cr_roster_admins, public.cr_team_profiles,
  public.cr_gallery_submissions from public, anon, authenticated;
grant select on public.cr_roster_admins to authenticated;
grant select, insert, update, delete on public.cr_team_profiles, public.cr_gallery_submissions to authenticated;
grant select on public.cr_team_profiles, public.cr_gallery_submissions to service_role;

create policy "Admins can read their own role" on public.cr_roster_admins
for select to authenticated using (email = lower(auth.jwt() ->> 'email'));

-- This function answers only whether the caller can sign in to the Cool Runnings site.
create function public.has_cr_team_site_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and (
    exists (select 1 from private.cr_team_members where email = lower(auth.jwt() ->> 'email'))
    or exists (select 1 from public.cr_roster_admins where email = lower(auth.jwt() ->> 'email'))
  );
$$;
revoke all on function public.has_cr_team_site_access() from public, anon, authenticated;
grant execute on function public.has_cr_team_site_access() to authenticated;

create policy "Members can read their own profile" on public.cr_team_profiles
for select to authenticated using (
  (select public.has_cr_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Members can create their own profile" on public.cr_team_profiles
for insert to authenticated with check (
  (select public.has_cr_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Members can edit their own profile" on public.cr_team_profiles
for update to authenticated using (
  (select public.has_cr_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
) with check (
  (select public.has_cr_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Roster admins can manage profiles" on public.cr_team_profiles
for all to authenticated using (exists (select 1 from public.cr_roster_admins))
with check (exists (select 1 from public.cr_roster_admins));

create trigger cr_team_profiles_set_updated_at
before update on public.cr_team_profiles for each row
execute function public.set_team_profile_updated_at();

create policy "Members can read their own submissions" on public.cr_gallery_submissions
for select to authenticated using (
  (select public.has_cr_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Members can submit their own gallery items" on public.cr_gallery_submissions
for insert to authenticated with check (
  (select public.has_cr_team_site_access())
  and lower(email) = lower(auth.jwt() ->> 'email')
  and status = 'pending'
  and (image_path is null or exists (
    select 1 from storage.objects o
    where o.bucket_id = 'cool-runnings-gallery' and o.name = image_path
      and o.owner_id = (select auth.uid())::text
  ))
);
create policy "Gallery moderators can read submissions" on public.cr_gallery_submissions
for select to authenticated using (exists (select 1 from public.cr_roster_admins where can_moderate_gallery));
create policy "Gallery moderators can edit submissions" on public.cr_gallery_submissions
for update to authenticated using (exists (select 1 from public.cr_roster_admins where can_moderate_gallery))
with check (exists (select 1 from public.cr_roster_admins where can_moderate_gallery));
create policy "Gallery moderators can delete submissions" on public.cr_gallery_submissions
for delete to authenticated using (exists (select 1 from public.cr_roster_admins where can_moderate_gallery));

-- Public projections expose the roster and approved posts without emails or object paths.
create view public.cr_published_team_profiles with (security_barrier = true) as
select id, name, roles, bio, is_current_member, photo_path is not null as has_photo
from public.cr_team_profiles;
create view public.cr_published_gallery_submissions with (security_barrier = true) as
select id, media_type, youtube_url, youtube_video_id, title, category, date, created_at
from public.cr_gallery_submissions where status = 'approved';
revoke all on public.cr_published_team_profiles, public.cr_published_gallery_submissions
from public, anon, authenticated;
grant select on public.cr_published_team_profiles, public.cr_published_gallery_submissions to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cool-runnings-gallery', 'cool-runnings-gallery', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('cool-runnings-profile-photos', 'cool-runnings-profile-photos', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

create policy "Cool Runnings members can upload to their own folder" on storage.objects
for insert to authenticated with check (
  bucket_id in ('cool-runnings-gallery', 'cool-runnings-profile-photos')
  and (select public.has_cr_team_site_access())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "Cool Runnings owners and staff can read photos" on storage.objects
for select to authenticated using (
  bucket_id in ('cool-runnings-gallery', 'cool-runnings-profile-photos')
  and (
    ((select public.has_cr_team_site_access()) and owner_id = (select auth.uid())::text)
    or exists (
      select 1 from public.cr_roster_admins
      where bucket_id = 'cool-runnings-profile-photos' or can_moderate_gallery
    )
  )
);
create policy "Cool Runnings owners and staff can delete photos" on storage.objects
for delete to authenticated using (
  bucket_id in ('cool-runnings-gallery', 'cool-runnings-profile-photos')
  and (
    ((select public.has_cr_team_site_access()) and owner_id = (select auth.uid())::text)
    or exists (
      select 1 from public.cr_roster_admins
      where bucket_id = 'cool-runnings-profile-photos' or can_moderate_gallery
    )
  )
);

-- A member can keep an existing photo or replace it with an upload they own.
create function private.check_cr_team_profile_photo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.photo_path is not distinct from old.photo_path then
      return new;
    end if;
  end if;
  if current_user = 'authenticated' and new.photo_path is not null
     and not exists (select 1 from public.cr_roster_admins)
     and not exists (
       select 1 from storage.objects o
       where o.bucket_id = 'cool-runnings-profile-photos' and o.name = new.photo_path
         and o.owner_id = (select auth.uid())::text
     ) then
    raise exception 'Profile photo must belong to the signed-in member' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.check_cr_team_profile_photo() from public, anon, authenticated;

create trigger check_cr_team_profile_photo
before insert or update of photo_path on public.cr_team_profiles
for each row execute function private.check_cr_team_profile_photo();
