'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = [
    { href: '/', label: 'Home' },
    { href: '/team', label: 'Team' },
    { href: '/gallery', label: 'Highlights' },
    { href: '/fixtures', label: 'Competition' },
  ];

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(6,12,23,0.82)] backdrop-blur-xl">
      <div className="container">
        <div className="flex items-center justify-between gap-4 py-3 lg:py-4">
          <Link href="/" className="group flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Image src="/images/FRRLogoBasic.png" alt="FRR Logo" width={128} height={128} className="h-10 w-auto" />
            </div>
            <div className="min-w-0">
              <p className="heading-display truncate text-base font-black text-white transition-colors group-hover:text-red-300 sm:text-lg">
                Five Rings Robotics
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-muted)] sm:text-xs sm:tracking-[0.28em]">
                Team 21052A
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex lg:flex-row lg:items-center lg:gap-4">
            <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-transparent px-4 py-2 text-[var(--color-muted)] hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/worlds-live" className="btn btn-primary px-5 py-2.5 text-xs">
              Worlds Display
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex flex-col gap-1.5">
              <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? 'translate-y-2 rotate-45' : ''}`}></span>
              <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''}`}></span>
            </div>
          </button>
        </div>

        <div
          id="mobile-nav"
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-200 lg:hidden ${
            isMenuOpen ? 'max-h-[420px] pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
          }`}
        >
          <div className="space-y-3 rounded-[1.4rem] border border-white/10 bg-white/5 p-3">
            <nav className="grid gap-2 text-sm font-semibold">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-2xl border border-transparent px-4 py-3 text-[var(--color-muted)] hover:border-white/10 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link href="/worlds-live" onClick={() => setIsMenuOpen(false)} className="btn btn-primary w-full px-5 py-3 text-xs">
              Worlds Display
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
