import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoStages, nextDemoStage } from './demo-model.ts';
test('walkthrough returns to reading after lookup and practice', () => {
  assert.deepEqual(demoStages.map(stage => stage.id), ['reading','searching','meaning','saved','practice','answer','understood']);
  let index = 0;
  for (let step = 0; step < demoStages.length; step++) index = nextDemoStage(index);
  assert.equal(index, 0);
  assert.ok(demoStages.every(stage => stage.duration >= 2000 && stage.label.length > 0));
});
test('invalid and final indices restart predictably', () => {
  for (const index of [-1, NaN, Infinity, 0.5, 999, demoStages.length - 1]) assert.equal(nextDemoStage(index), 0);
});

import { createDemoPlayback, isDemoRunning, updateDemoPlayback } from './demo-model.ts';

test('manual search, practice and answer reveal static frames without starting a timer', () => {
  let state = createDemoPlayback(false, true);
  state = updateDemoPlayback(state, { type: 'visibility', value: true }, 0);
  for (const index of [1, 4, 5]) {
    state = updateDemoPlayback(state, { type: 'select', index }, 100);
    assert.equal(state.index, index);
    assert.equal(state.manual, true);
    assert.equal(state.paused, true);
    assert.equal(state.startedAt, null);
    assert.equal(isDemoRunning(state), false);
    assert.equal(state.remaining, demoStages[index]!.duration);
  }
});

test('pause and resume preserve remaining time rather than restart the stage', () => {
  let state = updateDemoPlayback(createDemoPlayback(false, true), { type: 'visibility', value: true }, 100);
  state = updateDemoPlayback(state, { type: 'toggle' }, 1100);
  assert.equal(state.remaining, 1600);
  assert.equal(state.manual, false);
  state = updateDemoPlayback(state, { type: 'toggle' }, 9000);
  assert.equal(state.remaining, 1600);
  assert.equal(state.startedAt, 9000);
});

test('offscreen and hidden pauses share the timer pause without changing user intent', () => {
  let state = updateDemoPlayback(createDemoPlayback(false, true), { type: 'visibility', value: true }, 0);
  state = updateDemoPlayback(state, { type: 'visibility', value: false }, 600);
  assert.equal(state.remaining, 2000);
  assert.equal(state.paused, false);
  assert.equal(isDemoRunning(state), false);
  state = updateDemoPlayback(state, { type: 'pageVisibility', value: false }, 1000);
  state = updateDemoPlayback(state, { type: 'visibility', value: true }, 2000);
  assert.equal(isDemoRunning(state), false);
  state = updateDemoPlayback(state, { type: 'pageVisibility', value: true }, 5000);
  assert.equal(state.remaining, 2000);
  assert.equal(isDemoRunning(state), true);
});

test('reduced motion starts static and preference changes never resume a deliberate pause', () => {
  let state = createDemoPlayback(true, true);
  assert.equal(state.manual, true);
  assert.equal(state.paused, true);
  state = updateDemoPlayback(state, { type: 'visibility', value: true }, 0);
  state = updateDemoPlayback(state, { type: 'motion', value: false }, 100);
  assert.equal(state.paused, true);
  state = updateDemoPlayback(state, { type: 'toggle' }, 200);
  assert.equal(isDemoRunning(state), true);
  state = updateDemoPlayback(state, { type: 'motion', value: true }, 300);
  assert.equal(state.manual, true);
  assert.equal(state.paused, true);
  state = updateDemoPlayback(state, { type: 'motion', value: false }, 400);
  assert.equal(state.paused, true);
});

test('play from a manual frame restarts that stage, while replay honours reduced motion', () => {
  let state = updateDemoPlayback(createDemoPlayback(false, true), { type: 'visibility', value: true }, 0);
  state = updateDemoPlayback(state, { type: 'select', index: 5 }, 100);
  state = updateDemoPlayback(state, { type: 'toggle' }, 600);
  assert.equal(state.index, 5);
  assert.equal(state.manual, false);
  assert.equal(state.remaining, 4000);
  assert.equal(isDemoRunning(state), true);
  state = updateDemoPlayback(state, { type: 'replay' }, 1000);
  assert.equal(state.index, 0);
  assert.equal(state.remaining, 2600);
  state = updateDemoPlayback(state, { type: 'motion', value: true }, 1500);
  state = updateDemoPlayback(state, { type: 'replay' }, 2000);
  assert.equal(state.index, 0);
  assert.equal(state.paused, true);
  assert.equal(state.manual, true);
});

test('completed stages advance once with fresh timing and preserve the previous state', () => {
  const previous = updateDemoPlayback(createDemoPlayback(false, true), { type: 'visibility', value: true }, 0);
  const next = updateDemoPlayback(previous, { type: 'tick' }, 2600);
  assert.equal(previous.index, 0);
  assert.equal(previous.remaining, 2600);
  assert.equal(next.index, 1);
  assert.equal(next.remaining, demoStages[1].duration);
  assert.equal(next.startedAt, 2600);
});

test('accessible descriptions match actual lookup, history and flashcard captures', () => {
  assert.match(demoStages[1].description, /duck is typed/);
  assert.match(demoStages[2].description, /water bird/);
  assert.match(demoStages[3].description, /no bookmark action/);
  assert.match(demoStages[4].description, /real flashcard/);
  assert.match(demoStages[5].description, /Hindi translation/);
  assert.match(demoStages[5].description, /does not mark any answer automatically/);
});

import { demoScreens } from './demo-model.ts';
import { existsSync, readFileSync } from 'node:fs';

test('every stage maps to a real captured screen and never an invented control', () => {
  for (const stage of demoStages) assert.ok(demoScreens.some(screen => screen.id === stage.screen));
  for (const screen of demoScreens) {
    assert.ok(existsSync(new URL(`../../../../public${screen.light}`, import.meta.url)), `Missing production capture: ${screen.light}`);
    const capture = readFileSync(new URL(`../../../../public${screen.light}`, import.meta.url));
    assert.equal(capture.readUInt16BE(0), 0xffd8, "Capture has the JPEG signature matching its extension");
  }
});
