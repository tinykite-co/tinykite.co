/**
 * Configuration, constants, presets, and storage keys for Desktop Web Stopwatch,
 * Timer, Alarm, and World Clock.
 *
 * Strict TypeScript: no hardcoded magic numbers inline.
 */

export const STORAGE_KEYS = {
  PREFERENCES: 'tinykite_stopwatch_prefs_v1',
  SESSIONS: 'tinykite_stopwatch_sessions_v1',
  TIMERS: 'tinykite_stopwatch_timers_v1',
  ALARMS: 'tinykite_stopwatch_alarms_v1',
  PINNED_CITIES: 'tinykite_world_clock_pinned_v1',
} as const;

export const LAP_HIGHLIGHT_MIN_COUNT = 2;
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60_000;
export const MS_PER_HOUR = 3_600_000;
export const MS_PER_DAY = 86_400_000;

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const CENTISECONDS_PER_SECOND = 100;
export const MS_PER_CENTISECOND = 10;
export const DEGREES_PER_CIRCLE = 360;

export const ANALOG_SECONDS_PER_REV = 60;
export const ANALOG_SUBDIAL_MINUTES = 30;
export const MAX_SAVED_SESSIONS = 25;
export const DEFAULT_SNOOZE_MINUTES = 5;

export type SoundProfileId =
  | 'classic-beep'
  | 'crystal-chime'
  | 'arcade-victory'
  | 'zen-bell'
  | 'marimba';

export interface SoundTone {
  readonly frequency: number;
  readonly durationMs: number;
  readonly gain: number;
  readonly delayMs: number;
}

export interface SoundProfileConfig {
  readonly id: SoundProfileId;
  readonly label: string;
  readonly description: string;
  readonly frequencies: readonly number[];
  readonly waveform: OscillatorType;
  readonly tones: readonly SoundTone[];
}

export const SOUND_PROFILES: readonly SoundProfileConfig[] = [
  {
    id: 'classic-beep',
    label: 'Classic Beep',
    description: 'Crisp digital watch double beep',
    frequencies: [880, 1046],
    waveform: 'square',
    tones: [
      { frequency: 880, durationMs: 70, gain: 0.15, delayMs: 0 },
      { frequency: 1046, durationMs: 100, gain: 0.15, delayMs: 90 },
    ],
  },
  {
    id: 'crystal-chime',
    label: 'Crystal Chime',
    description: 'Bright harmonic triangle chime',
    frequencies: [523.25, 659.25, 783.99, 1046.5],
    waveform: 'triangle',
    tones: [
      { frequency: 523.25, durationMs: 140, gain: 0.2, delayMs: 0 },
      { frequency: 659.25, durationMs: 140, gain: 0.2, delayMs: 70 },
      { frequency: 783.99, durationMs: 140, gain: 0.2, delayMs: 140 },
      { frequency: 1046.5, durationMs: 300, gain: 0.25, delayMs: 210 },
    ],
  },
  {
    id: 'arcade-victory',
    label: 'Arcade Victory',
    description: 'Upbeat retro game fanfare',
    frequencies: [440, 554.37, 659.25, 880],
    waveform: 'sine',
    tones: [
      { frequency: 440, durationMs: 80, gain: 0.18, delayMs: 0 },
      { frequency: 554.37, durationMs: 80, gain: 0.18, delayMs: 80 },
      { frequency: 659.25, durationMs: 80, gain: 0.18, delayMs: 160 },
      { frequency: 880, durationMs: 250, gain: 0.22, delayMs: 240 },
    ],
  },
  {
    id: 'zen-bell',
    label: 'Zen Bell',
    description: 'Deep resonant meditation bell',
    frequencies: [432, 648],
    waveform: 'sine',
    tones: [
      { frequency: 432, durationMs: 400, gain: 0.25, delayMs: 0 },
      { frequency: 648, durationMs: 600, gain: 0.15, delayMs: 100 },
    ],
  },
  {
    id: 'marimba',
    label: 'Marimba',
    description: 'Warm wooden acoustic strike',
    frequencies: [392, 523.25, 659.25],
    waveform: 'sine',
    tones: [
      { frequency: 392, durationMs: 120, gain: 0.2, delayMs: 0 },
      { frequency: 523.25, durationMs: 120, gain: 0.2, delayMs: 80 },
      { frequency: 659.25, durationMs: 250, gain: 0.2, delayMs: 160 },
    ],
  },
] as const;

