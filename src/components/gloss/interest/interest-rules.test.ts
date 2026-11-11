import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInterestMailto, interestPrefill, matchingLanguages, normalizeLanguage, searchableLanguage, uniqueLanguages, MAX_LANGUAGE_CHOICES, MAX_LANGUAGE_LENGTH, MAX_MESSAGE_LENGTH, type InterestDraft } from "./interest-rules.ts";
import { WORLD_LANGUAGES } from "./languages.ts";
const configuration = { recipient: "support@tinykite.co", currency: "gbp", rewards: [{ id: "founding-family", title: "Founding family", price: 39 }] };
const draft = (changes: Partial<InterestDraft> = {}): InterestDraft => ({ languages: [], role: "reader", message: "", rewardId: "", ...changes });
test('worldwide language catalogue includes different regions and allows custom varieties', () => {
  assert.ok(WORLD_LANGUAGES.length > 80);
  for (const language of ['Arabic','Mandarin Chinese','Welsh','Swahili','Cherokee','Māori','Spanish','Telugu']) assert.ok(matchingLanguages(language).includes(language));
  assert.deepEqual(uniqueLanguages(['Spanish (Colombia)', 'Sámi']), ['Spanish (Colombia)', 'Sámi']);
});
test('search finds accent-insensitive language names and handles blank/missing results', () => {
  assert.equal(searchableLanguage('Māori'), 'maori');
  assert.deepEqual(matchingLanguages('maori'), ['Māori']);
  assert.equal(matchingLanguages('zzzz-unlisted').length, 0);
  assert.equal(matchingLanguages('').length, WORLD_LANGUAGES.length);
});
test('language labels are bounded, normalized and unique in preference order', () => {
  assert.equal(normalizeLanguage('  Spanish\r\n (Colombia)  '), 'Spanish (Colombia)');
  assert.equal(normalizeLanguage('a'.repeat(200)).length, MAX_LANGUAGE_LENGTH);
  assert.deepEqual(uniqueLanguages(['', 'spanish', 'Spanish', 'maori', 'Māori']), ['Spanish','Māori']);
  assert.equal(uniqueLanguages(Array.from({length:20},(_,index)=>`Regional ${index}`)).length, MAX_LANGUAGE_CHOICES);
});
test('URL prefill accepts only existing rewards and normalizes repeated languages', () => {
  assert.deepEqual(interestPrefill('?reward=founding-family&language=spanish&language=Welsh&language=Spanish', ['founding-family']), {rewardId:'founding-family',languages:['Spanish','Welsh']});
  assert.deepEqual(interestPrefill('?reward=fake&language=', ['founding-family']), {rewardId:'',languages:[]});
  assert.deepEqual(interestPrefill('', []), {rewardId:'',languages:[]});
});
test('email draft includes preferences and reward without submitting anything', () => {
  const url = new URL(buildInterestMailto(draft({languages:['Spanish','Welsh'],rewardId:'founding-family',role:'parent',message:'I can review pictures.'}), configuration));
  assert.equal(url.protocol,'mailto:');
  assert.equal(url.pathname,'support@tinykite.co');
  assert.equal(url.searchParams.get('subject'),'Gloss backing interest: Founding family');
  const body = url.searchParams.get('body')!;
  assert.match(body,/Spanish, Welsh/);
  assert.match(body,/GBP 39/);
  assert.match(body,/A parent or carer/);
  assert.match(body,/not a payment or reward reservation/);
  assert.match(body,/I can review pictures/);
});
test('unknown reward does not become an email reward and blank preferences are explicit', () => {
  const url = new URL(buildInterestMailto(draft({rewardId:'fake'}), configuration));
  assert.match(url.searchParams.get('body')!,/No reward chosen/);
  assert.match(url.searchParams.get('body')!,/No preference yet/);
  assert.equal(url.searchParams.get('subject'),'Gloss: expression of interest');
});
test('user text stays in encoded body and is bounded', () => {
  const url = new URL(buildInterestMailto(draft({languages:['A&B?subject=attack'],message:'x'.repeat(900)}), configuration));
  assert.equal([...url.searchParams.keys()].join(','),'subject,body');
  assert.match(url.searchParams.get('body')!,/A&B\?subject=attack/);
  assert.ok(url.searchParams.get('body')!.includes('x'.repeat(MAX_MESSAGE_LENGTH)));
  assert.ok(!url.searchParams.get('body')!.includes('x'.repeat(MAX_MESSAGE_LENGTH+1)));
});
test('reader-mode email never imports a reward or price from earlier backing intent', () => {
  const url = new URL(buildInterestMailto(draft({rewardId:'founding-family',languages:['Welsh']}), {...configuration, mode:'reader'}));
  assert.equal(url.searchParams.get('subject'), 'Gloss: expression of interest');
  assert.ok(!url.searchParams.get('body')!.includes('Backer reward:'));
  assert.ok(!url.searchParams.get('body')!.includes('GBP 39'));
  assert.ok(url.searchParams.get('body')!.includes('Welsh'));
});
