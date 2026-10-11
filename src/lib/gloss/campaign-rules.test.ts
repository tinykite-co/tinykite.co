import { test } from "node:test";
import assert from "node:assert/strict";
import {
  closingDateText,
  dollars,
  isOpen,
  percentRaised,
  pledgeLink,
  validateCampaign,
  type Campaign,
  type Language,
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
  };
}

const LINK = "https://buy.stripe.com/test_abc";

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
  assert.throws(() => validateCampaign(campaignWith([language({ pledgeLinks: { classroom: LINK } })])), /unknown tier/);
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
