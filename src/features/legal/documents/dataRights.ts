import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const dataRightsDocument: LegalDocument = {
  slug: "data-rights",
  title: "Data Rights and Account Closure",
  summary: "How to access, correct, export, or request deletion of Synex information.",
  version: "synex-data-rights-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  sections: [
    {
      heading: "1. Requests you can make",
      bullets: [
        "Access a copy of personal data Synex holds about you.",
        "Correct incomplete or inaccurate profile information.",
        "Request a portable export where applicable and technically available.",
        "Object to or restrict certain processing where applicable.",
        "Withdraw optional marketing consent.",
        "Request account closure and deletion of data that Synex is not required to retain.",
      ],
    },
    {
      heading: "2. How to submit a request",
      paragraphs: [
        `Email ${legalConfig.privacyEmail} from your registered address or use the future in-app privacy controls. Describe the request and the account concerned. We may verify identity and authority before disclosing or deleting data.`,
      ],
    },
    {
      heading: "3. Limits and connected providers",
      paragraphs: [
        "Some records may be retained for security, fraud prevention, financial reconciliation, audit, legal claims, and regulatory duties. We will explain applicable limits when responding.",
        "Closing Synex does not automatically close or erase a separate Deriv or payment-provider account. Submit provider requests through that provider's own process.",
      ],
    },
    {
      heading: "4. Product status",
      paragraphs: [
        "Automated export and deletion endpoints are not yet implemented. They are release blockers; until then, requests require a verified manual operations workflow.",
      ],
    },
  ],
};
