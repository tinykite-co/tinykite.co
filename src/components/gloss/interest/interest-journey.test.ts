import test from "node:test";
import assert from "node:assert/strict";
import { advanceInterestJourney, optionalBackingLink } from "./interest-journey.ts";
import { interestPrefill, MAX_LANGUAGE_CHOICES } from "./interest-rules.ts";

test("a draft or fallback handoff never means interest was sent", () => {
  for (const event of ["draft-opened", "fallback-opened"] as const) {
    assert.equal(advanceInterestJourney("editing", event), "handoff");
    assert.equal(advanceInterestJourney("handoff", event), "handoff");
  }
});
test("only deliberate confirmation after handoff unlocks optional backing", () => {
  assert.equal(advanceInterestJourney("editing", "confirm-sent"), "editing");
  assert.equal(advanceInterestJourney("handoff", "confirm-sent"), "self-confirmed");
  for (const event of ["confirm-sent", "draft-opened", "fallback-opened"] as const) assert.equal(advanceInterestJourney("self-confirmed", event), "self-confirmed");
});
test("optional backing carries only normalized, encoded language preferences", () => {
  const href = optionalBackingLink(["spanish", "Spanish", "Māori", "A&B?message=private#fragment"]);
  const url = new URL(href, "https://tinykite.co");
  assert.equal(url.pathname, "/gloss/back/");
  assert.deepEqual([...url.searchParams.keys()], ["language", "language", "language"]);
  assert.equal(url.hash, "");
  assert.deepEqual(interestPrefill(url.search, []).languages, ["Spanish", "Māori", "A&B?message=private#fragment"]);
});
test("empty or excessive preferences produce a safe bounded backing link", () => {
  assert.equal(optionalBackingLink([" "]), "/gloss/back/");
  const url = new URL(optionalBackingLink(Array.from({length:20},(_,index)=>`Language ${index}`)), "https://tinykite.co");
  assert.equal(url.searchParams.getAll("language").length, MAX_LANGUAGE_CHOICES);
});
test("rendered preview prefix survives while stale query fields and hashes are removed", () => {
  const renderedHref = "http://localhost:8800/tinykite-campaign/gloss/back/?message=private&reward=old#fragment";
  const href = optionalBackingLink(["Welsh"], renderedHref);
  assert.equal(href, "http://localhost:8800/tinykite-campaign/gloss/back/?language=Welsh");
  assert.equal(optionalBackingLink([], href), "http://localhost:8800/tinykite-campaign/gloss/back/");
});
