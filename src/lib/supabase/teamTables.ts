import 'server-only';

import { teamSite } from '@/lib/teamSite';

const tableNames = {
  'five-rings': {
    admins: 'gallery_admins',
    profiles: 'team_profiles',
    publicProfiles: 'published_team_profiles',
    submissions: 'gallery_submissions',
    publicSubmissions: 'published_gallery_submissions',
    accessCheck: 'has_team_site_access',
  },
  'cool-runnings': {
    admins: 'cr_roster_admins',
    profiles: 'cr_team_profiles',
    publicProfiles: 'cr_published_team_profiles',
    submissions: 'cr_gallery_submissions',
    publicSubmissions: 'cr_published_gallery_submissions',
    accessCheck: 'has_cr_team_site_access',
  },
  'byte-me': {
    admins: 'bm_roster_admins',
    profiles: 'bm_team_profiles',
    publicProfiles: 'bm_published_team_profiles',
    submissions: 'bm_gallery_submissions',
    publicSubmissions: 'bm_published_gallery_submissions',
    accessCheck: 'has_bm_team_site_access',
  },
};

export const teamTables = tableNames[teamSite.slug];
