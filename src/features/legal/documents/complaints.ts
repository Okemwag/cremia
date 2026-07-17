import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const complaintsDocument: LegalDocument = {
  slug: "complaints",
  title: "Complaints Procedure",
  summary: "How to report a concern about the Synex platform or connected workflow.",
  version: "synex-complaints-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  sections: [
    {
      heading: "1. How to complain",
      paragraphs: [
        `Use in-app support or email ${legalConfig.supportEmail}. State that the message is a complaint and include your Synex account email, relevant dates, connected-account reference, transaction or contract reference, what happened, and the resolution you seek. Do not send passwords, full card details, or private keys.`,
      ],
    },
    {
      heading: "2. What happens next",
      bullets: [
        "We record and acknowledge the complaint and may request information needed to investigate.",
        "We distinguish Synex software or service issues from matters controlled by Deriv or a payment provider.",
        "We preserve relevant audit information, communicate progress, and issue a written outcome when the review is complete.",
        "Formal response targets and escalation contacts must be approved for each launch jurisdiction before launch.",
      ],
    },
    {
      heading: "3. Provider and external escalation",
      paragraphs: [
        "Execution, pricing, settlement, Deriv account, or Deriv payment complaints may need to be raised with the relevant Deriv entity under its complaints process. Synex will provide available platform records but cannot decide a provider's regulated complaint.",
        "Your right to contact a regulator, ombudsman, court, or data-protection authority depends on your location and the responsible legal entity. Those details must be added once the launch jurisdictions are confirmed.",
      ],
    },
  ],
};
