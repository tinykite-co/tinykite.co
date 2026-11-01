/**
 * Core Stopwatch Domain Engine.
 *
 * Fully pure logic decoupled from DOM/timers for 100% testability.
 * Strict TypeScript compliant with astro/tsconfigs/strictest.
 */

import {
  LAP_HIGHLIGHT_MIN_COUNT,
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_CENTISECOND,
  DEGREES_PER_CIRCLE,
  ANALOG_SECONDS_PER_REV,
  ANALOG_SUBDIAL_MINUTES,
} from './config.ts';

export type StopwatchStatus = 'idle' | 'running' | 'paused';
export type LapHighlightStatus = 'fastest' | 'slowest' | 'normal';

export interface LapRecord {
  readonly lapNumber: number;
  readonly lapDurationMs: number;
  readonly totalSplitMs: number;
  readonly deltaFromAvgMs: number;
  readonly status: LapHighlightStatus;
  readonly timestampIso: string;
}

export interface StopwatchStats {
  readonly lapCount: number;
  readonly bestLapMs: number | null;
  readonly worstLapMs: number | null;
  readonly averageLapMs: number | null;
  readonly consistencyScore: number | null;
  readonly stdDevMs: number | null;
}

export interface FormattedDuration {
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
  readonly centiseconds: string;
  readonly milliseconds: string;
  readonly compact: string;
  readonly fullWithMs: string;
}

export interface AnalogDialAngles {
  readonly secondDeg: number;
  readonly minuteDeg: number;
  readonly lapSecondDeg: number;
}

export interface SavedStopwatchSession {
  readonly id: string;
  readonly title: string;
  readonly createdAtIso: string;
  readonly totalElapsedMs: number;
  readonly laps: readonly LapRecord[];
  readonly stats: StopwatchStats;
}

export interface StopwatchSnapshot {
  readonly status: StopwatchStatus;
  readonly totalElapsedMs: number;
  readonly currentLapElapsedMs: number;
  readonly formattedTotal: FormattedDuration;
  readonly formattedCurrentLap: FormattedDuration;
  readonly dialAngles: AnalogDialAngles;
  readonly laps: readonly LapRecord[];
  readonly stats: StopwatchStats;
  readonly targetPaceMs: number | null;
  readonly paceDeltaMs: number | null;
}

/**
 * Formats a duration in milliseconds into zero-padded units and composite strings.
 * Safely clamps negative numbers and handles arbitrarily large durations.
 */
export function formatDuration(ms: number): FormattedDuration {
  const safeMs = Math.max(0, Math.floor(Number.isFinite(ms) ? ms : 0));

  const hoursVal = Math.floor(safeMs / MS_PER_HOUR);
  const minutesVal = Math.floor((safeMs % MS_PER_HOUR) / MS_PER_MINUTE);
  const secondsVal = Math.floor((safeMs % MS_PER_MINUTE) / MS_PER_SECOND);
  const millisVal = Math.floor(safeMs % MS_PER_SECOND);
  const centisVal = Math.floor(millisVal / MS_PER_CENTISECOND);

  const hours = String(hoursVal).padStart(2, '0');
  const minutes = String(minutesVal).padStart(2, '0');
  const seconds = String(secondsVal).padStart(2, '0');
  const centiseconds = String(centisVal).padStart(2, '0');
  const milliseconds = String(millisVal).padStart(3, '0');

  const compact =
    hoursVal > 0
      ? `${hours}:${minutes}:${seconds}.${centiseconds}`
      : `${minutes}:${seconds}.${centiseconds}`;

  const fullWithMs =
    hoursVal > 0
      ? `${hours}:${minutes}:${seconds}.${milliseconds}`
      : `${minutes}:${seconds}.${milliseconds}`;

  return {
    hours,
    minutes,
    seconds,
    centiseconds,
    milliseconds,
    compact,
    fullWithMs,
  };
}

/**
 * Computes continuous sweep angles (0 to 360 deg) for:
 * 1. 60s main sweep second hand
 * 2. 30-minute subdial minute hand
 * 3. 60s current-lap split hand
 */
