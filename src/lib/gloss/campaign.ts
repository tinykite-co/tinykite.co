import raw from "../../data/gloss/campaigns.json";
import { validateCampaign, type Campaign } from "./campaign-rules";

/**
 * The Gloss language campaigns. `src/data/gloss/campaigns.json` is the one
 * source for every backing page and for the monorepo's Stripe script
 * (`scripts/gloss/pledge_links.py`), which writes `pledgeLinks`, `raised`
 * and `backers` back into it. Edit wording there, never in the pages.
 */
export const campaign: Campaign = validateCampaign(raw as Campaign);

export * from "./campaign-rules";
