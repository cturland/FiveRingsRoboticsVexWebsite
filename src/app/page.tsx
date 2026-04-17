import Image from 'next/image';
import { getTeamFixtures, getTeamResults, getTeamSummary } from '@/app/actions';
import { getGalleryItems } from '@/lib/gallery';

function formatResultDate(value: string) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Zurich',
    timeZoneName: 'short',
  }).format(new Date(value));
}

function splitAllianceTeams(teams: string) {
  return teams
    .split(',')
    .map((team) => team.trim())
    .filter(Boolean);
}

function getAllianceStyles(color: string, isOpponent = false) {
  const normalized = color.toLowerCase();

  if (normalized === 'blue') {
    return {
      panelClass: 'border-blue-400/20 bg-blue-500/10',
      labelClass: 'text-blue-300',
      label: isOpponent ? 'Blue Alliance' : 'Our Alliance',
    };
  }

  if (normalized === 'red') {
    return {
      panelClass: 'border-red-500/20 bg-red-500/10',
      labelClass: 'text-red-300',
      label: isOpponent ? 'Red Alliance' : 'Our Alliance',
    };
  }

  return {
    panelClass: 'border-white/10 bg-white/5',
    labelClass: 'text-slate-300',
    label: isOpponent ? 'Opponent' : 'Our Alliance',
  };
}

