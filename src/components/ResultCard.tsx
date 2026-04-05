import Card from "./Card";

type ResultCardProps = {
  eventName: string;
  season: string;
  date: string;
  placement: string;
  ourAllianceColor: string;
  opponentAllianceColor: string;
  awards: string;
  opponentScore: string;
  ourTeams: string;
  opponentTeams: string;
  link: string;
};

function formatMatchDate(date: string) {
  if (!date) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Zurich',
    timeZoneName: 'short',
  }).format(new Date(date));
}

function splitTeams(teams: string) {
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

export default function ResultCard({
  eventName,
  season,
  date,
  placement,
  ourAllianceColor,
  opponentAllianceColor,
  awards,
  opponentScore,
  ourTeams,
  opponentTeams,
  link,
}: ResultCardProps) {
  const badgeClass = placement === 'Win'
    ? 'bg-green-500'
    : placement === 'Loss'
      ? 'bg-red-500'
      : 'bg-yellow-500';
  const ourAlliance = getAllianceStyles(ourAllianceColor);
  const opponentAlliance = getAllianceStyles(opponentAllianceColor, true);

  return (
    <Card className="rounded-[1.6rem]">
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Recent Match</p>
            <h3 className="mt-3 text-xl font-black leading-tight text-white">{eventName || 'Unknown Event'}</h3>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {formatMatchDate(date)}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {season}
            </p>
          </div>
          <span className={`${badgeClass} rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white`}>
            {placement || 'Tie'}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={`rounded-[1.25rem] p-4 ${ourAlliance.panelClass}`}>
            <p className={`text-xs font-black uppercase tracking-[0.22em] ${ourAlliance.labelClass}`}>{ourAlliance.label}</p>
            <p className="mt-2 text-3xl font-black text-white">{awards || '0'}</p>
            <div className="mt-3 space-y-1 text-sm font-semibold text-slate-100">
              {splitTeams(ourTeams).map((team) => (
                <p key={team}>{team}</p>
              ))}
            </div>
          </div>
          <div className={`rounded-[1.25rem] p-4 ${opponentAlliance.panelClass}`}>
            <p className={`text-xs font-black uppercase tracking-[0.22em] ${opponentAlliance.labelClass}`}>{opponentAlliance.label}</p>
            <p className="mt-2 text-3xl font-black text-white">{opponentScore || '0'}</p>
            <div className="mt-3 space-y-1 text-sm font-semibold text-slate-100">
              {splitTeams(opponentTeams).map((team) => (
                <p key={team}>{team}</p>
              ))}
            </div>
          </div>
        </div>

        <a
          href={link || '#'}
          className="btn btn-secondary mt-6 w-full"
          target="_blank"
          rel="noreferrer"
          aria-label={`View result details for ${eventName || 'event'}`}
        >
          Match Details
        </a>
      </div>
    </Card>
  );
}
