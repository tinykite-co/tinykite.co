import definition from "../../data/gloss/picture-campaign.json";
import { validatePictureFund } from "./picture-fund-rules";

/** Shared campaign data. The single target retains compatibility with the Stripe sync tool. */
export const pictureFund = validatePictureFund(definition);
export const fundingTarget = pictureFund.languages[0]!;
/** Display the campaign's currency without coupling it to language cost estimates. */
export const pounds = (amount: number): string => new Intl.NumberFormat("en-GB", { style: "currency", currency: pictureFund.currency, maximumFractionDigits: 0 }).format(amount);
