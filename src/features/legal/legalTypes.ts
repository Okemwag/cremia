export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  slug: string;
  title: string;
  summary: string;
  version: string;
  effectiveDate: string;
  acceptanceRequired?: boolean;
  sections: LegalSection[];
};
