import Link from 'next/link';

export default function Navbar() {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/team', label: 'Team' },
    { href: '/blog', label: 'Blog' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/fixtures', label: 'Fixtures' },
    { href: '/results', label: 'Results' },
  ];

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          VEX Robotics
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-slate-200 hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
