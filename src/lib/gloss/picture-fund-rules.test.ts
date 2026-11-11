import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validatePictureFund, liveRewardLink, annualRewardSaving, type PictureFund } from "./picture-fund-rules.ts";
const source = JSON.parse(readFileSync(new URL('../../data/gloss/picture-campaign.json', import.meta.url), 'utf8')) as PictureFund;
const fixture = (): PictureFund => structuredClone(source);
test('single shared fund and fixed-term family rewards', () => {
  const fund = validatePictureFund(fixture());
  assert.equal(fund.status, 'preview');
  assert.equal(fund.tiers.find(tier => tier.id === 'founding-family')?.months, 12);
  assert.equal(fund.tiers.find(tier => tier.id === 'two-families')?.households, 2);
  for (const tier of fund.tiers) assert.equal(liveRewardLink(fund, tier.id), null);
});
test('preview cannot publish checkout even with a live-looking URL', () => {
  const fund = fixture(); fund.languages[0]!.pledgeLinks['supporter'] = 'https://buy.stripe.com/abc123';
  assert.equal(liveRewardLink(fund, 'supporter'), null);
});
test('rejects sandbox, foreign, malformed and missing checkout URLs', () => {
  for (const link of ['', 'https://buy.stripe.com/test_abc', 'https://evil.example/abc', 'http://buy.stripe.com/abc', 'https://buy.stripe.com@evil.example/abc', 'bad', 'https://buy.stripe.com/abc?test=true']) {
    const fund = fixture(); fund.status = 'open'; fund.goal = 10000; fund.languages[0]!.pledgeLinks['supporter'] = link;
    assert.equal(liveRewardLink(fund, 'supporter'), null);
    assert.throws(() => validatePictureFund(fund));
  }
});
test('open fund requires live checkout for every known tier', () => {
  const fund = fixture(); fund.status = 'open'; fund.goal = 10000;
  fund.tiers.forEach(tier => { fund.languages[0]!.pledgeLinks[tier.id] = 'https://buy.stripe.com/abc123'; });
  assert.equal(validatePictureFund(fund), fund);
  assert.equal(liveRewardLink(fund, 'unknown'), null);
  assert.equal(liveRewardLink(fund, 'supporter'), 'https://buy.stripe.com/abc123');
});
test('rejects separate funds and invalid reward/budget configurations', () => {
  const mutations = [
    (f: PictureFund) => { f.languages = []; },
    (f: PictureFund) => { f.languages.push(structuredClone(f.languages[0]!)); },
    (f: PictureFund) => { f.status = 'unknown'; },
    (f: PictureFund) => { f.currency = 'usd'; },
    (f: PictureFund) => { f.goal = 0; },
    (f: PictureFund) => { f.coverageGoal = ""; },
    (f: PictureFund) => { f.tiers = []; },
    (f: PictureFund) => { f.tiers.push(structuredClone(f.tiers[0]!)); },
    (f: PictureFund) => { f.tiers[0]!.price = -1; },
    (f: PictureFund) => { f.tiers[0]!.months = 12; },
  ];
  for (const mutate of mutations) { const fund = fixture(); mutate(fund); assert.throws(() => validatePictureFund(fund)); }
});

test('backer savings compare only discounted annual memberships', () => {
  const fund = fixture();
  const founding = fund.tiers.find(tier => tier.id === 'founding-family')!;
  assert.deepEqual(annualRewardSaving(founding, 49), { plannedPrice: 49, saving: 10 });
  assert.deepEqual(annualRewardSaving(fund.tiers.find(tier => tier.id === 'two-families')!, 49), { plannedPrice: 98, saving: 20 });
  for (const id of ['supporter', 'word-sponsor']) assert.equal(annualRewardSaving(fund.tiers.find(tier => tier.id === id)!, 49), null);
  assert.equal(annualRewardSaving({ ...founding, price: 49 }, 49), null);
  assert.equal(annualRewardSaving({ ...founding, months: 24 }, 49), null);
  for (const annualPrice of [0, -1, NaN, Infinity]) assert.equal(annualRewardSaving(founding, annualPrice), null);
});
