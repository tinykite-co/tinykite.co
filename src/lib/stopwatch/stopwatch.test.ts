import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatDuration,
  computeAnalogAngles,
  evaluateLaps,
  StopwatchEngine,
} from './stopwatch-engine.ts';
import {
  parseHmsToMs,
  createTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  addTimeMs,
  tickTimer,
  computeProgressFraction,
  TimerEngine,
} from './timer-engine.ts';
import {
  formatAlarmTime,
  getMinuteKey,
  shouldAlarmTrigger,
  getNextAlarmMsFromNow,
  formatCountdownUntilAlarm,
  createAlarm,
  snoozeAlarm,
  dismissAlarm,
  toggleAlarm,
  formatRepeatDaysLabel,
  type DayOfWeek,
} from './alarm-engine.ts';
import {
  classifySolarPhase,
  getTimeZoneOffsetMs,
  getWorldClockReading,
} from './world-clock.ts';
import { StopwatchStorage } from './storage.ts';
import {
  WORLD_CITIES,
  TIMER_PRESETS,
  SOUND_PROFILES,
  STORAGE_KEYS,
  MAX_SAVED_SESSIONS,
} from './config.ts';

// ============================================================================
// 1. Config & Presets Integrity Tests
// ============================================================================
test('Stopwatch Config - Presets and constants integrity', () => {
  assert.strictEqual(TIMER_PRESETS.length >= 8, true);
  const sprint = TIMER_PRESETS.find((p) => p.id === '1m-sprint');
  assert.ok(sprint);
  assert.strictEqual(sprint.durationMs, 60_000);

  const focus = TIMER_PRESETS.find((p) => p.id === '25m-focus');
  assert.ok(focus);
  assert.strictEqual(focus.durationMs, 1_500_000);

  assert.strictEqual(SOUND_PROFILES.length, 5);
  assert.strictEqual(WORLD_CITIES.length >= 16, true);

  const pinned = WORLD_CITIES.filter((c) => c.defaultPinned);
  assert.strictEqual(pinned.length, 6);
  assert.strictEqual(pinned.some((c) => c.name === 'London'), true);
  assert.strictEqual(pinned.some((c) => c.name === 'New York'), true);
  assert.strictEqual(pinned.some((c) => c.name === 'Tokyo'), true);
  assert.strictEqual(pinned.some((c) => c.name === 'Bengaluru'), true);
  assert.strictEqual(pinned.some((c) => c.name === 'Sydney'), true);
  assert.strictEqual(pinned.some((c) => c.name === 'San Francisco'), true);

  assert.ok(STORAGE_KEYS.PREFERENCES);
  assert.ok(STORAGE_KEYS.SESSIONS);
  assert.ok(STORAGE_KEYS.TIMERS);
  assert.ok(STORAGE_KEYS.ALARMS);
  assert.ok(STORAGE_KEYS.PINNED_CITIES);
});

// ============================================================================
// 2. Stopwatch Engine - Duration Formatting
// ============================================================================
test('Stopwatch Engine - formatDuration handles zero and negative numbers', () => {
  const zero = formatDuration(0);
  assert.strictEqual(zero.hours, '00');
  assert.strictEqual(zero.minutes, '00');
  assert.strictEqual(zero.seconds, '00');
  assert.strictEqual(zero.centiseconds, '00');
  assert.strictEqual(zero.milliseconds, '000');
  assert.strictEqual(zero.compact, '00:00.00');
  assert.strictEqual(zero.fullWithMs, '00:00.000');

  const negative = formatDuration(-5000);
  assert.strictEqual(negative.compact, '00:00.00');
});

test('Stopwatch Engine - formatDuration handles sub-second values', () => {
  const sub = formatDuration(456);
  assert.strictEqual(sub.hours, '00');
  assert.strictEqual(sub.minutes, '00');
  assert.strictEqual(sub.seconds, '00');
  assert.strictEqual(sub.centiseconds, '45');
  assert.strictEqual(sub.milliseconds, '456');
  assert.strictEqual(sub.compact, '00:00.45');
  assert.strictEqual(sub.fullWithMs, '00:00.456');
});

