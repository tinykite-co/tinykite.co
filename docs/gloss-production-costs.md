# Gloss campaign: production cost model

Research date: 11 November 2026. USD unless explicitly marked GBP. These are planning scenarios, not supplier quotations, measured run costs, a confirmed funding target, or a promise of complete Year 13 coverage. No paid generation was performed. Companion inputs and calculated outputs: [production-cost assumptions](gloss-production-cost-assumptions.json). Inventory evidence: [vocabulary audit](gloss-vocabulary-audit.md). The public calculator uses [production-cost configuration](../src/data/gloss/production-costs.json).

## What the campaign is funding

Fund a reusable, reviewed picture dictionary, with context-sensitive meanings and optional links to a reader's home language. The production unit is a **meaning**, and sometimes multiple picture panels for that meaning—not a headword. Pictures can be reused across languages when culturally appropriate. Translations, examples and pronunciation need their own language review. Real motion clips are a separate stretch goal; for abstract words, idioms and difficult distinctions, an honest explanation or contrast is better than a misleading literal picture.

The largest external model bill in the proposed core is image generation. However, with paid human review, editorial work is likely the largest total cost. Do not suggest that every pound goes to an image API or that AI verification alone proves content has been vetted by an educator.

## Measured scope and important uncertainty

The vocabulary agent measured the local `gloss-content` snapshot at commit `cc95c34c21` (11 September 2026): 30,714 English headwords, 88,741 meanings, 85,360 depictable meanings; 30,282 single-picture intents, 18,574 contrast-picture intents and 36,504 motion intents. There are 3,381 non-depictable meanings. Although 1,231 entries reference picture media, just 124 published entries have a published picture marked verified. The local manifest also references 12,200 missing files. Consequently **no existing images are subtracted from this budget**; an asset and editorial audit can reduce it later.

A cached production headword index fetched earlier on 11 November contains 63,265 distinct rows. It does not contain meaning/media counts. Applying the older snapshot's mix to that index is a sensitivity calculation, not a measured inventory. Neither number establishes all words appearing in books through Year 13: there is not yet an agreed book corpus or a coverage audit.

Picture panels `P = single meanings + 2 × contrast meanings + k × motion meanings`, where k is 1, 2 or 3 still panels. That gives 103,934 / 140,438 / 176,942 panels. These static treatments for motion need pedagogical review; some actions will require actual motion to be taught accurately.

Repository inspection: `mobile-apps/gloss/generate_pipeline.py` currently generates two separate images for comparisons, attempts four-second Veo video for motion, and falls back to three pictures. Image attempts escalate to Pro on the third attempt; three regeneration passes can consume nine renders for a difficult panel. Thus the campaign's pictures-first, video-optional plan is a change in production priority, not a description of existing pipeline behavior. Read `mobile-apps/gloss/docs/strategy.md` before implementing that change.

## Verified provider inputs

