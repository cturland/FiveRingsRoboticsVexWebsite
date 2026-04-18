/** @type {import('next').NextConfig} */
const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'img.youtube.com',
    pathname: '/vi/**',
  },
];

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
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns,
  },
};

export default nextConfig;
