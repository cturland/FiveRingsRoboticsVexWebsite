import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export type ReactionTimeScore = {
  id: number;
  teamNumber: string;
  playerName: string;
  reactionTimeMs: number;
  attempts: number;
  updatedAt: string;
};

export async function getReactionTimeLeaderboard(): Promise<ReactionTimeScore[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('reaction_time_scores')
    .select('id, team_number, player_name, reaction_time_ms, attempts, updated_at')
    .order('reaction_time_ms', { ascending: true })
    .order('updated_at', { ascending: true })
    .limit(600);

  if (error) {
    console.error('Failed to load reaction time leaderboard:', error);
    return [];
  }

  return (data ?? []).map((score) => ({
    id: score.id,
    teamNumber: score.team_number,
    playerName: score.player_name,
    reactionTimeMs: score.reaction_time_ms,
    attempts: score.attempts,
    updatedAt: score.updated_at,
  }));
}
