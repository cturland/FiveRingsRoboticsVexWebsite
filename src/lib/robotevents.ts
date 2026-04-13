import { cache } from 'react';

export type RobotEventsFixture = {
  id: number;
  eventName: string;
  eventCode: string;
  location: string;
  startDate: string;
  endDate: string;
  season: string;
  link: string;
};

export type RobotEventsResult = {
  id: number;
  eventName: string;
  eventCode: string;
  season: string;
  date: string;
  matchLabel: string;
  placement: string;
  countsForRecord: boolean;
  ourAllianceColor: string;
  opponentAllianceColor: string;
  awards: string;
  opponentScore: string;
  ourTeams: string;
  opponentTeams: string;
  link: string;
};

export type RobotEventsSummary = {
  teamName: string;
  teamNumber: string;
  organization: string;
  seasonsActive: number;
  eventsEntered: number;
  awardsWon: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
};

export type RobotEventsSeasonStats = {
  season: string;
  eventsEntered: number;
  awardsWon: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
};

const ROBOTEVENTS_BASE_URL = "https://www.robotevents.com/api/v2";
const TEAM_NUMBER = "21052A";
const ROBOTEVENTS_API_TOKEN = process.env.ROBOTEVENTS_API_TOKEN;
const ROBOTEVENTS_DEBUG = process.env.ROBOTEVENTS_DEBUG === 'true';

type RobotEventsTeamDetails = {
  id: number;
  number: string;
  team_name?: string;
};

function buildRobotEventsLink(eventCode?: string, anchor?: string) {
  if (!eventCode) {
    return '#';
  }

  const suffix = anchor ? `#${anchor}` : '';
  return `https://www.robotevents.com/robot-competitions/vex-robotics-competition/${eventCode}.html${suffix}`;
}

function logRobotEventsDebug(message: string, ...args: unknown[]) {
  if (ROBOTEVENTS_DEBUG) {
    console.log(message, ...args);
  }
}

function getMatchTimestamp(match: any) {
  return match.started || match.date || match.scheduled || match.updated_at || '';
}

