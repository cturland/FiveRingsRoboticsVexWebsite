import Link from 'next/link';

export default function Navbar() {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/team', label: 'Team' },
    { href: '/blog', label: 'Updates' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/fixtures', label: 'Competition' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(6,12,23,0.82)] backdrop-blur-xl">
      <div className="container">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="group flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <img src="/images/FRRLogoBasic.png" alt="FRR Logo" className="h-10 w-auto" />
            </div>
            <div>
              <p className="heading-display text-lg font-black text-white transition-colors group-hover:text-red-300">
                Five Rings Robotics
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Team 21052A
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
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
        </div>
      </div>
    </header>
  );
}
