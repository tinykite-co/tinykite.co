/**
 * Core Alarm Domain Engine.
 *
 * Handles alarm scheduling, snooze state, repeat day calculation, single-trigger
 * per-minute guarantee, and countdown calculations.
 * Strict TypeScript compliant with astro/tsconfigs/strictest.
 */

import {
  MS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  DEFAULT_SNOOZE_MINUTES,
  type SoundProfileId,
} from './config.ts';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: readonly string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAY_SHORT_NAMES: readonly string[] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

export interface AlarmItem {
  readonly id: string;
  readonly hour24: number;
  readonly minute: number;
  readonly label: string;
  readonly enabled: boolean;
  readonly repeatDays: readonly DayOfWeek[];
  readonly soundProfile: SoundProfileId;
  readonly snoozeMinutes: number;
  readonly snoozedUntilMs: number | null;
  readonly lastTriggeredMinuteKey: string | null;
}

/**
 * Formats hour and minute into display strings with AM/PM period.
 */
export function formatAlarmTime(
  hour24: number,
  minute: number,
  use24Hour: boolean = false
): { timeText: string; period: string } {
  const safeHour = Math.max(0, Math.min(23, Math.floor(hour24)));
  const safeMinute = Math.max(0, Math.min(59, Math.floor(minute)));
  const minutePadded = String(safeMinute).padStart(2, '0');

  if (use24Hour) {
    return {
      timeText: `${String(safeHour).padStart(2, '0')}:${minutePadded}`,
      period: '',
    };
  }

  const period = safeHour >= 12 ? 'PM' : 'AM';
  const hour12 = safeHour % 12 === 0 ? 12 : safeHour % 12;

  return {
    timeText: `${String(hour12).padStart(2, '0')}:${minutePadded}`,
    period,
  };
}

/**
 * Returns a stable minute key in local time (YYYY-MM-DDTHH:MM) to prevent
 * duplicate triggers within the same calendar minute.
 */
export function getMinuteKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

/**
 * Determines whether an alarm should trigger at the given moment.
 */
export function shouldAlarmTrigger(alarm: AlarmItem, now: Date): boolean {
  if (!alarm.enabled) {
    return false;
  }

  const currentMinuteKey = getMinuteKey(now);
  if (alarm.lastTriggeredMinuteKey === currentMinuteKey) {
    return false;
  }

  // 1. Snoozed alarms trigger as soon as snooze timestamp is reached
  if (alarm.snoozedUntilMs !== null) {
    return now.getTime() >= alarm.snoozedUntilMs;
  }

  // 2. Regular schedule check
  if (now.getHours() !== alarm.hour24 || now.getMinutes() !== alarm.minute) {
    return false;
  }

  // Empty repeatDays represents a one-time alarm that triggers on the next match
  if (alarm.repeatDays.length === 0) {
    return true;
  }

  const currentDay = now.getDay() as DayOfWeek;
  return alarm.repeatDays.includes(currentDay);
}

/**
 * Calculates exact milliseconds from now until the next occurrence of this alarm.
 * Returns null if the alarm is disabled.
 */
export function getNextAlarmMsFromNow(alarm: AlarmItem, now: Date): number | null {
  if (!alarm.enabled) {
    return null;
  }

  const nowMs = now.getTime();

  // If snoozed into the future, the next occurrence is the snooze target
  if (alarm.snoozedUntilMs !== null && alarm.snoozedUntilMs > nowMs) {
    return alarm.snoozedUntilMs - nowMs;
  }

  // One-time alarm
  if (alarm.repeatDays.length === 0) {
    const todayCandidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      alarm.hour24,
      alarm.minute,
      0,
      0
    );

    if (todayCandidate.getTime() > nowMs) {
      return todayCandidate.getTime() - nowMs;
    }

    const tomorrowCandidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      alarm.hour24,
      alarm.minute,
      0,
      0
    );

    return tomorrowCandidate.getTime() - nowMs;
  }

  // Repeating alarm: check up to 7 days ahead
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
      alarm.hour24,
      alarm.minute,
      0,
      0
    );

    const dayOfWeek = candidate.getDay() as DayOfWeek;
    if (alarm.repeatDays.includes(dayOfWeek) && candidate.getTime() > nowMs) {
      return candidate.getTime() - nowMs;
    }
  }

  return null;
}

