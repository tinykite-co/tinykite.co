/**
 * Core Timer Domain Engine & State Machine.
 *
 * Supports hero countdown timer and secondary multi-timers with strict state
 * transitions ('idle' -> 'running' -> 'paused' -> 'completed').
 * Strict TypeScript compliant with astro/tsconfigs/strictest.
 */

import { MS_PER_SECOND, SECONDS_PER_MINUTE, MINUTES_PER_HOUR } from './config.ts';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerInstance {
  readonly id: string;
  readonly label: string;
  readonly totalDurationMs: number;
  readonly remainingMs: number;
  readonly status: TimerStatus;
  readonly lastTickMs: number | null;
  readonly endTargetMs: number | null;
}

export interface TimerSnapshot {
  readonly id: string;
  readonly label: string;
  readonly totalDurationMs: number;
  readonly remainingMs: number;
  readonly progressFraction: number;
  readonly status: TimerStatus;
  readonly endTimeFormatted: string | null;
}

/**
 * Converts hours, minutes, seconds into milliseconds.
 */
export function parseHmsToMs(hours: number, minutes: number, seconds: number): number {
  const h = Math.max(0, Math.floor(Number.isFinite(hours) ? hours : 0));
  const m = Math.max(0, Math.floor(Number.isFinite(minutes) ? minutes : 0));
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));

  const totalSeconds = h * SECONDS_PER_MINUTE * MINUTES_PER_HOUR + m * SECONDS_PER_MINUTE + s;
  return totalSeconds * MS_PER_SECOND;
}

/**
 * Computes the remaining progress fraction clamped between 0 and 1.
 */
export function computeProgressFraction(remainingMs: number, totalDurationMs: number): number {
  if (totalDurationMs <= 0) {
    return 0;
  }
  const fraction = remainingMs / totalDurationMs;
  return Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
}

/**
 * Formats a predicted end timestamp in local time.
 */
