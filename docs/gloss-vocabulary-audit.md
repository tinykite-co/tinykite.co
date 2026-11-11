# Gloss campaign: vocabulary scope and measured content inventory

Measured 11 November 2026. Read-only research; no images generated, product files changed, or paid services called. See the companion [production-cost model](gloss-production-costs.md) for formulas, assumptions and provider sources.

## Recommendation for the public promise

“Help us build a picture dictionary for the words young people encounter from their first books through Year 13 — including difficult ideas, different meanings, and links to the languages spoken at home.”

This is an ambition, not a claim of completed coverage. Do not cap the project at 5,000 words. Equally, do not claim that any current headword total is literally every word in every book. There is no agreed reading corpus yet, and books, names, technical terms, historical senses, idioms and new editions keep changing the boundary. Publish measured coverage against a named reading corpus and an ongoing missing-word process.

## Inventory actually measured

Source: the separate `gloss-content` repository, clean checkout at `cc95c34c21`, commit dated 11 September 2026. This is an older versioned CMS snapshot, **not a fresh production export**. The research used local diagnostic artifacts named `gloss-inventory.py` and `gloss-content-inventory.json`; those temporary artifacts are not included in this documentation snapshot. The measured results are recorded below.

| en-GB snapshot measure | Count |
| --- | ---: |
| Headword documents | 30,714 |
| Meaning entries | 88,741 |
| Published entries | 88,538 |
| Held for review / draft | 189 / 14 |
| Entries marked depictable | 85,360 |
| Entries with a picture record | 1,231 |
| Distinct headwords with a picture record | 1,007 |
| Published entries with a published, verified picture flag | 124 |
| Picture intent / contrast-picture intent | 30,282 / 18,574 |
| Motion intent | 36,504 |
| No-media / null intent | 45 / 3,336 |

“Published” and `verified=true` are database flags; neither proves independent human educational review. Entry provenance can be automatic model generation. The asset manifest contains 6,010 records (5,138 audio, 658 picture, 214 motion); 12,200 referenced IDs across this snapshot are absent from the manifest. These counts therefore do not establish live usable image coverage, and cannot simply be subtracted from a production budget.

Other language snapshots are extremely small: hi-IN 10 headwords/10 entries; ta-IN 2/2; te-IN 2/2; en-US 2/2. Those are snapshot counts, not an assertion that production contains only these languages or entries.

A separate cached production search index, `gloss-live-index.json` (local diagnostic cache, not included here), modified 11 November at 03:12:50 local time, contains **63,265 distinct en-GB headword rows**. It includes phrases, but has no per-meaning media or review data. This was inspected from disk, not freshly downloaded. It supports “observed indexed headwords,” not “63,265 fully illustrated and vetted words.”

The small bundled `gloss.db` is a historical sample (213 words / 738 definitions); it must not be used to represent full coverage.

## Workload scenarios: meanings and panels, not just words

The local snapshot has **2.889 meanings per headword** (88,741 / 30,714). Older documentation records a different 4.69 ratio from a different corpus; do not mix that historical ratio with this inventory. The current schema correctly needs media, pronunciation and translations at meaning level.

For example, *duck* has eight entries in this snapshot: bird, lowering the head, putting under water, avoiding a duty, a cricket score, cloth, affectionate address and meat. One duck photograph does not teach all eight. *Bank* likewise has eight senses. Inflected forms should resolve to their relevant root and meaning, not automatically demand duplicate illustrations. Running as a noun/adjective can require a distinct meaning. Idioms and phrases need their own treatment.

For a still-image-first campaign, use these transparent planning assumptions:

`panels = 30,282 single-picture meanings + 2 × 18,574 contrast meanings + k × 36,504 motion-intent meanings`

| Scenario | Still panels for each motion-intent meaning | Panels on measured 30,714-headword snapshot | Projection to 63,265 indexed headwords |
| --- | ---: | ---: | ---: |
| Lower | 1 | 103,934 | 214,084 |
| Central | 2 | 140,438 | 289,276 |
| Higher | 3 | 176,942 | 364,467 |

The projection holds the observed meaning/media mix constant, which may be wrong for rarer advanced words. These are required accepted panels before failed generations, editorial rejection, retries, alternative cultures, accessibility, layout, storage and serving costs. No existing-asset credit is taken because acceptance and mapping are unverified. Two contrast panels are two renders in the existing pipeline. A short sequence can teach action without video, but this must be validated pedagogically. The classifications themselves need review; not every abstract word benefits from a literal picture.

There is no defensible measured total for complete Year 13 coverage yet. For budget sensitivity, a further 25% corpus-expansion reserve can be applied explicitly to any scenario; it is a reserve, not evidence that 25% more entries will finish the job. Regional translations should reuse culturally appropriate pictures of the same concept when possible and pay for additional variants where necessary.

## Translation source volume

Measured Unicode character counts over the 88,741 English entries (not bytes or model tokens):

| Source content | Characters |
| --- | ---: |
| Meaning labels | 1,406,191 |
| Definitions across reading tiers | 37,773,171 |
| Examples across reading tiers | 36,807,420 |
| Labels + definitions + examples | **75,986,782** |
| Synonym and antonym strings | 3,443,029 |
| Headword spelling once per document | 266,433 |

