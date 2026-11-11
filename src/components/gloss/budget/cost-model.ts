/** Scenario assumptions are estimates, not measured acceptance or review rates. */
export interface CostScenario {
  id: string; label: string; description: string; motionPanels: number;
  flashAttempts: number; proAttempts: number; flashUsd: number; proUsd: number;
  automationUsdPerPanel: number; reviewMinutes: number; reviewUsdPerHour: number;
  reserve: number; translationPasses: number; videoAttempts: number;
}

/** Public inputs; source rates and measurement provenance live in the JSON file. */
export interface ProductionCosts {
  snapshot: { meanings: number; singlePictures: number; contrastPictures: number; motionMeanings: number; translationCharacters: number };
  limits: { minimumMeanings: number; maximumMeanings: number };
  translationUsdPerMillionCharacters: number;
  video: { meanings: number; seconds: number; silentUsdPerSecond: number };
  scenarios: CostScenario[];
}

/** Normalize untrusted form input without allowing NaN or unbounded allocations. */
export function normalizeMeaningCount(value: unknown, configuration: ProductionCosts): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  const finiteCount = Number.isFinite(parsed) ? Math.round(parsed) : configuration.snapshot.meanings;
  return Math.min(configuration.limits.maximumMeanings, Math.max(configuration.limits.minimumMeanings, finiteCount));
}

/** Unknown selections return the documented working scenario. */
export function selectScenario(id: string, configuration: ProductionCosts): CostScenario {
  const scenario = configuration.scenarios.find(candidate => candidate.id === id)
    ?? configuration.scenarios.find(candidate => candidate.id === "working");
  if (!scenario) throw new Error("The production-cost model needs a working scenario.");
  return scenario;
}

/** Estimate panels by scaling the measured intent mix, not by assuming one image per word. */
export function estimatePanelCount(meanings: number, scenario: CostScenario, configuration: ProductionCosts): number {
  const snapshot = configuration.snapshot;
  const measuredPanels = snapshot.singlePictures + 2 * snapshot.contrastPictures + scenario.motionPanels * snapshot.motionMeanings;
  return measuredPanels * meanings / snapshot.meanings;
}

/** Keep each cost component separate so the UI cannot confuse model spend with reviewed content. */
export function calculateProductionCosts(value: unknown, scenarioId: string, configuration: ProductionCosts) {
  const meanings = normalizeMeaningCount(value, configuration);
  const scenario = selectScenario(scenarioId, configuration);
  const panels = estimatePanelCount(meanings, scenario, configuration);
  const images = panels * (scenario.flashAttempts * scenario.flashUsd + scenario.proAttempts * scenario.proUsd);
  const automation = panels * scenario.automationUsdPerPanel;
  const editorial = meanings * scenario.reviewMinutes / 60 * scenario.reviewUsdPerHour;
  const reserve = (images + automation + editorial) * scenario.reserve;
  return { meanings, scenario, panels, images, automation, editorial, reserve, total: images + automation + editorial + reserve,
    language: calculateLanguageCosts(meanings, scenario, configuration), video: calculateVideoCosts(scenario, configuration) };
}

/** One fully localized language; native review is additional to machine drafting. */
export function calculateLanguageCosts(meanings: number, scenario: CostScenario, configuration: ProductionCosts) {
  const characters = configuration.snapshot.translationCharacters * meanings / configuration.snapshot.meanings;
  const drafting = characters / 1_000_000 * configuration.translationUsdPerMillionCharacters * scenario.translationPasses;
  const nativeReview = meanings * scenario.reviewMinutes / 60 * scenario.reviewUsdPerHour;
  return { drafting, nativeReview, subtotal: drafting + nativeReview };
}

/** Fixed video milestone remains separate from the core picture allocation. */
export function calculateVideoCosts(scenario: CostScenario, configuration: ProductionCosts) {
  const video = configuration.video;
  return { generation: video.meanings * video.seconds * video.silentUsdPerSecond * scenario.videoAttempts, attempts: scenario.videoAttempts };
}

/** Display whole USD consistently; calculations retain precision until formatting. */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}
