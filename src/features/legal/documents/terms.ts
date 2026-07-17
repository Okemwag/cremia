import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const termsDocument: LegalDocument = {
  slug: "terms",
  title: "Platform Terms of Use",
  summary: "The rules for accessing Synex and connecting a third-party trading account.",
  version: "synex-terms-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  acceptanceRequired: true,
  sections: [
    {
      heading: "1. Eligibility and acceptance",
      paragraphs: [
        "You must be at least 18, legally capable of entering an agreement, and permitted to use the service in your jurisdiction. By creating or using an account you agree to the current version of these terms.",
        "The operator's registered identity, governing law, and dispute forum must be inserted before these terms are used for a public launch.",
      ],
    },
    {
      heading: "2. Synex's role",
      paragraphs: [
        "Synex is a technology interface. Unless a future legal arrangement expressly says otherwise, Synex is not your broker, custodian, bank, exchange, fiduciary, tax adviser, or investment adviser.",
        "Connected trading accounts, funds, product terms, execution, settlement, and regulatory checks are provided by the relevant Deriv entity under your separate agreement with Deriv.",
      ],
    },
    {
      heading: "3. Accounts and security",
      bullets: [
        "Provide accurate information and keep it current.",
        "Protect your device and authentication factors and notify us promptly of suspected compromise.",
        "Authorise only accounts you own or are lawfully permitted to control.",
        "We may restrict access to investigate abuse, security, sanctions, legal, or eligibility concerns.",
      ],
    },
    {
      heading: "4. Market data and instructions",
      paragraphs: [
        "Market data may be delayed, unavailable, corrected, or different from executable terms. A displayed value is not necessarily an offer.",
        "An instruction is submitted only after you explicitly confirm the current proposal or order details. Acceptance, rejection, pricing, cancellation, and settlement are controlled by Deriv's systems and product rules.",
      ],
    },
    {
      heading: "5. Acceptable use",
      bullets: [
        "Do not access another person's account or bypass security and eligibility controls.",
        "Do not manipulate, overload, scrape, reverse engineer, or disrupt the service except where law permits.",
        "Do not use Synex for unlawful activity, sanctions evasion, fraud, market abuse, or misleading promotion.",
      ],
    },
    {
      heading: "6. Fees, availability, and third parties",
      paragraphs: [
        "Any Synex fees or markup will be disclosed before they apply. Deriv and payment providers may charge separate fees under their own terms.",
        "The service may be interrupted by maintenance, networks, market events, providers, or circumstances outside our control. We do not promise uninterrupted availability.",
      ],
    },
    {
      heading: "7. Risk and responsibility",
      paragraphs: [
        "Trading can result in rapid and substantial loss. You remain responsible for deciding whether a product and instruction are appropriate for you.",
        "Liability exclusions and limitations must be reviewed for enforceability in each launch jurisdiction and do not exclude liability that cannot legally be excluded.",
      ],
    },
    {
      heading: "8. Ending use and contact",
      paragraphs: [
        `You may stop using Synex and request account closure. Some records may be retained for security, disputes, and legal duties. Contact ${legalConfig.supportEmail} for assistance.`,
      ],
    },
  ],
};
