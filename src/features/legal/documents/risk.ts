import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const riskDocument: LegalDocument = {
  slug: "risk",
  title: "Trading Risk Disclosure",
  summary: "Important risks of using Deriv products through the Synex interface.",
  version: "synex-risk-disclosure-v1",
  effectiveDate: legalConfig.effectiveDate,
  acceptanceRequired: true,
  sections: [
    {
      heading: "1. You can lose money quickly",
      paragraphs: [
        "Options, multipliers, accumulators, leveraged products, and short-duration contracts are high risk. You may lose the full amount committed to a contract, and some product structures may create additional exposure under their governing terms.",
        "Trade only with money you can afford to lose. Past, simulated, copied, or virtual-account results do not predict future performance.",
      ],
    },
    {
      heading: "2. Product and market risk",
      bullets: [
        "Prices can move suddenly because of liquidity, volatility, market news, or derived-market behaviour.",
        "Payout, barrier, duration, multiplier, cancellation, resale, and settlement rules vary by contract.",
        "A position may not be cancellable or sellable when you want, or the available value may be materially lower than your purchase price.",
        "Currency conversion and provider charges may affect your result.",
      ],
    },
    {
      heading: "3. Technology and execution risk",
      bullets: [
        "Quotes can expire between display and confirmation.",
        "Connectivity, device, API, provider, maintenance, and latency failures can delay information or instructions.",
        "An instruction is not complete until the execution provider confirms it.",
        "Duplicate, rejected, or interrupted requests must be checked against your Deriv account and Synex activity before retrying.",
      ],
    },
    {
      heading: "4. No personalised advice",
      paragraphs: [
        "Synex content, analytics, watchlists, alerts, education, and interface prompts are general information, not investment, legal, tax, or personalised financial advice.",
        "A suitability assessment is a risk control and does not guarantee that trading is appropriate or profitable for you.",
      ],
    },
    {
      heading: "5. Before confirming",
      bullets: [
        "Verify the account, symbol, direction, contract type, stake, duration, payout, maximum loss, and applicable limits.",
        "Review the live Deriv proposal and product terms rather than relying on an earlier screen value.",
        "Use demo trading until you understand the product and workflow.",
      ],
    },
  ],
};