export function formatEndTime(
  endTargetMs: number | null,
  use24Hour: boolean = false
): string | null {
  if (endTargetMs === null || !Number.isFinite(endTargetMs)) {
    return null;
  }
  const date = new Date(endTargetMs);
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const minutePadded = String(minute).padStart(2, '0');

  if (use24Hour) {
    return `${String(hour24).padStart(2, '0')}:${minutePadded}`;
  }

  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12)}:${minutePadded} ${period}`;
}

/**
 * Creates a new timer instance in the idle state.
 */
export function createTimer(id: string, label: string, durationMs: number): TimerInstance {
  const safeDuration = Math.max(0, Math.floor(Number.isFinite(durationMs) ? durationMs : 0));
  return {
    id,
    label: label.trim() || 'Timer',
    totalDurationMs: safeDuration,
    remainingMs: safeDuration,
    status: 'idle',
    lastTickMs: null,
    endTargetMs: null,
  };
}

/**
 * Starts or resumes a timer instance.
 */
export function startTimer(timer: TimerInstance, nowMs: number): TimerInstance {
  if (timer.status === 'running') {
    return timer;
  }

  let remainingMs = timer.remainingMs;
  if (remainingMs <= 0) {
    if (timer.totalDurationMs <= 0) {
      return timer;
    }
    remainingMs = timer.totalDurationMs;
  }

  return {
    ...timer,
    remainingMs,
    status: 'running',
    lastTickMs: nowMs,
    endTargetMs: nowMs + remainingMs,
  };
}

/**
 * Pauses a running timer instance.
 */
export function pauseTimer(timer: TimerInstance, nowMs: number): TimerInstance {
  if (timer.status !== 'running') {
    return timer;
  }

  const delta = Math.max(0, nowMs - (timer.lastTickMs ?? nowMs));
  const newRemaining = Math.max(0, timer.remainingMs - delta);

  if (newRemaining <= 0) {
    return {
      ...timer,
      remainingMs: 0,
      status: 'completed',
      lastTickMs: null,
      endTargetMs: null,
    };
  }

  return {
    ...timer,
    remainingMs: newRemaining,
    status: 'paused',
    lastTickMs: null,
    endTargetMs: null,
  };
}

/**
 * Resets a timer instance back to idle with full duration.
 */
export function resetTimer(timer: TimerInstance): TimerInstance {
  return {
    ...timer,
    remainingMs: timer.totalDurationMs,
    status: 'idle',
    lastTickMs: null,
    endTargetMs: null,
  };
}

/**
 * Adds extra duration to a timer instance.
 */
export function addTimeMs(
  timer: TimerInstance,
  extraMs: number,
  nowMs: number = Date.now()
): TimerInstance {
  const safeExtra = Math.max(0, Math.floor(Number.isFinite(extraMs) ? extraMs : 0));
  if (safeExtra === 0) {
    return timer;
  }

  const newTotal = timer.totalDurationMs + safeExtra;
  const newRemaining = timer.remainingMs + safeExtra;

  let newEndTarget: number | null = timer.endTargetMs;
  if (timer.status === 'running') {
    newEndTarget = nowMs + newRemaining;
  }

  const newStatus: TimerStatus =
    timer.status === 'completed' && newRemaining > 0 ? 'paused' : timer.status;

  return {
    ...timer,
    totalDurationMs: newTotal,
    remainingMs: newRemaining,
    endTargetMs: newEndTarget,
    status: newStatus,
    lastTickMs: timer.status === 'running' ? nowMs : timer.lastTickMs,
  };
}

/**
 * Ticks a running timer forward in time. Transitions to 'completed' when remainingMs <= 0.
 */
export function tickTimer(timer: TimerInstance, nowMs: number): TimerInstance {
  if (timer.status !== 'running') {
    return timer;
  }

  const delta = Math.max(0, nowMs - (timer.lastTickMs ?? nowMs));
  const newRemaining = timer.remainingMs - delta;

  if (newRemaining <= 0) {
    return {
      ...timer,
      remainingMs: 0,
      status: 'completed',
      lastTickMs: null,
      endTargetMs: null,
    };
  }

  return {
    ...timer,
    remainingMs: newRemaining,
    lastTickMs: nowMs,
  };
}

/**
 * Builds a read-only snapshot of a timer instance for UI consumption.
 */
export function getTimerSnapshot(
  timer: TimerInstance,
  use24Hour: boolean = false
): TimerSnapshot {
  return {
    id: timer.id,
    label: timer.label,
    totalDurationMs: timer.totalDurationMs,
    remainingMs: timer.remainingMs,
    progressFraction: computeProgressFraction(timer.remainingMs, timer.totalDurationMs),
    status: timer.status,
    endTimeFormatted: formatEndTime(timer.endTargetMs, use24Hour),
  };
}

/**
 * TimerEngine managing a collection of independent timer instances.
 */
export class TimerEngine {
  private timers: Map<string, TimerInstance> = new Map();

  public constructor(initialTimers?: readonly TimerInstance[]) {
    if (initialTimers) {
      for (const t of initialTimers) {
        this.timers.set(t.id, t);
      }
    }
  }

  public addTimer(id: string, label: string, durationMs: number): TimerInstance {
    const timer = createTimer(id, label, durationMs);
    this.timers.set(id, timer);
    return timer;
  }

  public removeTimer(id: string): boolean {
    return this.timers.delete(id);
  }

  public getTimer(id: string): TimerInstance | undefined {
    return this.timers.get(id);
  }

  public getAllTimers(): readonly TimerInstance[] {
    return Array.from(this.timers.values());
  }

  public startTimer(id: string, nowMs: number = Date.now()): TimerInstance | null {
    const timer = this.timers.get(id);
    if (!timer) {
      return null;
    }
    const updated = startTimer(timer, nowMs);
    this.timers.set(id, updated);
    return updated;
  }

  public pauseTimer(id: string, nowMs: number = Date.now()): TimerInstance | null {
    const timer = this.timers.get(id);
    if (!timer) {
      return null;
    }
    const updated = pauseTimer(timer, nowMs);
    this.timers.set(id, updated);
    return updated;
  }

  public toggleTimer(id: string, nowMs: number = Date.now()): TimerInstance | null {
    const timer = this.timers.get(id);
    if (!timer) {
      return null;
    }
    if (timer.status === 'running') {
      return this.pauseTimer(id, nowMs);
    }
    return this.startTimer(id, nowMs);
  }

  public resetTimer(id: string): TimerInstance | null {
    const timer = this.timers.get(id);
    if (!timer) {
      return null;
    }
    const updated = resetTimer(timer);
    this.timers.set(id, updated);
    return updated;
  }

  public addTime(
    id: string,
    extraMs: number,
    nowMs: number = Date.now()
  ): TimerInstance | null {
    const timer = this.timers.get(id);
    if (!timer) {
      return null;
    }
    const updated = addTimeMs(timer, extraMs, nowMs);
    this.timers.set(id, updated);
    return updated;
  }

  public tickAll(nowMs: number = Date.now()): {
    updated: TimerInstance[];
    justCompletedIds: string[];
  } {
    const updated: TimerInstance[] = [];
    const justCompletedIds: string[] = [];

    for (const [id, timer] of this.timers.entries()) {
      if (timer.status === 'running') {
        const next = tickTimer(timer, nowMs);
        this.timers.set(id, next);
        updated.push(next);
        if (next.status === 'completed' && timer.status === 'running') {
          justCompletedIds.push(id);
        }
      }
    }

    return { updated, justCompletedIds };
  }

  public getSnapshot(id: string, use24Hour: boolean = false): TimerSnapshot | null {
    const timer = this.timers.get(id);
    if (!timer) {
      return null;
    }
    return getTimerSnapshot(timer, use24Hour);
  }

  public getAllSnapshots(use24Hour: boolean = false): TimerSnapshot[] {
    return Array.from(this.timers.values()).map((t) => getTimerSnapshot(t, use24Hour));
  }
}