/**
 * Formats milliseconds until the next alarm into a human-friendly label.
 * (e.g. "in 2h 14m", "in 45m", "in < 1m").
 */
export function formatCountdownUntilAlarm(msUntil: number): string {
  if (msUntil < MS_PER_MINUTE) {
    return 'in < 1m';
  }

  const totalMinutes = Math.floor(msUntil / MS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const days = Math.floor(hours / HOURS_PER_DAY);

  if (days > 0) {
    const remHours = hours % HOURS_PER_DAY;
    return remHours > 0 ? `in ${days}d ${remHours}h` : `in ${days}d`;
  }

  if (hours > 0) {
    return minutes > 0 ? `in ${hours}h ${minutes}m` : `in ${hours}h`;
  }

  return `in ${minutes}m`;
}

/**
 * Creates a new alarm item with defaults.
 */
export function createAlarm(params: {
  id: string;
  hour24: number;
  minute: number;
  label: string;
  enabled?: boolean;
  repeatDays?: readonly DayOfWeek[];
  soundProfile?: SoundProfileId;
  snoozeMinutes?: number;
}): AlarmItem {
  return {
    id: params.id,
    hour24: Math.max(0, Math.min(23, Math.floor(params.hour24))),
    minute: Math.max(0, Math.min(59, Math.floor(params.minute))),
    label: params.label.trim() || 'Alarm',
    enabled: params.enabled ?? true,
    repeatDays: params.repeatDays ?? [],
    soundProfile: params.soundProfile ?? 'crystal-chime',
    snoozeMinutes: params.snoozeMinutes ?? DEFAULT_SNOOZE_MINUTES,
    snoozedUntilMs: null,
    lastTriggeredMinuteKey: null,
  };
}

/**
 * Puts an alarm into snooze mode.
 */
export function snoozeAlarm(
  alarm: AlarmItem,
  nowMs: number = Date.now(),
  snoozeMinutes?: number
): AlarmItem {
  const minutes = snoozeMinutes ?? alarm.snoozeMinutes ?? DEFAULT_SNOOZE_MINUTES;
  const snoozedUntilMs = nowMs + minutes * MS_PER_MINUTE;

  return {
    ...alarm,
    snoozedUntilMs,
    lastTriggeredMinuteKey: null,
  };
}

/**
 * Dismisses an alarm that has triggered or is snoozed.
 * For one-time alarms, automatically disables the alarm.
 */
export function dismissAlarm(alarm: AlarmItem, now: Date = new Date()): AlarmItem {
  const isOneTime = alarm.repeatDays.length === 0;

  return {
    ...alarm,
    enabled: isOneTime ? false : alarm.enabled,
    snoozedUntilMs: null,
    lastTriggeredMinuteKey: getMinuteKey(now),
  };
}

/**
 * Toggles an alarm on or off, resetting snooze if toggled off.
 */
export function toggleAlarm(alarm: AlarmItem, forceEnabled?: boolean): AlarmItem {
  const nextEnabled = forceEnabled !== undefined ? forceEnabled : !alarm.enabled;

  return {
    ...alarm,
    enabled: nextEnabled,
    snoozedUntilMs: nextEnabled ? alarm.snoozedUntilMs : null,
    lastTriggeredMinuteKey: nextEnabled ? alarm.lastTriggeredMinuteKey : null,
  };
}

/**
 * Formats repeat days into a compact label (e.g. "Every day", "Weekdays", "Weekends", "Mon, Wed").
 */
export function formatRepeatDaysLabel(repeatDays: readonly DayOfWeek[]): string {
  if (repeatDays.length === 0) {
    return 'Once';
  }
  if (repeatDays.length === 7) {
    return 'Every day';
  }

  const isWeekdays =
    repeatDays.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => repeatDays.includes(d as DayOfWeek));
  if (isWeekdays) {
    return 'Weekdays';
  }

  const isWeekends =
    repeatDays.length === 2 &&
    repeatDays.includes(0) &&
    repeatDays.includes(6);
  if (isWeekends) {
    return 'Weekends';
  }

  const sorted = [...repeatDays].sort((a, b) => a - b);
  return sorted.map((d) => DAY_SHORT_NAMES[d] ?? '').join(', ');
}
