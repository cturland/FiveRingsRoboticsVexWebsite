'use server';

import { revalidatePath } from 'next/cache';
import { getReactionTimeLeaderboard, type ReactionTimeScore } from '@/lib/reactionTimes';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type SubmitReactionTimeResult = {
  status: 'success' | 'error';
  message: string;
  leaderboard: ReactionTimeScore[];
};

export async function submitReactionTimeScore(
  teamNumber: string,
  playerName: string,
  reactionTimeMs: number,
): Promise<SubmitReactionTimeResult> {
  if (!isSupabaseConfigured()) {
    return {
      status: 'error',
      message: 'Leaderboard storage is not configured yet.',
      leaderboard: [],
    };
  }

  const cleanTeamNumber = teamNumber.trim();
  const cleanPlayerName = playerName.trim();
  const cleanReactionTime = Math.round(reactionTimeMs);

  if (!cleanTeamNumber || !cleanPlayerName) {
    return {
      status: 'error',
      message: 'Enter your VEX team number and name before racing.',
      leaderboard: await getReactionTimeLeaderboard(),
    };
  }

  if (!Number.isFinite(cleanReactionTime) || cleanReactionTime <= 0 || cleanReactionTime >= 10000) {
    return {
      status: 'error',
      message: 'That reaction time could not be recorded. Please try again.',
      leaderboard: await getReactionTimeLeaderboard(),
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc('submit_reaction_time_score', {
    submitted_team_number: cleanTeamNumber,
    submitted_player_name: cleanPlayerName,
    submitted_reaction_time_ms: cleanReactionTime,
  });

  if (error) {
    return {
      status: 'error',
      message: error.message,
      leaderboard: await getReactionTimeLeaderboard(),
    };
  }

  revalidatePath('/reaction-time');

  return {
    status: 'success',
    message: 'Score recorded. If this was faster than your previous time, the leaderboard has been updated.',
    leaderboard: await getReactionTimeLeaderboard(),
  };
}
