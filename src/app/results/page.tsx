export default function ResultsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Results</h1>
      <p className="text-slate-300">Match results and leaderboard positions from recent events.</p>
      <table className="w-full border-collapse rounded-lg overflow-hidden border border-slate-700 bg-slate-900/70">
        <thead className="bg-slate-800">
          <tr>
            <th className="p-3 text-left">Event</th>
            <th className="p-3 text-left">Result</th>
            <th className="p-3 text-left">Rank</th>
          </tr>
        </thead>
        <tbody>
          {[
            { event: 'Regional qualifers', result: '2nd place', rank: '2' },
            { event: 'State qualifier', result: 'Top 8', rank: '7' },
          ].map((entry) => (
            <tr key={entry.event} className="border-t border-slate-700">
              <td className="p-3 text-slate-200">{entry.event}</td>
              <td className="p-3 text-slate-200">{entry.result}</td>
              <td className="p-3 text-slate-200">{entry.rank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
