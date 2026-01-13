export const RISK_WEIGHTS = {
  // Existing
  UNKNOWN_IP: 15,
  SUSPICIOUS_USER_AGENT: 10,
  RAPID_REQUESTS: 20,
  SENSITIVE_ACTION: 30,
  MULTIPLE_FAILURES: 25,

  // ✅ NEW — Document Intelligence Weights
  INVALID_DOCUMENT: 40,      // Dummy / meaningless / empty docs
  FORGED_DOCUMENT: 50,       // Suspected forgery / tampering
};