Full instructional translation is much larger than adding one mother-tongue equivalent to each meaning. State which service the campaign buys. A useful first language milestone is reviewed meaning-level equivalents, pronunciation where needed, and example/context notes for imperfect matches. An expanded milestone can translate the complete tiered explanations. Tokenisation, target-script length, prompts, verification and human linguistic review are additional costs. One English meaning does not necessarily map one-to-one to one foreign word; dialects, scripts, inflection and cultural appropriateness require native-speaker review.

## Difficult words: teach the idea honestly

The snapshot already has entries for these, but no picture media records were found on their entries. Existing metadata is generated and is not an editorial acceptance record.

| Word | Useful illustration direction | What an optional video adds |
| --- | --- | --- |
| inference | Wet umbrella and puddle as clues; a caption connects them to a conclusion about rain | Show evidence arriving before a conclusion; distinguish inference from certainty |
| ambiguous | One situation with two plausible interpretations; label both readings | Reveal different interpretations over time; narration remains necessary |
| resilient | Separate elastic-material and recovering-from-difficulty senses; compression/recovery contrast | Show recovery after the force or setback ends |
| equilibrium | Balanced forces, with a labelled diagram where appropriate | Dynamic equilibrium needs ongoing equal processes, not a frozen “nothing happens” picture |
| irony | A captioned expectation/result contrast | Timing and a short story can make the contrast intelligible; mere surprise is not sufficient |
| sanction | Two explicitly separate entries: permission and penalty | Context makes the opposite uses clearer; never collapse into a single generic scene |

Idioms such as *under the weather* must not be taught with a misleading literal weather picture. Connectives such as *because* may need a cause-and-effect diagram and sentence, or no picture. Pictures are learning aids, not proof that a single scene exhausts a meaning. Every scene needs an age-appropriate explanation, accessible alternative text, and review of whether learners infer the intended meaning.

## Existing illustration candidates for the campaign

No local image was found for the requested abstract examples such as *reluctant*, *inference*, *ambiguous*, *resilient*, *irony* or *equilibrium*. Four actual picture files can demonstrate the equally important problem of familiar words with unexpected meanings. Each was visually inspected and matched against **its own bundled metadata** in `mobile-apps/gloss/assets/reader/demo_bundle_v5.json` in the inspected Gloss build checkout.

Build-relative media directory: `mobile-apps/gloss/build/web/assets/assets/reader/media/`. These are diagnostic build paths, not public asset URLs.

| File | Meaning visible and bundled label | Review/provenance caution |
| --- | --- | --- |
| `nose__s2__single.jpg` | Airplane front; “Front of vehicle” | Older CMS agrees and marks published/verified, but entry provenance is auto-generated; no human-review evidence found |
| `ear__s2__single.jpg` | An ear of maize; “Part of corn” | Older CMS agrees and marks published/verified; no human-review evidence found |
| `mouth__s2__single.jpg` | River joining the sea; “River opening” | Modern bundle matches the image; older CMS rank2 says opening generally, rank3 is river end. Do not transfer review flags across versions |
| `sound__s4__single.jpg` | Sea inlet/coastal waterway; “Body of water” | Modern bundle matches the image; older CMS rank4 labels healthy/undamaged. This is observed snapshot rank drift, not an established production defect |

Suitable public label: “Existing illustration examples.” Do not call these independently vetted until an identified reviewer checks the final picture, meaning, text and stable entry identifier together. Any new hard-word scene created only for the campaign should be labelled “Concept illustration,” not represented as completed dictionary content. Avoid exposing mutable rank-based IDs as evidence of semantic identity.

## What must be measured next

1. Export a consistent current production inventory: stable meaning IDs, published content, asset hashes, model/source licences, human reviewer and date, accessibility and age suitability. Reconcile orphan references and reused assets.
2. Define a legally usable, versioned reading corpus spanning first readers, primary, secondary and Year 13 fiction/nonfiction, contemporary and older works, and more than one English region. Record additions and omissions instead of implying a fixed universal book list.
3. Measure exact-token coverage, normalised headword/form coverage, phrase coverage, and contextually correct meaning coverage separately. A present headword does not establish that the book's meaning is covered.
4. Prioritise missing high-frequency and high-confusion meanings, then abstract, scientific, literary and historical vocabulary; reserve an explicit process for proper names, offensive/historical usage and age-sensitive contexts.
5. Run a stratified editorial pilot across concrete nouns, verbs, adjective contrasts, abstract words, polysemes, idioms and language pairs. Record accepted panels per meaning, attempts, reviewer minutes and comprehension failures. Replace scenario multipliers with those measurements before accepting a fixed all-coverage funding promise.

Sources inspected locally: authoritative `CLAUDE.md`; `mobile-apps/gloss/AGENTS.md`; Gloss strategy/requirements/decision log; `mobile-apps/gloss/docs/language-quirks.md`; `mobile-apps/gloss/tool/coverage_set.py`; existing generation/import pipeline and content metadata. The report is an inventory and planning model, not a claim of final editorial completeness.
