export type RiskInput = {
  userId?: number;
  ip: string;
  userAgent?: string;
  eventType: "DOCUMENT_UPLOAD" | "SENSITIVE_ACTION";
  timestamp: Date;

  // ✅ Enhanced document intelligence signals
  documentIntelligence?: {
    isDummy: boolean;
    suspectedForgery: boolean;
    documentType: string;
    wordCount?: number;
    containsSensitive?: boolean;
    isBlurry?: boolean;
  };

  // ✅ Behavioral signals
  rapidUploads?: boolean;
  multipleFailures?: boolean;
};

export type RiskResult = {
  score: number;
  reasons: string[];
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  verdict: "APPROVE" | "REVIEW" | "REJECT";
};
