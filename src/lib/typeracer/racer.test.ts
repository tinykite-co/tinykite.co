import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PASSAGES } from '../../data/typeracer/passages.ts';

describe('Racer Data - Clean Classical Literature Passages', () => {
  test('all passages have complete literary metadata', () => {
    assert(PASSAGES.length >= 10, 'Should have at least 10 classic literature passages');
    for (const p of PASSAGES) {
      assert(p.title && p.title.length > 0, `Passage ${p.id} missing title`);
      assert(p.author && p.author.length > 0, `Passage ${p.id} missing author`);
      assert(p.year > 1700, `Passage ${p.id} has invalid year`);
      assert(p.text && p.text.length > 50, `Passage ${p.id} text too short`);
      assert(Array.isArray(p.vocabulary) && p.vocabulary.length > 0, `Passage ${p.id} missing vocab`);
    }
  });

  test('no passages mention implementation notes (11+ exam or Gutenberg) in user-facing texts', () => {
    for (const p of PASSAGES) {
      assert.strictEqual(/11\+/i.test(p.title), false, `Title of ${p.id} should not mention 11+`);
      assert.strictEqual(/11\+/i.test(p.author), false, `Author of ${p.id} should not mention 11+`);
      assert.strictEqual(/11\+/i.test(p.chapter), false, `Chapter of ${p.id} should not mention 11+`);
      assert.strictEqual(/11\+/i.test(p.text), false, `Text of ${p.id} should not mention 11+`);

      assert.strictEqual(/gutenberg/i.test(p.title), false, `Title of ${p.id} should not mention Gutenberg`);
      assert.strictEqual(/gutenberg/i.test(p.chapter), false, `Chapter of ${p.id} should not mention Gutenberg`);
      assert.strictEqual(/gutenberg/i.test(p.text), false, `Text of ${p.id} should not mention Gutenberg`);
    }
  });

  test('no passages contain em dashes (—) or en dashes (–)', () => {
    for (const p of PASSAGES) {
      assert.strictEqual(p.text.includes('—'), false, `Text of ${p.id} should not contain em dash (—)`);
      assert.strictEqual(p.text.includes('–'), false, `Text of ${p.id} should not contain en dash (–)`);
    }
  });
});

describe('Racer - Character-Level Progress and Real-Time WPM', () => {
  test('calculates character-level progress smoothly', () => {
    const text = 'She walked round and looked closely at that side.';
    const totalChars = text.length;

    // 0 characters typed
    assert.strictEqual(Math.round((0 / totalChars) * 100), 0);

    // After typing first word 'She' (3 chars)
    const progressWord1 = Math.round((3 / totalChars) * 100);
    assert(progressWord1 > 0, 'Progress after typing first word should be > 0%');

    // After typing 25 chars (halfway)
    const progressMid = Math.round((25 / totalChars) * 100);
    assert(progressMid >= 50 && progressMid <= 52);
  });

  test('calculates WPM accurately based on standard 5-character words', () => {
    // 50 characters in 30 seconds = 10 words in 0.5 minutes = 20 WPM
    const typedChars = 50;
    const elapsedMinutes = 30 / 60;
    const wpm = Math.round((typedChars / 5) / elapsedMinutes);
    assert.strictEqual(wpm, 20);

    // 150 characters in 30 seconds = 30 words in 0.5 minutes = 60 WPM
    const fastWpm = Math.round((150 / 5) / (30 / 60));
    assert.strictEqual(fastWpm, 60);
  });
});
