import { teamSite } from '@/lib/teamSite';
import { galleryEnabled } from '@/lib/galleryFeature';
import type { Metadata, Viewport } from 'next';
import { Manrope, Orbitron } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Layout from '@/components/Layout';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: teamSite.name + ' | Team ' + teamSite.number,
  description: 'Official website for ' + teamSite.name + ', VEX team ' + teamSite.number + ' at the International School of Lausanne.',
  icons: {
    icon: [{ url: teamSite.favicon, type: 'image/png', sizes: '32x32' }],
    apple: [{ url: teamSite.appleIcon, type: 'image/png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-team={teamSite.slug}>
      <body className={`${manrope.variable} ${orbitron.variable}`}>
        <Layout galleryEnabled={galleryEnabled}>{children}</Layout>
        <Analytics />
      </body>
    </html>
  );
}