test('Stopwatch Engine - formatDuration handles minutes and seconds under 1 hour', () => {
  // 125,450 ms = 2 minutes, 5 seconds, 45 centiseconds
  const dur = formatDuration(125_450);
  assert.strictEqual(dur.hours, '00');
  assert.strictEqual(dur.minutes, '02');
  assert.strictEqual(dur.seconds, '05');
  assert.strictEqual(dur.centiseconds, '45');
  assert.strictEqual(dur.compact, '02:05.45');
  assert.strictEqual(dur.fullWithMs, '02:05.450');
});

test('Stopwatch Engine - formatDuration handles multi-hour durations with compact hour prefix', () => {
  // 3,661,050 ms = 1 hour, 1 minute, 1 second, 50 ms
  const dur = formatDuration(3_661_050);
  assert.strictEqual(dur.hours, '01');
  assert.strictEqual(dur.minutes, '01');
  assert.strictEqual(dur.seconds, '01');
  assert.strictEqual(dur.centiseconds, '05');
  assert.strictEqual(dur.milliseconds, '050');
  assert.strictEqual(dur.compact, '01:01:01.05');
  assert.strictEqual(dur.fullWithMs, '01:01:01.050');
});

// ============================================================================
// 3. Stopwatch Engine - Analog Dial Angles
// ============================================================================
test('Stopwatch Engine - computeAnalogAngles calculates sweep angles correctly', () => {
  const zero = computeAnalogAngles(0, 0);
  assert.strictEqual(zero.secondDeg, 0);
  assert.strictEqual(zero.minuteDeg, 0);
  assert.strictEqual(zero.lapSecondDeg, 0);

  // 15 seconds (15,000 ms) should be exactly 90 degrees on 60s dial
  const quarterMin = computeAnalogAngles(15_000, 30_000);
  assert.strictEqual(quarterMin.secondDeg, 90);
  assert.strictEqual(quarterMin.lapSecondDeg, 180);

  // 15 minutes (900,000 ms) on a 30m subdial should be 180 degrees
  const halfSubdial = computeAnalogAngles(900_000, 0);
  assert.strictEqual(halfSubdial.minuteDeg, 180);
});

// ============================================================================
// 4. Stopwatch Engine - Lap Evaluation & Statistics
// ============================================================================
test('Stopwatch Engine - evaluateLaps handles empty lap list', () => {
  const res = evaluateLaps([]);
  assert.strictEqual(res.laps.length, 0);
  assert.strictEqual(res.stats.lapCount, 0);
  assert.strictEqual(res.stats.bestLapMs, null);
  assert.strictEqual(res.stats.worstLapMs, null);
  assert.strictEqual(res.stats.averageLapMs, null);
  assert.strictEqual(res.stats.consistencyScore, null);
});

test('Stopwatch Engine - evaluateLaps does not mark fastest/slowest with fewer than 2 laps', () => {
  const res = evaluateLaps([5000]);
  assert.strictEqual(res.laps.length, 1);
  const lap1 = res.laps[0];
  assert.ok(lap1);
  assert.strictEqual(lap1.status, 'normal');
  assert.strictEqual(lap1.lapNumber, 1);
  assert.strictEqual(lap1.totalSplitMs, 5000);
  assert.strictEqual(lap1.deltaFromAvgMs, 0);
  assert.strictEqual(res.stats.lapCount, 1);
  assert.strictEqual(res.stats.bestLapMs, 5000);
  assert.strictEqual(res.stats.worstLapMs, 5000);
});

