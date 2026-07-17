import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const executionDocument: LegalDocument = {
  slug: "order-execution",
  title: "Order Transmission and Execution Disclosure",
  summary: "How a confirmed instruction moves from Synex to Deriv and where execution occurs.",
  version: "synex-order-execution-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  acceptanceRequired: true,
  sections: [
    {
      heading: "1. Synex transmits; Deriv executes",
      paragraphs: [
        "Synex displays information and transmits an instruction only after you confirm the current trade details. Synex is not an execution venue and does not independently determine whether Deriv accepts or rejects an instruction.",
        "Deriv determines available products, proposals, prices, contract terms, limits, acceptance, execution, cancellation, resale, and settlement under your Deriv agreement.",
      ],
    },
    {
      heading: "2. Quotes and confirmation",
      bullets: [
        "A market value, chart, tick, or earlier proposal may differ from the executable terms available at confirmation.",
        "Proposals may expire, products may become unavailable, and an instruction may be rejected or delayed.",
        "A trade is not complete until Deriv returns a successful confirmation and contract identifier.",
      ],
    },
    {
      heading: "3. Customer checks",
      paragraphs: [
        "Before confirming, check the connected account, product, symbol, direction, stake, duration, barrier, payout, maximum loss, currency, and any cancellation or resale terms.",
        "After an interruption, check Synex activity and the connected Deriv account before retrying so that you do not unintentionally submit a second instruction.",
      ],
    },
    {
      heading: "4. Records, conflicts, and complaints",
      paragraphs: [
        `Synex keeps relevant transmission and response records for security, support, and disputes. If the interfaces disagree, contact ${legalConfig.supportEmail} and provide the contract or request reference. The confirmed provider record governs the trading outcome, subject to applicable law and complaint rights.`,
      ],
    },
  ],
};
