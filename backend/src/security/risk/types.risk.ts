export type RiskInput = {
  userId?: number;
  ip: string;
  userAgent?: string;
  eventType: "DOCUMENT_UPLOAD" | "SENSITIVE_ACTION";
  timestamp: Date;

  // ✅ NEW — document intelligence signals
  documentIntelligence?: {
    isDummy: boolean;
    suspectedForgery: boolean;
    documentType: string;
  };
};

export type RiskResult = {
  score: number;
  reasons: string[];
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};
