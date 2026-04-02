import { getTeamFixtures, getTeamResults, getTeamSummary } from '@/app/actions';

const latestPosts = [
  {
    title: 'Season kickoff recap',
    date: 'March 20, 2026',
    summary: 'We unveiled the robot, refined our game plan, and set the tone for the rest of the season.',
  },
  {
    title: 'Build session highlight',
    date: 'March 28, 2026',
    summary: 'Driver reps, scoring consistency, and mechanism tuning were the focus of this week’s work.',
  },
  {
    title: 'Worlds prep update',
    date: 'April 1, 2026',
    summary: 'The team is locking in performance details and preparing for the next major event on the calendar.',
  },
];

const galleryPreview = [
  { title: 'Competition Day Focus', category: 'Event Floor' },
  { title: 'Robot Build Sessions', category: 'Engineering' },
  { title: 'Team Behind The Robot', category: 'Culture' },
];

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

export default async function Home() {
  const [fixturesResult, resultsResult, summaryResult] = await Promise.all([
    getTeamFixtures(),
    getTeamResults(),
    getTeamSummary(),
  ]);

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
        ourTeams: '',
        opponentTeams: '',
        notes: resultsResult.error || 'API connection failed',
        isError: true,
      };

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

  const performancePoints = [
    'Live RobotEvents match and event data',
    'Competition-ready updates and fixtures',
    'Student-led engineering and strategy focus',
  ];

  return (
    <div className="space-y-20 pb-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(11,24,40,0.96),rgba(8,16,29,0.92))] px-6 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] md:px-10 md:py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-5rem] top-[-4rem] h-56 w-56 rounded-full bg-red-500/15 blur-3xl"></div>
          <div className="absolute bottom-[-6rem] right-[-2rem] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="panel-grid absolute inset-0 opacity-60"></div>
        </div>

        <div className="relative grid gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <span className="eyebrow mb-6">Official Team Site</span>
            <h1 className="heading-primary max-w-4xl text-5xl font-black text-white md:text-7xl">
              Five Rings
              <span className="mt-2 block text-red-500">Robotics</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
              A polished robotics program built around technical excellence, sharp teamwork, and competitive VEX performance.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="/team" className="btn btn-primary px-7 py-3.5">Meet The Team</a>
              <a href="/fixtures" className="btn btn-secondary px-7 py-3.5">Open Competition Hub</a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {performancePoints.map((point) => (
                <div key={point} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-slate-100 backdrop-blur-sm">
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-red-500/25 bg-[rgba(227,51,61,0.09)] p-6 backdrop-blur-sm">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Team Identity</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)]">
                  <img src="/images/FRRLogo.png" alt="Five Rings Robotics logo" className="h-14 w-auto" />
                </div>
                <div>
                  <p className="heading-display text-2xl font-black text-white">{summary.teamNumber}</p>
                  <p className="text-sm text-[var(--color-muted)]">{summary.teamName}</p>
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

      <section className="rounded-[1.8rem] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-6 backdrop-blur-sm md:px-8">
        <div className="grid gap-5 md:grid-cols-4">
          {teamStats.map((stat) => (
            <div key={stat.label} className="rounded-[1.4rem] border border-white/8 bg-[rgba(255,255,255,0.03)] px-5 py-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">{stat.label}</p>
              <p className="mt-3 text-4xl font-black text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card panel-grid rounded-[1.9rem] p-8 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow mb-5">About The Program</span>
              <h2 className="heading-display text-3xl font-black text-white md:text-4xl">
                School-professional, competitive, and engineering-driven
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[var(--color-muted)]">
                Five Rings Robotics represents the International School of Lausanne in VEX competition with a focus on technical discipline,
                strategic play, and consistent student-led development. The website is now designed to surface live team information with a more
                polished, modern presentation.
              </p>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-[var(--color-muted)] lg:w-[21rem]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>Team</span>
                <span className="font-bold text-white">{summary.teamNumber}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span>School</span>
                <span className="font-bold text-white">ISL</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Program</span>
                <span className="font-bold text-white">VEX Robotics</span>
              </div>
            </div>
          </div>
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
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-red-300">{nextEvent.date}</p>
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

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card rounded-[1.9rem] p-8 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="eyebrow mb-5">Latest Match</span>
              <h2 className="heading-display text-3xl font-black text-white">Competition Snapshot</h2>
            </div>
            {!latestResult.isError ? (
              <span className={`${latestResult.rank === 'Win' ? 'bg-green-500' : latestResult.rank === 'Loss' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white`}>
                {latestResult.rank}
              </span>
            ) : null}
          </div>

          {latestResult.isError ? (
            <div className="mt-6 rounded-[1.4rem] border border-red-500/30 bg-red-950/30 p-5">
              <p className="text-sm font-semibold text-red-200">{latestResult.notes}</p>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <h3 className="max-w-2xl text-2xl font-bold text-white">{latestResult.event}</h3>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  {formatResultDate(latestResult.date)}
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-red-500/18 bg-red-500/8 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Our Alliance</p>
                  <p className="mt-3 text-4xl font-black text-white">{latestResult.score}</p>
                  <div className="mt-4 space-y-2 text-sm font-semibold text-slate-100">
                    {splitAllianceTeams(latestResult.ourTeams).map((team) => (
                      <p key={team}>{team}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-blue-400/18 bg-blue-500/8 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">Opponent</p>
                  <p className="mt-3 text-4xl font-black text-white">{latestResult.opponentScore}</p>
                  <div className="mt-4 space-y-2 text-sm font-semibold text-slate-100">
                    {splitAllianceTeams(latestResult.opponentTeams).map((team) => (
                      <p key={team}>{team}</p>
                    ))}
                  </div>
                </div>
              </div>

              <a href="/fixtures" className="btn btn-secondary mt-8">Open Competition Hub</a>
            </>
          )}
        </div>

        <div className="card rounded-[1.9rem] p-8 md:p-10">
          <span className="eyebrow mb-5">Team Updates</span>
          <h2 className="heading-display text-3xl font-black text-white">What We’re Working On</h2>
          <div className="mt-7 space-y-4">
            {latestPosts.map((post) => (
              <article key={post.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">{post.date}</p>
                <h3 className="mt-2 text-lg font-bold text-white">{post.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{post.summary}</p>
              </article>
            ))}
          </div>
          <a href="/blog" className="btn btn-secondary mt-8">Read Team Updates</a>
        </div>
      </section>

      <section className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,31,0.92),rgba(11,23,38,0.96))] px-6 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow mb-4">Photo Preview</span>
            <h2 className="heading-display text-3xl font-black text-white">A sharper look at the season</h2>
            <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
              A preview gallery area designed to spotlight competition moments, robot work, and team culture.
            </p>
          </div>
          <a href="/gallery" className="btn btn-primary">Open Gallery</a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {galleryPreview.map((item, index) => (
            <article key={item.title} className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)]">
              <div className={`flex aspect-[4/3] items-end bg-gradient-to-br ${index === 0 ? 'from-red-500/30 via-red-500/8 to-transparent' : index === 1 ? 'from-blue-500/25 via-slate-500/8 to-transparent' : 'from-white/10 via-red-500/10 to-transparent'} p-5`}>
                <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white/80">
                  {item.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Designed as a consistent card format so gallery previews feel aligned with the rest of the homepage.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
