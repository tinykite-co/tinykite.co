import { uniqueLanguages } from "./interest-rules.ts";

/** This tracks the visitor's actions, never email delivery or server receipt. */
export type InterestJourney = "editing" | "handoff" | "self-confirmed";
export type InterestJourneyEvent = "draft-opened" | "fallback-opened" | "confirm-sent";

/** Optional backing appears only after an explicit confirmation following handoff. */
export function advanceInterestJourney(state: InterestJourney, event: InterestJourneyEvent): InterestJourney {
  if (state === "self-confirmed") return state;
  if (event === "draft-opened" || event === "fallback-opened") return "handoff";
  return state === "handoff" ? "self-confirmed" : state;
}

/** Carry only bounded language preferences; never message text or account details. */
export function optionalBackingLink(languages: string[], renderedHref = "/gloss/back/"): string {
  const parameters = new URLSearchParams();
  uniqueLanguages(languages).forEach(language => parameters.append("language", language));
  const query = parameters.toString();
  const destination = renderedHref.split(/[?#]/, 1)[0] || "/gloss/back/";
  return `${destination}${query ? `?${query}` : ""}`;
}
