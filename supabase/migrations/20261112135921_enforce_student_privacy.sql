-- Apply after the application uses the published views and server photo routes.

revoke all on public.team_profiles, public.gallery_submissions, public.gallery_admins,
  public.reaction_time_scores, public.robotevents_team_cache from public, anon, authenticated;
grant select, insert, update, delete on public.team_profiles, public.gallery_submissions to authenticated;
grant select on public.gallery_admins to authenticated;
grant select on public.reaction_time_scores, public.robotevents_team_cache to anon, authenticated;
grant select on public.team_profiles, public.gallery_submissions to service_role;

drop policy if exists "Public can view team profiles" on public.team_profiles;
create policy "Members can read their own team profile" on public.team_profiles
for select to authenticated using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Users can insert their own team profile" on public.team_profiles;
create policy "Members can insert their own team profile" on public.team_profiles
for insert to authenticated with check (
  (select public.has_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);

drop policy if exists "Users can update their own team profile" on public.team_profiles;
create policy "Members can update their own team profile" on public.team_profiles
for update to authenticated using (
  (select public.has_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
) with check (
  (select public.has_team_site_access()) and lower(email) = lower(auth.jwt() ->> 'email')
);

drop policy if exists "Public can view approved gallery submissions" on public.gallery_submissions;
drop policy if exists "Authenticated users can insert their own pending gallery submissions" on public.gallery_submissions;
create policy "Members can submit their own gallery items" on public.gallery_submissions
for insert to authenticated with check (
  (select public.has_team_site_access())
  and lower(email) = lower(auth.jwt() ->> 'email')
  and status = 'pending'
  and (image_path is null or exists (
    select 1 from storage.objects o
    where o.bucket_id = 'gallery-uploads' and o.name = image_path
      and o.owner_id = (select auth.uid())::text
  ))
);

update storage.buckets set public = false where id in ('gallery-uploads', 'team-profile-photos');

drop policy if exists "Public can view gallery uploads" on storage.objects;
drop policy if exists "Authenticated users can upload gallery images" on storage.objects;
drop policy if exists "Authenticated users can update their gallery images" on storage.objects;
drop policy if exists "Authenticated users can delete gallery images" on storage.objects;
drop policy if exists "Public can view team profile photos" on storage.objects;
drop policy if exists "Authenticated users can upload team profile photos" on storage.objects;
drop policy if exists "Authenticated users can update team profile photos" on storage.objects;
drop policy if exists "Authenticated users can delete team profile photos" on storage.objects;

create policy "Members can upload to their own folder" on storage.objects
for insert to authenticated with check (
  bucket_id in ('gallery-uploads', 'team-profile-photos')
  and (select public.has_team_site_access())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Owners and admins can read team site photos" on storage.objects
for select to authenticated using (
  bucket_id in ('gallery-uploads', 'team-profile-photos')
  and (
    owner_id = (select auth.uid())::text
    or exists (select 1 from public.gallery_admins)
  )
);

create policy "Owners and admins can delete team site photos" on storage.objects
for delete to authenticated using (
  bucket_id in ('gallery-uploads', 'team-profile-photos')
  and (
    (owner_id = (select auth.uid())::text and (select public.has_team_site_access()))
    or exists (select 1 from public.gallery_admins)
  )
);

-- Old photo paths remain valid. A replacement must be an upload the member owns.
create function private.check_team_profile_photo()
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
     and not exists (select 1 from public.gallery_admins)
     and not exists (
       select 1 from storage.objects o
       where o.bucket_id = 'team-profile-photos' and o.name = new.photo_path
         and o.owner_id = (select auth.uid())::text
     ) then
    raise exception 'Profile photo must belong to the signed-in member' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.check_team_profile_photo() from public, anon, authenticated;

create trigger check_team_profile_photo
before insert or update of photo_path on public.team_profiles
for each row execute function private.check_team_profile_photo();
