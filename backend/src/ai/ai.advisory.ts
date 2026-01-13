import { AIAdvisoryResult } from "./ai.types";
import { DocumentIntelligenceResult } from "./orchestrators/documentIntelligence.orchestrator";

interface AIInput {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReasons: string[];
  behaviorFlags: string[];
  documentIntelligence?: DocumentIntelligenceResult;
}

export const generateAIAdvisory = (
  input: AIInput
): AIAdvisoryResult => {
  const signals: string[] = [];
  let recommendation: AIAdvisoryResult["recommendation"] = "APPROVE";

  // ============================
  // 🔴 DOCUMENT INTELLIGENCE
  // ============================
  if (input.documentIntelligence) {
    const intel = input.documentIntelligence;

    if (intel.isDummy) {
      signals.push("Document appears to be dummy or meaningless");
      recommendation = "REJECT";
    }

    if (intel.suspectedForgery) {
      signals.push("Potential forgery indicators detected");
      recommendation = "REJECT";
    }

    if (intel.validityReasons.length > 0) {
      signals.push(...intel.validityReasons);
    }
  }

  // ============================
  // 🔴 RISK-BASED OVERRIDES
  // ============================
  if (input.riskScore >= 80) {
    recommendation = "REJECT";
    signals.push("Critical risk score");
  } else if (input.riskScore >= 50 && recommendation !== "REJECT") {
    recommendation = "REVIEW";
    signals.push("Moderate risk requires manual review");
  }

  if (input.behaviorFlags.length > 0) {
    signals.push("Suspicious user behavior detected");
  }

  return {
    recommendation,
    confidence: Math.min(input.riskScore / 100, 0.95),
    signals,
    explanation:
      "This decision was generated using document intelligence (content validity, forgery signals), behavioral risk analysis, and security policies. The AI does not approve documents that lack meaningful content or show signs of manipulation.",
  };
};