export function computeAnalogAngles(
  totalElapsedMs: number,
  currentLapElapsedMs: number
): AnalogDialAngles {
  const safeTotal = Math.max(0, Number.isFinite(totalElapsedMs) ? totalElapsedMs : 0);
  const safeLap = Math.max(0, Number.isFinite(currentLapElapsedMs) ? currentLapElapsedMs : 0);

  const mainRevMs = ANALOG_SECONDS_PER_REV * MS_PER_SECOND;
  const subdialRevMs = ANALOG_SUBDIAL_MINUTES * MS_PER_MINUTE;

  const secondDeg = ((safeTotal % mainRevMs) / mainRevMs) * DEGREES_PER_CIRCLE;
  const minuteDeg = ((safeTotal % subdialRevMs) / subdialRevMs) * DEGREES_PER_CIRCLE;
  const lapSecondDeg = ((safeLap % mainRevMs) / mainRevMs) * DEGREES_PER_CIRCLE;

  return {
    secondDeg,
    minuteDeg,
    lapSecondDeg,
  };
}

/**
 * Evaluates raw lap durations in chronological order (lap 1 first).
 * Computes split cumulative times, deltas from average, identifies fastest/slowest
 * (when lap count >= LAP_HIGHLIGHT_MIN_COUNT and laps are not all identical), and
 * calculates statistical metrics including coefficient-of-variation consistency score.
 */
export function evaluateLaps(
  rawLapDurationsMs: readonly number[],
  isoTimestamps?: readonly string[]
): { laps: LapRecord[]; stats: StopwatchStats } {
  const count = rawLapDurationsMs.length;

  if (count === 0) {
    return {
      laps: [],
      stats: {
        lapCount: 0,
        bestLapMs: null,
        worstLapMs: null,
        averageLapMs: null,
        consistencyScore: null,
        stdDevMs: null,
      },
    };
  }

  let totalSum = 0;
  let minDuration = Number.POSITIVE_INFINITY;
  let maxDuration = Number.NEGATIVE_INFINITY;

  for (const dur of rawLapDurationsMs) {
    totalSum += dur;
    if (dur < minDuration) minDuration = dur;
    if (dur > maxDuration) maxDuration = dur;
  }

  const avg = totalSum / count;

  let varianceSum = 0;
  for (const dur of rawLapDurationsMs) {
    const diff = dur - avg;
    varianceSum += diff * diff;
  }

  const stdDev = Math.sqrt(varianceSum / count);
  const cvPercent = avg > 0 ? (stdDev / avg) * 100 : 0;
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - cvPercent)));

  const hasHighlights = count >= LAP_HIGHLIGHT_MIN_COUNT && minDuration !== maxDuration;

  let runningSplit = 0;
  const laps: LapRecord[] = [];

  for (let i = 0; i < count; i++) {
    const dur = rawLapDurationsMs[i] ?? 0;
    runningSplit += dur;

    let status: LapHighlightStatus = 'normal';
    if (hasHighlights) {
      if (dur === minDuration) {
        status = 'fastest';
      } else if (dur === maxDuration) {
        status = 'slowest';
      }
    }

    const timestampIso =
      isoTimestamps && isoTimestamps[i] !== undefined
        ? (isoTimestamps[i] as string)
        : new Date().toISOString();

    laps.push({
      lapNumber: i + 1,
      lapDurationMs: dur,
      totalSplitMs: runningSplit,
      deltaFromAvgMs: Math.round(dur - avg),
      status,
      timestampIso,
    });
  }

  const stats: StopwatchStats = {
    lapCount: count,
    bestLapMs: minDuration,
    worstLapMs: maxDuration,
    averageLapMs: Math.round(avg),
    consistencyScore,
    stdDevMs: Math.round(stdDev),
  };

  return { laps, stats };
}

/**
 * Pure stateful StopwatchEngine.
 * External caller supplies monotonic or wall-clock timestamps (nowMs), allowing
 * deterministic testing of start, pause, resume, lap recording, and resets.
 */