test('Stopwatch Engine - evaluateLaps marks fastest and slowest laps accurately', () => {
  const durations = [10_000, 8_000, 12_000, 9_000];
  const res = evaluateLaps(durations);

  assert.strictEqual(res.laps.length, 4);

  const lap1 = res.laps[0];
  const lap2 = res.laps[1];
  const lap3 = res.laps[2];
  const lap4 = res.laps[3];

  assert.ok(lap1);
  assert.ok(lap2);
  assert.ok(lap3);
  assert.ok(lap4);

  assert.strictEqual(lap1.status, 'normal');
  assert.strictEqual(lap2.status, 'fastest'); // 8_000 ms is fastest
  assert.strictEqual(lap3.status, 'slowest'); // 12_000 ms is slowest
  assert.strictEqual(lap4.status, 'normal');

  assert.strictEqual(lap1.totalSplitMs, 10_000);
  assert.strictEqual(lap2.totalSplitMs, 18_000);
  assert.strictEqual(lap3.totalSplitMs, 30_000);
  assert.strictEqual(lap4.totalSplitMs, 39_000);

  // Average = (10000 + 8000 + 12000 + 9000) / 4 = 9750
  assert.strictEqual(res.stats.averageLapMs, 9750);
  assert.strictEqual(lap1.deltaFromAvgMs, 250);
  assert.strictEqual(lap2.deltaFromAvgMs, -1750);

  assert.strictEqual(res.stats.bestLapMs, 8_000);
  assert.strictEqual(res.stats.worstLapMs, 12_000);
  assert.ok(res.stats.consistencyScore !== null && res.stats.consistencyScore > 0);
});

test('Stopwatch Engine - evaluateLaps handles identical laps without false highlight', () => {
  const durations = [5000, 5000, 5000];
  const res = evaluateLaps(durations);

  assert.strictEqual(res.laps.length, 3);
  for (const lap of res.laps) {
    assert.strictEqual(lap.status, 'normal');
    assert.strictEqual(lap.deltaFromAvgMs, 0);
  }
  // Perfect consistency score
  assert.strictEqual(res.stats.consistencyScore, 100);
  assert.strictEqual(res.stats.stdDevMs, 0);
});

// ============================================================================
// 5. Stopwatch Engine - Lifecycle & State Transitions
// ============================================================================
test('Stopwatch Engine - Lifecycle (start, record lap, pause, resume, reset)', () => {
  const engine = new StopwatchEngine();
  assert.strictEqual(engine.getStatus(), 'idle');
  assert.strictEqual(engine.getTotalElapsedMs(1000), 0);

  // Start at t = 1000
  engine.start(1000);
  assert.strictEqual(engine.getStatus(), 'running');
  assert.strictEqual(engine.getTotalElapsedMs(2500), 1500);

  // Record lap at t = 3000 (lap 1 duration = 2000 ms)
  const lap1 = engine.recordLap(3000);
  assert.ok(lap1);
  assert.strictEqual(lap1.lapNumber, 1);
  assert.strictEqual(lap1.lapDurationMs, 2000);

  // Check current lap elapsed at t = 3500 (500 ms into lap 2)
  assert.strictEqual(engine.getCurrentLapElapsedMs(3500), 500);
  assert.strictEqual(engine.getTotalElapsedMs(3500), 2500);

  // Pause at t = 4000
  engine.pause(4000);
  assert.strictEqual(engine.getStatus(), 'paused');
  assert.strictEqual(engine.getTotalElapsedMs(4000), 3000);

  // While paused, elapsed does not increment
  assert.strictEqual(engine.getTotalElapsedMs(9000), 3000);
  assert.strictEqual(engine.getCurrentLapElapsedMs(9000), 1000);

  // Resume at t = 10000
  engine.start(10000);
  assert.strictEqual(engine.getStatus(), 'running');
  // At t = 12000, 2000 ms elapsed after resume => total 5000 ms
  assert.strictEqual(engine.getTotalElapsedMs(12000), 5000);

  // Record lap 2 at t = 12000 (duration = 3000 ms)
  const lap2 = engine.recordLap(12000);
  assert.ok(lap2);
  assert.strictEqual(lap2.lapNumber, 2);
  assert.strictEqual(lap2.lapDurationMs, 3000);

  // Snapshot verification
  const snapshot = engine.getSnapshot(12000);
  assert.strictEqual(snapshot.laps.length, 2);
  assert.strictEqual(snapshot.totalElapsedMs, 5000);
  assert.strictEqual(snapshot.formattedTotal.compact, '00:05.00');

  // Reset
  engine.reset();
  assert.strictEqual(engine.getStatus(), 'idle');
  assert.strictEqual(engine.getTotalElapsedMs(15000), 0);
  assert.strictEqual(engine.getRawLapDurations().length, 0);
});

