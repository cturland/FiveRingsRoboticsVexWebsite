export function getSafeLoginRedirect(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/')) return '/profile';

  try {
    const base = 'https://team-site.invalid';
    const url = new URL(value, base);
    const target = url.pathname + url.search + url.hash;
    return url.origin === base && !target.startsWith('//') ? target : '/profile';
  } catch {
    return '/profile';
  }
}
