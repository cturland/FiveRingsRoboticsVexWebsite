import Link from 'next/link';
import { getTeamResults } from '@/app/actions';
import OpponentHistoryExplorer from '@/components/OpponentHistoryExplorer';
import SectionHeading from '@/components/SectionHeading';

export default async function OpponentHistoryPage() {
  const resultsResult = await getTeamResults();
  const results = resultsResult.success ? resultsResult.data : [];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          title="Opponent History"
          subtitle="Choose a team we have played before to see the full match history and overall head-to-head record."
        />
        <Link href="/fixtures" className="btn btn-secondary w-fit">
          Back To Competition Hub
        </Link>
      </div>

      {resultsResult.error ? (
        <div className="rounded-[1.5rem] border border-red-500/30 bg-red-950/30 p-5 text-sm font-semibold text-red-200">
          {resultsResult.error}
        </div>
      ) : null}

      <OpponentHistoryExplorer results={results} />
    </section>
  );
}