export interface TimerPreset {
  readonly id: string;
  readonly label: string;
  readonly category: string;
  readonly durationMs: number;
  readonly icon: string;
}

export const TIMER_PRESETS: readonly TimerPreset[] = [
  { id: '1m-sprint', label: '1m Sprint', category: 'Sprint', durationMs: 60_000, icon: 'bolt' },
  { id: '3m-stretch', label: '3m Stretch', category: 'Exercise', durationMs: 180_000, icon: 'heart' },
  { id: '5m-break', label: '5m Break', category: 'Rest', durationMs: 300_000, icon: 'coffee' },
  { id: '10m-reading', label: '10m Reading', category: 'School', durationMs: 600_000, icon: 'book' },
  { id: '15m-drill', label: '15m Drill', category: 'Practice', durationMs: 900_000, icon: 'target' },
  { id: '25m-focus', label: '25m Focus', category: 'Pomodoro', durationMs: 1_500_000, icon: 'flame' },
  { id: '45m-study', label: '45m Study', category: 'Study', durationMs: 2_700_000, icon: 'compass' },
  { id: '60m-deep-work', label: '60m Deep Work', category: 'Deep Work', durationMs: 3_600_000, icon: 'sparkles' },
] as const;

export interface WorldCityConfig {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly timeZone: string;
  readonly defaultPinned: boolean;
}

export const WORLD_CITIES: readonly WorldCityConfig[] = [
  { id: 'london', name: 'London', country: 'United Kingdom', timeZone: 'Europe/London', defaultPinned: true },
  { id: 'new-york', name: 'New York', country: 'United States', timeZone: 'America/New_York', defaultPinned: true },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo', defaultPinned: true },
  { id: 'bengaluru', name: 'Bengaluru', country: 'India', timeZone: 'Asia/Kolkata', defaultPinned: true },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timeZone: 'Australia/Sydney', defaultPinned: true },
  { id: 'san-francisco', name: 'San Francisco', country: 'United States', timeZone: 'America/Los_Angeles', defaultPinned: true },
  { id: 'paris', name: 'Paris', country: 'France', timeZone: 'Europe/Paris', defaultPinned: false },
  { id: 'berlin', name: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', defaultPinned: false },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timeZone: 'Asia/Singapore', defaultPinned: false },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', defaultPinned: false },
  { id: 'toronto', name: 'Toronto', country: 'Canada', timeZone: 'America/Toronto', defaultPinned: false },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', timeZone: 'Asia/Seoul', defaultPinned: false },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', timeZone: 'Europe/Zurich', defaultPinned: false },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', timeZone: 'America/Sao_Paulo', defaultPinned: false },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', timeZone: 'Africa/Cairo', defaultPinned: false },
  { id: 'utc', name: 'UTC', country: 'Universal Time', timeZone: 'UTC', defaultPinned: false },
] as const;

export const ALARM_PRESET_LABELS: readonly string[] = [
  'Morning Wake Up',
  'Start Homework',
  'Reading Time',
  'Music / Piano Practice',
  'Screen Time Over',
  'Dinner Time',
] as const;

export interface StopwatchPreferences {
  use24Hour: boolean;
  showMilliseconds: boolean;
  soundEnabled: boolean;
  targetPaceSeconds: number | null;
  activeSoundProfile: SoundProfileId;
}

export const DEFAULT_PREFERENCES: StopwatchPreferences = {
  use24Hour: false,
  showMilliseconds: true,
  soundEnabled: true,
  targetPaceSeconds: null,
  activeSoundProfile: 'crystal-chime',
};
