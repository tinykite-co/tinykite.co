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

/** A published source a page cites; every number on a page names one. */
export interface Citation {
  label: string;
  url: string;
}

/** How many words in one chapter a child of [age] does not know yet. */
export interface ChapterRow {
  age: number;
  /** Median across the books measured. */
  unknownWords: number;
  /** The book with the fewest such words, and the most. */
  low: number;
  high: number;
  /** Share of a chapter's running words a child of this age already knows. */
  knownPercent: number;
}

/**
 * Our own measurement of new words per chapter, shared by every page that
 * tells the reading story so the numbers live in one place. Story text
 * refers to it with placeholders such as `{unknownWordsAt9}`.
 */
export interface ReadingEvidence {
  method: string;
  rows: ChapterRow[];
  notes: string[];
  caveat: string;
  citations: Citation[];
}

export interface StorySection {
  title: string;
  body: string;
  citations?: Citation[];
}

export interface ComparisonRow {
  traditional: string;
  gloss: string;
}

/**
 * The reading story an English page tells, in order: the moment a child
 * meets a word, the risk of handing over a phone, why a traditional
 * dictionary doesn't serve a child, pictures, depths, and practice.
 */
export interface Story {
  moment: StorySection;
  risk: StorySection;
  dictionary: StorySection & { rows: ComparisonRow[] };
  pictures: StorySection;
  depths: StorySection;
  practice: { title: string; today: string[]; next: string[] };
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
  /** The reading story; languages without one show only the campaign sections. */
  story?: Story;
  pledgeLinks: Record<string, string>;
  raised: number;
  backers: number;
}

/**
 * The language whose real build is the basis for every other language's cost
 * estimate. It is the only language another language's page may name.
 */
export interface CostReference {
  slug: string;
  /** What that language already has, in one sentence. */
  built: string;
  /** What has gone into it so far; null until the owner states it, and then nothing is shown. */
  investedUsd: number | null;
}

export interface Campaign {
  campaignId: string;
  currency: string;
  siteBaseUrl: string;
  /** ISO date (YYYY-MM-DD). Null until the owner sets it; no pledge opens without one. */
  closesOn: string | null;
  tiers: Tier[];
  languages: Language[];
  costReference: CostReference;
  readingEvidence: ReadingEvidence;
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
  validateCostReference(campaign);
  validateReadingEvidence(campaign.readingEvidence);
  for (const language of campaign.languages) {
    if (language.story) validateStory(language.slug, language.story, campaign.readingEvidence);
  }
  if (campaign.closesOn && Number.isNaN(Date.parse(campaign.closesOn))) {
    throw new Error(`closesOn is not a date: ${campaign.closesOn}`);
  }
  return campaign;
}

function validateCostReference(campaign: Campaign): void {
  const { slug, investedUsd } = campaign.costReference;
  if (!campaign.languages.some((language) => language.slug === slug)) {
    throw new Error(`costReference: unknown language ${slug}`);
  }
  if (investedUsd !== null && investedUsd <= 0) throw new Error("costReference: investedUsd must be positive");
}

function validateReadingEvidence(evidence: ReadingEvidence): void {
  if (evidence.rows.length === 0) throw new Error("readingEvidence: no rows");
  for (const row of evidence.rows) {
    if (!(row.low <= row.unknownWords && row.unknownWords <= row.high)) {
      throw new Error(`readingEvidence: age ${row.age} median is outside its range`);
    }
    if (row.knownPercent <= 0 || row.knownPercent > 100) {
      throw new Error(`readingEvidence: age ${row.age} known percent must be in (0, 100]`);
    }
  }
  validateCitations("readingEvidence", evidence.citations);
}

function validateCitations(where: string, citations: Citation[] = []): void {
  for (const citation of citations) {
    if (!citation.url.startsWith("https://")) throw new Error(`${where}: citation ${citation.label} must be https`);
  }
}

/** Every story string must fill: a typo'd placeholder fails the build, not the page. */
function validateStory(slug: string, story: Story, evidence: ReadingEvidence): void {
  const sections = [story.moment, story.risk, story.dictionary, story.pictures, story.depths];
  const texts = [
    ...sections.flatMap((section) => [section.title, section.body]),
    ...story.dictionary.rows.flatMap((row) => [row.traditional, row.gloss]),
    story.practice.title,
    ...story.practice.today,
    ...story.practice.next,
  ];
  for (const text of texts) fillEvidence(text, evidence);
  for (const section of sections) validateCitations(slug, section.citations);
}

const EVIDENCE_PLACEHOLDER = /\{(unknownWords|knownPercent)At(\d+)\}/g;

/**
 * Replaces `{unknownWordsAt9}` / `{knownPercentAt7}` with the measured
 * number for that age. Throws on an age with no row or any other `{…}`.
 */
export function fillEvidence(text: string, evidence: ReadingEvidence): string {
  const filled = text.replace(EVIDENCE_PLACEHOLDER, (_match, field: "unknownWords" | "knownPercent", age: string) => {
    const row = evidence.rows.find((candidate) => candidate.age === Number(age));
    if (!row) throw new Error(`readingEvidence has no row for age ${age}`);
    return String(row[field]);
  });
  if (/[{}]/.test(filled)) throw new Error(`unknown placeholder in: ${text}`);
  return filled;
}

/** Every language but the reference is priced from the reference, and says so. */
export function isPricedFromReference(language: Language, campaign: Campaign): boolean {
  return language.slug !== campaign.costReference.slug;
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
