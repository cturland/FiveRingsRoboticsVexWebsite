'use client';

import { useMemo, useState } from 'react';
import SeasonFilter from '@/components/SeasonFilter';
import type { RobotEventsResult, RobotEventsSeasonStats } from '@/lib/robotevents';

type ResultsHistoryProps = {
  results: RobotEventsResult[];
  seasonStats: RobotEventsSeasonStats[];
  error?: string;
};

function formatSeasonLabel(season: string) {
  const match = season.match(/(\d{4})-(\d{4}):\s*(.+)$/);
  if (!match) {
    return season;
  }

  const [, startYear, endYear, gameName] = match;
  return `${startYear}-${endYear.slice(-2)}: ${gameName}`;
}

function seasonSortValue(season: string) {
  const match = season.match(/(\d{4})-(\d{4})/);
  return match ? Number(match[1]) : 0;
}

function formatMatchDate(date: string) {
  if (!date) {
    return 'Time unavailable';
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

type TournamentGroup = {
  key: string;
  eventName: string;
  eventCode: string;
  link: string;
  matches: RobotEventsResult[];
  latestDate: string;
  wins: number;
  losses: number;
  ties: number;
};

export default function ResultsHistory({ results, seasonStats, error }: ResultsHistoryProps) {
  const seasonOptions = useMemo(() => {
    return Array.from(new Set([...results.map((result) => result.season), ...seasonStats.map((stats) => stats.season)]))
      .filter(Boolean)
      .sort((a, b) => seasonSortValue(b) - seasonSortValue(a))
      .map((season) => ({
        value: season,
        label: formatSeasonLabel(season),
      }));
  }, [results, seasonStats]);

  const [selectedSeason, setSelectedSeason] = useState(seasonOptions[0]?.value ?? '');

  const filteredResults = useMemo(() => {
    if (!selectedSeason) {
      return results;
    }

    return results.filter((result) => result.season === selectedSeason);
  }, [results, selectedSeason]);

  const selectedSeasonStats = useMemo(() => {
    return seasonStats.find((stats) => stats.season === selectedSeason) || null;
  }, [seasonStats, selectedSeason]);

  const groupedResults = useMemo<TournamentGroup[]>(() => {
    const groups = new Map<string, TournamentGroup>();

    for (const result of filteredResults) {
      const key = result.eventCode || result.eventName;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          eventName: result.eventName,
          eventCode: result.eventCode,
          link: result.link,
          matches: [],
          latestDate: result.date,
          wins: 0,
          losses: 0,
          ties: 0,
        });
      }

      const group = groups.get(key)!;
      group.matches.push(result);

      if (new Date(result.date || 0).getTime() > new Date(group.latestDate || 0).getTime()) {
        group.latestDate = result.date;
      }

      if (result.countsForRecord) {
        if (result.placement === 'Win') {
          group.wins += 1;
        } else if (result.placement === 'Loss') {
          group.losses += 1;
        } else {
          group.ties += 1;
        }
      }
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        matches: [...group.matches].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()),
      }))
      .sort((a, b) => new Date(b.latestDate || 0).getTime() - new Date(a.latestDate || 0).getTime());
  }, [filteredResults]);

  const statsCards = selectedSeasonStats ? [
    {
      label: 'Win Rate',
      value: `${selectedSeasonStats.winPercentage}%`,
      detail: `${selectedSeasonStats.wins}-${selectedSeasonStats.losses}-${selectedSeasonStats.ties} official record`,
    },
    {
      label: 'Matches',
      value: selectedSeasonStats.matchesPlayed.toString(),
      detail: `${selectedSeasonStats.wins} wins total`,
    },
    {
      label: 'Events',
      value: selectedSeasonStats.eventsEntered.toString(),
      detail: 'Entered this season',
    },
    {
      label: 'Awards',
      value: selectedSeasonStats.awardsWon.toString(),
      detail: 'Won this season',
    },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Results</p>
          <h2 className="mt-2 text-3xl font-black text-white">Match History</h2>
        </div>
        {seasonOptions.length > 0 ? (
          <SeasonFilter
            options={seasonOptions}
            selectedSeason={selectedSeason}
            onChange={setSelectedSeason}
          />
        ) : null}
      </div>

      {statsCards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((stat) => (
            <div key={stat.label} className="rounded-[1.35rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">{stat.label}</p>
              <p className="mt-2 text-3xl font-black text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{stat.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      {results.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-[var(--color-muted)]">
          {error || 'No recent results are available on RobotEvents right now.'}
        </div>
      ) : groupedResults.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-[var(--color-muted)]">
          No results found for the selected season.
        </div>
      ) : (
        <>
          <div className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[var(--color-muted)] w-fit">
            {filteredResults.length} result{filteredResults.length === 1 ? '' : 's'} across {groupedResults.length} tournament{groupedResults.length === 1 ? '' : 's'}
          </div>

          <div className="space-y-4">
            {groupedResults.map((group) => (
              <details
                key={group.key}
                className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5"
              >
                <summary className="cursor-pointer list-none px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Tournament</p>
                      <h3 className="mt-2 text-xl font-black text-white">{group.eventName}</h3>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">{formatMatchDate(group.latestDate)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                        {group.matches.length} match{group.matches.length === 1 ? '' : 'es'}
                      </div>
                      <div className="rounded-full border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                        {group.wins}-{group.losses}-{group.ties} official
                      </div>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-white/10 px-5 py-5">
                  <div className="space-y-3">
                    {group.matches.map((result) => {
                      const badgeClass = result.placement === 'Win'
                        ? 'bg-green-500'
                        : result.placement === 'Loss'
                          ? 'bg-red-500'
                          : 'bg-yellow-500';
                      const ourAlliance = getAllianceStyles(result.ourAllianceColor);
                      const opponentAlliance = getAllianceStyles(result.opponentAllianceColor, true);

                      return (
                        <div key={result.id ?? `${result.eventCode}-${result.date}`} className="rounded-[1.2rem] border border-white/10 bg-[rgba(8,16,29,0.45)] px-4 py-4">
                          <div className="rounded-[0.95rem] border border-white/8 bg-black/15 px-4 py-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-100">
                                  {result.matchLabel}
                                </p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                                  {result.date ? formatMatchDate(result.date) : 'Time unavailable'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                {!result.countsForRecord ? (
                                  <span className="rounded-full border border-yellow-400/25 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-200">
                                    Excluded
                                  </span>
                                ) : null}
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                  {result.eventCode || group.eventCode}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <div className={`rounded-[1rem] px-4 py-4 ${ourAlliance.panelClass}`}>
                              <div className="flex items-center justify-between gap-3">
                                <p className={`text-xs font-black uppercase tracking-[0.18em] ${ourAlliance.labelClass}`}>{ourAlliance.label}</p>
                                <p className="text-[2rem] font-black leading-none text-white">{result.awards || '0'}</p>
                              </div>
                              <div className="mt-3 space-y-1 text-sm font-semibold text-slate-100">
                                {splitTeams(result.ourTeams).map((team) => (
                                  <p key={team}>{team}</p>
                                ))}
                              </div>
                            </div>

                            <div className={`rounded-[1rem] px-4 py-4 ${opponentAlliance.panelClass}`}>
                              <div className="flex items-center justify-between gap-3">
                                <p className={`text-xs font-black uppercase tracking-[0.18em] ${opponentAlliance.labelClass}`}>{opponentAlliance.label}</p>
                                <p className="text-[2rem] font-black leading-none text-white">{result.opponentScore || '0'}</p>
                              </div>
                              <div className="mt-3 space-y-1 text-sm font-semibold text-slate-100">
                                {splitTeams(result.opponentTeams).map((team) => (
                                  <p key={team}>{team}</p>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                            <span className={`${badgeClass} rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white`}>
                              {result.placement}
                            </span>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                              Match Result
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <a
                    href={group.link || '#'}
                    className="btn btn-secondary mt-5"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Tournament Details
                  </a>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
