/** @type {import('next').NextConfig} */
const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'img.youtube.com',
    pathname: '/vi/**',
  },
];

const nextConfig = {
  images: {
    localPatterns: [{ pathname: '/images/**' }],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns,
  },
};

export default nextConfig;
