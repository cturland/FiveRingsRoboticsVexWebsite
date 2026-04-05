'use server';

import { cache } from 'react';
import { fetchRoboteventsFixtures, fetchRoboteventsResults, fetchRoboteventsSeasonStats, fetchRoboteventsSummary } from '@/lib/robotevents';

export const getTeamFixtures = cache(async () => {
  try {
    const fixtures = await fetchRoboteventsFixtures();
    if (!fixtures || fixtures.length === 0) {
      return { success: false, data: [], error: 'No upcoming events found for team 21052A on RobotEvents' };
    }
    return { success: true, data: fixtures };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching fixtures:', errorMessage);
    return { success: false, data: [], error: `Failed to fetch fixtures: ${errorMessage}` };
  }
});

export const getTeamResults = cache(async () => {
  try {
    const results = await fetchRoboteventsResults();
    if (!results || results.length === 0) {
      return { success: false, data: [], error: 'No match results found for team 21052A on RobotEvents' };
    }
    return { success: true, data: results };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching results:', errorMessage);
    return { success: false, data: [], error: `Failed to fetch results: ${errorMessage}` };
  }
});

export const getTeamSummary = cache(async () => {
  try {
    const summary = await fetchRoboteventsSummary();
    return { success: true, data: summary, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching summary:', errorMessage);
    return { success: false, data: null, error: `Failed to fetch summary: ${errorMessage}` };
  }
});

export const getTeamSeasonStats = cache(async () => {
  try {
    const stats = await fetchRoboteventsSeasonStats();
    return { success: true, data: stats, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching season stats:', errorMessage);
    return { success: false, data: [], error: `Failed to fetch season stats: ${errorMessage}` };
  }
});
