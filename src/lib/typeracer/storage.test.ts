import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  getCareerStats,
  recordRace,
  resetCareerStats,
  getRaceHistory,
  recordRaceHistory,
  getAcademyHistory,
  recordAcademyHistory,
  clearAllHistory,
  type RaceRecord,
  type AcademyHistoryRecord
} from './storage.ts';

// Mock localStorage for Node test runner
const memoryStore: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => memoryStore[k] || null,
  setItem: (k: string, v: string) => { memoryStore[k] = v; },
  removeItem: (k: string) => { delete memoryStore[k]; },
  clear: () => {
    for (const k of Object.keys(memoryStore)) delete memoryStore[k];
  }
};
(globalThis as any).window = {};

describe('Storage Persistence - Race and Academy History', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
  });

  test('records individual race history entries with separate passage and Q&A speeds', () => {
    const entry1 = recordRaceHistory({
      bookTitle: 'The Secret Garden',
      chapter: 'Chapter 5: The Cry in the Corridor',
      passageWpm: 75,
      qaWpm: 60,
      accuracy: 98,
      rank: 1,
      timeSeconds: 24,
      hasQA: true
    });

    assert(entry1.id.startsWith('race_'), 'Must have generated unique ID');
    assert(entry1.timestamp > 0, 'Must have recorded valid timestamp');
    assert.strictEqual(entry1.passageWpm, 75);
    assert.strictEqual(entry1.qaWpm, 60);

    const history = getRaceHistory();
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].passageWpm, 75);
    assert.strictEqual(history[0].qaWpm, 60);
  });

  test('records speed sprint race where Q&A is null without affecting passage speed', () => {
    recordRaceHistory({
      bookTitle: 'Treasure Island',
      chapter: 'Chapter 1: The Old Sea-dog at the Admiral Benbow',
      passageWpm: 88,
      qaWpm: null,
      accuracy: 99,
      rank: 1,
      timeSeconds: 19,
      hasQA: false
    });

    const history = getRaceHistory();
    assert.strictEqual(history[0].passageWpm, 88);
    assert.strictEqual(history[0].qaWpm, null);
  });

  test('records and retrieves typing academy history', () => {
    recordAcademyHistory({
      lessonId: 1,
      title: 'Home Row Anchors: F & J',
      level: 'Beginner',
      wpm: 32,
      accuracy: 96,
      stars: 3
    });

    const history = getAcademyHistory();
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].lessonId, 1);
    assert.strictEqual(history[0].stars, 3);
    assert.strictEqual(history[0].wpm, 32);
  });

  test('clearAllHistory wipes race and academy logs', () => {
    recordRaceHistory({
      bookTitle: 'Alice in Wonderland',
      chapter: 'Chapter 1',
      passageWpm: 70,
      qaWpm: 50,
      accuracy: 95,
      rank: 2,
      timeSeconds: 30,
      hasQA: true
    });
    recordAcademyHistory({
      lessonId: 2,
      title: 'Anchor Rhythm',
      level: 'Beginner',
      wpm: 35,
      accuracy: 92,
      stars: 2
    });

    assert.strictEqual(getRaceHistory().length, 1);
    assert.strictEqual(getAcademyHistory().length, 1);

    clearAllHistory();

    assert.strictEqual(getRaceHistory().length, 0);
    assert.strictEqual(getAcademyHistory().length, 0);
  });
});
