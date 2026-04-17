'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { ReactionTimeScore } from '@/lib/reactionTimes';
import { submitReactionTimeScore } from './actions';

type GamePhase = 'setup' | 'armed' | 'lighting' | 'waiting' | 'go' | 'result' | 'false-start' | 'locked-out';
type FalseStartKind = 'early' | 'anticipation';

type ReactionTimeGameProps = {
  initialLeaderboard: ReactionTimeScore[];
};

const LIGHT_COUNT = 5;
const LIGHT_INTERVAL_MS = 1000;
const MIN_START_DELAY_MS = 200;
const MAX_START_DELAY_MS = 3000;
const MIN_VALID_REACTION_MS = 100;

function formatMs(value: number) {
  return `${value} ms`;
}

function normalizeTeamNumber(value: string) {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

export default function ReactionTimeGame({ initialLeaderboard }: ReactionTimeGameProps) {
  const [teamNumber, setTeamNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [litLights, setLitLights] = useState(0);
  const [falseStarts, setFalseStarts] = useState(0);
  const [falseStartKind, setFalseStartKind] = useState<FalseStartKind>('early');
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const [message, setMessage] = useState('Enter your details, then start the challenge.');
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [isPending, startTransition] = useTransition();
  const timersRef = useRef<number[]>([]);
  const goTimeRef = useRef(0);

  const canStart = normalizeTeamNumber(teamNumber).length > 0 && playerName.trim().length > 0 && phase !== 'lighting' && phase !== 'waiting' && phase !== 'go' && phase !== 'locked-out';
  const detailsLocked = phase !== 'setup' && phase !== 'armed' && phase !== 'result' && phase !== 'false-start' && phase !== 'locked-out';
  const isWarningPhase = phase === 'false-start' || phase === 'locked-out';
  const warningTitle = phase === 'locked-out'
    ? 'No Time Recorded'
    : falseStartKind === 'anticipation'
      ? 'Jump Start'
      : 'False Start';

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT' || target?.isContentEditable;

      if (event.code !== 'Space' || isTyping) {
        return;
      }

      event.preventDefault();
      handleRaceControl();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function clearTimers() {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }

    timersRef.current = [];
  }

  function resetLights() {
    clearTimers();
    setLitLights(0);
    goTimeRef.current = 0;
  }

  function resetForNewPlayer() {
    resetLights();
    setTeamNumber('');
    setPlayerName('');
    setFalseStarts(0);
    setFalseStartKind('early');
    setReactionTimeMs(null);
    setPhase('setup');
    setMessage('Enter your details, then start the challenge.');
  }

  function startAttempt() {
    if (!canStart) {
      setMessage('Enter your VEX team number and name first.');
      return;
    }

    resetLights();
    if (phase !== 'false-start') {
      setFalseStarts(0);
    }
    setReactionTimeMs(null);
    setPhase('lighting');
    setMessage('Watch the lights. Press Space when they go out. Mobile players can tap the control.');

    for (let index = 1; index <= LIGHT_COUNT; index += 1) {
      const timer = window.setTimeout(() => {
        setLitLights(index);
      }, index * LIGHT_INTERVAL_MS);

      timersRef.current.push(timer);
    }

    const allLightsDelay = LIGHT_COUNT * LIGHT_INTERVAL_MS;
    const randomDelay = MIN_START_DELAY_MS + Math.random() * (MAX_START_DELAY_MS - MIN_START_DELAY_MS);

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('waiting');
      }, allLightsDelay),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setLitLights(0);
        goTimeRef.current = performance.now();
        setPhase('go');
        setMessage('Go!');
      }, allLightsDelay + randomDelay),
    );
  }

  function handleFalseStart(reason = 'False start. One more try.', kind: FalseStartKind = 'early') {
    clearTimers();
    setLitLights(0);
    setFalseStartKind(kind);

    const nextFalseStarts = falseStarts + 1;
    setFalseStarts(nextFalseStarts);
    setReactionTimeMs(null);

    if (nextFalseStarts >= 2) {
      setPhase('locked-out');
      setMessage('Second false start. No time recorded. A new player can play now.');
      return;
    }

    setPhase('false-start');
    setMessage(`${reason} Press Space or tap Start to use your final try.`);
  }

  function recordReactionTime() {
    const elapsed = Math.round(performance.now() - goTimeRef.current);

    if (elapsed < MIN_VALID_REACTION_MS) {
      handleFalseStart(`Jump start. Reactions under ${MIN_VALID_REACTION_MS} ms count as anticipating the lights. One more try.`, 'anticipation');
      return;
    }

    setReactionTimeMs(elapsed);
    setPhase('result');
    setFalseStarts(0);
    setMessage('Submitting your time...');

    startTransition(async () => {
      const result = await submitReactionTimeScore(normalizeTeamNumber(teamNumber), playerName.trim(), elapsed);
      setLeaderboard(result.leaderboard);
      setMessage(result.message);
    });
  }

  function handleRaceControl() {
    if (phase === 'lighting' || phase === 'waiting') {
      handleFalseStart();
      return;
    }

    if (phase === 'go') {
      recordReactionTime();
      return;
    }

    startAttempt();
  }

  return (
    <div className="grid min-h-[calc(100vh-12rem)] min-w-0 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(24rem,0.75fr)]">
      <section className={`flex w-full max-w-[21.25rem] min-w-0 flex-col overflow-x-hidden rounded-[1.8rem] border bg-[linear-gradient(180deg,rgba(13,24,40,0.97),rgba(7,14,26,0.98))] p-5 transition-colors sm:max-w-none md:p-7 ${
        isWarningPhase ? 'border-red-400/70 shadow-[0_0_0_3px_rgba(248,113,113,0.18)]' : 'border-white/10'
      }`}>
        <div>
          <p className="eyebrow">Limited Time Challenge</p>
          <h1 className="heading-display mt-4 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            <span className="block">VEX Worlds</span>
            <span className="block">Fastest</span>
            <span className="block">Reaction Times</span>
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-muted)]">
            Five red start lights, a random delay, then lights out. React too early and it counts as a false start.
          </p>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-red-200">
            Desktop racers use Spacebar. Mobile racers can tap the control. Anything under {MIN_VALID_REACTION_MS} ms is treated as a jump start.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">VEX Team Number</span>
            <input
              type="text"
              value={teamNumber}
              onChange={(event) => setTeamNumber(event.target.value)}
              placeholder="21052A"
              disabled={detailsLocked}
              className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold uppercase text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10 disabled:opacity-70"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)]">Player Name</span>
            <input
              type="text"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Your name"
              disabled={detailsLocked}
              className="w-full rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-white outline-none transition focus:border-[var(--color-primary-accent)] focus:bg-white/10 disabled:opacity-70"
            />
          </label>
        </div>

        {isWarningPhase ? (
          <div className="mt-6 rounded-[1.25rem] border border-red-300/60 bg-red-600/20 px-5 py-4 text-center shadow-[0_0_34px_rgba(220,38,38,0.22)]" role="alert" aria-live="assertive">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-red-100">
              {warningTitle}
            </p>
            <p className="mt-2 text-base font-bold text-white">{message}</p>
          </div>
        ) : null}

        <div className="my-8 flex flex-1 flex-col items-center justify-center gap-7">
          <div className={`w-full max-w-3xl rounded-[1.5rem] border bg-black/35 p-4 transition-colors sm:p-5 ${isWarningPhase ? 'border-red-300/60' : 'border-white/10'}`}>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {Array.from({ length: LIGHT_COUNT }).map((_, column) => {
                const isLit = column < litLights;

                return (
                  <div key={column} className="rounded-[0.9rem] bg-black p-2 sm:p-3">
                    <div className={`aspect-square rounded-full ${isLit ? 'bg-red-600 shadow-[0_0_28px_rgba(239,68,68,0.78)]' : 'bg-zinc-800'}`}></div>
                    <div className={`mt-2 aspect-square rounded-full ${isLit ? 'bg-red-600 shadow-[0_0_28px_rgba(239,68,68,0.78)]' : 'bg-zinc-800'}`}></div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRaceControl}
            disabled={phase === 'locked-out' || isPending}
            className={`flex h-36 w-36 items-center justify-center rounded-full border text-center text-sm font-black uppercase tracking-[0.18em] transition sm:h-44 sm:w-44 ${
              phase === 'go'
                ? 'border-green-300 bg-green-500 text-black shadow-[0_0_48px_rgba(34,197,94,0.55)]'
                : isWarningPhase
                  ? 'border-red-100 bg-red-700 text-white shadow-[0_0_54px_rgba(239,68,68,0.5)] disabled:cursor-not-allowed disabled:opacity-50'
                : 'border-red-400/40 bg-red-600 text-white shadow-[0_24px_70px_rgba(227,51,61,0.24)] hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
            }`}
          >
            {phase === 'go' ? 'React' : phase === 'lighting' || phase === 'waiting' ? 'Wait' : phase === 'false-start' ? 'Final Try' : phase === 'locked-out' ? 'Stopped' : isPending ? 'Saving' : 'Start'}
          </button>

          <div className="min-h-[5rem] text-center">
            {reactionTimeMs !== null ? (
              <p className="heading-display text-5xl font-black text-white md:text-7xl">{formatMs(reactionTimeMs)}</p>
            ) : (
              <p className="heading-display text-5xl font-black text-white/35 md:text-7xl">00.000</p>
            )}
            <p className={`mt-3 text-sm font-semibold ${isWarningPhase ? 'text-red-100' : 'text-[var(--color-muted)]'}`}>
              {message}
            </p>
            <p className={`mt-2 text-xs font-black uppercase tracking-[0.18em] ${isWarningPhase ? 'text-red-200' : 'text-[var(--color-muted)]'}`}>False starts: {falseStarts}/2</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={startAttempt} disabled={!canStart || isPending} className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
            Try Again
          </button>
          <button type="button" onClick={resetForNewPlayer} className="btn btn-primary">
            New Player
          </button>
        </div>
      </section>

      <aside className="flex min-h-[34rem] w-full max-w-[21.25rem] min-w-0 flex-col rounded-[1.8rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 sm:max-w-none md:p-5 xl:sticky xl:top-28 xl:max-h-[calc(100vh-9rem)]">
        <div className="border-b border-white/10 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">Leaderboard</p>
          <h2 className="mt-2 text-2xl font-black text-white">Fastest Times</h2>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {leaderboard.length === 0 ? (
            <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4 text-sm text-[var(--color-muted)]">
              No times recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((score, index) => {
                const rank = index + 1;
                const isTopTen = rank <= 10;

                return (
                  <div
                    key={score.id}
                    className={`grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-[1rem] border ${
                      isTopTen
                        ? 'border-red-400/25 bg-red-500/10 px-4 py-4 text-base'
                        : 'border-white/10 bg-black/15 px-3 py-2 text-sm'
                    }`}
                  >
                    <p className={`${isTopTen ? 'text-2xl' : 'text-base'} font-black text-white`}>#{rank}</p>
                    <div className="min-w-0">
                      <p className={`${isTopTen ? 'text-lg' : 'text-sm'} truncate font-black text-white`}>{score.playerName}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">{score.teamNumber}</p>
                    </div>
                    <p className={`${isTopTen ? 'text-2xl' : 'text-base'} font-black text-red-200`}>{score.reactionTimeMs} ms</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
