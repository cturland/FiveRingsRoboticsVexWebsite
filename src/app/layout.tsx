import type { Metadata, Viewport } from 'next';
import { Manrope, Orbitron } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Layout from '@/components/Layout';
import { SITE_URL } from '@/lib/site';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Five Rings Robotics | Team 21052A',
  description: 'Five Rings Robotics is VEX V5 Robotics Competition team 21052A at the International School of Lausanne. Explore the team’s competition schedule and results.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/images/favicon/favicon.ico', sizes: 'any' },
      { url: '/images/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/images/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/images/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${orbitron.variable}`}>
        <Layout>{children}</Layout>
        <Analytics />
      </body>
    </html>
  );
}
