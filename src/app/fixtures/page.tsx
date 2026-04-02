export default function FixturesPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Fixtures</h1>
      <p className="text-slate-300">
        Upcoming practice matches and tournament events.
      </p>
      <ul className="space-y-3">
        {[
          { date: '2026-04-20', event: 'Regional qualifers', location: 'School gym' },
          { date: '2026-05-10', event: 'State qualifier', location: 'City Arena' },
        ].map((fixture) => (
          <li key={fixture.date} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
            <p className="font-semibold text-white">{fixture.event}</p>
            <p className="text-slate-300">{fixture.date} • {fixture.location}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
