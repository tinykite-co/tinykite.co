# Gloss shared campaign — 11 November 2026

Owner direction: one picture-dictionary fundraiser, regional languages as additional
cost estimates, Kickstarter-style rewards, and one household plan across Nesta,
Gloss and future TinyKite apps. Beta remains free.

## Public configuration

- `/gloss/back/`: the shared campaign, goals, rewards, language estimates and offers of credits/review.
- `/pricing/`, `/family/`, campaign: share `src/components/family/FamilyPlan.astro`
  and `src/data/family/plan.ts`. Planned £4.99/month or £49/year; no beta charge.
- `src/data/gloss/picture-campaign.json`: one funding target (`picture-dictionary`),
  GBP one-time rewards. The `languages` array is a compatibility boundary for the
  recovered Stripe script, not separate language funds.
- Legacy `campaigns.json` now supplies language expansion content only. Its tiers
  and payment URLs are empty. Existing language URLs remain useful and indexed.
- Budget figures are planning allowances carried forward from the previous draft,
  not validated quotations. The foundation is a £10,000 working target for 5,000
  pictured English words; language estimates remain explicitly USD, not converted.

## Payment launch remains closed

`status: preview` suppresses all checkout links, including sandbox links. Contact
links do not reserve rewards. Production needs the existing SOPS file rewrapped to
the current authorized recipients; the local production identity cannot decrypt it.
Sandbox keys work. Do not publish sandbox URLs or open the campaign just because
Stripe objects exist.

Before opening: state delivery estimates and cancellation/refund terms, implement
and test verified-payment reward fulfillment (including gifted households and the
membership start after beta), validate the live key, sync the single campaign,
then set status to open. A return to a thank-you page is not proof of payment.

Recovered CLI: monorepo `scripts/gloss/pledge_links.py`; test suite in
`scripts/gloss/tests/`. Supply the new picture-campaign file, not the retired
language-campaign file. Keep decrypted keys only in process memory/environment.
Sandbox configuration was tested from a separate temporary copy; no test URLs in
public source. Live creation has not run.

## Subscription-based content production

Confirmed locally: `codex login status` reports ChatGPT authentication. Official
OpenAI documentation supports local subscription access without an API key:
https://learn.chatgpt.com/docs/auth
https://learn.chatgpt.com/docs/pricing

Use supervised authoring sessions to draft batches of meanings, examples and image
briefs. Image generation, when available in the subscription, shares usage limits
and consumes them faster. This is not an unlimited production API or permission to
bypass limits. No API-key-backed generation was run for this change.

Suggested editorial workflow:
1. Select missing high-use words and specific senses from the existing lexicon.
2. Draft explanations, examples and one picture brief per sense in this session.
3. Validate against Gloss's existing schema and language-quirks rules.
4. Generate candidate pictures using the supported image tool, in bounded batches.
5. Review meaning, depiction, child suitability and provenance. Keep drafts out of
   the published catalog until review passes. Do not equate model checking with
   human approval.
6. For translations, add native-speaker review before publishing as finished.
7. Reuse the approved asset; never regenerate it for each learner lookup.

Contributors with spare credits should contact support, generate agreed briefs in
their own account where provider terms permit, and contribute outputs with clear
publication rights. Never solicit credentials or assume credits can be transferred.

## Verification

94 site tests and 45 Stripe tests passed; production Astro build succeeded.
Astro check reports the same 135 pre-existing errors on unchanged HEAD and this
revision; no errors added by this change. Responsive browser checks are recorded
in the task. No real payment or paid entitlement has been claimed as tested.
