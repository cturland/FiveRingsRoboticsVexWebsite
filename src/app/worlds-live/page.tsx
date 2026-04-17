import Image from 'next/image';
import { getTeamFixtures, getTeamResults, getTeamSummary } from '@/app/actions';
import WorldsPhotoRotator from '@/components/WorldsPhotoRotator';
import { getGalleryItems } from '@/lib/gallery';

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

function getAllianceStyles(color: string, isOpponent = false) {
  const normalized = color.toLowerCase();

  if (normalized === 'blue') {
    return isOpponent
      ? {
          panelClass: 'border-blue-400/25 bg-[rgba(25,46,82,0.72)]',
          labelClass: 'text-blue-300',
          label: 'Blue Alliance',
        }
      : {
          panelClass: 'border-blue-400/25 bg-[rgba(25,46,82,0.72)]',
          labelClass: 'text-blue-300',
          label: 'Our Alliance',
        };
  }

  if (normalized === 'red') {
    return isOpponent
      ? {
          panelClass: 'border-red-500/25 bg-[rgba(69,31,41,0.72)]',
          labelClass: 'text-red-300',
          label: 'Red Alliance',
        }
      : {
          panelClass: 'border-red-500/25 bg-[rgba(69,31,41,0.72)]',
          labelClass: 'text-red-300',
          label: 'Our Alliance',
        };
  }

  return {
    panelClass: 'border-white/15 bg-[rgba(255,255,255,0.06)]',
    labelClass: 'text-slate-300',
    label: isOpponent ? 'Opponent' : 'Our Alliance',
  };
}

export default async function WorldsLivePage() {
  const [fixturesResult, resultsResult, summaryResult] = await Promise.all([
    getTeamFixtures(),
    getTeamResults(),
    getTeamSummary(),
  ]);
  const allGalleryItems = await getGalleryItems();

  const fixtures = (fixturesResult.success ? fixturesResult.data : []).slice(0, 2);
  const results = (resultsResult.success ? resultsResult.data : []).slice(0, 2);
  const summary = summaryResult.success && summaryResult.data ? summaryResult.data : null;

  const photos = allGalleryItems
    .filter((item) => item.mediaType === 'image')
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 10);

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,#040914_0%,#0a1220_55%,#07111f_100%)] text-white">
      <div className="mx-auto flex h-screen max-w-[1920px] flex-col gap-5 px-6 py-5 xl:px-8 xl:py-6">
        <header className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-6 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-5 xl:gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/5 p-3 xl:h-28 xl:w-28">
                <Image
                  src="/images/FRRLogo.png"
                  alt="Five Rings Robotics logo"
                  width={224}
                  height={224}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.32em] text-red-300 xl:text-sm">Team 21052A</p>
                <h1 className="heading-display mt-2 text-3xl font-black text-white md:text-5xl">
                  Five Rings Robotics
                </h1>
                <p className="mt-3 max-w-5xl text-base text-[var(--color-muted)] md:text-xl">
                  Follow ISL&apos;s Five Rings Robotics as they represent Switzerland at the World VEX Finals
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:min-w-[33rem]">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3.5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Team</p>
                <p className="mt-1.5 text-2xl font-black text-white xl:text-3xl">{summary?.teamNumber || '21052A'}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{summary?.teamName || 'Five Rings Robotics'}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3.5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Status</p>
                <p className="mt-1.5 text-2xl font-black text-white xl:text-3xl">Live</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Auto-refresh data every few minutes</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <section className="grid min-h-0 gap-5 xl:grid-rows-[0.82fr_1.18fr]">
            <div className="min-h-0 rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
              <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">What&apos;s Next</p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Upcoming Fixtures</h2>
              </div>

              <div className="grid gap-3">
                {fixtures.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-5 text-base text-[var(--color-muted)]">
                    {fixturesResult.error || 'No upcoming fixtures available right now.'}
                  </div>
                ) : (
                  fixtures.map((fixture) => (
                    <div key={fixture.id} className="rounded-[1.2rem] border border-white/10 bg-[rgba(8,16,29,0.55)] px-4 py-4">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300 xl:text-sm">{formatDate(fixture.startDate)}</p>
                      <h3 className="mt-2 line-clamp-2 text-xl font-black text-white xl:text-2xl">{fixture.eventName}</h3>
                      <p className="mt-2 text-base text-[var(--color-muted)] xl:text-lg">{fixture.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="min-h-0 rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
              <div className="mb-4">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Recent Results</p>
                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Latest Matches</h2>
              </div>

              <div className="grid gap-3">
                {results.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-5 text-base text-[var(--color-muted)]">
                    {resultsResult.error || 'No recent results available right now.'}
                  </div>
                ) : (
                  results.map((result) => (
                    <div key={result.id} className="rounded-[1.1rem] border border-white/10 bg-[rgba(8,16,29,0.55)] px-4 py-3.5">
                      {(() => {
                        const ourAlliance = getAllianceStyles(result.ourAllianceColor);
                        const opponentAlliance = getAllianceStyles(result.opponentAllianceColor, true);

                        return (
                          <>
                      <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/70 bg-[rgba(12,20,34,0.75)] px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-white xl:text-sm">{formatDate(result.date, true)}</p>
                        <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300 xl:text-xs">
                          {result.eventCode || 'Event Code'}
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                        <div className={`rounded-[0.95rem] px-4 py-3 ${ourAlliance.panelClass}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-xs font-black uppercase tracking-[0.18em] ${ourAlliance.labelClass}`}>{ourAlliance.label}</p>
                              <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-white xl:text-[15px]">{result.ourTeams}</p>
                            </div>
                            <p className="text-2xl font-black leading-none text-white xl:text-3xl">{result.awards}</p>
                          </div>
                        </div>
                        <div className={`rounded-[0.95rem] px-4 py-3 ${opponentAlliance.panelClass}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-xs font-black uppercase tracking-[0.18em] ${opponentAlliance.labelClass}`}>{opponentAlliance.label}</p>
                              <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-white xl:text-[15px]">{result.opponentTeams}</p>
                            </div>
                            <p className="text-2xl font-black leading-none text-white xl:text-3xl">{result.opponentScore}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                        <div className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] xl:px-4 ${result.placement === 'Win' ? 'bg-green-500 text-white' : result.placement === 'Loss' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                          {result.placement}
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">Match Result</p>
                      </div>
                          </>
                        );
                      })()}
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
