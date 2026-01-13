import { classifyDocumentType } from "../classifiers/documentType.classifier";
import { classifyDocumentValidity } from "../classifiers/documentValidity.classifier";
import { detectForgerySignals } from "../classifiers/documentForgery.classifier";

export type DocumentIntelligenceResult = {
  documentType: string;
  isDummy: boolean;
  validityReasons: string[];
  suspectedForgery: boolean;
  forgeryIndicators: string[];
};

export const runDocumentIntelligence = (input: {
  rawText?: string;
  wordCount?: number;
  containsSensitive?: boolean;
  isBlurry?: boolean;
  possibleForgery?: boolean;
}): DocumentIntelligenceResult => {
  // ============================
  // 🛡 Normalize inputs
  // ============================
  const rawText = input.rawText?.trim() || "";
  const wordCount = input.wordCount ?? 0;
  const containsSensitive = input.containsSensitive ?? false;
  const isBlurry = input.isBlurry ?? false;
  const possibleForgery = input.possibleForgery ?? false;

  // ============================
  // 📄 Document Type
  // ============================
  const docType = classifyDocumentType(rawText);

  // ============================
  // ❌ Dummy / Validity Detection
  // ============================
  const validity = classifyDocumentValidity(rawText, wordCount);

  // ============================
  // 🔍 Forgery Detection
  // ============================
  const forgery = detectForgerySignals(
    containsSensitive,
    isBlurry,
    possibleForgery
  );

  return {
    documentType: docType,
    isDummy: validity.isDummy,
    validityReasons: validity.reasons,
    suspectedForgery: forgery.suspectedForgery,
    forgeryIndicators: forgery.indicators,
  };
};
