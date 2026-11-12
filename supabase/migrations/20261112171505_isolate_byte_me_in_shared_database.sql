-- ByteMe Robotics has its own roster, permissions and media in the existing database.
-- Five Rings tables and the shared reaction leaderboard are unchanged.
create table private.bm_team_members (
  email text primary key check (
    email = lower(btrim(email)) and split_part(email, '@', 2) in ('isl.ch', 'islstudent.ch')
  )
);
create table public.bm_roster_admins (
  email text primary key check (
    email = lower(btrim(email)) and split_part(email, '@', 2) in ('isl.ch', 'islstudent.ch')
  ),
  can_moderate_gallery boolean not null default false
);
create table public.bm_team_profiles (like public.team_profiles including all);
create table public.bm_gallery_submissions (like public.gallery_submissions including all);

alter table private.bm_team_members enable row level security;
alter table public.bm_roster_admins enable row level security;
alter table public.bm_team_profiles enable row level security;
alter table public.bm_gallery_submissions enable row level security;

revoke all on private.bm_team_members, public.bm_roster_admins, public.bm_team_profiles,
  public.bm_gallery_submissions from public, anon, authenticated;
grant select on public.bm_roster_admins to authenticated;
grant select, insert, update, delete on public.bm_team_profiles, public.bm_gallery_submissions to authenticated;
grant select on public.bm_team_profiles, public.bm_gallery_submissions to service_role;

create policy "Admins can read their own role" on public.bm_roster_admins
for select to authenticated using (email = lower(auth.jwt() ->> 'email'));

-- This function answers only whether the caller can sign in to the ByteMe Robotics site.
create function public.has_bm_team_site_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and (
    exists (select 1 from private.bm_team_members where email = lower(auth.jwt() ->> 'email'))
    or exists (select 1 from public.bm_roster_admins where email = lower(auth.jwt() ->> 'email'))
  );
$$;
revoke all on function public.has_bm_team_site_access() from public, anon, authenticated;
grant execute on function public.has_bm_team_site_access() to authenticated;

create policy "Members can read their own profile" on public.bm_team_profiles
for select to authenticated using (
  (select public.has_bm_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Members can create their own profile" on public.bm_team_profiles
for insert to authenticated with check (
  (select public.has_bm_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Members can edit their own profile" on public.bm_team_profiles
for update to authenticated using (
  (select public.has_bm_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
) with check (
  (select public.has_bm_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Roster admins can manage profiles" on public.bm_team_profiles
for all to authenticated using (exists (select 1 from public.bm_roster_admins))
with check (exists (select 1 from public.bm_roster_admins));

create trigger bm_team_profiles_set_updated_at
before update on public.bm_team_profiles for each row
execute function public.set_team_profile_updated_at();

create policy "Members can read their own submissions" on public.bm_gallery_submissions
for select to authenticated using (
  (select public.has_bm_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);
create policy "Members can submit their own gallery items" on public.bm_gallery_submissions
for insert to authenticated with check (
  (select public.has_bm_team_site_access())
  and lower(email) = lower(auth.jwt() ->> 'email')
  and status = 'pending'
  and (image_path is null or exists (
    select 1 from storage.objects o
    where o.bucket_id = 'byte-me-gallery' and o.name = image_path
      and o.owner_id = (select auth.uid())::text
  ))
);
create policy "Gallery moderators can read submissions" on public.bm_gallery_submissions
for select to authenticated using (exists (select 1 from public.bm_roster_admins where can_moderate_gallery));
create policy "Gallery moderators can edit submissions" on public.bm_gallery_submissions
for update to authenticated using (exists (select 1 from public.bm_roster_admins where can_moderate_gallery))
with check (exists (select 1 from public.bm_roster_admins where can_moderate_gallery));
create policy "Gallery moderators can delete submissions" on public.bm_gallery_submissions
for delete to authenticated using (exists (select 1 from public.bm_roster_admins where can_moderate_gallery));

-- Public projections expose the roster and approved posts without emails or object paths.
create view public.bm_published_team_profiles with (security_barrier = true) as
select id, name, roles, bio, is_current_member, photo_path is not null as has_photo
from public.bm_team_profiles;
create view public.bm_published_gallery_submissions with (security_barrier = true) as
select id, media_type, youtube_url, youtube_video_id, title, category, date, created_at
from public.bm_gallery_submissions where status = 'approved';
revoke all on public.bm_published_team_profiles, public.bm_published_gallery_submissions
from public, anon, authenticated;
grant select on public.bm_published_team_profiles, public.bm_published_gallery_submissions to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('byte-me-gallery', 'byte-me-gallery', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']),
  ('byte-me-profile-photos', 'byte-me-profile-photos', false, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

create policy "ByteMe Robotics members can upload to their own folder" on storage.objects
for insert to authenticated with check (
  bucket_id in ('byte-me-gallery', 'byte-me-profile-photos')
  and (select public.has_bm_team_site_access())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "ByteMe Robotics owners and staff can read photos" on storage.objects
for select to authenticated using (
  bucket_id in ('byte-me-gallery', 'byte-me-profile-photos')
  and (
    ((select public.has_bm_team_site_access()) and owner_id = (select auth.uid())::text)
    or exists (
      select 1 from public.bm_roster_admins
      where bucket_id = 'byte-me-profile-photos' or can_moderate_gallery
    )
  )
);
create policy "ByteMe Robotics owners and staff can delete photos" on storage.objects
for delete to authenticated using (
  bucket_id in ('byte-me-gallery', 'byte-me-profile-photos')
  and (
    ((select public.has_bm_team_site_access()) and owner_id = (select auth.uid())::text)
    or exists (
      select 1 from public.bm_roster_admins
      where bucket_id = 'byte-me-profile-photos' or can_moderate_gallery
    )
  )
);

-- A member can keep an existing photo or replace it with an upload they own.
create function private.check_bm_team_profile_photo()
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
     and not exists (select 1 from public.bm_roster_admins)
     and not exists (
       select 1 from storage.objects o
       where o.bucket_id = 'byte-me-profile-photos' and o.name = new.photo_path
         and o.owner_id = (select auth.uid())::text
     ) then
    raise exception 'Profile photo must belong to the signed-in member' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.check_bm_team_profile_photo() from public, anon, authenticated;

create trigger check_bm_team_profile_photo
before insert or update of photo_path on public.bm_team_profiles
for each row execute function private.check_bm_team_profile_photo();
