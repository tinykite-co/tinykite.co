export type CountdownPhase = 'idle' | 'ready' | 'set' | 'go' | 'racing';

export interface CountdownState {
  phase: CountdownPhase;
  label: string;
  badgeColor: string;
  dotColor: string;
  isInputEnabled: boolean;
}

export function getCountdownStep(secondsRemaining: number): CountdownState {
  if (secondsRemaining > 2) {
    return {
      phase: 'ready',
      label: 'READY',
      badgeColor: 'bg-rose-500 text-white',
      dotColor: 'bg-rose-500 shadow-rose-500/50',
      isInputEnabled: false
    };
  } else if (secondsRemaining > 1) {
    return {
      phase: 'set',
      label: 'SET',
      badgeColor: 'bg-amber-500 text-slate-950',
      dotColor: 'bg-amber-500 shadow-amber-500/50',
      isInputEnabled: false
    };
  } else if (secondsRemaining > 0) {
    return {
      phase: 'go',
      label: 'GO!',
      badgeColor: 'bg-emerald-500 text-white',
      dotColor: 'bg-emerald-500 shadow-emerald-500/50',
      isInputEnabled: true
    };
  } else {
    return {
      phase: 'racing',
      label: 'RACING',
      badgeColor: 'bg-slate-800 text-slate-200',
      dotColor: 'bg-emerald-500 shadow-emerald-500/50',
      isInputEnabled: true
    };
  }
}
