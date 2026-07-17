import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const financialCrimeDocument: LegalDocument = {
  slug: "financial-crime",
  title: "Financial Crime and AML Notice",
  summary: "How Synex approaches identity checks, sanctions, fraud, and suspicious activity.",
  version: "synex-financial-crime-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  sections: [
    {
      heading: "1. Purpose",
      paragraphs: [
        "Synex must not be used for money laundering, terrorist financing, fraud, sanctions evasion, market abuse, or other unlawful activity.",
        "The final policy, legal duties, reporting authority, and restricted-country rules depend on the registered operator and launch jurisdictions and require compliance approval.",
      ],
    },
    {
      heading: "2. Checks and information",
      bullets: [
        "We may verify identity, age, residence, contact details, source of funds, account ownership, and device or transaction risk signals.",
        "We may request current documents or explanations and may use approved identity, fraud, sanctions, and payment providers.",
        "Deriv and payment providers perform their own checks under their separate legal and regulatory responsibilities.",
      ],
    },
    {
      heading: "3. Restrictions and reporting",
      paragraphs: [
        "Where permitted or required, we may delay or restrict platform access, decline a service, preserve records, or report concerns to an appropriate authority. We may be unable to explain a restriction where law prohibits disclosure.",
        "A Synex restriction does not replace any action Deriv or a payment provider may take on its own systems.",
      ],
    },
    {
      heading: "4. Customer responsibilities",
      bullets: [
        "Use only accounts and payment methods you are authorised to control.",
        "Keep identity and residence information accurate and current.",
        "Respond truthfully and promptly to lawful information requests.",
        `Report suspected fraud or account misuse to ${legalConfig.supportEmail}.`,
      ],
    },
  ],
};