function getMatchLabel(match: any) {
  const candidates = [
    match?.name,
    match?.round?.name,
    match?.round,
    match?.instance,
    match?.type,
    match?.match_type,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return 'Match';
}

function isPracticeMatch(match: any) {
  return /^practice\b/i.test(getMatchLabel(match));
}

function hasUsableMatchData(match: any) {
  const hasTimestamp = Boolean(getMatchTimestamp(match));
  const hasAllianceScores = Array.isArray(match.alliances) && match.alliances.some((alliance: any) => typeof alliance?.score === 'number');
  return hasTimestamp || hasAllianceScores;
}

function getMatchScores(match: any, teamId: number) {
  const ourAlliance = match.alliances?.find((alliance: any) =>
    alliance.teams?.some((entry: any) => entry.team?.id === teamId)
  );
  const opponentAlliance = match.alliances?.find((alliance: any) =>
    !alliance.teams?.some((entry: any) => entry.team?.id === teamId)
  );

  return {
    ourAlliance,
    opponentAlliance,
    ourScore: ourAlliance?.score ?? 0,
    opponentScore: opponentAlliance?.score ?? 0,
  };
}

function isCountableForStats(match: any, teamId: number) {
  if (!hasUsableMatchData(match)) {
    return false;
  }

  if (isPracticeMatch(match)) {
    return false;
  }

  const { ourAlliance, opponentAlliance, ourScore, opponentScore } = getMatchScores(match, teamId);
  if (!ourAlliance || !opponentAlliance) {
    return false;
  }

  // Exclude common placeholder records that appear in RobotEvents as 0-0.
  if (ourScore === 0 && opponentScore === 0) {
    return false;
  }

  return true;
}

// Helper function to fetch from RobotEvents API
const fetchFromRobotEvents = cache(async (endpoint: string) => {
  try {
    const url = `${ROBOTEVENTS_BASE_URL}${endpoint}`;
    logRobotEventsDebug(`[RobotEvents] Fetching: ${url}`);
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (ROBOTEVENTS_API_TOKEN) {
      headers["Authorization"] = `Bearer ${ROBOTEVENTS_API_TOKEN}`;
      logRobotEventsDebug('[RobotEvents] Using API token for authentication');
    } else {
      console.warn('[RobotEvents] No API token found in environment variables');
    }
    
    const res = await fetch(url, {
      method: "GET",
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    logRobotEventsDebug(`[RobotEvents] Response status: ${res.status}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    logRobotEventsDebug(`[RobotEvents] Data received:`, data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[RobotEvents] Error fetching from ${endpoint}: ${errorMessage}`);
    throw error;
  }
});

const fetchAllPagesFromRobotEvents = cache(async (endpoint: string) => {
  const allRows: any[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const separator = endpoint.includes('?') ? '&' : '?';
    const data = await fetchFromRobotEvents(`${endpoint}${separator}page=${page}&per_page=250`);
    const rows = Array.isArray(data?.data) ? data.data : [];
    allRows.push(...rows);
    lastPage = data?.meta?.last_page || 1;
    page += 1;
  } while (page <= lastPage);

  return allRows;
});

const teamDetailsCache = new Map<number, Promise<RobotEventsTeamDetails | null>>();

async function getTeamDetails(teamId: number): Promise<RobotEventsTeamDetails | null> {
  if (!teamDetailsCache.has(teamId)) {
    teamDetailsCache.set(
      teamId,
      (async () => {
        try {
          const data = await fetchFromRobotEvents(`/teams/${teamId}`);
          return data ?? null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`[RobotEvents] Failed to fetch team ${teamId}: ${errorMessage}`);
          return null;
        }
      })()
    );
  }

  return teamDetailsCache.get(teamId) ?? null;
}

async function formatAllianceTeams(alliance: any): Promise<string> {
  if (!alliance?.teams?.length) {
    return 'TBD';
  }

  const teamLabels = await Promise.all(
    alliance.teams.map(async (entry: any) => {
      const fallbackNumber = entry.team?.number || entry.team?.name || 'Unknown Team';
      const teamId = entry.team?.id;

      if (!teamId) {
        return fallbackNumber;
      }

      const teamDetails = await getTeamDetails(teamId);
      const teamNumber = teamDetails?.number || fallbackNumber;
      const teamName = teamDetails?.team_name?.trim();

      return teamName ? `${teamNumber}: ${teamName}` : teamNumber;
    })
  );

  return teamLabels.filter(Boolean).join(', ');
}

// Fetch team ID from team number
export const getTeamIdByNumber = cache(async (teamNumber: string = TEAM_NUMBER): Promise<number | null> => {
  try {
    const data = await fetchFromRobotEvents(`/teams?number=${teamNumber}`);
    if (!data?.data || data.data.length === 0) {
      throw new Error(`Team ${teamNumber} not found in RobotEvents database`);
    }
    logRobotEventsDebug(`[RobotEvents] Found team ID: ${data.data[0].id} for team ${teamNumber}`);
    return data.data[0].id;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[RobotEvents] Failed to get team ID: ${errorMessage}`);
    throw error;
  }
});

// Get upcoming events for the team
export const fetchRoboteventsFixtures = cache(async (): Promise<RobotEventsFixture[]> => {
  try {
    const teamId = await getTeamIdByNumber();
    if (!teamId) {
      throw new Error('Could not get team ID for 21052A');
    }

    const events = await fetchAllPagesFromRobotEvents(`/teams/${teamId}/events`);
    if (!events || events.length === 0) {
      console.warn('[RobotEvents] No events found for team');
      return [];
    }

    // Filter for future events and format them
    const now = new Date();
    const fixtures = events
      .filter((event: any) => new Date(event.start) > now)
      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5) // Get next 5 events
      .map((event: any) => ({
        id: event.id,
        eventName: event.name,
        eventCode: event.sku || '',
        location: event.location?.city || "TBD",
        startDate: event.start,
        endDate: event.end,
        season: event.season?.name || "Current",
        link: buildRobotEventsLink(event.sku),
      }));
    
    logRobotEventsDebug(`[RobotEvents] Fetched ${fixtures.length} upcoming fixtures`);
    return fixtures;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[RobotEvents] Failed to fetch fixtures: ${errorMessage}`);
    throw error;
  }
});

// Get past match results for the team
export const fetchRoboteventsResults = cache(async (): Promise<RobotEventsResult[]> => {
  try {
    const teamId = await getTeamIdByNumber();
    if (!teamId) {
      throw new Error('Could not get team ID for 21052A');
    }

    const matchesEndpoint = `/teams/${teamId}/matches`;
    const eventsEndpoint = `/teams/${teamId}/events`;
    const fullUrl = `https://www.robotevents.com/api/v2${matchesEndpoint}`;
    logRobotEventsDebug('[RobotEvents] Fetching matches from:', fullUrl);
    
    const [matches, events] = await Promise.all([
      fetchAllPagesFromRobotEvents(matchesEndpoint),
      fetchAllPagesFromRobotEvents(eventsEndpoint),
    ]);
    logRobotEventsDebug('[RobotEvents] Raw matches response count:', matches.length);
    
    if (!Array.isArray(matches) || matches.length === 0) {
      console.warn('[RobotEvents] No match results found for team');
      return [];
    }

    const seasonByEventId = new Map<number, string>();
    const seasonByEventCode = new Map<string, string>();

    for (const event of events) {
      const seasonName = event?.season?.name;
      if (!seasonName) {
        continue;
      }

      if (typeof event.id === 'number') {
        seasonByEventId.set(event.id, seasonName);
      }

      if (event.sku) {
        seasonByEventCode.set(event.sku, seasonName);
      }
    }

    // Format all played matches so the UI can filter across seasons
    const playedMatches = matches
      .filter((match: any) => {
        const includeMatch = hasUsableMatchData(match);
        logRobotEventsDebug('[RobotEvents] Processing match:', { id: match.id, scored: match.scored, started: match.started, updatedAt: match.updated_at, name: match.name, includeMatch });
        return includeMatch;
      })
      .sort((a: any, b: any) => {
        return new Date(getMatchTimestamp(b) || 0).getTime() - new Date(getMatchTimestamp(a) || 0).getTime();
      });

    const results = await Promise.all(playedMatches.map(async (match: any) => {
        // Determine team's alliance and score
        const { ourAlliance, opponentAlliance, ourScore, opponentScore } = getMatchScores(match, teamId);
        const result = ourScore > opponentScore ? 'Win' : ourScore < opponentScore ? 'Loss' : 'Tie';
        const allianceColor = (ourAlliance?.color || 'unknown').toUpperCase();
        const ourTeams = await formatAllianceTeams(ourAlliance);
        const opponentTeams = await formatAllianceTeams(opponentAlliance);
        const season = seasonByEventId.get(match.event?.id) || seasonByEventCode.get(match.event?.code) || 'Unknown Season';
        const matchLabel = getMatchLabel(match);
        const countsForRecord = isCountableForStats(match, teamId);
        
        logRobotEventsDebug('[RobotEvents] Match details:', {
          id: match.id,
          event: match.event?.name,
          season,
          matchLabel,
          countsForRecord,
          ourScore,
          opponentScore,
          result,
          allianceColor,
          ourTeams,
          opponentTeams
        });
        
        return {
          id: match.id,
          eventName: match.event?.name || "Event",
          eventCode: match.event?.code || '',
          season,
          date: getMatchTimestamp(match),
          matchLabel,
          placement: result,
          countsForRecord,
          ourAllianceColor: (ourAlliance?.color || 'unknown').toLowerCase(),
          opponentAllianceColor: (opponentAlliance?.color || 'unknown').toLowerCase(),
          awards: ourScore.toString(),
          opponentScore: opponentScore.toString(),
          ourTeams,
          opponentTeams,
          link: buildRobotEventsLink(match.event?.code, 'results-'),
        };
      }));
    
    logRobotEventsDebug(`[RobotEvents] Fetched ${results.length} match results`);
    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[RobotEvents] Failed to fetch results: ${errorMessage}`);
    throw error;
  }
});

export const fetchRoboteventsSummary = cache(async (): Promise<RobotEventsSummary> => {
  try {
    const teamId = await getTeamIdByNumber();
    if (!teamId) {
      throw new Error('Could not get team ID for 21052A');
    }

    const [team, events, awards, matches] = await Promise.all([
      fetchFromRobotEvents(`/teams/${teamId}`),
      fetchAllPagesFromRobotEvents(`/teams/${teamId}/events`),
      fetchAllPagesFromRobotEvents(`/teams/${teamId}/awards`),
      fetchAllPagesFromRobotEvents(`/teams/${teamId}/matches`),
    ]);

    const playedMatches = matches.filter((match: any) => isCountableForStats(match, teamId));

    let wins = 0;
    let losses = 0;
    let ties = 0;

    for (const match of playedMatches) {
      const { ourScore, opponentScore } = getMatchScores(match, teamId);

      if (ourScore > opponentScore) {
        wins += 1;
      } else if (ourScore < opponentScore) {
        losses += 1;
      } else {
        ties += 1;
      }
    }

    const seasonsActive = new Set(
      events
        .map((event: any) => event.season?.name)
        .filter(Boolean)
    ).size;

    const winPercentage = playedMatches.length > 0
      ? Number(((wins / playedMatches.length) * 100).toFixed(1))
      : 0;

    return {
      teamName: team?.team_name || 'Five Rings Robotics',
      teamNumber: team?.number || TEAM_NUMBER,
      organization: team?.organization || '',
      seasonsActive,
      eventsEntered: events.length,
      awardsWon: awards.length,
      matchesPlayed: playedMatches.length,
      wins,
      losses,
      ties,
      winPercentage,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[RobotEvents] Failed to fetch summary: ${errorMessage}`);
    throw error;
  }
});

