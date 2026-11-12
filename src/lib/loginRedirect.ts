export const loginDestinationCookie = 'team_login_next';
export const loginCallbackPath = '/auth/callback';

export function getSafeLoginRedirect(value: unknown) {
  if (typeof value !== 'string' || value.length > 1024 || !value.startsWith('/')) return '/upload';

  try {
    const base = 'https://team-site.invalid';
    const url = new URL(value, base);
    const target = url.pathname + url.search + url.hash;
    return url.origin === base && !target.startsWith('//') ? target : '/upload';
  } catch {
    return '/upload';
  }
}