export default async function Home() {
  const [fixturesResult, resultsResult, summaryResult] = await Promise.all([
    getTeamFixtures(),
    getTeamResults(),
    getTeamSummary(),
  ]);
  const allGalleryItems = await getGalleryItems();

  const fixtures = fixturesResult.success ? fixturesResult.data : [];
  const results = resultsResult.success ? resultsResult.data : [];
  const summary = summaryResult.success && summaryResult.data
    ? summaryResult.data
    : {
        teamName: 'Five Rings Robotics',
        teamNumber: '21052A',
        organization: 'International School of Lausanne',
        seasonsActive: 4,
        eventsEntered: 0,
        awardsWon: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winPercentage: 0,
      };

  const nextEvent = fixtures.length > 0
    ? {
        name: fixtures[0].eventName,
        date: new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(fixtures[0].startDate)),
        location: fixtures[0].location,
        notes: 'Live schedule synced from RobotEvents.',
        isError: false,
      }
    : {
        name: 'Upcoming event data unavailable',
        date: '',
        location: '',
        notes: fixturesResult.error || 'API connection failed',
        isError: true,
      };

  const latestResult = results.length > 0
    ? {
        event: results[0].eventName,
        date: results[0].date,
        rank: results[0].placement,
        score: results[0].awards,
        opponentScore: results[0].opponentScore,
        ourAllianceColor: results[0].ourAllianceColor,
        opponentAllianceColor: results[0].opponentAllianceColor,
        ourTeams: results[0].ourTeams,
        opponentTeams: results[0].opponentTeams,
        isError: false,
      }
    : {
        event: 'Recent result unavailable',
        date: '',
        rank: 'API Error',
        score: '',
        opponentScore: '',
        ourAllianceColor: 'unknown',
        opponentAllianceColor: 'unknown',
        ourTeams: '',
        opponentTeams: '',
        notes: resultsResult.error || 'API connection failed',
        isError: true,
      };

  const galleryItems = allGalleryItems
    .slice()
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 3);

  const teamStats = [
    {
      value: `${summary.winPercentage}%`,
      label: 'Win Rate',
      detail: `${summary.wins}-${summary.losses}-${summary.ties} overall record`,
    },
    {
      value: summary.eventsEntered.toString(),
      label: 'Events Entered',
      detail: `${summary.seasonsActive} seasons on record`,
    },
    {
      value: summary.awardsWon.toString(),
      label: 'Awards Won',
      detail: summary.organization,
    },
    {
      value: summary.matchesPlayed.toString(),
      label: 'Matches Played',
      detail: `${summary.teamNumber} | ${summary.teamName}`,
    },
  ];
  const latestOurAlliance = getAllianceStyles(latestResult.ourAllianceColor);
  const latestOpponentAlliance = getAllianceStyles(latestResult.opponentAllianceColor, true);

  return (
    <div className="space-y-12 pb-6 md:space-y-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(11,24,40,0.96),rgba(8,16,29,0.92))] px-5 py-7 shadow-[0_40px_120px_rgba(0,0,0,0.35)] md:px-10 md:py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-4rem] top-[-3rem] h-48 w-48 rounded-full bg-red-500/12 blur-3xl"></div>
          <div className="absolute bottom-[-5rem] right-[-2rem] h-56 w-56 rounded-full bg-blue-500/8 blur-3xl"></div>
          <div className="panel-grid absolute inset-0 opacity-35"></div>
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
          <div className="max-w-3xl lg:pt-4">
            <span className="eyebrow mb-5">Official Team Site</span>
            <h1 className="heading-primary max-w-4xl text-4xl font-black text-white sm:text-5xl md:text-[4.5rem]">
              Five Rings
              <span className="mt-2 block text-red-500">Robotics</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)] md:text-lg">
              Representing the International School of Lausanne with a student-led focus on engineering quality,
              match discipline, and season-long improvement.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="/team" className="btn btn-primary px-7 py-3.5">Meet The Team</a>
              <a href="/fixtures" className="btn btn-secondary px-6 py-3.5">Competition Hub</a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="flex min-h-[5.75rem] items-center justify-center rounded-[1.35rem] border border-white/40 bg-white px-3 py-3 shadow-[0_18px_40px_rgba(3,8,20,0.18)]">
                <Image src="/images/vex_robotics_logo.png" alt="VEX Robotics logo" width={420} height={120} className="max-h-[5.25rem] w-auto object-contain" />
              </div>
              <div className="flex min-h-[5.75rem] items-center justify-center rounded-[1.35rem] border border-white/40 bg-white px-5 py-4 shadow-[0_18px_40px_rgba(3,8,20,0.18)]">
                <Image src="/images/International_School_of_Lausanne_Logo.png" alt="International School of Lausanne logo" width={420} height={120} className="max-h-11 w-auto object-contain" />
              </div>
              <div className="flex min-h-[5.75rem] items-center justify-center rounded-[1.35rem] border border-white/40 bg-white px-2 py-2 shadow-[0_18px_40px_rgba(3,8,20,0.18)]">
                <Image src="/images/REC-Foundation-Primary-Logo-Featured.png" alt="REC Foundation logo" width={420} height={140} className="max-h-[5.85rem] w-auto object-contain" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:pt-2">
            <div className="rounded-[1.75rem] border border-red-500/25 bg-[rgba(227,51,61,0.09)] p-6 backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Program Profile</p>
              <div className="mt-4 flex items-center gap-5">
                <div className="flex h-[5.75rem] w-[5.75rem] shrink-0 items-center justify-center rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                  <Image src="/images/FRRLogoBasic.png" alt="Five Rings Robotics logo" width={160} height={160} className="max-h-[4.4rem] w-auto object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="heading-display text-[2rem] font-black leading-none text-white">{summary.teamNumber}</p>
                  <p className="mt-2 text-base font-semibold text-white/90">{summary.teamName}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-red-200/80">International School of Lausanne</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-muted)]">Events</p>
                <p className="mt-3 text-4xl font-black text-white">{summary.eventsEntered}</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">Entered across {summary.seasonsActive} active seasons</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-muted)]">Record</p>
                <p className="mt-3 text-4xl font-black text-white">
                  {summary.wins}-{summary.losses}-{summary.ties}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">Live summary from RobotEvents match history</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-5 backdrop-blur-sm md:px-8 md:py-6">
        <div className="grid gap-4 md:grid-cols-4">
          {teamStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.4rem] border border-white/8 bg-[rgba(255,255,255,0.03)] px-5 py-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">{stat.label}</p>
              <p className="mt-2.5 text-[2.35rem] font-black text-white">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card rounded-[1.9rem] p-8 md:p-10">
          <div>
            <span className="eyebrow mb-5">Latest Match</span>
            <h2 className="heading-display text-3xl font-black text-white">Competition Snapshot</h2>
          </div>

          {latestResult.isError ? (
            <div className="mt-6 rounded-[1.4rem] border border-red-500/30 bg-red-950/30 p-5">
              <p className="text-sm font-semibold text-red-200">{latestResult.notes}</p>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <h3 className="max-w-2xl text-2xl font-bold text-white">{latestResult.event}</h3>
              </div>

              <div className="mt-6 rounded-[0.95rem] border border-white/8 bg-black/15 px-4 py-3">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-200">
                  {formatResultDate(latestResult.date)}
                </p>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div className={`rounded-[1rem] px-4 py-4 ${latestOurAlliance.panelClass}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${latestOurAlliance.labelClass}`}>{latestOurAlliance.label}</p>
                    <p className="text-[2rem] font-black leading-none text-white">{latestResult.score}</p>
                  </div>
                  <div className="mt-3 space-y-2 text-sm font-semibold text-slate-100">
                    {splitAllianceTeams(latestResult.ourTeams).map((team) => (
                      <p key={team}>{team}</p>
                    ))}
                  </div>
                </div>

                <div className={`rounded-[1rem] px-4 py-4 ${latestOpponentAlliance.panelClass}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${latestOpponentAlliance.labelClass}`}>{latestOpponentAlliance.label}</p>
                    <p className="text-[2rem] font-black leading-none text-white">{latestResult.opponentScore}</p>
                  </div>
                  <div className="mt-3 space-y-2 text-sm font-semibold text-slate-100">
                    {splitAllianceTeams(latestResult.opponentTeams).map((team) => (
                      <p key={team}>{team}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <span className={`${latestResult.rank === 'Win' ? 'bg-green-500' : latestResult.rank === 'Loss' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white`}>
                  {latestResult.rank}
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  Match Result
                </p>
              </div>

              <a href="/fixtures" className="btn btn-secondary mt-6">Open Competition Hub</a>
            </>
          )}
        </div>

        <div className={`${nextEvent.isError ? 'border-red-500/35 bg-[rgba(103,16,22,0.42)]' : 'border-white/10 bg-[linear-gradient(180deg,rgba(12,23,39,0.96),rgba(16,30,50,0.96))]'} card rounded-[1.9rem] p-8`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Next Event</p>
              <h3 className="mt-2 text-2xl font-black text-white">Upcoming Schedule</h3>
            </div>
            <div className={`h-3.5 w-3.5 rounded-full ${nextEvent.isError ? 'bg-red-400' : 'animate-pulse bg-red-500'}`}></div>
          </div>

          {nextEvent.isError ? (
            <div className="mt-6 rounded-[1.4rem] border border-red-500/30 bg-red-950/30 p-5">
              <p className="text-sm font-semibold text-red-200">{nextEvent.notes}</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-xl font-bold leading-tight text-white">{nextEvent.name}</h4>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">{nextEvent.date}</p>
                <p className="mt-1 text-[var(--color-muted)]">{nextEvent.location}</p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-[var(--color-muted)]">{nextEvent.notes}</p>
              </div>

              <a href="/fixtures" className="btn btn-primary w-full">Open Competition Hub</a>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.92),rgba(11,23,38,0.96))] px-6 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow mb-4">Highlights Preview</span>
            <h2 className="heading-display text-3xl font-black text-white">Latest updates</h2>
            <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
              Recent highlights from the live team feed, pulled directly from approved uploads.
            </p>
          </div>
          <a href="/gallery" className="btn btn-primary">Open Highlights</a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {galleryItems.length > 0 ? (
            galleryItems.map((item) => (
              <article key={item.id ?? item.title} className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.image || '/images/gallery/robot.jpg'}
                    alt={item.title || 'Highlights preview'}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="w-fit rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white">
                      {item.category || 'Highlight'}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white">{item.title || 'Untitled image'}</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {item.date
                      ? new Intl.DateTimeFormat('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(item.date))
                      : 'Date unavailable'}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 text-[var(--color-muted)] md:col-span-3">
              No approved gallery items yet. Once submissions are approved, they will appear here automatically.
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
