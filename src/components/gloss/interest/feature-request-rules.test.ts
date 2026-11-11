import test from "node:test";
import assert from "node:assert/strict";
import { buildFeatureRequestDraft, normalizeFeatureText, FEATURE_REQUEST_LIMIT, FEATURE_BENEFIT_LIMIT, FEATURE_PRODUCTS } from "./feature-request-rules.ts";

test("an empty or whitespace-only request cannot create a draft", () => {
  for (const request of ["", " \n\t ", "\u0000\u0007"]) assert.equal(buildFeatureRequestDraft({ product: "gloss", request, benefit: "Useful" }, "support@example.com"), null);
});

test("every supported product is named correctly and optional benefits stay optional", () => {
  for (const [product, label] of Object.entries(FEATURE_PRODUCTS)) {
    const draft = buildFeatureRequestDraft({ product, request: "Let me choose words for practice.", benefit: "" }, "support@example.com")!;
    assert.equal(draft.subject, `TinyKite feature idea: ${label}`);
    assert.ok(draft.body.includes(`Product: ${label}`));
    assert.ok(!draft.body.includes("How it would help:"));
    assert.ok(draft.body.includes("not a confirmed feature"));
  }
});

test("unknown products fall back to the shared family category", () => {
  for (const product of ["<script>", "__proto__", "constructor", ""]) {
    const draft = buildFeatureRequestDraft({ product, request: "Help families read together.", benefit: "Across devices." }, "support@example.com")!;
    assert.equal(draft.subject, `TinyKite feature idea: ${FEATURE_PRODUCTS.family}`);
    assert.ok(draft.body.includes("How it would help:\nAcross devices."));
  }
});

test("normalization preserves paragraphs, removes controls and enforces both limits", () => {
  assert.equal(normalizeFeatureText(" \u0000hello\r\nworld\rnext\u007f ", 100), "hello\nworld\nnext");
  const draft = buildFeatureRequestDraft({ product: "nesta", request: "A".repeat(FEATURE_REQUEST_LIMIT + 1), benefit: "B".repeat(FEATURE_BENEFIT_LIMIT + 1) }, "support@example.com")!;
  assert.ok(draft.body.includes("A".repeat(FEATURE_REQUEST_LIMIT)));
  assert.ok(!draft.body.includes("A".repeat(FEATURE_REQUEST_LIMIT + 1)));
  assert.ok(!draft.body.includes("B".repeat(FEATURE_BENEFIT_LIMIT + 1)));
});

test("user text cannot add mail recipients or email query fields", () => {
  const request = "More Māori words &bcc=other@example.com?subject=changed #yes";
  const draft = buildFeatureRequestDraft({ product: "gloss", request, benefit: "Use familiar words." }, "support@example.com")!;
  const url = new URL(draft.href);
  assert.equal(url.pathname, "support@example.com");
  assert.deepEqual([...url.searchParams.keys()], ["subject", "body"]);
  assert.ok(url.searchParams.get("body")!.includes(request));
});
