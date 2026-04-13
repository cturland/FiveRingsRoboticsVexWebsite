import { getTeamFixtures, getTeamResults, getTeamSeasonStats, getTeamSummary } from '@/app/actions';
import EventCard from '@/components/EventCard';
import ResultsHistory from '@/components/ResultsHistory';
import SectionHeading from '@/components/SectionHeading';

export default async function FixturesPage() {
  const [fixturesResult, resultsResult, seasonStatsResult, summaryResult] = await Promise.all([
    getTeamFixtures(),
    getTeamResults(),
    getTeamSeasonStats(),
    getTeamSummary(),
  ]);

  const fixtures = fixturesResult.success ? fixturesResult.data : [];
  const results = resultsResult.success ? resultsResult.data : [];
  const seasonStats = seasonStatsResult.success ? seasonStatsResult.data : [];
  const summary = summaryResult.success ? summaryResult.data : null;
  const overallStats = summary ? [
    {
      label: 'Win Rate',
      value: `${summary.winPercentage}%`,
      detail: `${summary.wins}-${summary.losses}-${summary.ties} overall`,
    },
    {
      label: 'Events',
      value: summary.eventsEntered.toString(),
      detail: `${summary.seasonsActive} seasons`,
    },
    {
      label: 'Awards',
      value: summary.awardsWon.toString(),
      detail: 'Career total',
    },
    {
      label: 'Matches',
      value: summary.matchesPlayed.toString(),
      detail: summary.teamNumber,
    },
  ] : [];

  return (
    <section className="space-y-8">
      <SectionHeading
        title="Competition Hub"
        subtitle="Upcoming fixtures and full match history from RobotEvents, in one place."
      />

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

      {overallStats.length > 0 ? (
        <section className="rounded-[1.4rem] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-300">Overall Record</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                A compact RobotEvents summary for the full program.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {overallStats.map((stat) => (
                <div key={stat.label} className="min-w-[9rem] rounded-[1.1rem] border border-white/10 bg-black/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-muted)]">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black leading-none text-white">{stat.value}</p>
                  <p className="mt-1.5 text-xs text-[var(--color-muted)]">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}
