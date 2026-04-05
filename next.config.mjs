/** @type {import('next').NextConfig} */
const remotePatterns = [];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);

    remotePatterns.push({
      protocol: supabaseUrl.protocol.replace(':', ''),
      hostname: supabaseUrl.hostname,
      pathname: '/storage/v1/object/public/**',
    });
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL for Next.js image remotePatterns:', error);
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
