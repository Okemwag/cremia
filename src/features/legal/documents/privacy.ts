import { legalConfig } from "../legalConfig";
import type { LegalDocument } from "../legalTypes";

export const privacyDocument: LegalDocument = {
  slug: "privacy",
  title: "Privacy Notice",
  summary: "How Synex collects, uses, shares, protects, and retains personal data.",
  version: "synex-privacy-v1-draft",
  effectiveDate: legalConfig.effectiveDate,
  sections: [
    {
      heading: "1. Who this notice covers",
      paragraphs: [
        `This notice applies when you use ${legalConfig.serviceName}'s website, Android application, support channels, and account services. The registered operator and address must be confirmed before public launch.`,
        "Synex provides a software interface for connected Deriv accounts. Deriv separately controls personal data it receives for its own account, regulatory, payment, and trading services.",
      ],
    },
    {
      heading: "2. Information we process",
      bullets: [
        "Platform identity details, including name, email, Auth0 identifier, and authentication events.",
        "Profile, contact, residence, age, source-of-funds, suitability, and risk-acknowledgement information.",
        "Connected Deriv account identifiers, currencies, account type, encrypted OAuth credentials, and connection status.",
        "Orders, proposals, positions, statements, watchlists, alerts, support messages, and audit records.",
        "Device, browser, IP address, security, diagnostic, and service-usage information.",
        "Funding and transaction references after a payment provider is connected; Synex should not store full card details.",
      ],
    },
    {
      heading: "3. Why we use information",
      bullets: [
        "Provide, secure, troubleshoot, and improve the platform.",
        "Authenticate users and connect authorised Deriv accounts.",
        "Display market and portfolio information and submit expressly confirmed instructions.",
        "Assess eligibility and suitability, manage risk, prevent fraud, and keep required records.",
        "Respond to support requests, legal obligations, disputes, and security incidents.",
        "Send marketing only where permitted and according to your preferences.",
      ],
    },
    {
      heading: "4. Sharing and international processing",
      paragraphs: ["We disclose only what is reasonably necessary to service providers and authorities."],
      bullets: [
        "Auth0 for identity and authentication.",
        "Deriv entities for connected-account and trading functionality you request.",
        "Hosting, communications, monitoring, professional-adviser, and future payment providers.",
        "Regulators, courts, law enforcement, and other parties where legally required.",
      ],
    },
    {
      heading: "5. Retention and security",
      paragraphs: [
        "We retain data only for service, security, dispute, audit, and legal needs. Final retention periods must be approved for each data class before launch.",
        "Controls include encrypted transport, access restrictions, encrypted Deriv tokens, audit logging, and separation of platform identity from trading credentials. No system is completely secure.",
      ],
    },
    {
      heading: "6. Your choices and rights",
      bullets: [
        "Request access, correction, portability, restriction, objection, or deletion where applicable.",
        "Withdraw optional marketing consent without affecting essential service messages.",
        "Disconnect a Deriv account and revoke authority through the relevant account controls.",
        `Contact ${legalConfig.privacyEmail}; identity verification may be required before fulfilling a request.`,
      ],
    },
    {
      heading: "7. Children, changes, and complaints",
      paragraphs: [
        "Synex is not intended for anyone under 18. We will publish material changes and update the version and effective date.",
        "You may complain to Synex and, where applicable, the data-protection authority responsible for your location. The responsible authority depends on the operator and launch jurisdiction, which remain to be confirmed.",
      ],
    },
  ],
};