test('Stopwatch Engine - Target pace tracking', () => {
  const engine = new StopwatchEngine();
  engine.setTargetPaceMs(30_000); // 30s target pace
  assert.strictEqual(engine.getTargetPaceMs(), 30_000);

  engine.start(0);
  const snap = engine.getSnapshot(35_000);
  assert.strictEqual(snap.targetPaceMs, 30_000);
  assert.strictEqual(snap.paceDeltaMs, 5_000); // 5s behind pace
});

// ============================================================================
// 6. Timer Engine Tests
// ============================================================================
test('Timer Engine - parseHmsToMs and computeProgressFraction', () => {
  const ms = parseHmsToMs(1, 30, 15);
  // (1 * 3600 + 30 * 60 + 15) * 1000 = (3600 + 1800 + 15) * 1000 = 5415 * 1000
  assert.strictEqual(ms, 5_415_000);

  assert.strictEqual(computeProgressFraction(1000, 2000), 0.5);
  assert.strictEqual(computeProgressFraction(0, 5000), 0);
  assert.strictEqual(computeProgressFraction(6000, 5000), 1); // clamped
  assert.strictEqual(computeProgressFraction(1000, 0), 0); // safe with 0 total
});

test('Timer Engine - Pure timer state machine transitions', () => {
  const t0 = createTimer('t1', 'Sprint', 60_000);
  assert.strictEqual(t0.status, 'idle');
  assert.strictEqual(t0.remainingMs, 60_000);

  // Start timer at t = 1000
  const t1 = startTimer(t0, 1000);
  assert.strictEqual(t1.status, 'running');
  assert.strictEqual(t1.endTargetMs, 61_000);

  // Tick 10 seconds forward at t = 11000
  const t2 = tickTimer(t1, 11_000);
  assert.strictEqual(t2.status, 'running');
  assert.strictEqual(t2.remainingMs, 50_000);

  // Pause at t = 15000 (delta = 4000 from lastTick 11000)
  const t3 = pauseTimer(t2, 15_000);
  assert.strictEqual(t3.status, 'paused');
  assert.strictEqual(t3.remainingMs, 46_000);

  // Add 14 seconds (14,000 ms) => remaining becomes 60,000 ms
  const t4 = addTimeMs(t3, 14_000, 15_000);
  assert.strictEqual(t4.remainingMs, 60_000);
  assert.strictEqual(t4.totalDurationMs, 74_000);

  // Resume and fast forward past remaining duration
  const t5 = startTimer(t4, 20_000);
  const t6 = tickTimer(t5, 80_000); // 60,000 ms passed
  assert.strictEqual(t6.status, 'completed');
  assert.strictEqual(t6.remainingMs, 0);

  // Reset restores full duration and idle state
  const t7 = resetTimer(t6);
  assert.strictEqual(t7.status, 'idle');
  assert.strictEqual(t7.remainingMs, 74_000);
});

test('Timer Engine - TimerEngine collection coordinator', () => {
  const manager = new TimerEngine();
  manager.addTimer('work', 'Focus', 25 * 60_000);
  manager.addTimer('break', 'Short Break', 5 * 60_000);

  assert.strictEqual(manager.getAllTimers().length, 2);

  manager.startTimer('work', 1000);
  const workTimer = manager.getTimer('work');
  assert.ok(workTimer);
  assert.strictEqual(workTimer.status, 'running');

  // Tick 1 minute forward
  const tickRes = manager.tickAll(61_000);
  assert.strictEqual(tickRes.updated.length, 1);
  const updatedWork = tickRes.updated[0];
  assert.ok(updatedWork);
  assert.strictEqual(updatedWork.remainingMs, 24 * 60_000);
  assert.strictEqual(tickRes.justCompletedIds.length, 0);

  manager.removeTimer('break');
  assert.strictEqual(manager.getAllTimers().length, 1);
});

