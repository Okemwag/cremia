import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const cookiesDocument: LegalDocument = {
  slug: "cookies",
  title: "Cookie and Local Storage Notice",
  summary: "How the Synex website uses browser storage and similar technology.",
  version: "synex-cookies-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  sections: [
    {
      heading: "1. Essential technology",
      paragraphs: [
        "Synex and its identity provider may use cookies, session storage, local storage, and similar technology that is necessary for authentication, OAuth security, routing, fraud prevention, preferences, and service continuity.",
      ],
    },
    {
      heading: "2. Optional analytics and marketing",
      paragraphs: [
        "Non-essential analytics, advertising, or cross-site marketing technology must not be activated until it has been inventoried and, where required, you have made a clear choice through a consent control.",
        "The current production deployment must be audited before launch so this notice and any consent banner match the technology actually used.",
      ],
    },
    {
      heading: "3. Managing storage",
      paragraphs: [
        "You can remove or block browser storage through your browser settings, but essential authentication and account functionality may stop working. Any future consent centre must let you revisit optional choices without blocking essential service access.",
      ],
    },
  ],
};
