/**
 * normalize.ts
 * Typographic character normalization and flexible input matching for TypeRacer & Typing Academy.
 *
 * Ensures typists can use standard QWERTY keys for non-standard typographic symbols:
 * - Em dashes ('—', U+2014) and En dashes ('–', U+2013) matched by '-' (or double-dash '--')
 * - Typographic quotes (‘, ’, `) matched by standard apostrophe '\''
 * - Typographic double quotes (“ , ”, «, ») matched by '"'
 * - Non-breaking spaces (\u00A0) matched by ' '
 */

/**
 * Normalizes an individual character to its standard keyboard equivalent.
 */
export function normalizeChar(ch: string): string {
  if (ch === '—' || ch === '–' || ch === '―' || ch === '−' || ch === '‒') return '-';
  if (ch === '’' || ch === '‘' || ch === '`') return "'";
  if (ch === '“' || ch === '”' || ch === '«' || ch === '»') return '"';
  if (ch === '\u00A0') return ' ';
  return ch;
}

/**
 * Normalizes all typographic characters in a string to standard ASCII keyboard characters.
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/[—–―−‒]/g, '-')
    .replace(/[‘’`]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/\u00A0/g, ' ');
}

/**
 * Checks whether a single typed character matches the target character.
 * Handles exact equality as well as typographic equivalences (e.g. '-' matching '—').
 */
export function charsMatch(typed: string, target: string): boolean {
  if (typed === target) return true;
  if (!typed || !target) return false;
  return normalizeChar(typed) === normalizeChar(target);
}

/**
 * Checks if current typing input matches the beginning of the target word.
 * Tolerates:
 * - Direct prefix matches
 * - Normalized character matches ('-' for '—', '\'' for '’')
 * - Double-hyphen '--' typed for an em dash '—' (e.g. "before--" matching "before—")
 */
export function matchesWordProgress(targetWord: string, inputVal: string): boolean {
  if (!inputVal) return true;
  if (targetWord.startsWith(inputVal)) return true;

  const normTarget = normalizeString(targetWord);
  const normInput = normalizeString(inputVal);

  if (normTarget.startsWith(normInput)) return true;

  // If user types '--' for an em dash, collapse it to single '-'
  const collapsedInput = normInput.replace(/--/g, '-');
  if (normTarget.startsWith(collapsedInput)) return true;

  return false;
}

/**
 * Checks if the completed word input matches the target word.
 * Normalizes both strings and accepts '--' as equivalent to '—'.
 */
export function isWordCompleted(targetWord: string, inputVal: string): boolean {
  if (inputVal === targetWord) return true;

  const normTarget = normalizeString(targetWord);
  const normInput = normalizeString(inputVal);

  if (normTarget === normInput) return true;
  if (normTarget === normInput.replace(/--/g, '-')) return true;

  return false;
}

/**
 * Aligns typed input to target word length for character-by-character rendering.
 * If user typed '--' for '—', collapses '--' to '-' so subsequent characters align.
 */
export function alignTypedInput(targetWord: string, currentInput: string): string {
  if (targetWord.includes('—') || targetWord.includes('–')) {
    return currentInput.replace(/--/g, '-');
  }
  return currentInput;
}
