import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getFingerForKey, FINGER_ZONES } from './fingers.ts';
import { CURRICULUM } from './curriculum.ts';
import {
  createAcademySession,
  processAcademyKeystroke,
  calculateAccuracy,
  calculateWpm,
  calculateStars
} from './academy-engine.ts';
import { getCountdownStep } from './countdown.ts';

describe('Typing Academy - Finger Mapping', () => {
  test('maps home row keys to accurate hands and fingers', () => {
    const f = getFingerForKey('f');
    assert.strictEqual(f.hand, 'left');
    assert.strictEqual(f.finger, 'index');
    assert.strictEqual(f.name, 'Left Index');

    const j = getFingerForKey('j');
    assert.strictEqual(j.hand, 'right');
    assert.strictEqual(j.finger, 'index');
    assert.strictEqual(j.name, 'Right Index');

    const d = getFingerForKey('d');
    assert.strictEqual(d.finger, 'middle');
    assert.strictEqual(d.hand, 'left');

    const k = getFingerForKey('k');
    assert.strictEqual(k.finger, 'middle');
    assert.strictEqual(k.hand, 'right');

    const s = getFingerForKey('s');
    assert.strictEqual(s.finger, 'ring');
    assert.strictEqual(s.hand, 'left');

    const l = getFingerForKey('l');
    assert.strictEqual(l.finger, 'ring');
    assert.strictEqual(l.hand, 'right');

    const a = getFingerForKey('a');
    assert.strictEqual(a.finger, 'pinky');
    assert.strictEqual(a.hand, 'left');

    const semi = getFingerForKey(';');
    assert.strictEqual(semi.finger, 'pinky');
    assert.strictEqual(semi.hand, 'right');
  });

  test('maps spacebar to thumb', () => {
    const space = getFingerForKey(' ');
    assert.strictEqual(space.hand, 'thumb');
    assert.strictEqual(space.finger, 'thumb');
  });

  test('maps uppercase and shifted symbols to appropriate fingers', () => {
    const F = getFingerForKey('F');
    assert.strictEqual(F.finger, 'index');
    assert.strictEqual(F.hand, 'left');

    const exclam = getFingerForKey('!');
    assert.strictEqual(exclam.finger, 'pinky');
    assert.strictEqual(exclam.hand, 'left');
  });
});

describe('Typing Academy - Curriculum Integrity', () => {
  test('Lesson 1 focuses purely on F and J without spaces', () => {
    const lesson1 = CURRICULUM[0];
    assert.strictEqual(lesson1.id, 1);
    assert.strictEqual(lesson1.drillText.includes(' '), false, 'Lesson 1 must NOT contain any spaces');
    for (const char of lesson1.drillText) {
      assert(char === 'f' || char === 'j', `Lesson 1 should only contain 'f' or 'j', found: ${char}`);
    }
  });

  test('Lesson 2 introduces the spacebar', () => {
    const lesson2 = CURRICULUM[1];
    assert.strictEqual(lesson2.id, 2);
    assert.strictEqual(lesson2.drillText.includes(' '), true, 'Lesson 2 must introduce spaces');
  });

  test('No lesson titles or tips contain implementation mentions of 11+ or Gutenberg', () => {
    for (const lesson of CURRICULUM) {
      assert.strictEqual(/11\+/i.test(lesson.title), false, `Lesson ${lesson.id} title should not mention 11+`);
      assert.strictEqual(/11\+/i.test(lesson.tip), false, `Lesson ${lesson.id} tip should not mention 11+`);
      assert.strictEqual(/gutenberg/i.test(lesson.title), false, `Lesson ${lesson.id} title should not mention Gutenberg`);
      assert.strictEqual(/gutenberg/i.test(lesson.tip), false, `Lesson ${lesson.id} tip should not mention Gutenberg`);
    }
  });
});

describe('Typing Academy - Lockout Typing Behavior', () => {
  test('wrong key prevents advancement without requiring backspace', () => {
    const state = createAcademySession(1, 'fj');
    assert.strictEqual(state.currentIndex, 0);

    // Press wrong key 'k' when 'f' is expected
    const resultWrong = processAcademyKeystroke(state, 'k');
    assert.strictEqual(resultWrong.success, false);
    assert.strictEqual(resultWrong.advanced, false);
    assert.strictEqual(resultWrong.shake, true);
    assert.strictEqual(state.currentIndex, 0, 'Current index must remain at 0 on error');
    assert.strictEqual(state.errorCount, 1);
    assert.strictEqual(resultWrong.accuracy, 0); // 0 correct out of 1

    // User simply presses the right key 'f' to advance
    const resultRight = processAcademyKeystroke(state, 'f');
    assert.strictEqual(resultRight.success, true);
    assert.strictEqual(resultRight.advanced, true);
    assert.strictEqual(resultRight.shake, false);
    assert.strictEqual(state.currentIndex, 1, 'Current index must advance to 1 on correct key');
    assert.strictEqual(resultRight.accuracy, 50); // 1 correct out of 2 strokes
  });

  test('completing a lesson sets completion flag and calculates stars', () => {
    const state = createAcademySession(1, 'fj');
    processAcademyKeystroke(state, 'f');
    const finalResult = processAcademyKeystroke(state, 'j');

    assert.strictEqual(finalResult.isComplete, true);
    assert.strictEqual(state.isComplete, true);
    assert.strictEqual(calculateAccuracy(state), 100);
    assert.strictEqual(calculateStars(100), 3);
    assert.strictEqual(calculateStars(90), 2);
    assert.strictEqual(calculateStars(75), 1);
  });
});

describe('Racer - Get Set GO! Countdown State Machine', () => {
  test('counts down through READY, SET, GO! with input lock', () => {
    const readyState = getCountdownStep(3);
    assert.strictEqual(readyState.phase, 'ready');
    assert.strictEqual(readyState.label, 'READY');
    assert.strictEqual(readyState.isInputEnabled, false);

    const setState = getCountdownStep(2);
    assert.strictEqual(setState.phase, 'set');
    assert.strictEqual(setState.label, 'SET');
    assert.strictEqual(setState.isInputEnabled, false);

    const goState = getCountdownStep(0.5);
    assert.strictEqual(goState.phase, 'go');
    assert.strictEqual(goState.label, 'GO!');
    assert.strictEqual(goState.isInputEnabled, true);

    const racingState = getCountdownStep(0);
    assert.strictEqual(racingState.phase, 'racing');
    assert.strictEqual(racingState.isInputEnabled, true);
  });
});
