import { test } from "node:test";
import assert from "node:assert/strict";
import {
  closingDateText,
  dollars,
  fillEvidence,
  isOpen,
  isPricedFromReference,
  percentRaised,
  pledgeLink,
  tierName,
  validateCampaign,
  type Campaign,
  type Language,
  type ReadingEvidence,
  type Story,
} from "./campaign-rules.ts";

const CLOSES_ON = "2026-12-11";

function language(overrides: Partial<Language> = {}): Language {
  return {
    slug: "hinglish",
    name: "Hinglish",
    who: "",
    goal: 10000,
    promise: "",
    roots: null,
    forFun: null,
    builtIntro: "",
    built: [],
    samplesIntro: "",
    samples: [],
    buys: [],
    screenshot: null,
    pledgeLinks: { "early-backer": "" },
    raised: 0,
    backers: 0,
    ...overrides,
  };
}

function campaignWith(languages: Language[], closesOn: string | null = CLOSES_ON): Campaign {
  return {
    campaignId: "test",
    currency: "usd",
    siteBaseUrl: "https://tinykite.co",
    closesOn,
    tiers: [{ id: "early-backer", price: 10, title: "Early backer", limitPerLanguage: null, now: [], later: [] }],
    languages,
    costReference: { slug: "hinglish", built: "", investedUsd: null },
    readingEvidence: evidence(),
  };
}

const LINK = "https://buy.stripe.com/test_abc";

function evidence(overrides: Partial<ReadingEvidence> = {}): ReadingEvidence {
  return {
    method: "",
    rows: [{ age: 9, unknownWords: 47, low: 31, high: 103, knownPercent: 97 }],
    notes: [],
    caveat: "",
    citations: [],
    ...overrides,
  };
}

function story(momentTitle = "About {unknownWordsAt9} a chapter"): Story {
  const section = { title: "", body: "" };
  return {
    moment: { title: momentTitle, body: "" },
    risk: section,
    dictionary: { ...section, rows: [] },
    pictures: section,
    depths: section,
    practice: { title: "", today: [], next: [] },
  };
}

test("a pledge stays closed without a link", () => {
  assert.equal(pledgeLink(language(), "early-backer", CLOSES_ON), null);
  assert.equal(isOpen(language(), CLOSES_ON), false);
});

test("a pledge stays closed without a closing date, even with a link", () => {
  const withLink = language({ pledgeLinks: { "early-backer": LINK } });
  assert.equal(pledgeLink(withLink, "early-backer", null), null);
  assert.equal(isOpen(withLink, null), false);
});

test("a pledge opens with both a link and a closing date", () => {
  const withLink = language({ pledgeLinks: { "early-backer": LINK } });
  assert.equal(pledgeLink(withLink, "early-backer", CLOSES_ON), LINK);
  assert.equal(isOpen(withLink, CLOSES_ON), true);
});

test("an unknown tier has no link", () => {
  assert.equal(pledgeLink(language({ pledgeLinks: { "early-backer": LINK } }), "patron", CLOSES_ON), null);
});

test("percent raised floors and caps at 100", () => {
  assert.equal(percentRaised(language({ raised: 0 })), 0);
  assert.equal(percentRaised(language({ raised: 2599 })), 25);
  assert.equal(percentRaised(language({ raised: 25000 })), 100);
});

test("dollars groups thousands", () => {
  assert.equal(dollars(10000), "$10,000");
  assert.equal(dollars(10), "$10");
});

test("closing date reads the way the terms write dates", () => {
  assert.equal(closingDateText(CLOSES_ON), "11 December 2026");
});

test("validation accepts the shape the pages use", () => {
  assert.doesNotThrow(() => validateCampaign(campaignWith([language({ pledgeLinks: { "early-backer": LINK } })])));
});

test("validation rejects a link for a tier that doesn't exist", () => {
  assert.throws(() => validateCampaign(campaignWith([language({ pledgeLinks: { "school-bundle": LINK } })])), /unknown tier/);
});

test("validation rejects a name for a tier that doesn't exist", () => {
  assert.throws(() => validateCampaign(campaignWith([language({ tierNames: { classroom: { name: "Class" } } })])), /unknown tier/);
});

const EARLY_BACKER = { id: "early-backer", price: 10, title: "Early backer", limitPerLanguage: null, now: [], later: [] };

test("a tier uses the language's own name and meaning", () => {
  const hinglish = language({ tierNames: { "early-backer": { name: "Dost", meaning: "Friend" } } });
  assert.deepEqual(tierName(hinglish, EARLY_BACKER), { name: "Dost", meaning: "Friend" });
});

test("a tier without a language name falls back to its title", () => {
  assert.deepEqual(tierName(language(), EARLY_BACKER), { name: "Early backer" });
});

test("validation rejects a non-https link", () => {
  assert.throws(() => validateCampaign(campaignWith([language({ pledgeLinks: { "early-backer": "http://x" } })])), /https/);
});

test("validation rejects a zero goal", () => {
  assert.throws(() => validateCampaign(campaignWith([language({ goal: 0 })])), /goal/);
});

test("validation rejects a closing date that isn't a date", () => {
  assert.throws(() => validateCampaign(campaignWith([language()], "soon")), /closesOn/);
});

test("validation rejects a cost reference to a language that doesn't exist", () => {
  const campaign = campaignWith([language()]);
  campaign.costReference.slug = "klingon";
  assert.throws(() => validateCampaign(campaign), /costReference/);
});

test("validation rejects a zero invested amount", () => {
  const campaign = campaignWith([language()]);
  campaign.costReference.investedUsd = 0;
  assert.throws(() => validateCampaign(campaign), /investedUsd/);
});

test("only languages other than the reference are priced from it", () => {
  const tenglish = language({ slug: "tenglish" });
  const campaign = campaignWith([language(), tenglish]);
  assert.equal(isPricedFromReference(language(), campaign), false);
  assert.equal(isPricedFromReference(tenglish, campaign), true);
});

test("evidence placeholders fill with the measured number for that age", () => {
  assert.equal(fillEvidence("{unknownWordsAt9} new, {knownPercentAt9}% known", evidence()), "47 new, 97% known");
});

test("an age with no measurement is refused", () => {
  assert.throws(() => fillEvidence("{unknownWordsAt5}", evidence()), /age 5/);
});

test("a misspelt placeholder is refused rather than printed", () => {
  assert.throws(() => fillEvidence("{unknownWordAt9}", evidence()), /unknown placeholder/);
});

test("validation refuses a story with a placeholder that cannot fill", () => {
  const broken = campaignWith([language({ story: story("{knownPercentAt12}") })]);
  assert.throws(() => validateCampaign(broken), /age 12/);
});

test("validation accepts a story whose placeholders fill", () => {
  assert.doesNotThrow(() => validateCampaign(campaignWith([language({ story: story() })])));
});

test("validation refuses evidence whose median is outside its range", () => {
  const broken = campaignWith([language()]);
  broken.readingEvidence = evidence({ rows: [{ age: 9, unknownWords: 200, low: 31, high: 103, knownPercent: 97 }] });
  assert.throws(() => validateCampaign(broken), /outside its range/);
});

test("validation refuses a citation that isn't https", () => {
  const broken = campaignWith([language()]);
  broken.readingEvidence = evidence({ citations: [{ label: "x", url: "http://example.com" }] });
  assert.throws(() => validateCampaign(broken), /https/);
});
