export type HandSide = 'left' | 'right' | 'thumb';
export type FingerType = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';

export interface FingerInfo {
  hand: HandSide;
  finger: FingerType;
  name: string;
  fingerId: string; // e.g. 'left-index'
  colorClass: string;
  accentHex: string;
  homeKey?: string;
}

export const FINGER_ZONES: Record<string, FingerInfo> = {
  'left-pinky': {
    hand: 'left',
    finger: 'pinky',
    name: 'Left Pinky',
    fingerId: 'left-pinky',
    colorClass: 'text-rose-600 dark:text-rose-400 border-rose-500/40 bg-rose-500/10',
    accentHex: '#f43f5e',
    homeKey: 'a'
  },
  'left-ring': {
    hand: 'left',
    finger: 'ring',
    name: 'Left Ring',
    fingerId: 'left-ring',
    colorClass: 'text-orange-600 dark:text-orange-400 border-orange-500/40 bg-orange-500/10',
    accentHex: '#f97316',
    homeKey: 's'
  },
  'left-middle': {
    hand: 'left',
    finger: 'middle',
    name: 'Left Middle',
    fingerId: 'left-middle',
    colorClass: 'text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10',
    accentHex: '#eab308',
    homeKey: 'd'
  },
  'left-index': {
    hand: 'left',
    finger: 'index',
    name: 'Left Index',
    fingerId: 'left-index',
    colorClass: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    accentHex: '#10b981',
    homeKey: 'f'
  },
  'thumb': {
    hand: 'thumb',
    finger: 'thumb',
    name: 'Thumb (Space)',
    fingerId: 'thumb',
    colorClass: 'text-blue-600 dark:text-blue-400 border-blue-500/40 bg-blue-500/10',
    accentHex: '#3b82f6'
  },
  'right-index': {
    hand: 'right',
    finger: 'index',
    name: 'Right Index',
    fingerId: 'right-index',
    colorClass: 'text-teal-600 dark:text-teal-400 border-teal-500/40 bg-teal-500/10',
    accentHex: '#14b8a6',
    homeKey: 'j'
  },
  'right-middle': {
    hand: 'right',
    finger: 'middle',
    name: 'Right Middle',
    fingerId: 'right-middle',
    colorClass: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
    accentHex: '#6366f1',
    homeKey: 'k'
  },
  'right-ring': {
    hand: 'right',
    finger: 'ring',
    name: 'Right Ring',
    fingerId: 'right-ring',
    colorClass: 'text-purple-600 dark:text-purple-400 border-purple-500/40 bg-purple-500/10',
    accentHex: '#a855f7',
    homeKey: 'l'
  },
  'right-pinky': {
    hand: 'right',
    finger: 'pinky',
    name: 'Right Pinky',
    fingerId: 'right-pinky',
    colorClass: 'text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-500/10',
    accentHex: '#d946ef',
    homeKey: ';'
  }
};

const KEY_TO_FINGER_MAP: Record<string, string> = {
  // Left Pinky
  '`': 'left-pinky', '~': 'left-pinky', '1': 'left-pinky', '!': 'left-pinky',
  'q': 'left-pinky', 'Q': 'left-pinky', 'a': 'left-pinky', 'A': 'left-pinky',
  'z': 'left-pinky', 'Z': 'left-pinky', 'Tab': 'left-pinky', 'CapsLock': 'left-pinky',
  'ShiftLeft': 'left-pinky',

  // Left Ring
  '2': 'left-ring', '@': 'left-ring',
  'w': 'left-ring', 'W': 'left-ring', 's': 'left-ring', 'S': 'left-ring',
  'x': 'left-ring', 'X': 'left-ring',

  // Left Middle
  '3': 'left-middle', '#': 'left-middle',
  'e': 'left-middle', 'E': 'left-middle', 'd': 'left-middle', 'D': 'left-middle',
  'c': 'left-middle', 'C': 'left-middle',

  // Left Index
  '4': 'left-index', '$': 'left-index', '5': 'left-index', '%': 'left-index',
  'r': 'left-index', 'R': 'left-index', 't': 'left-index', 'T': 'left-index',
  'f': 'left-index', 'F': 'left-index', 'g': 'left-index', 'G': 'left-index',
  'v': 'left-index', 'V': 'left-index', 'b': 'left-index', 'B': 'left-index',

  // Thumbs
  ' ': 'thumb', 'Space': 'thumb',

  // Right Index
  '6': 'right-index', '^': 'right-index', '7': 'right-index', '&': 'right-index',
  'y': 'right-index', 'Y': 'right-index', 'u': 'right-index', 'U': 'right-index',
  'h': 'right-index', 'H': 'right-index', 'j': 'right-index', 'J': 'right-index',
  'n': 'right-index', 'N': 'right-index', 'm': 'right-index', 'M': 'right-index',

  // Right Middle
  '8': 'right-middle', '*': 'right-middle',
  'i': 'right-middle', 'I': 'right-middle', 'k': 'right-middle', 'K': 'right-middle',
  ',': 'right-middle', '<': 'right-middle',

  // Right Ring
  '9': 'right-ring', '(': 'right-ring',
  'o': 'right-ring', 'O': 'right-ring', 'l': 'right-ring', 'L': 'right-ring',
  '.': 'right-ring', '>': 'right-ring',

  // Right Pinky
  '0': 'right-pinky', ')': 'right-pinky', '-': 'right-pinky', '_': 'right-pinky',
  '=': 'right-pinky', '+': 'right-pinky',
  'p': 'right-pinky', 'P': 'right-pinky', '[': 'right-pinky', '{': 'right-pinky',
  ']': 'right-pinky', '}': 'right-pinky', '\\': 'right-pinky', '|': 'right-pinky',
  ';': 'right-pinky', ':': 'right-pinky', '\'': 'right-pinky', '"': 'right-pinky',
  '/': 'right-pinky', '?': 'right-pinky', 'Enter': 'right-pinky', 'Backspace': 'right-pinky',
  'ShiftRight': 'right-pinky'
};

export function getFingerForKey(charOrKey: string): FingerInfo {
  const zoneId = KEY_TO_FINGER_MAP[charOrKey] || KEY_TO_FINGER_MAP[charOrKey.toLowerCase()] || 'left-index';
  return FINGER_ZONES[zoneId];
}

export function getFingerForChar(char: string): string {
  const info = getFingerForKey(char);
  return info ? info.fingerId : 'left-index';
}

export function getFingerDescription(fingerKey: string, char: string): string {
  const map: Record<string, string> = {
    'left-pinky': 'Left Pinky',
    'left-ring': 'Left Ring',
    'left-middle': 'Left Middle',
    'left-index': 'Left Index' + (char === 'f' || char === 'F' ? ' (Home Bump)' : ''),
    'right-index': 'Right Index' + (char === 'j' || char === 'J' ? ' (Home Bump)' : ''),
    'right-middle': 'Right Middle',
    'right-ring': 'Right Ring',
    'right-pinky': 'Right Pinky',
    'thumb': 'Either Thumb on Spacebar'
  };
  return map[fingerKey] || 'Index Finger';
}
