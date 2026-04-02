import { getTeamFixtures, getTeamResults, getTeamSeasonStats } from '@/app/actions';
import EventCard from '@/components/EventCard';
import ResultsHistory from '@/components/ResultsHistory';
import SectionHeading from '@/components/SectionHeading';

export default async function FixturesPage() {
  const [fixturesResult, resultsResult, seasonStatsResult] = await Promise.all([
    getTeamFixtures(),
    getTeamResults(),
    getTeamSeasonStats(),
  ]);

  const fixtures = fixturesResult.success ? fixturesResult.data : [];
  const results = resultsResult.success ? resultsResult.data : [];
  const seasonStats = seasonStatsResult.success ? seasonStatsResult.data : [];

  return (
    <section className="space-y-8">
      <SectionHeading
        title="Competition Hub"
        subtitle="Upcoming fixtures and full match history from RobotEvents, in one place."
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Live Data</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Focused on upcoming events and season-by-season results.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[var(--color-muted)]">
            {fixtures.length} upcoming event{fixtures.length === 1 ? '' : 's'}
          </div>
          <div className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-2 text-[var(--color-muted)]">
            {results.length} total result{results.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Upcoming</p>
              <h2 className="mt-2 text-3xl font-black text-white">Fixtures</h2>
            </div>
          </div>

          {fixtures.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-[var(--color-muted)]">
              {fixturesResult.error || 'No upcoming events are available on RobotEvents right now.'}
            </div>
          ) : (
            <div className="grid gap-5">
              {fixtures.map((fixture) => (
                <EventCard key={fixture.id ?? `${fixture.eventName}-${fixture.startDate}`} {...fixture} />
              ))}
            </div>
          )}
        </div>

        <ResultsHistory
          results={results}
          seasonStats={seasonStats}
          error={resultsResult.error || seasonStatsResult.error || undefined}
        />
      </div>
    </section>
  );
}
