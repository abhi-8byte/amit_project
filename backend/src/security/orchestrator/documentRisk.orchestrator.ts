import prisma from "../../lib/prisma";
import { calculateRiskScore } from "../risk/engine.risk";
import { runPolicyEngine } from "../policy/engine.policy";
import { generateAIAdvisory } from "../../ai/ai.advisory";

type Input = {
  documentId: number;
  userId?: number;
  ip: string;
  userAgent?: string;

  // ✅ NEW
  documentIntelligence?: {
    isDummy: boolean;
    suspectedForgery: boolean;
    documentType: string;
  };
};

export const evaluateDocumentRisk = async (input: Input) => {
  const risk = calculateRiskScore({
    userId: input.userId,
    ip: input.ip,
    userAgent: input.userAgent,
    eventType: "DOCUMENT_UPLOAD",
    timestamp: new Date(),
    documentIntelligence: input.documentIntelligence,
  });

  const policy = runPolicyEngine({
    riskScore: risk.score,
    userId: input.userId,
    action: "DOCUMENT_UPLOAD",
  });

  const ai = generateAIAdvisory({
    riskScore: risk.score,
    riskLevel: risk.level === "CRITICAL" ? "HIGH" : risk.level,
    riskReasons: risk.reasons,
    behaviorFlags: [],
  });

  await prisma.documentRiskSnapshot.upsert({
    where: { documentId: input.documentId },
    update: {},
    create: {
      documentId: input.documentId,
      riskScore: risk.score,
      riskLevel: risk.level,
      aiVerdict: ai.recommendation,
      aiReason: ai.explanation,
      policyFlags: [policy.decision],
      behaviorFlags: [],
    },
  });
};
