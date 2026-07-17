import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const platformDocument: LegalDocument = {
  slug: "platform-disclosure",
  title: "Platform and Deriv Disclosure",
  summary: "Which services Synex provides and which remain with Deriv or other providers.",
  version: "synex-platform-disclosure-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  acceptanceRequired: true,
  sections: [
    {
      heading: "1. Synex is the software layer",
      paragraphs: [
        "Synex provides authentication, account connection, portfolio views, market tools, support workflows, and an interface for expressly confirmed instructions.",
        "Synex does not become the owner of your connected account or acquire authority to trade independently merely because you connect it.",
      ],
    },
    {
      heading: "2. Deriv provides the trading account",
      bullets: [
        "Deriv determines available accounts, jurisdictions, products, prices, proposals, limits, and execution outcomes.",
        "Your money and trading contracts remain subject to your agreement with the relevant Deriv entity.",
        "Deriv may perform identity, regulatory, sanctions, payment, and suitability controls under its policies.",
        "Deriv availability and API permissions can change independently of Synex.",
      ],
    },
    {
      heading: "3. What Synex does not claim",
      bullets: [
        "Synex does not claim to provide MT5, ECN execution, market depth, segregated client money, or negative-balance protection unless a documented legal arrangement supports that claim.",
        "Deriv-native contracts are not the same as VCG or MT5 CFD positions, margin, spreads, leverage, swaps, or instrument coverage.",
        "Synex does not guarantee execution, profit, availability, or that every product is lawful or suitable in your location.",
      ],
    },
    {
      heading: "4. Credentials and instructions",
      paragraphs: [
        "Synex should never request your Deriv password. Connection uses Deriv's authorisation flow, and stored account tokens are encrypted by the Synex backend.",
        "Review every live proposal before confirmation. If any screen conflicts with the confirmed Deriv record, the provider record governs the trading outcome, subject to applicable law and complaint rights.",
      ],
    },
    {
      heading: "5. Funding",
      paragraphs: [
        "Synex deposit and withdrawal features are not active until an approved payment gateway and reconciliation process are connected. Payment-provider and Deriv funding terms will also apply when enabled.",
      ],
    },
  ],
};
