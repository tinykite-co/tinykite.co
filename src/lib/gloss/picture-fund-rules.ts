/** One-off rewards, never recurring Stripe subscriptions. */
export interface Reward { id: string; price: number; title: string; months: number; households: number; benefits: string[]; }
/** A single shared funding target; regional languages are estimates, not separate funds. */
export interface PictureFund { campaignId: string; currency: string; status: string; goal: number; coverageGoal: string; tiers: Reward[]; languages: { slug: string; name: string; pledgeLinks: Record<string, string>; raised: number; backers: number }[]; }
/** Fail the build if configuration could misrepresent rewards or publish test checkout. */
export function validatePictureFund(fund: PictureFund): PictureFund {
  if (fund.languages.length !== 1 || fund.languages[0]?.slug !== "picture-dictionary") throw new Error("Exactly one shared dictionary fund is required");
  if (!["preview", "open"].includes(fund.status)) throw new Error("Unknown campaign status");
  if (fund.currency !== "gbp" || fund.goal <= 0 || !fund.coverageGoal.trim()) throw new Error("Invalid funding budget");
  if (!fund.tiers.length || new Set(fund.tiers.map(tier => tier.id)).size !== fund.tiers.length) throw new Error("Unique reward tiers required");
  for (const tier of fund.tiers) {
    if (!Number.isInteger(tier.price) || tier.price <= 0 || tier.months < 0 || tier.households < 0) throw new Error("Invalid reward");
    if ((tier.months === 0) !== (tier.households === 0)) throw new Error("Membership reward must specify duration and households");
    if (fund.status === "open" && !liveRewardLink(fund, tier.id)) throw new Error("Live checkout required for every open reward");
  }
  return fund;
}
/** Never expose sandbox links or any payment link while the campaign is in preview. */
export function liveRewardLink(fund: PictureFund, tierId: string): string | null {
  if (fund.status !== "open" || !fund.tiers.some(tier => tier.id === tierId)) return null;
  const link = fund.languages[0]?.pledgeLinks[tierId];
  if (!link) return null;
  try {
    const url = new URL(link);
    return url.origin === "https://buy.stripe.com" && /^\/[A-Za-z0-9]+$/.test(url.pathname) && !url.search && !url.hash ? link : null;
  } catch { return null; }
}
