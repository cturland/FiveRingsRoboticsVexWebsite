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
