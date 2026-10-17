export interface AcademyState {
  lessonId: number;
  drillText: string;
  currentIndex: number;
  totalKeystrokes: number;
  errorCount: number;
  startTime: number | null;
  endTime: number | null;
  isComplete: boolean;
}

export interface KeyResult {
  success: boolean;
  advanced: boolean;
  shake: boolean;
  isComplete: boolean;
  accuracy: number;
  wpm: number;
  currentChar: string;
  nextChar: string;
}

export function createAcademySession(lessonId: number, drillText: string): AcademyState {
  return {
    lessonId,
    drillText,
    currentIndex: 0,
    totalKeystrokes: 0,
    errorCount: 0,
    startTime: null,
    endTime: null,
    isComplete: false
  };
}

export function processAcademyKeystroke(state: AcademyState, pressedKey: string): KeyResult {
  if (state.isComplete) {
    return {
      success: true,
      advanced: false,
      shake: false,
      isComplete: true,
      accuracy: calculateAccuracy(state),
      wpm: calculateWpm(state),
      currentChar: '',
      nextChar: ''
    };
  }

  if (!state.startTime) {
    state.startTime = Date.now();
  }

  state.totalKeystrokes++;
  const targetChar = state.drillText[state.currentIndex];

  // Match key
  const isMatch = pressedKey === targetChar;

  if (isMatch) {
    state.currentIndex++;
    if (state.currentIndex >= state.drillText.length) {
      state.isComplete = true;
      state.endTime = Date.now();
    }

    return {
      success: true,
      advanced: true,
      shake: false,
      isComplete: state.isComplete,
      accuracy: calculateAccuracy(state),
      wpm: calculateWpm(state),
      currentChar: state.drillText[state.currentIndex] || '',
      nextChar: state.drillText[state.currentIndex + 1] || ''
    };
  } else {
    // Lockout: Do not advance, shake current letter
    state.errorCount++;
    return {
      success: false,
      advanced: false,
      shake: true,
      isComplete: false,
      accuracy: calculateAccuracy(state),
      wpm: calculateWpm(state),
      currentChar: targetChar,
      nextChar: state.drillText[state.currentIndex + 1] || ''
    };
  }
}

export function calculateAccuracy(state: AcademyState): number {
  if (state.totalKeystrokes === 0) return 100;
  const correct = Math.max(0, state.totalKeystrokes - state.errorCount);
  return Math.max(0, Math.round((correct / state.totalKeystrokes) * 100));
}

export function calculateWpm(state: AcademyState): number {
  if (!state.startTime || state.currentIndex === 0) return 0;
  const elapsedMinutes = Math.max(0.01, ((state.endTime || Date.now()) - state.startTime) / 60000);
  const wordsTyped = state.currentIndex / 5;
  return Math.max(0, Math.round(wordsTyped / elapsedMinutes));
}

export function calculateStars(accuracy: number): number {
  if (accuracy >= 95) return 3;
  if (accuracy >= 85) return 2;
  return 1;
}
