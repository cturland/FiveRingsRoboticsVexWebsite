-- Baseline for the original schema, in dependency order.

-- 20260405_create_gallery_uploads_bucket.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-uploads',
  'gallery-uploads',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view gallery uploads"
on storage.objects
for select
to public
using (bucket_id = 'gallery-uploads');

create policy "Authenticated users can upload gallery images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'gallery-uploads');

create policy "Authenticated users can update their gallery images"
on storage.objects
for update
to authenticated
using (bucket_id = 'gallery-uploads')
with check (bucket_id = 'gallery-uploads');

create policy "Authenticated users can delete gallery images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'gallery-uploads');

-- 20260405_create_gallery_submissions_table.sql
create table if not exists public.gallery_submissions (
  id bigint generated always as identity primary key,
  email text not null,
  image_path text not null,
  title text not null,
  category text not null,
  date date not null,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  constraint gallery_submissions_status_check check (status in ('pending', 'approved', 'rejected'))
);

alter table public.gallery_submissions enable row level security;

create index if not exists gallery_submissions_status_created_at_idx
  on public.gallery_submissions (status, created_at desc);

create policy "Authenticated users can insert their own pending gallery submissions"
on public.gallery_submissions
for insert
to authenticated
with check (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status = 'pending'
);

create policy "Authenticated users can view their own gallery submissions"
on public.gallery_submissions
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- 20260405_allow_public_read_of_approved_gallery_submissions.sql
create policy "Public can view approved gallery submissions"
on public.gallery_submissions
for select
to public
using (status = 'approved');

