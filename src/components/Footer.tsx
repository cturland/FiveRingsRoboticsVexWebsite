import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[rgba(5,10,20,0.92)]">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <span className="eyebrow">Built For Competition</span>
            <div>
              <h3 className="heading-display text-2xl font-black text-white">Five Rings Robotics</h3>
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Team 21052A
              </p>
            </div>
            <p className="max-w-md text-[var(--color-muted)]">
              A school robotics team from the International School of Lausanne focused on engineering,
              strategy, and high-performance VEX competition.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-white">Explore</h3>
            <div className="grid gap-2 text-sm text-[var(--color-muted)]">
              <Link href="/">Home</Link>
              <Link href="/team">Team</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/fixtures">Competition</Link>
              <Link href="/blog">Blog</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-white">Contact</h3>
            <div className="grid gap-2 text-sm text-[var(--color-muted)]">
              <p>International School of Lausanne</p>
              <p>Le Mont-sur-Lausanne, Switzerland</p>
              <p>team@fiveringsrobotics.edu</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Five Rings Robotics</p>
          <p>Competitive. Technical. Student-Led.</p>
        </div>
      </div>
    </footer>
  );
}
