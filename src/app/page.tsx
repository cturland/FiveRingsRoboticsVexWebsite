export default function Home() {
  const latestPosts = [
    { title: 'Season kickoff recap', date: 'March 20, 2026', summary: 'We unveiled the robot and finalized our strategy for regionals.' },
    { title: 'Build session highlight', date: 'March 28, 2026', summary: 'Focused on lift optimization and driver practice sessions.' },
    { title: 'State qualifier prep', date: 'April 1, 2026', summary: 'Final tuning before next week’s main event.' },
  ];

  const nextEvent = { name: 'Regional Qualifiers', date: 'April 20, 2026', location: 'West High Gym', notes: 'Team meeting 2 days before.' };
  const latestResult = { event: 'County Cup', rank: '2nd Place', score: '95' };

  return (
    <div className="space-y-10">
      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-primary-accent)]">VEX Robotics</p>
            <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">West High VEX Robotics Team</h1>
            <p className="mt-4 max-w-xl text-[var(--color-muted)] text-lg">Engineering precision, competition performance, and teamwork excellence in every season.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/team" className="rounded-lg bg-[var(--color-primary-accent)] px-6 py-3 font-semibold text-black">Join the team</a>
              <a href="/fixtures" className="rounded-lg border border-[var(--color-border)] px-6 py-3 font-semibold text-[var(--color-text)] hover:bg-[var(--color-primary)]">View fixtures</a>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-6">
            <h2 className="text-xl font-semibold text-white">Next Event</h2>
            <p className="mt-3 text-[var(--color-muted)]">{nextEvent.name}</p>
            <p className="mt-1 text-white">{nextEvent.date} • {nextEvent.location}</p>
            <p className="mt-3 text-[var(--color-muted)]">{nextEvent.notes}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <h2 className="text-2xl font-bold text-white">About the Team</h2>
        <p className="mt-3 text-[var(--color-muted)] max-w-3xl">
          We are a collaborative group of students who design, build, and program competitive robots in the VEX Robotics Challenge. Our focus is on engineering design cycles, iterative testing, and strong competition performance while developing leadership and STEM skills.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
          <h3 className="text-xl font-semibold text-white">Latest News</h3>
          <ul className="mt-4 space-y-4">
            {latestPosts.map((post) => (
              <li key={post.title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
                <p className="text-sm text-[var(--color-primary-accent)]">{post.date}</p>
                <p className="font-semibold text-white">{post.title}</p>
                <p className="text-[var(--color-muted)] mt-1">{post.summary}</p>
              </li>
            ))}
          </ul>
          <a href="/blog" className="mt-4 inline-block text-[var(--color-primary-accent)] font-semibold">See all posts →</a>
        </div>

        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
          <h3 className="text-xl font-semibold text-white">Latest Result</h3>
          <div className="mt-4 space-y-2">
            <p className="text-[var(--color-muted)]">Event:</p>
            <p className="text-white font-semibold">{latestResult.event}</p>
            <p className="text-[var(--color-muted)]">Rank:</p>
            <p className="text-white font-semibold">{latestResult.rank}</p>
            <p className="text-[var(--color-muted)]">Score:</p>
            <p className="text-white font-semibold">{latestResult.score}</p>
          </div>
        </div>

        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
          <h3 className="text-xl font-semibold text-white">Supporters</h3>
          <p className="mt-3 text-[var(--color-muted)]">Thanks to our sponsors and community partners for funding equipment, travel, and mentorship.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-1">
            {['Sponsor A', 'Sponsor B', 'Sponsor C', 'Sponsor D'].map((sponsor) => (
              <div key={sponsor} className="rounded-lg bg-[var(--color-surface-alt)] p-3 text-[var(--color-text)]">{sponsor}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8">
        <h2 className="text-2xl font-bold text-white">Photo Preview</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900" />
          ))}
        </div>
      </section>
    </div>
  );
}
