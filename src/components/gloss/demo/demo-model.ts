/** Unmodified light-appearance production captures, preserved in either page theme. */
export const demoScreens = ['home', 'search', 'meaning', 'saved', 'practice', 'answer'].map(id => ({
  id,
  light: `/gloss/screenshots/walkthrough/${id}-light.jpg`,
}));

/** Caption-free stages describe only what the actual captured screens show. */
export const demoStages = [
  { id: 'reading', screen: 'home', duration: 2600, label: 'Read the book', description: 'The passage reads: A duck swam across the pond. Duck is the word to look up. The real Gloss home screen is shown beside the passage.' },
  { id: 'searching', screen: 'search', duration: 2600, label: 'Look up duck', description: 'On the real Gloss search screen, duck is typed into the search field. Suggestions include duck, ducky, ducker and duckie.' },
  { id: 'meaning', screen: 'meaning', duration: 3600, label: 'Understand duck', description: 'The real duck entry shows a photograph, pronunciation, the noun meaning and an example sentence. Duck is a water bird with a wide flat beak, short legs and webbed feet.' },
  { id: 'saved', screen: 'saved', duration: 2600, label: 'See words you have met', description: 'The real Words you’ve met screen shows saved lookup history and time windows, with Flashcards and Quiz me actions. Looking up words adds them to this reader’s history; no bookmark action is shown.' },
  { id: 'practice', screen: 'practice', duration: 2400, label: 'Recall the meaning', description: 'A real flashcard asks the reader to recall duck. It shows the noun label, pronunciation control and Tap to turn it over.' },
  { id: 'answer', screen: 'answer', duration: 4000, label: 'Turn the flashcard', description: 'The reverse of the actual duck flashcard shows the duck photograph, a simple definition and the Hindi translation बतख. The reader can choose Knew it. This capture does not mark any answer automatically.' },
  { id: 'understood', screen: 'meaning', duration: 3200, label: 'Return to the book', description: 'The passage is shown again: A duck swam across the pond. The real dictionary entry stays visible as a reference. A check beside duck represents the reader returning to the story.' },
] as const;

/** Advance one step; invalid or final indices restart the story. */
export function nextDemoStage(index: number): number {
  return Number.isInteger(index) && index >= 0 && index < demoStages.length - 1 ? index + 1 : 0;
}

/** Playback state keeps user intent separate from temporary visibility pauses. */
export interface DemoPlayback {
  index: number;
  paused: boolean;
  manual: boolean;
  reducedMotion: boolean;
  visible: boolean;
  pageVisible: boolean;
  remaining: number;
  startedAt: number | null;
}

/** Events are timed by the caller's monotonic clock. */
export type DemoEvent =
  | { type: 'tick' | 'toggle' | 'replay' }
  | { type: 'select'; index: number }
  | { type: 'visibility' | 'pageVisibility' | 'motion'; value: boolean };

/** Start reduced-motion visitors on a still frame until they choose playback. */
export function createDemoPlayback(reducedMotion: boolean, pageVisible: boolean): DemoPlayback {
  return { index: 0, paused: reducedMotion, manual: reducedMotion, reducedMotion,
    visible: false, pageVisible, remaining: demoStages[0].duration, startedAt: null };
}

/** Whether both the stage timer and its CSS animations may progress. */
export function isDemoRunning(state: DemoPlayback): boolean {
  return !state.paused && state.visible && state.pageVisible;
}

/** Reset timing when entering a different stage, including a replay. */
function enterStage(state: DemoPlayback, index: number): void {
  state.index = Number.isInteger(index) && index >= 0 && index < demoStages.length ? index : 0;
  state.remaining = demoStages[state.index]!.duration;
}

/** Apply deliberate navigation separately from a temporary environmental pause. */
function applyDemoEvent(state: DemoPlayback, event: DemoEvent): void {
  if (event.type === 'tick') enterStage(state, nextDemoStage(state.index));
  if (event.type === 'select') {
    state.paused = true;
    state.manual = true;
    enterStage(state, event.index);
  }
  if (event.type === 'toggle') {
    state.paused = !state.paused;
    if (!state.paused && state.manual) enterStage(state, state.index);
    if (!state.paused) state.manual = false;
  }
  if (event.type === 'replay') {
    state.paused = state.reducedMotion;
    state.manual = state.reducedMotion;
    enterStage(state, 0);
  }
  applyEnvironmentEvent(state, event);
}

/** Turning motion reduction off never overrides a visitor's pause. */
function applyEnvironmentEvent(state: DemoPlayback, event: DemoEvent): void {
  if (event.type === 'visibility') state.visible = event.value;
  if (event.type === 'pageVisibility') state.pageVisible = event.value;
  if (event.type === 'motion') {
    state.reducedMotion = event.value;
    if (event.value) { state.paused = true; state.manual = true; }
  }
}

/** Preserve elapsed stage time on pause, hiding, or scrolling out of view. */
export function updateDemoPlayback(previous: DemoPlayback, event: DemoEvent, now: number): DemoPlayback {
  const state = { ...previous };
  if (state.startedAt !== null) state.remaining = Math.max(0, state.remaining - Math.max(0, now - state.startedAt));
  applyDemoEvent(state, event);
  state.startedAt = isDemoRunning(state) ? now : null;
  return state;
}
