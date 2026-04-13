import type { Metadata } from 'next';
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
  title: 'Five Rings Robotics | Team 21052A',
  description: 'Official Five Rings Robotics website for Team 21052A.',
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
