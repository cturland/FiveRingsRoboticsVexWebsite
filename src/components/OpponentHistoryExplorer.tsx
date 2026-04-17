'use client';

import { useMemo, useState } from 'react';
import type { RobotEventsMatchTeam, RobotEventsResult } from '@/lib/robotevents';

type OpponentRecord = {
  team: RobotEventsMatchTeam;
  matches: RobotEventsResult[];
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  winPercentage: number;
};

type OpponentHistoryExplorerProps = {
  results: RobotEventsResult[];
};

function formatDate(value: string) {
  if (!value) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getTeamKey(team: RobotEventsMatchTeam) {
  return team.id ? `id:${team.id}` : `number:${team.number}`;
}

function getTeamLabel(team: RobotEventsMatchTeam) {
  return team.name ? `${team.number}: ${team.name}` : team.number;
}

function parseTeamNumber(teamNumber: string) {
  const match = teamNumber.match(/^(\d+)(.*)$/);

  if (!match) {
    return {
      numeric: Number.MAX_SAFE_INTEGER,
      suffix: teamNumber,
    };
  }

  return {
    numeric: Number(match[1]),
    suffix: match[2] ?? '',
  };
}

function compareTeams(a: RobotEventsMatchTeam, b: RobotEventsMatchTeam) {
  const aNumber = parseTeamNumber(a.number);
  const bNumber = parseTeamNumber(b.number);

  if (aNumber.numeric !== bNumber.numeric) {
    return aNumber.numeric - bNumber.numeric;
  }

  const suffixCompare = aNumber.suffix.localeCompare(bNumber.suffix, undefined, { numeric: true });

  if (suffixCompare !== 0) {
    return suffixCompare;
  }

  return getTeamLabel(a).localeCompare(getTeamLabel(b), undefined, { numeric: true });
}

function getMatchResultClass(result: string) {
  if (result === 'Win') {
    return 'bg-green-500 text-white';
  }

  if (result === 'Loss') {
    return 'bg-red-500 text-white';
  }

  return 'bg-yellow-500 text-black';
}

function getAlliancePanelClass(color: string) {
  const normalized = color.toLowerCase();

  if (normalized === 'blue') {
    return 'border-blue-400/25 bg-blue-500/10';
  }

  if (normalized === 'red') {
    return 'border-red-500/25 bg-red-500/10';
  }

  return 'border-white/10 bg-black/15';
}

function getAllianceLabelClass(color: string) {
  const normalized = color.toLowerCase();

  if (normalized === 'blue') {
    return 'text-blue-300';
  }

  if (normalized === 'red') {
    return 'text-red-300';
  }

  return 'text-[var(--color-muted)]';
}

function buildOpponentRecords(results: RobotEventsResult[]) {
  const records = new Map<string, OpponentRecord>();

  for (const result of results) {
    if (!result.countsForRecord) {
      continue;
    }

    const pointsFor = Number(result.awards || 0);
    const pointsAgainst = Number(result.opponentScore || 0);

    for (const team of result.opponentAllianceTeams ?? []) {
      if (!team.number || team.number === 'Unknown Team') {
        continue;
      }

      const key = getTeamKey(team);

      if (!records.has(key)) {
        records.set(key, {
          team,
          matches: [],
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          winPercentage: 0,
        });
      }

      const record = records.get(key)!;
      record.matches.push(result);
      record.pointsFor += Number.isFinite(pointsFor) ? pointsFor : 0;
      record.pointsAgainst += Number.isFinite(pointsAgainst) ? pointsAgainst : 0;

      if (result.placement === 'Win') {
        record.wins += 1;
      } else if (result.placement === 'Loss') {
        record.losses += 1;
      } else {
        record.ties += 1;
      }
    }
  }

  return Array.from(records.values())
    .map((record) => {
      const totalMatches = record.wins + record.losses + record.ties;

      return {
        ...record,
        matches: record.matches.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()),
        winPercentage: totalMatches > 0 ? Number(((record.wins / totalMatches) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => compareTeams(a.team, b.team));
}

export default function OpponentHistoryExplorer({ results }: OpponentHistoryExplorerProps) {
  const opponentRecords = useMemo(() => buildOpponentRecords(results), [results]);
  const [selectedTeamKey, setSelectedTeamKey] = useState(() => opponentRecords[0] ? getTeamKey(opponentRecords[0].team) : '');
  const selectedRecord = opponentRecords.find((record) => getTeamKey(record.team) === selectedTeamKey) ?? opponentRecords[0];

  if (opponentRecords.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-[var(--color-muted)]">
        No opponent history is available yet. Once RobotEvents returns scored matches with opponent teams, they will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,34,56,0.96),rgba(11,20,33,0.96))] p-5 md:p-6">
        <label htmlFor="opponent-team" className="block text-xs font-black uppercase tracking-[0.22em] text-red-300">
          Opponent Team
        </label>
        <select
          id="opponent-team"
          value={selectedRecord ? getTeamKey(selectedRecord.team) : ''}
          onChange={(event) => setSelectedTeamKey(event.target.value)}
          className="mt-3 w-full rounded-[1rem] border border-white/10 bg-[#111c2f] px-4 py-3 text-base font-semibold text-white outline-none transition focus:border-[var(--color-primary-accent)]"
        >
          {opponentRecords.map((record) => (
            <option key={getTeamKey(record.team)} value={getTeamKey(record.team)}>
              {getTeamLabel(record.team)}
            </option>
          ))}
        </select>
      </section>

      {selectedRecord ? (
        <>
          <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 md:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Overall Against</p>
              <h2 className="mt-2 text-3xl font-black text-white">{getTeamLabel(selectedRecord.team)}</h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-[1.1rem] border border-white/10 bg-black/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-muted)]">Record</p>
                <p className="mt-2 text-2xl font-black text-white">{selectedRecord.wins}-{selectedRecord.losses}-{selectedRecord.ties}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-black/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-muted)]">Win Rate</p>
                <p className="mt-2 text-2xl font-black text-white">{selectedRecord.winPercentage}%</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-black/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-muted)]">Points For</p>
                <p className="mt-2 text-2xl font-black text-white">{selectedRecord.pointsFor}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-black/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-muted)]">Points Against</p>
                <p className="mt-2 text-2xl font-black text-white">{selectedRecord.pointsAgainst}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-black/10 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-muted)]">Matches</p>
                <p className="mt-2 text-2xl font-black text-white">{selectedRecord.matches.length}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {selectedRecord.matches.map((match) => (
              <article key={match.id} className="rounded-[1.4rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">{formatDate(match.date)}</p>
                    <h3 className="mt-2 text-xl font-black text-white">{match.eventName}</h3>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{match.matchLabel} | {match.season}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${getMatchResultClass(match.placement)}`}>
                    {match.placement}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className={`rounded-[1rem] border px-4 py-4 ${getAlliancePanelClass(match.ourAllianceColor)}`}>
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${getAllianceLabelClass(match.ourAllianceColor)}`}>
                      Five Rings Alliance
                    </p>
                    <p className="mt-3 text-3xl font-black text-white">{match.awards}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white/85">{match.ourTeams}</p>
                  </div>
                  <div className={`rounded-[1rem] border px-4 py-4 ${getAlliancePanelClass(match.opponentAllianceColor)}`}>
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${getAllianceLabelClass(match.opponentAllianceColor)}`}>
                      Opponent Alliance
                    </p>
                    <p className="mt-3 text-3xl font-black text-white">{match.opponentScore}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white/85">{match.opponentTeams}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}
