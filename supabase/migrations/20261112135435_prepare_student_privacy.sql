-- Keep access records outside the Data API and expose only the caller's own access decision.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.team_site_members (
  email text primary key check (
    email = lower(btrim(email)) and split_part(email, '@', 2) in ('isl.ch', 'islstudent.ch')
  )
);
alter table private.team_site_members enable row level security;
revoke all on private.team_site_members from public, anon, authenticated;

create function public.has_team_site_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null and (
    exists (
      select 1 from private.team_site_members m
      where m.email = lower(auth.jwt() ->> 'email')
    ) or exists (
      select 1 from public.gallery_admins a
      where lower(a.email) = lower(auth.jwt() ->> 'email')
    )
  );
$$;
revoke all on function public.has_team_site_access() from public, anon, authenticated;
grant execute on function public.has_team_site_access() to authenticated;

-- Owner-rights projections deliberately expose only these published fields.
create view public.published_team_profiles with (security_barrier = true) as
select id, name, roles, bio, is_current_member, photo_path is not null as has_photo
from public.team_profiles;

create view public.published_gallery_submissions with (security_barrier = true) as
select id, media_type, youtube_url, youtube_video_id, title, category, date, created_at
from public.gallery_submissions
where status = 'approved';

revoke all on public.published_team_profiles, public.published_gallery_submissions
from public, anon, authenticated;
grant select on public.published_team_profiles, public.published_gallery_submissions
to anon, authenticated;
