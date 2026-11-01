/**
 * Persistent Storage Manager for Stopwatch, Timer, Alarm, and World Clock.
 *
 * Uses localStorage with transparent fallback to in-memory storage when running in
 * Node.js (unit tests) or environments with restricted storage.
 * Strict TypeScript compliant with astro/tsconfigs/strictest.
 */

import {
  STORAGE_KEYS,
  MAX_SAVED_SESSIONS,
  WORLD_CITIES,
  DEFAULT_PREFERENCES,
  type StopwatchPreferences,
} from './config.ts';
import type { SavedStopwatchSession } from './stopwatch-engine.ts';
import type { AlarmItem } from './alarm-engine.ts';

export const DEFAULT_INITIAL_ALARMS: readonly AlarmItem[] = [
  {
    id: 'alarm_seed_morning',
    hour24: 7,
    minute: 30,
    label: 'Morning Wake Up',
    enabled: false,
    repeatDays: [1, 2, 3, 4, 5],
    soundProfile: 'crystal-chime',
    snoozeMinutes: 5,
    snoozedUntilMs: null,
    lastTriggeredMinuteKey: null,
  },
  {
    id: 'alarm_seed_homework',
    hour24: 16,
    minute: 30,
    label: 'Homework & Reading',
    enabled: false,
    repeatDays: [1, 2, 3, 4, 5],
    soundProfile: 'crystal-chime',
    snoozeMinutes: 5,
    snoozedUntilMs: null,
    lastTriggeredMinuteKey: null,
  },
] as const;

export const DEFAULT_PINNED_CITY_IDS: readonly string[] = WORLD_CITIES.filter(
  (c) => c.defaultPinned
).map((c) => c.id);

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export class MemoryStorage implements KeyValueStore {
  private map: Map<string, string> = new Map();

  public getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  public removeItem(key: string): void {
    this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
  }
}

export class StopwatchStorage {
  private store: KeyValueStore;

  public constructor(customStore?: KeyValueStore) {
    if (customStore) {
      this.store = customStore;
      return;
    }

    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        this.store = window.localStorage;
        return;
      } catch {
        // Fallback to memory store if localStorage is blocked by browser policy
      }
    }

    this.store = new MemoryStorage();
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const raw = this.store.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson<T>(key: string, value: T): void {
    try {
      this.store.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota or serialization error safely ignored
    }
  }

  // --- Preferences ---

  public getPreferences(): StopwatchPreferences {
    return this.readJson<StopwatchPreferences>(STORAGE_KEYS.PREFERENCES, {
      ...DEFAULT_PREFERENCES,
    });
  }

  public savePreferences(partial: Partial<StopwatchPreferences>): StopwatchPreferences {
    const current = this.getPreferences();
    const updated: StopwatchPreferences = {
      ...current,
      ...partial,
    };
    this.writeJson(STORAGE_KEYS.PREFERENCES, updated);
    return updated;
  }

  // --- Stopwatch Saved Sessions ---

  public getSessions(): SavedStopwatchSession[] {
    return this.readJson<SavedStopwatchSession[]>(STORAGE_KEYS.SESSIONS, []);
  }

  public saveSession(session: SavedStopwatchSession): SavedStopwatchSession[] {
    const existing = this.getSessions().filter((s) => s.id !== session.id);
    const updated = [session, ...existing].slice(0, MAX_SAVED_SESSIONS);
    this.writeJson(STORAGE_KEYS.SESSIONS, updated);
    return updated;
  }

  public deleteSession(sessionId: string): SavedStopwatchSession[] {
    const updated = this.getSessions().filter((s) => s.id !== sessionId);
    this.writeJson(STORAGE_KEYS.SESSIONS, updated);
    return updated;
  }

  public clearAllSessions(): void {
    this.store.removeItem(STORAGE_KEYS.SESSIONS);
  }

  // --- Alarms ---

  public getAlarms(): AlarmItem[] {
    const stored = this.store.getItem(STORAGE_KEYS.ALARMS);
    if (!stored) {
      // Seed initial kid-friendly alarms
      const initial = [...DEFAULT_INITIAL_ALARMS];
      this.writeJson(STORAGE_KEYS.ALARMS, initial);
      return initial;
    }
    return this.readJson<AlarmItem[]>(STORAGE_KEYS.ALARMS, [...DEFAULT_INITIAL_ALARMS]);
  }

  public saveAlarm(alarm: AlarmItem): AlarmItem[] {
    const current = this.getAlarms();
    const index = current.findIndex((a) => a.id === alarm.id);
    let updated: AlarmItem[];

    if (index >= 0) {
      updated = [...current];
      updated[index] = alarm;
    } else {
      updated = [...current, alarm];
    }

    this.writeJson(STORAGE_KEYS.ALARMS, updated);
    return updated;
  }

  public deleteAlarm(alarmId: string): AlarmItem[] {
    const updated = this.getAlarms().filter((a) => a.id !== alarmId);
    this.writeJson(STORAGE_KEYS.ALARMS, updated);
    return updated;
  }

  // --- Pinned World Clock Cities ---

  public getPinnedCityIds(): string[] {
    const stored = this.store.getItem(STORAGE_KEYS.PINNED_CITIES);
    if (!stored) {
      const initial = [...DEFAULT_PINNED_CITY_IDS];
      this.writeJson(STORAGE_KEYS.PINNED_CITIES, initial);
      return initial;
    }
    return this.readJson<string[]>(STORAGE_KEYS.PINNED_CITIES, [...DEFAULT_PINNED_CITY_IDS]);
  }

  public savePinnedCityIds(ids: readonly string[]): string[] {
    const unique = Array.from(new Set(ids));
    this.writeJson(STORAGE_KEYS.PINNED_CITIES, unique);
    return unique;
  }

  public togglePinnedCity(cityId: string): string[] {
    const current = this.getPinnedCityIds();
    const exists = current.includes(cityId);
    const updated = exists ? current.filter((id) => id !== cityId) : [...current, cityId];
    return this.savePinnedCityIds(updated);
  }
}
