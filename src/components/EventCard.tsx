import Card from "./Card";

type EventCardProps = {
  eventName: string;
  location: string;
  startDate: string;
  endDate: string;
  season: string;
  link: string;
};

function formatEventDate(startDate: string, endDate: string) {
  if (!startDate) {
    return 'Date TBC';
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Zurich',
  });

  if (!end || formatter.format(start) === formatter.format(end)) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export default function EventCard({ eventName, location, startDate, endDate, season, link }: EventCardProps) {
  return (
    <Card className="rounded-[1.6rem]">
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Upcoming Event</p>
            <h3 className="mt-3 text-2xl font-black leading-tight text-white">{eventName || 'Unnamed Event'}</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-muted)]">
            Scheduled
          </span>
        </div>

        <div className="mt-6 grid gap-4 rounded-[1.3rem] border border-white/10 bg-white/5 p-4 text-sm text-[var(--color-muted)]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white">Date</p>
            <p className="mt-2">{formatEventDate(startDate, endDate)}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white">Location</p>
            <p className="mt-2">{location || 'Location not specified'}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white">Season</p>
            <p className="mt-2">{season || 'Current season'}</p>
          </div>
        </div>

        <a href={link || '#'} className="btn btn-secondary mt-6 w-full" aria-label={`Details for ${eventName || 'event'}`}>
          Event Details
        </a>
      </div>
    </Card>
  );
}
