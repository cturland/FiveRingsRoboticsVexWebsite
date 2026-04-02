import galleryData from '../../../data/gallery.json';
import { getTeamFixtures, getTeamResults, getTeamSummary } from '@/app/actions';
import WorldsPhotoRotator from '@/components/WorldsPhotoRotator';

const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='520' viewBox='0 0 800 520'%3E%3Crect width='800' height='520' fill='%230b1323'/%3E%3Ctext x='50%25' y='50%25' fill='%23f8fafc' font-size='36' font-family='Segoe UI, sans-serif' text-anchor='middle' dominant-baseline='middle'%3ENo Photo Available%3C/text%3E%3C/svg%3E";

function formatDate(value: string, includeTime = false) {
  if (!value) {
    return 'TBC';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit', timeZone: 'Europe/Zurich', timeZoneName: 'short' as const } : {}),
  }).format(new Date(value));
}

export default async function WorldsLivePage() {
  const [fixturesResult, resultsResult, summaryResult] = await Promise.all([
    getTeamFixtures(),
    getTeamResults(),
    getTeamSummary(),
  ]);

  const fixtures = (fixturesResult.success ? fixturesResult.data : []).slice(0, 3);
  const results = (resultsResult.success ? resultsResult.data : []).slice(0, 4);
  const summary = summaryResult.success && summaryResult.data ? summaryResult.data : null;

  const photos = (Array.isArray(galleryData) ? galleryData : [])
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#040914_0%,#0a1220_55%,#07111f_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col gap-8 px-8 py-8 lg:px-12 lg:py-10">
        <header className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-8 py-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.35em] text-red-300">Five Rings Robotics</p>
              <h1 className="heading-display mt-4 text-4xl font-black text-white md:text-6xl">
                Worlds Live Board
              </h1>
              <p className="mt-4 max-w-4xl text-lg text-[var(--color-muted)] md:text-2xl">
                2026 VEX Robotics World Championship: VEX V5 Robotics Competition High School Event
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:min-w-[46rem]">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Team</p>
                <p className="mt-2 text-3xl font-black text-white">{summary?.teamNumber || '21052A'}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{summary?.teamName || 'Five Rings Robotics'}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Record</p>
                <p className="mt-2 text-3xl font-black text-white">
                  {summary ? `${summary.wins}-${summary.losses}-${summary.ties}` : '0-0-0'}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {summary ? `${summary.winPercentage}% win rate` : 'Live data unavailable'}
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Status</p>
                <p className="mt-2 text-3xl font-black text-white">Live</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Auto-refresh data every few minutes</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="grid gap-8">
            <div className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Upcoming Fixtures</p>
                <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">What&apos;s Next</h2>
              </div>

              <div className="grid gap-4">
                {fixtures.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-6 text-lg text-[var(--color-muted)]">
                    {fixturesResult.error || 'No upcoming fixtures available right now.'}
                  </div>
                ) : (
                  fixtures.map((fixture) => (
                    <div key={fixture.id} className="rounded-[1.4rem] border border-white/10 bg-[rgba(8,16,29,0.55)] px-5 py-5">
                      <p className="text-sm font-black uppercase tracking-[0.22em] text-red-300">{formatDate(fixture.startDate)}</p>
                      <h3 className="mt-2 text-2xl font-black text-white">{fixture.eventName}</h3>
                      <p className="mt-3 text-lg text-[var(--color-muted)]">{fixture.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Recent Results</p>
                <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Latest Matches</h2>
              </div>

              <div className="grid gap-4">
                {results.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-6 text-lg text-[var(--color-muted)]">
                    {resultsResult.error || 'No recent results available right now.'}
                  </div>
                ) : (
                  results.map((result) => (
                    <div key={result.id} className="rounded-[1.4rem] border border-white/10 bg-[rgba(8,16,29,0.55)] px-5 py-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.22em] text-red-300">{formatDate(result.date, true)}</p>
                          <h3 className="mt-2 text-2xl font-black text-white">{result.eventName}</h3>
                        </div>
                        <div className={`rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.2em] ${result.placement === 'Win' ? 'bg-green-500 text-white' : result.placement === 'Loss' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                          {result.placement}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Our Alliance</p>
                            <p className="text-3xl font-black text-white">{result.awards}</p>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-100">{result.ourTeams}</p>
                        </div>
                        <div className="rounded-[1rem] border border-blue-400/20 bg-blue-500/10 px-4 py-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Opponent</p>
                            <p className="text-3xl font-black text-white">{result.opponentScore}</p>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-100">{result.opponentTeams}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <WorldsPhotoRotator photos={photos} placeholder={placeholder} />
        </div>
      </div>
    </div>
  );
}