Current global Google rates: Gemini 3.1 Flash Image 1K output is 1,120 image tokens × $60/million = $0.0672; batch is $0.0336. Gemini 3 Pro Image 1K/2K is $0.1344. Flash image input costs $0.50/million tokens. Gemini 2.5 Flash-Lite verification costs $0.10/million input and $0.40/million output tokens. Lite Image batch offers a $0.0168 1K alternative, but quality and pipeline compatibility have not been benchmarked. [Google Cloud model pricing](https://cloud.google.com/model-garden/pricing)

Cloud Translation NMT charges $20/million source characters for each target language beyond allowances. Treat this as a drafting comparator, not a reviewed dictionary service. [Google translation pricing](https://cloud.google.com/products/translate/pricing)

R2 Standard storage costs $0.015/GB-month; Class A operations $4.50/million, Class B $0.36/million, with no direct Internet egress charge. Free allowances are not included in this model. [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/)

## Core pictures: transparent low / working / difficult scenarios

All three scenarios cover the same local snapshot, but differ in picture treatment, paid render count and editorial effort. Human time/rates and retry distributions below are **explicit planning assumptions**, not industry rates or measured pipeline performance. They must be calibrated with a mixed sample of concrete, abstract, polysemous and culturally sensitive meanings before a monetary funding promise.

| Input or result | Lean | Working | Difficult |
|---|---:|---:|---:|
| Motion still panels | 1 | 2 | 3 |
| Total panels | 103,934 | 140,438 | 176,942 |
| Mean Flash renders per final panel | 1.2, batch | 1.5, standard | 2, standard |
| Mean Pro renders per final panel | 0 | 0.15 | 0.8 |
| Image-output API spend | $4,191 | $16,987 | $42,806 |
| Prompt and automated-verification allowance | $104 | $281 | $708 |
| Review minutes per meaning | 0.5 | 1.5 | 3 |
| Reviewer assumed hourly cost | $20 | $30 | $40 |
| Editorial review allocation | $14,790 | $66,556 | $177,482 |
| Subtotal | $19,085 | $83,824 | $220,996 |
| Uncertainty reserve | 15% | 20% | 30% |
| Total planning allocation | **$21,947** | **$100,589** | **$287,294** |

Formula: `image spend = P × (Flash renders × Flash price + Pro renders × Pro price)`; `review = meanings × minutes / 60 × hourly rate`; `allocation = (image spend + prompt/verification allowance + review) × (1 + reserve)`.

Prompt/verification allowances are $0.001 / $0.002 / $0.004 per final panel. A reference Flash render with 500 prompt tokens and a verifier consuming 2,000 input and 300 output tokens costs about $0.00057 beyond image output. Allowances cover repeated checks and variation, but actual reasoning tokens and image inputs must be logged; these are not asserted usage measurements. Lexical authoring and specialist editorial commissioning are excluded, not assumed free. The current pipeline uses Claude Opus for authoring, which needs a separate token-metered budget once the missing-entry scope is defined.

For scale, **1,000 final panels cost approximately $40 / $121 / $242 in image output alone** under these scenarios; review is separately **$167 / $750 / $2,000 per 1,000 meanings**. Hard words can require substantially more expert work than these averages. Three complete failed passes with two Flash and one Pro render per pass cost $0.8064 per panel in image output alone, before labor; the difficult scenario is not an absolute ceiling.

The speculative 63,265-headword extrapolation is 2.0598 times the snapshot: about **$45,208 / $207,194 / $591,772**, including the assumed review and reserve. Do not put those figures on the page as a commitment to every Year 13 word. A cheaper model or donated expert time reduces cash cost; it does not remove the work or establish completeness.

## Each language: draft, review, cultural adaptation

The vocabulary agent measured Python Unicode character lengths, excluding prompts, JSON and output: labels 1,406,191; all four depths of definitions 37,773,171; examples 36,807,420; synonyms/antonyms 3,443,029; headwords once 266,433. Core labels + definitions + examples total **75,986,782 characters**, around 856 per meaning.

Two scopes must remain distinct:

1. **Mother-tongue bridge:** a sense-specific equivalent and short disambiguation linking to the English explanation and reusable pictures. Raw label translation would cost only $28 per language at the above rate, but that ignores the context needed to choose the correct equivalent. It is not a production estimate.
2. **Full instructional localization:** all four explanation depths and examples. A single NMT drafting pass over the measured core costs **$1,520 per target language**. Synonyms/antonyms add about $69 if translated mechanically, but local synonym choice should be authored and checked rather than copied blindly.

Illustrative full-core per-language budget:

| Input or result | Lean | Working | Difficult |
|---|---:|---:|---:|
| Draft-equivalent passes over 75.99M chars | 1 | 1.5 | 2 |
| Translation draft API allocation | $1,520 | $2,280 | $3,039 |
| Native review allocation, same time/rate assumptions above | $14,790 | $66,556 | $177,482 |
| Subtotal before adaptation, setup and reserve | **$16,310** | **$68,835** | **$180,521** |

Formula for any selected slice: `draft = meaning count × measured source chars/meaning × target languages × repeat factor × $20 / 1,000,000`; `native review = meaning count × review minutes / 60 × reviewer hourly cost`. Use actual per-language reviewer quotes and actual translated payload before setting a goal. A context-aware LLM draft may cost differently; do not present NMT's mechanical character rate as the chosen production architecture.

Every language additionally needs decisions on locale, script/romanization, dialect, right-to-left presentation where relevant, pronunciation coverage, gloss length and cultural substitutions. Add `language setup hours × local expert rate` and `culture-specific panels × accepted-panel cost` explicitly. The current data does not establish those values. Existing pictures should be shared across languages by default; never multiply the entire image budget by the language count.

Worldwide scope should mean an open language preference field with searchable suggestions and a free-text option, not a promise that every requested language has equal model support or identical review cost. Show interest counts separately from money raised. Supporters can select a language to help prioritize recruitment and localization; do not imply their payment is ring-fenced unless accounting and refund rules implement that promise.

## Optional real-motion stretch goal

Veo 3.1 Fast at 720p costs $0.08 per generated second without audio or $0.10 with audio. Cloudflare's official model page explicitly defines the per-second unit; Google Cloud lists matching numerical rates but renders the unit as “count”. These are provider list prices; verify the selected SKU before a production run. [Veo Fast pricing and parameters](https://developers.cloudflare.com/ai/models/google/veo-3.1-fast/), [Google Cloud pricing](https://cloud.google.com/model-garden/pricing)

For the snapshot's 36,504 motion meanings and four-second clips, generation-only spend is `36,504 × 4 × $0.08 × attempts`: **$11,681 / $23,363 / $35,044** at one/two/three attempts. Audio-enabled clips cost **$14,602 / $29,203 / $43,805**. Review, editing, encoding, retention, and any failed-video still fallback are additional. A focused 1,000-motion-meaning milestone costs $320 / $640 / $960 without audio before those additions. The pipeline does not explicitly set resolution or audio mode, so it must set them and meter returned usage before relying on the silent-720p figure.

Do not replace action videos with a slideshow and describe it as motion. Budget video only after the core picture explanations have passed teaching-quality checks.

## Pronunciation and delivery

The strategy's prior measured headword recording consumed 26 audio tokens on average. At Gemini 2.5 Flash TTS's published $10/million audio output tokens, 30,714 spoken forms would be **about $8 output-only** for one pass; 63,265 would be about $16.45. These are a narrow illustration, not the cost of complete pronunciation coverage: heteronyms, alternate forms, TTS input, retries, ASR checks, supported voices and native listening are additional. Verify the current Vertex TTS SKU separately before production. [Gemini TTS rate card](https://aistudio.google.com/docs/pricing)

At an assumed 200 kB delivered still per panel, the working 140,438-panel set is about 28.1 GB, roughly **$0.42/month** in R2 Standard storage. Retaining two 1 MB candidates per panel adds about 281 GB, or $4.21/month. Ten million uncached object reads add $3.60; one million writes add $4.50. Workers, database, transforms, analytics and application hosting are outside those object-storage figures. Multiply sizes by measured exports, not raw generated resolutions; the campaign should not promise a fixed infrastructure bill without audience/load assumptions.

## Subscription capacity, contributed credits, and cash

Supported built-in image generation can use subscription allowance without an API key. Official OpenAI documentation says it counts toward general Codex limits and consumes those limits roughly three to five times faster than similar non-image turns; it directs larger batches to API usage. No fixed image quota or guaranteed free corpus production can be inferred from the user's plan. [OpenAI image-generation documentation](https://learn.chatgpt.com/docs/image-generation)

Use subscription-assisted generation for bounded supervised batches, prototypes and volunteer contributions. Only reduce the cash budget after usable, reviewed assets exist. Ask interested cloud-credit sponsors and reviewers to contact TinyKite; accept credits through provider-supported grants or sponsorship arrangements, not shared account passwords or personal keys. Track expiration, provider/model restrictions and eligible spend. A $1,000 provider credit is not $1,000 of freely transferable cash and does not pay reviewer invoices.

For future cash collection, current Stripe UK standard-card processing is 1.5% + £0.20; EEA 2.5% + £0.20; international 3.15% + £0.20; currency conversion can add 2%. Example: a £50 standard-UK-card contribution leaves £49.05 before other costs/taxes/refunds. [Stripe UK pricing](https://stripe.com/gb/pricing)

Keep USD production estimates separate from GBP supporter prices until a documented conversion date/rate is selected. Do not subtract hypothetical credits, free tiers or volunteer labor from the public target. At this stage the requested interest/backer page should say no payment is collected, use estimated cost ranges, explain planned discounted access without inventing a binding price, and promise a detailed campaign budget after the corpus and review pilot are measured.

## Recommended evidence before a binding monetary goal

Run a budget-capped sample spanning 1,000 meanings, including concrete vocabulary, motion, contrasts, polysemy, secondary-school science/humanities terms, idioms and hard abstract words. Record accepted assets, rejected candidates, actual model tokens/cost, minutes of expert review and learner comprehension—not just whether an API returned an image. Sample at least one right-to-left and one non-Latin-script language with native reviewers. Establish the book/curriculum corpus and deduplicated meaning list. This converts the transparent assumptions above into measured unit economics while keeping the current interest page honest.
