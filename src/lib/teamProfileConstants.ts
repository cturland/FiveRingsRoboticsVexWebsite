export const TEAM_PROFILE_ROLE_OPTIONS = [
  'Lead Engineer',
  'Support Engineer',
  'Lead Programmer',
  'Support Programmer',
  'Driver',
  'Backup Driver',
  'Lead Scout/Strategist',
] as const;

export type TeamProfileRole = (typeof TEAM_PROFILE_ROLE_OPTIONS)[number];