// ============================================================================
// 7. Alarm Engine Tests
// ============================================================================
test('Alarm Engine - formatAlarmTime 12-hour and 24-hour', () => {
  const morning = formatAlarmTime(7, 30, false);
  assert.strictEqual(morning.timeText, '07:30');
  assert.strictEqual(morning.period, 'AM');

  const evening = formatAlarmTime(16, 5, false);
  assert.strictEqual(evening.timeText, '04:05');
  assert.strictEqual(evening.period, 'PM');

  const midnight = formatAlarmTime(0, 0, false);
  assert.strictEqual(midnight.timeText, '12:00');
  assert.strictEqual(midnight.period, 'AM');

  const noon24 = formatAlarmTime(13, 45, true);
  assert.strictEqual(noon24.timeText, '13:45');
  assert.strictEqual(noon24.period, '');
});

test('Alarm Engine - getMinuteKey provides stable local minute identifier', () => {
  const d = new Date(2026, 10, 1, 8, 15, 30);
  const key = getMinuteKey(d);
  assert.strictEqual(key, '2026-11-01T08:15');
});

test('Alarm Engine - shouldAlarmTrigger evaluates enabled, repeat days, and duplicate prevention', () => {
  const alarm = createAlarm({
    id: 'a1',
    hour24: 8,
    minute: 0,
    label: 'School',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5], // Monday through Friday
  });

  // Monday 08:00 (DayOfWeek = 1) -> matches
  const mondayMatch = new Date(2026, 10, 2, 8, 0, 10); // Nov 2, 2026 is Monday
  assert.strictEqual(mondayMatch.getDay(), 1);
  assert.strictEqual(shouldAlarmTrigger(alarm, mondayMatch), true);

  // Sunday 08:00 (DayOfWeek = 0) -> does not match repeat days
  const sundayNoMatch = new Date(2026, 10, 1, 8, 0, 10); // Nov 1, 2026 is Sunday
  assert.strictEqual(sundayNoMatch.getDay(), 0);
  assert.strictEqual(shouldAlarmTrigger(alarm, sundayNoMatch), false);

  // Same Monday at 08:01 -> minute mismatch
  const minuteMismatch = new Date(2026, 10, 2, 8, 1, 0);
  assert.strictEqual(shouldAlarmTrigger(alarm, minuteMismatch), false);

  // If already triggered in this minute, should NOT re-trigger
  const dismissed = dismissAlarm(alarm, mondayMatch);
  assert.strictEqual(dismissed.lastTriggeredMinuteKey, getMinuteKey(mondayMatch));
  assert.strictEqual(shouldAlarmTrigger(dismissed, mondayMatch), false);

  // If disabled, should NOT trigger
  const disabled = toggleAlarm(alarm, false);
  assert.strictEqual(shouldAlarmTrigger(disabled, mondayMatch), false);
});

test('Alarm Engine - Snooze trigger behavior', () => {
  const alarm = createAlarm({
    id: 'a2',
    hour24: 7,
    minute: 0,
    label: 'Wake',
    enabled: true,
  });

  const now = new Date(2026, 10, 1, 7, 0, 0);
  // Snooze for 5 minutes
  const snoozed = snoozeAlarm(alarm, now.getTime(), 5);
  assert.ok(snoozed.snoozedUntilMs);
  assert.strictEqual(snoozed.snoozedUntilMs, now.getTime() + 5 * 60_000);

  // 2 minutes later: still snoozed, does not trigger
  const intermediate = new Date(now.getTime() + 2 * 60_000);
  assert.strictEqual(shouldAlarmTrigger(snoozed, intermediate), false);

  // 5 minutes later: snooze time reached -> triggers!
  const wakeAgain = new Date(now.getTime() + 5 * 60_000);
  assert.strictEqual(shouldAlarmTrigger(snoozed, wakeAgain), true);
});

