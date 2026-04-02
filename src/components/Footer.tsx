export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] text-[var(--color-muted)]">
      <div className="container grid gap-6 md:grid-cols-3 py-8 text-sm">
        <div>
          <h3 className="text-lg font-semibold text-white">VEX Robotics</h3>
          <p>School Robotics Team.</p>
          <p>Located: West High School</p>
          <p>Email: team@westhighrobotics.edu</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="mt-2 space-y-1">
            <li>Home</li>
            <li>Team</li>
            <li>Blog</li>
            <li>Gallery</li>
            <li>Fixtures</li>
            <li>Results</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Connect</h3>
          <p className="mt-2">Follow us for updates</p>
          <div className="mt-2 flex items-center gap-3">
            <a href="#" className="text-[var(--color-primary-accent)]">Twitter</a>
            <a href="#" className="text-[var(--color-primary-accent)]">Instagram</a>
            <a href="#" className="text-[var(--color-primary-accent)]">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} VEX Robotics Team. Built with Next.js and TypeScript.
      </div>
    </footer>
  );
}
