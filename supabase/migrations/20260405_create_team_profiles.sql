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