test('Alarm Engine - getNextAlarmMsFromNow and formatCountdownUntilAlarm', () => {
  const now = new Date(2026, 10, 1, 10, 0, 0); // 10:00 AM

  // Alarm set for 12:30 PM today (2h 30m away)
  const alarmToday = createAlarm({
    id: 'lunch',
    hour24: 12,
    minute: 30,
    label: 'Lunch',
    enabled: true,
  });

  const msUntil = getNextAlarmMsFromNow(alarmToday, now);
  assert.ok(msUntil);
  assert.strictEqual(msUntil, (2 * 60 + 30) * 60_000);

  const countdown = formatCountdownUntilAlarm(msUntil);
  assert.strictEqual(countdown, 'in 2h 30m');

  // Alarm set for 09:00 AM (already passed today => triggers tomorrow in 23h)
  const alarmPast = createAlarm({
    id: 'past',
    hour24: 9,
    minute: 0,
    label: 'Morning',
    enabled: true,
  });

  const msTomorrow = getNextAlarmMsFromNow(alarmPast, now);
  assert.ok(msTomorrow);
  assert.strictEqual(msTomorrow, 23 * 60 * 60_000);
  assert.strictEqual(formatCountdownUntilAlarm(msTomorrow), 'in 23h');

  // Sub-minute countdown
  assert.strictEqual(formatCountdownUntilAlarm(45_000), 'in < 1m');
});

test('Alarm Engine - formatRepeatDaysLabel', () => {
  assert.strictEqual(formatRepeatDaysLabel([]), 'Once');
  assert.strictEqual(formatRepeatDaysLabel([0, 1, 2, 3, 4, 5, 6]), 'Every day');
  assert.strictEqual(formatRepeatDaysLabel([1, 2, 3, 4, 5]), 'Weekdays');
  assert.strictEqual(formatRepeatDaysLabel([0, 6]), 'Weekends');
  assert.strictEqual(formatRepeatDaysLabel([1, 3, 5] as DayOfWeek[]), 'Mon, Wed, Fri');
});

// ============================================================================
// 8. World Clock Tests
// ============================================================================
test('World Clock - classifySolarPhase boundaries', () => {
  assert.strictEqual(classifySolarPhase(5), 'dawn');
  assert.strictEqual(classifySolarPhase(6), 'dawn');
  assert.strictEqual(classifySolarPhase(7), 'day');
  assert.strictEqual(classifySolarPhase(12), 'day');
  assert.strictEqual(classifySolarPhase(17), 'day');
  assert.strictEqual(classifySolarPhase(18), 'dusk');
  assert.strictEqual(classifySolarPhase(19), 'dusk');
  assert.strictEqual(classifySolarPhase(20), 'night');
  assert.strictEqual(classifySolarPhase(23), 'night');
  assert.strictEqual(classifySolarPhase(0), 'night');
  assert.strictEqual(classifySolarPhase(4), 'night');
});

test('World Clock - getTimeZoneOffsetMs calculates accurate UTC offsets', () => {
  const utcDate = new Date(Date.UTC(2026, 10, 1, 12, 0, 0));

  const utcOffset = getTimeZoneOffsetMs('UTC', utcDate);
  assert.strictEqual(utcOffset, 0);

  const tokyoOffset = getTimeZoneOffsetMs('Asia/Tokyo', utcDate);
  // Tokyo is UTC+9 (+32,400,000 ms)
  assert.strictEqual(tokyoOffset, 9 * 3600 * 1000);

  const kolkataOffset = getTimeZoneOffsetMs('Asia/Kolkata', utcDate);
  // India is UTC+5:30 (+19,800,000 ms)
  assert.strictEqual(kolkataOffset, 5.5 * 3600 * 1000);
});

test('World Clock - getWorldClockReading generates comprehensive reading', () => {
  const tokyo = WORLD_CITIES.find((c) => c.id === 'tokyo');
  assert.ok(tokyo);

  const testInstant = new Date(Date.UTC(2026, 10, 1, 12, 0, 0)); // 12:00 UTC
  // In Tokyo (UTC+9), local time is 21:00 (9:00 PM)
  const reading = getWorldClockReading(tokyo, testInstant, 'UTC', false);

  assert.strictEqual(reading.cityId, 'tokyo');
  assert.strictEqual(reading.cityName, 'Tokyo');
  assert.strictEqual(reading.country, 'Japan');
  assert.strictEqual(reading.hour24, 21);
  assert.strictEqual(reading.formattedTime, '09:00');
  assert.strictEqual(reading.period, 'PM');
  assert.strictEqual(reading.solarPhase, 'night');
  assert.strictEqual(reading.offsetHoursLabel, '+9 HRS');
  assert.strictEqual(reading.relativeDayLabel, 'Today');
});

