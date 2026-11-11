import { test } from "node:test";
import assert from "node:assert/strict";
import configuration from "../../../data/gloss/production-costs.json" with { type: "json" };
import { calculateProductionCosts, formatUsd, normalizeMeaningCount, selectScenario } from "./cost-model.ts";

test("measured snapshot produces reproducible working costs with no asset inventory subtraction", () => {
  const result = calculateProductionCosts(88741, "working", configuration);
  assert.equal(result.panels, 140438);
  assert.ok(Math.abs(result.images - 16987.38048) < 0.000001);
  assert.ok(Math.abs(result.automation - 280.876) < 0.000001);
  assert.equal(result.editorial, 66555.75);
  assert.ok(Math.abs(result.total - 100588.807776) < 0.000001);
  assert.equal(result.total, result.images + result.automation + result.editorial + result.reserve);
});

test("scenario panel treatments, reserve and video retries change independently", () => {
  const lean = calculateProductionCosts(88741, "lean", configuration);
  const difficult = calculateProductionCosts(88741, "difficult", configuration);
  assert.equal(lean.panels, 103934);
  assert.equal(difficult.panels, 176942);
  assert.equal(lean.video.generation, 320);
  assert.equal(difficult.video.generation, 960);
  assert.equal(difficult.video.attempts, 3);
  assert.ok(lean.total < difficult.total);
  assert.equal(lean.reserve, (lean.images + lean.automation + lean.editorial) * 0.15);
});

test("language drafting scales by measured characters and target meaning count", () => {
  const full = calculateProductionCosts(88741, "working", configuration);
  const doubled = calculateProductionCosts(177482, "working", configuration);
  assert.ok(Math.abs(full.language.drafting - 2279.60346) < 0.000001);
  assert.equal(full.language.nativeReview, 66555.75);
  assert.equal(doubled.language.subtotal, full.language.subtotal * 2);
  assert.equal(doubled.images, full.images * 2);
  assert.equal(doubled.video.generation, full.video.generation);
});

test("invalid input falls back while finite counts are rounded and bounded", () => {
  for (const value of [null, undefined, "", "  ", "abc", NaN, Infinity, -Infinity, {}, true]) {
    assert.equal(normalizeMeaningCount(value, configuration), 88741);
  }
  for (const value of [-10, 0, 999, "0"]) assert.equal(normalizeMeaningCount(value, configuration), 1000);
  assert.equal(normalizeMeaningCount(300001, configuration), 300000);
  assert.equal(normalizeMeaningCount("1500.6", configuration), 1501);
  assert.equal(normalizeMeaningCount(1000, configuration), 1000);
  assert.equal(normalizeMeaningCount(300000, configuration), 300000);
});

test("unknown scenarios fall back safely and invalid configuration fails explicitly", () => {
  assert.equal(selectScenario("unexpected", configuration).id, "working");
  assert.equal(calculateProductionCosts(1000, "unexpected", configuration).scenario.id, "working");
  assert.throws(() => selectScenario("unexpected", { ...configuration, scenarios: [] }), /working scenario/);
  assert.equal(formatUsd(100588.807776), "$100,589");
});