export class StopwatchEngine {
  private status: StopwatchStatus = 'idle';
  private accumulatedMs: number = 0;
  private lastStartTimestampMs: number | null = null;
  private rawLapDurationsMs: number[] = [];
  private lapTimestampsIso: string[] = [];
  private targetPaceMs: number | null = null;

  public getStatus(): StopwatchStatus {
    return this.status;
  }

  public getTargetPaceMs(): number | null {
    return this.targetPaceMs;
  }

  public setTargetPaceMs(paceMs: number | null): void {
    this.targetPaceMs = paceMs !== null && paceMs > 0 ? paceMs : null;
  }

  public getRawLapDurations(): readonly number[] {
    return this.rawLapDurationsMs;
  }

  public start(nowMs: number = Date.now()): void {
    if (this.status === 'running') {
      return;
    }
    this.status = 'running';
    this.lastStartTimestampMs = nowMs;
  }

  public pause(nowMs: number = Date.now()): void {
    if (this.status !== 'running') {
      return;
    }
    const delta = Math.max(0, nowMs - (this.lastStartTimestampMs ?? nowMs));
    this.accumulatedMs += delta;
    this.lastStartTimestampMs = null;
    this.status = 'paused';
  }

  public toggle(nowMs: number = Date.now()): void {
    if (this.status === 'running') {
      this.pause(nowMs);
    } else {
      this.start(nowMs);
    }
  }

  public reset(): void {
    this.status = 'idle';
    this.accumulatedMs = 0;
    this.lastStartTimestampMs = null;
    this.rawLapDurationsMs = [];
    this.lapTimestampsIso = [];
  }

  public getTotalElapsedMs(nowMs: number = Date.now()): number {
    if (this.status === 'running' && this.lastStartTimestampMs !== null) {
      return this.accumulatedMs + Math.max(0, nowMs - this.lastStartTimestampMs);
    }
    return this.accumulatedMs;
  }

  public getCurrentLapElapsedMs(nowMs: number = Date.now()): number {
    const total = this.getTotalElapsedMs(nowMs);
    let previousLapsSum = 0;
    for (const d of this.rawLapDurationsMs) {
      previousLapsSum += d;
    }
    return Math.max(0, total - previousLapsSum);
  }

  public recordLap(nowMs: number = Date.now()): LapRecord | null {
    if (this.status === 'idle') {
      return null;
    }

    const lapDuration = this.getCurrentLapElapsedMs(nowMs);
    this.rawLapDurationsMs.push(lapDuration);
    this.lapTimestampsIso.push(new Date(nowMs).toISOString());

    const { laps } = evaluateLaps(this.rawLapDurationsMs, this.lapTimestampsIso);
    const lastLap = laps[laps.length - 1];
    return lastLap ?? null;
  }

  public getSnapshot(nowMs: number = Date.now()): StopwatchSnapshot {
    const totalElapsedMs = this.getTotalElapsedMs(nowMs);
    const currentLapElapsedMs = this.getCurrentLapElapsedMs(nowMs);

    const formattedTotal = formatDuration(totalElapsedMs);
    const formattedCurrentLap = formatDuration(currentLapElapsedMs);
    const dialAngles = computeAnalogAngles(totalElapsedMs, currentLapElapsedMs);
    const { laps, stats } = evaluateLaps(this.rawLapDurationsMs, this.lapTimestampsIso);

    const paceDeltaMs =
      this.targetPaceMs !== null ? currentLapElapsedMs - this.targetPaceMs : null;

    return {
      status: this.status,
      totalElapsedMs,
      currentLapElapsedMs,
      formattedTotal,
      formattedCurrentLap,
      dialAngles,
      laps,
      stats,
      targetPaceMs: this.targetPaceMs,
      paceDeltaMs,
    };
  }

  public createSavedSession(
    title: string = 'Stopwatch Session',
    nowMs: number = Date.now()
  ): SavedStopwatchSession {
    const totalElapsedMs = this.getTotalElapsedMs(nowMs);
    const { laps, stats } = evaluateLaps(this.rawLapDurationsMs, this.lapTimestampsIso);

    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title,
      createdAtIso: new Date(nowMs).toISOString(),
      totalElapsedMs,
      laps,
      stats,
    };
  }
}
