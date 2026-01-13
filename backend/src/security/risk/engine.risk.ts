import { RiskInput, RiskResult } from "./types.risk";
import { evaluateRules } from "./rules.risk";
import { THRESHOLDS } from "../config/thresholds";

export const calculateRiskScore = (
  input: RiskInput
): RiskResult => {
  const { score, reasons } = evaluateRules(input);
  const cappedScore = Math.min(score, 100);

  let level: RiskResult["level"] = "LOW";
  if (cappedScore >= THRESHOLDS.HIGH) level = "CRITICAL";
  else if (cappedScore >= THRESHOLDS.MEDIUM) level = "HIGH";
  else if (cappedScore >= THRESHOLDS.SAFE) level = "MEDIUM";

  return { score: cappedScore, reasons, level };
};
