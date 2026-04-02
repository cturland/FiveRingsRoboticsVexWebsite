'use server';

import { fetchRoboteventsFixtures, fetchRoboteventsResults, fetchRoboteventsSeasonStats, fetchRoboteventsSummary } from '@/lib/robotevents';

export async function getTeamFixtures() {
  try {
    console.log('Fetching fixtures from RobotEvents API...');
    const fixtures = await fetchRoboteventsFixtures();
    console.log('Fixtures fetched successfully:', fixtures.length, 'events');
    if (!fixtures || fixtures.length === 0) {
      return { success: false, data: [], error: 'No upcoming events found for team 21052A on RobotEvents' };
    }
    return { success: true, data: fixtures };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching fixtures:', errorMessage);
    return { success: false, data: [], error: `Failed to fetch fixtures: ${errorMessage}` };
  }
}

export async function getTeamResults() {
  try {
    console.log('Fetching results from RobotEvents API...');
    const results = await fetchRoboteventsResults();
    console.log('Results fetched successfully:', results.length, 'matches');
    if (!results || results.length === 0) {
      return { success: false, data: [], error: 'No match results found for team 21052A on RobotEvents' };
    }
    return { success: true, data: results };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching results:', errorMessage);
    return { success: false, data: [], error: `Failed to fetch results: ${errorMessage}` };
  }
}

export async function getTeamSummary() {
  try {
    console.log('Fetching summary from RobotEvents API...');
    const summary = await fetchRoboteventsSummary();
    console.log('Summary fetched successfully for team:', summary.teamNumber);
    return { success: true, data: summary, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching summary:', errorMessage);
    return { success: false, data: null, error: `Failed to fetch summary: ${errorMessage}` };
  }
}

export async function getTeamSeasonStats() {
  try {
    console.log('Fetching season stats from RobotEvents API...');
    const stats = await fetchRoboteventsSeasonStats();
    console.log('Season stats fetched successfully:', stats.length, 'seasons');
    return { success: true, data: stats, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching season stats:', errorMessage);
    return { success: false, data: [], error: `Failed to fetch season stats: ${errorMessage}` };
  }
}
