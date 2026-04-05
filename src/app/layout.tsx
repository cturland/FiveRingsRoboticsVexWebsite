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
