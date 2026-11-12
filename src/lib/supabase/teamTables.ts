import 'server-only';

import { teamSite } from '@/lib/teamSite';

export const teamTables = teamSite.slug === 'cool-runnings'
  ? {
      admins: 'cr_roster_admins',
      profiles: 'cr_team_profiles',
      publicProfiles: 'cr_published_team_profiles',
      submissions: 'cr_gallery_submissions',
      publicSubmissions: 'cr_published_gallery_submissions',
      accessCheck: 'has_cr_team_site_access',
    }
  : {
      admins: 'gallery_admins',
      profiles: 'team_profiles',
      publicProfiles: 'published_team_profiles',
      submissions: 'gallery_submissions',
      publicSubmissions: 'published_gallery_submissions',
      accessCheck: 'has_team_site_access',
    };
