# Gloss shared campaign — 11 November 2026

Owner direction: one picture-dictionary fundraiser, regional languages as additional
cost estimates, Kickstarter-style rewards, and one household plan across Nesta,
Gloss and future TinyKite apps. Beta remains free.

## Public configuration

- `/gloss/interest/`: real-screen silent walkthrough, existing practice and clearly
  labelled planned games, worldwide language preference form, family membership,
  and feature requests.
- `/gloss/back/`: shared dictionary goals, transparent cost explorer, proposed
  discounted rewards, language choices, Gloss/Nesta membership and feature requests.
- `/pricing/` redirects to express interest. There is no standalone pricing offer.
- One household subscription includes Gloss, Nesta and future TinyKite family
  products. Beta remains free. Nesta is described as a household-first messenger
  with specific adult-approved contacts, not an absolute safety guarantee.
- `src/data/gloss/picture-campaign.json`: GBP one-time reward proposals. Founding
  family £39 vs planned £49 for its first paid year; two households £78 vs £98.
  Included years begin after beta, with no automatic renewal. The `languages`
  array is legacy Stripe CLI compatibility, not individual fundraising pots.
- Funding goal is null in preview. The old arbitrary £10,000 target is removed.
  Scope is every word encountered in books through Year 13, subject to a defined
  reading corpus and coverage audit. See [vocabulary audit](gloss-vocabulary-audit.md).
- Interactive costs use the measured 88,741-meaning sample and explicit assumptions,
  in USD. Image attempts, paid review, translation and optional video are separated.
  See [production cost report](gloss-production-costs.md). These are not quotes or
  a confirmed fundraising target. No existing or donated assets are deducted.
- Existing language links redirect to the interest form with that preference filled.
- Interest and feature-request forms prepare an email draft with a selectable-copy
  fallback. Nothing is submitted until the person sends their email. The interest-first journey
  asks the visitor to confirm they have sent it, then offers optional backing; it
  cannot verify email delivery. No fake success
  state, contact database, child details or payment reservation.

## Actual product evidence

Walkthrough captures come from the production Flutter web app at 390 × 844 on
11 November 2026. They preserve the actual light app appearance, including missing
media outside the illustrated duck example. The surrounding page follows system
appearance with System/Light/Dark controls; screenshots are not recoloured mocks.
The book is an illustrative reading context, not an automatic book-import feature.

Flashcards and picture/meaning quizzes use saved lookups. Both quiz targets and
options come from the chosen reader's history; quiz meanings currently use the
word's leading meaning, so do not claim exact encountered-sense testing.
[Issue #611](https://github.com/tinykite-co/monorepo/issues/611) defines the planned
“Use words I've read” generator, under [#610](https://github.com/tinykite-co/monorepo/issues/610).
Crosswords and other games are planned, not shipped by this website change.

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

Validation evidence is recorded in the release commit and local test logs. The
site's pre-existing Astro type-check failures are outside this campaign; changed
campaign components must introduce none. No real payment, reward fulfilment or
native-store release is claimed as tested by this website change.

11 November release checks: 128 site unit tests and 8 built-page regressions passed;
Astro production build passed. Full Astro check retained its 135 existing errors,
with no errors in the changed campaign files. Browser checks covered 320/390px
phones, 820px tablet and 1280px desktop; light, dark and System controls; real
screen playback, pause and step controls; budget inputs; international/custom
language choices; reward prefill; feature draft validation; and interest-first
optional backing with language carryover. No email or payment was sent in QA.
