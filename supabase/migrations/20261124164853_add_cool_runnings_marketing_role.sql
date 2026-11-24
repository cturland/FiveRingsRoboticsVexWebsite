alter table public.cr_team_profiles drop constraint team_profiles_roles_allowed_check;
alter table public.cr_team_profiles add constraint team_profiles_roles_allowed_check check (roles <@ array['Lead Engineer','Support Engineer','Lead Programmer','Support Programmer','Driver','Backup Driver','Lead Scout/Strategist','Marketing']);