// ============================================================================
// 9. Storage Persistence Tests (Node fallback & quota capping)
// ============================================================================
test('Storage - Preferences saving and loading with defaults', () => {
  const storage = new StopwatchStorage();
  const initial = storage.getPreferences();
  assert.strictEqual(initial.soundEnabled, true);
  assert.strictEqual(initial.showMilliseconds, true);

  storage.savePreferences({ showMilliseconds: false, use24Hour: true });
  const updated = storage.getPreferences();
  assert.strictEqual(updated.showMilliseconds, false);
  assert.strictEqual(updated.use24Hour, true);
  assert.strictEqual(updated.soundEnabled, true); // preserved
});

test('Storage - Alarms seeded with kid-friendly defaults and supports CRUD', () => {
  const storage = new StopwatchStorage();
  const alarms = storage.getAlarms();
  assert.strictEqual(alarms.length, 2);

  const morningAlarm = alarms[0];
  assert.ok(morningAlarm);
  assert.strictEqual(morningAlarm.label, 'Morning Wake Up');
  assert.strictEqual(morningAlarm.hour24, 7);
  assert.strictEqual(morningAlarm.minute, 30);
  assert.strictEqual(morningAlarm.enabled, false);

  // Add custom alarm
  const custom = createAlarm({
    id: 'piano',
    hour24: 17,
    minute: 0,
    label: 'Piano Practice',
  });
  storage.saveAlarm(custom);

  const afterAdd = storage.getAlarms();
  assert.strictEqual(afterAdd.length, 3);
  assert.strictEqual(afterAdd.some((a) => a.id === 'piano'), true);

  // Delete alarm
  storage.deleteAlarm('piano');
  assert.strictEqual(storage.getAlarms().length, 2);
});

test('Storage - Session saving respects MAX_SAVED_SESSIONS cap', () => {
  const storage = new StopwatchStorage();
  storage.clearAllSessions();
  assert.strictEqual(storage.getSessions().length, 0);

  // Add 30 sessions (exceeding MAX_SAVED_SESSIONS = 25)
  for (let i = 1; i <= 30; i++) {
    storage.saveSession({
      id: `s_${i}`,
      title: `Session ${i}`,
      createdAtIso: new Date(1000 * i).toISOString(),
      totalElapsedMs: 1000 * i,
      laps: [],
      stats: {
        lapCount: 0,
        bestLapMs: null,
        worstLapMs: null,
        averageLapMs: null,
        consistencyScore: null,
        stdDevMs: null,
      },
    });
  }

  const sessions = storage.getSessions();
  assert.strictEqual(sessions.length, MAX_SAVED_SESSIONS);
  // Newest session (30) should be first
  const firstSession = sessions[0];
  assert.ok(firstSession);
  assert.strictEqual(firstSession.id, 's_30');

  // Deleting one session
  storage.deleteSession('s_30');
  assert.strictEqual(storage.getSessions().length, MAX_SAVED_SESSIONS - 1);
});

test('Storage - Pinned cities toggle and retrieval', () => {
  const storage = new StopwatchStorage();
  const pinned = storage.getPinnedCityIds();
  assert.strictEqual(pinned.length, 6);
  assert.strictEqual(pinned.includes('paris'), false);

  // Toggle Paris on
  const withParis = storage.togglePinnedCity('paris');
  assert.strictEqual(withParis.includes('paris'), true);
  assert.strictEqual(storage.getPinnedCityIds().includes('paris'), true);

  // Toggle Paris off
  const withoutParis = storage.togglePinnedCity('paris');
  assert.strictEqual(withoutParis.includes('paris'), false);
});
