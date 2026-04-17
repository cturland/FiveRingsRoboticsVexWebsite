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