export const fetchRoboteventsSeasonStats = cache(async (): Promise<RobotEventsSeasonStats[]> => {
  try {
    const teamId = await getTeamIdByNumber();
    if (!teamId) {
      throw new Error('Could not get team ID for 21052A');
    }

    const [events, awards, matches] = await Promise.all([
      fetchAllPagesFromRobotEvents(`/teams/${teamId}/events`),
      fetchAllPagesFromRobotEvents(`/teams/${teamId}/awards`),
      fetchAllPagesFromRobotEvents(`/teams/${teamId}/matches`),
    ]);

    const seasonStats = new Map<string, RobotEventsSeasonStats>();
    const seasonByEventId = new Map<number, string>();
    const seasonByEventCode = new Map<string, string>();

    for (const event of events) {
      const season = event?.season?.name;
      if (!season) {
        continue;
      }

      if (!seasonStats.has(season)) {
        seasonStats.set(season, {
          season,
          eventsEntered: 0,
          awardsWon: 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winPercentage: 0,
        });
      }

      seasonStats.get(season)!.eventsEntered += 1;

      if (typeof event.id === 'number') {
        seasonByEventId.set(event.id, season);
      }

      if (event.sku) {
        seasonByEventCode.set(event.sku, season);
      }
    }

    for (const award of awards) {
      const season = seasonByEventId.get(award?.event?.id) || seasonByEventCode.get(award?.event?.code);
      if (!season) {
        continue;
      }

      if (!seasonStats.has(season)) {
        seasonStats.set(season, {
          season,
          eventsEntered: 0,
          awardsWon: 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winPercentage: 0,
        });
      }

      seasonStats.get(season)!.awardsWon += 1;
    }

    for (const match of matches) {
      if (!isCountableForStats(match, teamId)) {
        continue;
      }

      const season = seasonByEventId.get(match.event?.id) || seasonByEventCode.get(match.event?.code);
      if (!season) {
        continue;
      }

      if (!seasonStats.has(season)) {
        seasonStats.set(season, {
          season,
          eventsEntered: 0,
          awardsWon: 0,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winPercentage: 0,
        });
      }

      const { ourScore, opponentScore } = getMatchScores(match, teamId);
      const stats = seasonStats.get(season)!;

      stats.matchesPlayed += 1;

      if (ourScore > opponentScore) {
        stats.wins += 1;
      } else if (ourScore < opponentScore) {
        stats.losses += 1;
      } else {
        stats.ties += 1;
      }
    }

    const seasonSortValue = (season: string) => {
      const match = season.match(/(\d{4})-(\d{4})/);
      return match ? Number(match[1]) : 0;
    };

    return Array.from(seasonStats.values())
      .map((stats) => ({
        ...stats,
        winPercentage: stats.matchesPlayed > 0
          ? Number(((stats.wins / stats.matchesPlayed) * 100).toFixed(1))
          : 0,
      }))
      .sort((a, b) => seasonSortValue(b.season) - seasonSortValue(a.season));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[RobotEvents] Failed to fetch season stats: ${errorMessage}`);
    throw error;
  }
});
