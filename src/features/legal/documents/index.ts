import { complaintsDocument } from "./complaints";
import { cookiesDocument } from "./cookies";
import { dataRightsDocument } from "./dataRights";
import { executionDocument } from "./execution";
import { financialCrimeDocument } from "./financialCrime";
import { platformDocument } from "./platform";
import { privacyDocument } from "./privacy";
import { riskDocument } from "./risk";
import { termsDocument } from "./terms";

export const legalDocuments = [
  privacyDocument,
  termsDocument,
  riskDocument,
  platformDocument,
  executionDocument,
  financialCrimeDocument,
  cookiesDocument,
  complaintsDocument,
  dataRightsDocument,
];

export function findLegalDocument(slug?: string) {
  return legalDocuments.find((document) => document.slug === slug);
}
