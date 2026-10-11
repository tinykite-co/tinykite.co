/**
 * Types and pure rules for the Gloss language campaigns. Kept free of the
 * JSON import so the rules can be tested with `node --test` (see
 * campaign-rules.test.ts); `campaign.ts` loads the data.
 */

export interface Tier {
  id: string;
  price: number;
  title: string;
  limitPerLanguage: number | null;
  now: string[];
  later: string[];
}

export interface BuiltItem {
  title: string;
  body: string;
}

export interface Sample {
  word: string;
  lines: string[];
  picture?: string;
}

export interface Screenshot {
  src: string;
  alt: string;
}

/** A tier's name in one language's campaign, with its English meaning when it isn't English. */
export interface TierName {
  name: string;
  meaning?: string;
}

export interface Language {
  slug: string;
  name: string;
  who: string;
  goal: number;
  promise: string;
  roots: string | null;
  forFun: string | null;
  builtIntro: string;
  built: BuiltItem[];
  samplesIntro: string;
  samples: Sample[];
  buys: string[];
  screenshot: Screenshot | null;
  /** Per-tier names for this language; a tier without one uses its generic title. */
  tierNames?: Record<string, TierName>;
  pledgeLinks: Record<string, string>;
  raised: number;
  backers: number;
}

export interface Campaign {
  campaignId: string;
  currency: string;
  siteBaseUrl: string;
  /** ISO date (YYYY-MM-DD). Null until the owner sets it; no pledge opens without one. */
  closesOn: string | null;
  tiers: Tier[];
  languages: Language[];
}

export const BACK_HUB_PATH = "/gloss/back/";
export const BACKER_PRIVACY_PATH = "/gloss/back/privacy/";
export const TERMS_PATH = "/gloss/terms/";
export const SUPPORT_EMAIL = "support@tinykite.co";
export const TESTFLIGHT_URL = "https://testflight.apple.com/join/f796KSxZ";
export const PLAY_TESTING_URL = "https://play.google.com/apps/testing/co.tinykite.gloss";
/** Days we promise to refund within when a language misses its goal; must match the terms. */
export const REFUND_DAYS = 14;

/** Throws at build time, so a malformed campaign file never ships. */
export function validateCampaign(campaign: Campaign): Campaign {
  const tierIds = new Set(campaign.tiers.map((tier) => tier.id));
  for (const language of campaign.languages) {
    if (language.goal <= 0) throw new Error(`${language.slug}: goal must be positive`);
    for (const tierId of [...Object.keys(language.pledgeLinks), ...Object.keys(language.tierNames ?? {})]) {
      if (!tierIds.has(tierId)) throw new Error(`${language.slug}: unknown tier ${tierId}`);
    }
    for (const link of Object.values(language.pledgeLinks)) {
      if (link && !link.startsWith("https://")) throw new Error(`${language.slug}: pledge link must be https`);
    }
  }
  if (campaign.closesOn && Number.isNaN(Date.parse(campaign.closesOn))) {
    throw new Error(`closesOn is not a date: ${campaign.closesOn}`);
  }
  return campaign;
}

/** What this language calls a tier: its own name if it has one, else the generic title. */
export function tierName(language: Language, tier: Tier): TierName {
  return language.tierNames?.[tier.id] ?? { name: tier.title };
}

export function dollars(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

/** "11 December 2026", the way the terms write dates. */
export function closingDateText(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The link for one tier, or null while that pledge can't be taken. The terms
 * promise every language a closing date, so a link alone is not enough.
 */
export function pledgeLink(language: Language, tierId: string, closesOn: string | null): string | null {
  const link = language.pledgeLinks[tierId];
  return link && closesOn ? link : null;
}

export function isOpen(language: Language, closesOn: string | null): boolean {
  return Object.keys(language.pledgeLinks).some((tierId) => pledgeLink(language, tierId, closesOn) !== null);
}

/** Whole percent of the goal raised, capped at 100 so the bar never overflows. */
export function percentRaised(language: Language): number {
  return Math.min(100, Math.floor((language.raised / language.goal) * 100));
}

export function languagePath(language: Language): string {
  return `${BACK_HUB_PATH}${language.slug}/`;
}
