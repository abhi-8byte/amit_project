import { RiskInput } from "./types.risk";
import { RISK_WEIGHTS } from "./weights.risk";

export const evaluateRules = (input: RiskInput) => {
  let score = 0;
  const reasons: string[] = [];

  // Base rules
  if (!input.userAgent) {
    score += RISK_WEIGHTS.SUSPICIOUS_USER_AGENT;
    reasons.push("Missing or suspicious user agent");
  }

  // ✅ Document intelligence rules
  if (input.documentIntelligence?.isDummy) {
    score += RISK_WEIGHTS.INVALID_DOCUMENT;
    reasons.push("Dummy or meaningless document detected");
  }

  if (input.documentIntelligence?.suspectedForgery) {
    score += RISK_WEIGHTS.FORGED_DOCUMENT;
    reasons.push("Possible forged document");
  }

  return { score, reasons };
};