-- 20260405_create_gallery_admins_table.sql
create table if not exists public.gallery_admins (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.gallery_admins enable row level security;

create policy "Gallery admins can view their own admin record"
on public.gallery_admins
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "Gallery admins can view all submissions"
on public.gallery_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create policy "Gallery admins can update submissions"
on public.gallery_submissions
for update
to authenticated
using (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

-- 20260405_create_team_profiles.sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-profile-photos',
  'team-profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.team_profiles (
  id bigint generated always as identity primary key,
  email text not null unique,
  name text not null,
  photo_path text,
  roles text[] not null default '{}',
  bio text not null default '',
  is_current_member boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_profiles_name_length_check check (char_length(name) <= 120),
  constraint team_profiles_bio_length_check check (char_length(bio) <= 1200),
  constraint team_profiles_roles_count_check check (coalesce(array_length(roles, 1), 0) > 0),
  constraint team_profiles_roles_allowed_check check (
    roles <@ array[
      'Lead Engineer',
      'Support Engineer',
      'Lead Programmer',
      'Support Programmer',
      'Driver',
      'Backup Driver',
      'Lead Scout/Strategist'
    ]
  )
);

create or replace function public.set_team_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists team_profiles_set_updated_at on public.team_profiles;

create trigger team_profiles_set_updated_at
before update on public.team_profiles
for each row
execute function public.set_team_profile_updated_at();

alter table public.team_profiles enable row level security;

create index if not exists team_profiles_current_member_idx
  on public.team_profiles (is_current_member, updated_at desc);

create policy "Public can view team profiles"
on public.team_profiles
for select
to public
using (true);

create policy "Users can insert their own team profile"
on public.team_profiles
for insert
to authenticated
with check (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "Users can update their own team profile"
on public.team_profiles
for update
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
)
with check (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "Gallery admins can manage team profiles"
on public.team_profiles
for all
to authenticated
using (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create policy "Public can view team profile photos"
on storage.objects
for select
to public
using (bucket_id = 'team-profile-photos');

create policy "Authenticated users can upload team profile photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'team-profile-photos');

create policy "Authenticated users can update team profile photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'team-profile-photos')
with check (bucket_id = 'team-profile-photos');

create policy "Authenticated users can delete team profile photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'team-profile-photos');

-- 20260417_add_youtube_updates.sql
alter table public.gallery_submissions
  add column if not exists media_type text not null default 'image',
  add column if not exists youtube_url text,
  add column if not exists youtube_video_id text;

alter table public.gallery_submissions
  alter column image_path drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_submissions_media_type_check'
  ) then
    alter table public.gallery_submissions
      add constraint gallery_submissions_media_type_check
      check (
        media_type in ('image', 'youtube')
        and (
          (media_type = 'image' and image_path is not null and youtube_video_id is null)
          or
          (media_type = 'youtube' and image_path is null and youtube_url is not null and youtube_video_id is not null)
        )
      );
  end if;
end
$$;

create index if not exists gallery_submissions_media_type_idx
  on public.gallery_submissions (media_type);

-- 20260417_create_reaction_time_scores.sql
create table if not exists public.reaction_time_scores (
  id bigint generated always as identity primary key,
  team_number text not null,
  player_name text not null,
  normalized_team_number text not null,
  normalized_player_name text not null,
  reaction_time_ms integer not null,
  attempts integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reaction_time_scores_time_check check (reaction_time_ms > 0 and reaction_time_ms < 10000),
  constraint reaction_time_scores_identity_unique unique (normalized_team_number, normalized_player_name)
);

alter table public.reaction_time_scores enable row level security;

create index if not exists reaction_time_scores_time_idx
  on public.reaction_time_scores (reaction_time_ms asc, updated_at asc);

create policy "Anyone can view reaction time leaderboard"
on public.reaction_time_scores
for select
to anon, authenticated
using (true);

create or replace function public.submit_reaction_time_score(
  submitted_team_number text,
  submitted_player_name text,
  submitted_reaction_time_ms integer
)
returns public.reaction_time_scores
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned_team_number text;
  cleaned_player_name text;
  normalized_team_number_value text;
  normalized_player_name_value text;
  saved_score public.reaction_time_scores;
begin
  cleaned_team_number := upper(regexp_replace(trim(coalesce(submitted_team_number, '')), '\s+', '', 'g'));
  cleaned_player_name := regexp_replace(trim(coalesce(submitted_player_name, '')), '\s+', ' ', 'g');
  normalized_team_number_value := lower(cleaned_team_number);
  normalized_player_name_value := lower(cleaned_player_name);

  if cleaned_team_number = '' or cleaned_player_name = '' then
    raise exception 'Team number and player name are required.';
  end if;

  if cleaned_team_number !~ '^[0-9]{1,6}[A-Za-z]{0,2}$' then
    raise exception 'Enter a valid VEX team number.';
  end if;

  if submitted_reaction_time_ms <= 0 or submitted_reaction_time_ms >= 10000 then
    raise exception 'Reaction time must be between 1 and 9999 milliseconds.';
  end if;

  insert into public.reaction_time_scores (
    team_number,
    player_name,
    normalized_team_number,
    normalized_player_name,
    reaction_time_ms
  )
  values (
    cleaned_team_number,
    cleaned_player_name,
    normalized_team_number_value,
    normalized_player_name_value,
    submitted_reaction_time_ms
  )
  on conflict (normalized_team_number, normalized_player_name)
  do update set
    team_number = excluded.team_number,
    player_name = excluded.player_name,
    reaction_time_ms = least(public.reaction_time_scores.reaction_time_ms, excluded.reaction_time_ms),
    attempts = public.reaction_time_scores.attempts + 1,
    updated_at = case
      when excluded.reaction_time_ms < public.reaction_time_scores.reaction_time_ms
        then timezone('utc', now())
      else public.reaction_time_scores.updated_at
    end
  returning * into saved_score;

  return saved_score;
end;
$$;

grant execute on function public.submit_reaction_time_score(text, text, integer) to anon, authenticated;

-- 20260417_create_robotevents_team_cache.sql
create table if not exists public.robotevents_team_cache (
  team_id bigint primary key,
  team_number text not null,
  team_name text,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.robotevents_team_cache enable row level security;

create index if not exists robotevents_team_cache_number_idx
  on public.robotevents_team_cache (team_number);

create index if not exists robotevents_team_cache_updated_at_idx
  on public.robotevents_team_cache (updated_at);

drop policy if exists "Anyone can view RobotEvents team cache"
  on public.robotevents_team_cache;

create policy "Anyone can view RobotEvents team cache"
on public.robotevents_team_cache
for select
to anon, authenticated
using (true);

create or replace function public.upsert_robotevents_team_cache(
  submitted_team_id bigint,
  submitted_team_number text,
  submitted_team_name text
)
returns public.robotevents_team_cache
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned_team_number text;
  cleaned_team_name text;
  saved_team public.robotevents_team_cache;
begin
  cleaned_team_number := upper(regexp_replace(trim(coalesce(submitted_team_number, '')), '\s+', '', 'g'));
  cleaned_team_name := nullif(regexp_replace(trim(coalesce(submitted_team_name, '')), '\s+', ' ', 'g'), '');

  if submitted_team_id is null or submitted_team_id <= 0 then
    raise exception 'RobotEvents team id is required.';
  end if;

  if cleaned_team_number = '' then
    raise exception 'RobotEvents team number is required.';
  end if;

  insert into public.robotevents_team_cache (
    team_id,
    team_number,
    team_name
  )
  values (
    submitted_team_id,
    cleaned_team_number,
    cleaned_team_name
  )
  on conflict (team_id)
  do update set
    team_number = excluded.team_number,
    team_name = excluded.team_name,
    updated_at = timezone('utc', now())
  returning * into saved_team;

  return saved_team;
end;
$$;

grant execute on function public.upsert_robotevents_team_cache(bigint, text, text) to anon, authenticated;

-- 20260424_allow_gallery_admin_delete_submissions.sql
create policy "Gallery admins can delete submissions"
on public.gallery_submissions
for delete
to authenticated
using (
  exists (
    select 1
    from public.gallery_admins admins
    where lower(admins.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);
