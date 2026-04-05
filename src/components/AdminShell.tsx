import Link from 'next/link';

type AdminSection = 'overview' | 'gallery' | 'team';

type AdminShellProps = {
  title: string;
  description: string;
  userEmail: string;
  activeSection: AdminSection;
  children: React.ReactNode;
};

const links = [
  { href: '/admin', label: 'Overview', key: 'overview' },
  { href: '/admin/gallery', label: 'Gallery', key: 'gallery' },
  { href: '/admin/team', label: 'Team', key: 'team' },
] as const;

export default function AdminShell({ title, description, userEmail, activeSection, children }: AdminShellProps) {
  return (
    <section className="mx-auto max-w-6xl py-8">
      <div className="mb-6 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,34,56,0.96),rgba(11,20,33,0.96))] p-6 md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Admin Hub</p>
            <h1 className="heading-display mt-4 text-4xl font-black text-white">{title}</h1>
            <p className="mt-4 text-lg text-[var(--color-muted)]">{description}</p>
          </div>

          <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Signed In As</p>
            <p className="mt-2 break-all text-sm font-bold text-white">{userEmail}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                activeSection === link.key
                  ? 'border-red-400/40 bg-red-500/15 text-white'
                  : 'border-white/10 bg-white/5 text-[var(--color-muted)] hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </section>
  );
}
