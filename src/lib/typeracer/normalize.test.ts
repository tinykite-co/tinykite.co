import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  normalizeChar,
  normalizeString,
  charsMatch,
  matchesWordProgress,
  isWordCompleted,
  alignTypedInput
} from './normalize.ts';
import { getFingerForKey } from './fingers.ts';

describe('Typing Normalization - Em Dashes & Typographic Equivalences', () => {
  test('normalizeChar maps em dash, en dash, and special dashes to hyphen', () => {
    assert.strictEqual(normalizeChar('—'), '-'); // Em dash U+2014
    assert.strictEqual(normalizeChar('–'), '-'); // En dash U+2013
    assert.strictEqual(normalizeChar('―'), '-'); // Horizontal bar U+2015
    assert.strictEqual(normalizeChar('−'), '-'); // Minus sign U+2212
    assert.strictEqual(normalizeChar('‒'), '-'); // Figure dash U+2012
    assert.strictEqual(normalizeChar('-'), '-'); // ASCII hyphen
  });

  test('normalizeChar maps curly quotes and apostrophes to standard ASCII', () => {
    assert.strictEqual(normalizeChar('’'), "'");
    assert.strictEqual(normalizeChar('‘'), "'");
    assert.strictEqual(normalizeChar('`'), "'");
    assert.strictEqual(normalizeChar('“'), '"');
    assert.strictEqual(normalizeChar('”'), '"');
    assert.strictEqual(normalizeChar('\u00A0'), ' ');
  });

  test('charsMatch allows typing standard hyphen for em dashes and en dashes', () => {
    assert.strictEqual(charsMatch('-', '—'), true, 'Typing hyphen must match em dash');
    assert.strictEqual(charsMatch('-', '–'), true, 'Typing hyphen must match en dash');
    assert.strictEqual(charsMatch('—', '—'), true, 'Typing em dash must match em dash');
    assert.strictEqual(charsMatch("'", '’'), true, 'Typing apostrophe must match curly apostrophe');
    assert.strictEqual(charsMatch('"', '“'), true, 'Typing quote must match curly quote');
    assert.strictEqual(charsMatch('a', 'b'), false, 'Non-matching letters must return false');
    assert.strictEqual(charsMatch('-', 'a'), false, 'Hyphen should not match letters');
  });

  test('matchesWordProgress accurately validates typing progress with em dashes', () => {
    const target = 'before—that';

    // Partial typing before dash
    assert.strictEqual(matchesWordProgress(target, 'bef'), true);
    assert.strictEqual(matchesWordProgress(target, 'before'), true);

    // Typing hyphen for em dash
    assert.strictEqual(matchesWordProgress(target, 'before-'), true);

    // Typing double-hyphen for em dash
    assert.strictEqual(matchesWordProgress(target, 'before--'), true);

    // Continuing word after single hyphen
    assert.strictEqual(matchesWordProgress(target, 'before-th'), true);
    assert.strictEqual(matchesWordProgress(target, 'before-that'), true);

    // Continuing word after double hyphen
    assert.strictEqual(matchesWordProgress(target, 'before--th'), true);
    assert.strictEqual(matchesWordProgress(target, 'before--that'), true);

    // Typing direct em dash (Mac shortcut)
    assert.strictEqual(matchesWordProgress(target, 'before—'), true);
    assert.strictEqual(matchesWordProgress(target, 'before—that'), true);

    // Errors
    assert.strictEqual(matchesWordProgress(target, 'beforex'), false);
    assert.strictEqual(matchesWordProgress(target, 'before-xyz'), false);
  });

  test('isWordCompleted validates word completion with single or double hyphens', () => {
    const target = 'before—that';

    assert.strictEqual(isWordCompleted(target, 'before-that'), true, 'Single hyphen should complete word');
    assert.strictEqual(isWordCompleted(target, 'before--that'), true, 'Double hyphen should complete word');
    assert.strictEqual(isWordCompleted(target, 'before—that'), true, 'Direct em dash should complete word');
    assert.strictEqual(isWordCompleted(target, 'before'), false, 'Incomplete word should return false');
    assert.strictEqual(isWordCompleted(target, 'before-tha'), false, 'Incomplete word should return false');
    assert.strictEqual(isWordCompleted(target, 'wrong'), false, 'Wrong word should return false');
  });

  test('alignTypedInput aligns character indices when double hyphen is typed', () => {
    const target = 'before—that';
    assert.strictEqual(alignTypedInput(target, 'before-'), 'before-');
    assert.strictEqual(alignTypedInput(target, 'before--'), 'before-');
    assert.strictEqual(alignTypedInput(target, 'before--that'), 'before-that');
  });
});
