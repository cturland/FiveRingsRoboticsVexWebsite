import { teamSite } from '@/lib/teamSite';
import 'server-only';

export const instagram = {
  handle: teamSite.instagramHandle,
  url: 'https://www.instagram.com/' + teamSite.instagramHandle + '/',
};

type InstagramMedia = {
  id?: unknown;
  caption?: unknown;
  media_type?: unknown;
  media_url?: unknown;
  thumbnail_url?: unknown;
  permalink?: unknown;
  timestamp?: unknown;
  username?: unknown;
};

export type InstagramPost = {
  id: string;
  caption: string;
  image: string | null;
  url: string;
  date: string | null;
  isVideo: boolean;
};

function httpsUrl(value: unknown, allowedHost: (host: string) => boolean) {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password && !url.port && allowedHost(url.hostname)) {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return [];

  const url = new URL('https://graph.instagram.com/v25.0/me/media');
  url.searchParams.set('fields', 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username');
  url.searchParams.set('limit', '9');

  try {
    const response = await fetch(url, {
      headers: { Authorization: 'Bearer ' + token },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error('Instagram feed request failed with HTTP status', response.status);
      return [];
    }

    const result: { data?: InstagramMedia[] } = await response.json();
    if (!Array.isArray(result.data)) return [];

    return result.data.flatMap((item): InstagramPost[] => {
      if (!item || typeof item.id !== 'string' ||
          typeof item.username !== 'string' || item.username.toLowerCase() !== instagram.handle) {
        return [];
      }

      const permalink = httpsUrl(item.permalink, host => host === 'www.instagram.com' || host === 'instagram.com');
      if (!permalink) return [];

      const isVideo = item.media_type === 'VIDEO';
      const image = httpsUrl(isVideo ? item.thumbnail_url : item.media_url, host =>
        host.endsWith('.cdninstagram.com') || host.endsWith('.fbcdn.net')
      );
      const timestamp = typeof item.timestamp === 'string' ? Date.parse(item.timestamp) : NaN;

      return [{
        id: item.id,
        caption: typeof item.caption === 'string' ? item.caption.trim() : '',
        image,
        url: permalink,
        date: Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString(),
        isVideo,
      }];
    }).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  } catch {
    console.error('Instagram feed could not be loaded');
    return [];
  }
}
