import { WORLD_LANGUAGES } from "./languages.ts";

export const MAX_LANGUAGE_CHOICES = 8;
export const MAX_LANGUAGE_LENGTH = 80;
export const MAX_MESSAGE_LENGTH = 600;
export const INTEREST_ROLES = {
  reader: "A reader learning a language",
  parent: "A parent or carer",
  educator: "A teacher or librarian",
  reviewer: "A language speaker or content reviewer",
  credits: "Someone offering credits or images",
  backer: "A potential backer",
} as const;
export type InterestRole = keyof typeof INTEREST_ROLES;
/** Only grown-up preferences, never a child's name, age or account data. */
export interface InterestDraft { languages: string[]; role: InterestRole; message: string; rewardId: string; }
export interface InterestReward { id: string; title: string; price: number; }
export interface MailtoConfiguration { recipient: string; rewards: InterestReward[]; currency: string; mode?: "reader" | "backer"; }

/** Normalize a language label for safe display and email composition. */
export function normalizeLanguage(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_LANGUAGE_LENGTH);
}
/** Fold accents for search without changing the user's displayed language. */
export function searchableLanguage(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}
/** Search uses the visible label and accepts unlisted varieties separately. */
export function matchingLanguages(query: string): string[] {
  const search = searchableLanguage(query.trim());
  return WORLD_LANGUAGES.filter(language => searchableLanguage(language).includes(search));
}
/** Keep preference order while removing blanks, duplicates and excessive values. */
export function uniqueLanguages(values: string[]): string[] {
  const selected = new Map<string, string>();
  for (const value of values) {
    const normalized = normalizeLanguage(value);
    const language = WORLD_LANGUAGES.find(candidate => searchableLanguage(candidate) === searchableLanguage(normalized)) ?? normalized;
    if (language && !selected.has(searchableLanguage(language))) selected.set(searchableLanguage(language), language);
  }
  return [...selected.values()].slice(0, MAX_LANGUAGE_CHOICES);
}
/** Prefill is untrusted URL data and cannot create a reward or send a message. */
export function interestPrefill(query: string, rewardIds: string[]): Pick<InterestDraft, "languages" | "rewardId"> {
  const parameters = new URLSearchParams(query);
  const rewardId = parameters.get("reward") ?? "";
  return { languages: uniqueLanguages(parameters.getAll("language")), rewardId: rewardIds.includes(rewardId) ? rewardId : "" };
}
/** Build an email draft only. Calling this never submits, reserves or charges. */
export function buildInterestMailto(draft: InterestDraft, configuration: MailtoConfiguration): string {
  const reward = configuration.mode === "reader" ? undefined : configuration.rewards.find(candidate => candidate.id === draft.rewardId);
  const subject = reward ? `Gloss backing interest: ${reward.title}` : "Gloss: expression of interest";
  const role = INTEREST_ROLES[draft.role] ?? INTEREST_ROLES.reader;
  const languageNames = uniqueLanguages(draft.languages);
  const preferences = languageNames.length ? languageNames.join(", ") : "No preference yet";
  const rewardLine = reward ? `${reward.title} (${configuration.currency.toUpperCase()} ${reward.price}, proposed one-off reward)` : "No reward chosen";
  const rewardDetails = configuration.mode === "reader" ? [] : [`Backer reward: ${rewardLine}`];
  const body = ["Hello TinyKite,", "", "I’d like to express interest in Gloss.", `I'm here as: ${role}`, `Languages / regional varieties: ${preferences}`, ...rewardDetails, "", draft.message.trim().slice(0, MAX_MESSAGE_LENGTH), "", "I understand this is interest only, not a payment or reward reservation. Language choices express preferences, not earmarked funding."].join("\n");
  return `mailto:${configuration.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
