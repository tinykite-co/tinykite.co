export const FEATURE_REQUEST_LIMIT = 800;
export const FEATURE_BENEFIT_LIMIT = 400;
export const FEATURE_PRODUCTS = {
  gloss: "Gloss",
  nesta: "Nesta",
  family: "Across TinyKite family apps",
  future: "An idea for a future family product",
} as const;
/** A grown-up's product idea; no child or account identity is requested. */
export interface FeatureRequest { product: string; request: string; benefit: string; }
/** Email composition data only; creating this object never sends a message. */
export interface FeatureEmailDraft { subject: string; body: string; href: string; }

/** Preserve useful line breaks while excluding control characters and excessive input. */
export function normalizeFeatureText(value: string, limit: number): string {
  return value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, limit);
}

/** Build a reviewable draft, or return null when no actual request was supplied. */
export function buildFeatureRequestDraft(input: FeatureRequest, recipient: string): FeatureEmailDraft | null {
  const request = normalizeFeatureText(input.request, FEATURE_REQUEST_LIMIT);
  if (!request) return null;
  const product = Object.hasOwn(FEATURE_PRODUCTS, input.product) ? FEATURE_PRODUCTS[input.product as keyof typeof FEATURE_PRODUCTS] : FEATURE_PRODUCTS.family;
  const benefit = normalizeFeatureText(input.benefit, FEATURE_BENEFIT_LIMIT);
  const subject = `TinyKite feature idea: ${product}`;
  const body = ["Hello TinyKite,", "", `Product: ${product}`, "", "My feature idea:", request, ...(benefit ? ["", "How it would help:", benefit] : []), "", "I understand this is a suggestion, not a confirmed feature or delivery date."].join("\n");
  return { subject, body, href: `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}
