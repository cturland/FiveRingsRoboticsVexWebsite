import type { MetadataRoute } from 'next';
import { teamSite } from '@/lib/teamSite';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: teamSite.name,
    short_name: teamSite.shortName,
    start_url: '/',
    display: 'standalone',
    theme_color: teamSite.themeColor,
    background_color: teamSite.themeColor,
    icons: [
      { src: teamSite.manifestIcons[0], sizes: '192x192', type: 'image/png' },
      { src: teamSite.manifestIcons[1], sizes: '512x512', type: 'image/png' },
    ],
  };
}
