'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, galleryEnabled }: { children: ReactNode; galleryEnabled: boolean }) {
  const pathname = usePathname();
  const isDisplayRoute = pathname === '/worlds-live';

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[var(--color-text)]">
      {!isDisplayRoute ? <Navbar galleryEnabled={galleryEnabled} /> : null}
      <main className="flex-1 w-full"> 
        <div className={isDisplayRoute ? 'min-h-screen' : 'container py-5 md:py-10'}>{children}</div>
      </main>
      {!isDisplayRoute ? <Footer galleryEnabled={galleryEnabled} /> : null}
    </div>
  );
}
