import ReactionTimeGame from './ReactionTimeGame';
import { getReactionTimeLeaderboard } from '@/lib/reactionTimes';

export default async function ReactionTimePage() {
  const leaderboard = await getReactionTimeLeaderboard();

  return <ReactionTimeGame initialLeaderboard={leaderboard} />;
}
