"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";

type RiskSnapshot = {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  aiVerdict: "APPROVE" | "REVIEW" | "REJECT";
  aiReason: string;
};

type Document = {
  id: number;
  title: string;
  createdAt: string;
  owner: {
    email: string;
  };
  riskSnapshot?: RiskSnapshot | null;
};

export default function SanctionsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      const res = await api.get("/sanctions/queue");
      setDocuments(res.data);
      setLoading(false);
    };

    fetchQueue();
  }, []);

  const makeDecision = async (
    documentId: number,
    decision: "APPROVE" | "REJECT" | "FLAG"
  ) => {
    setActionLoading(documentId);

    await api.post(`/sanctions/documents/${documentId}/decision`, {
      decision,
      reason: "Manual sanction manager decision",
    });

    setActionLoading(null);
    alert(`Document ${decision}`);
  };

  if (loading) {
    return <div className="p-8 text-black">Loading sanction queue…</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-black">
        Sanctions Review Queue
      </h1>

      {documents.map((doc) => (
        <div
          key={doc.id}
          className="border-2 border-black rounded-lg p-6 bg-white"
        >
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-black">
              {doc.title}
            </h2>

            <p className="text-black text-sm">
              Uploaded by: <strong>{doc.owner.email}</strong>
            </p>

            <p className="text-black text-sm">
              Uploaded at:{" "}
              {new Date(doc.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Risk Info */}
          {doc.riskSnapshot && (
            <div className="mt-4 space-y-2 text-black">
              <p>
                <strong>Risk Score:</strong>{" "}
                {doc.riskSnapshot.riskScore}
              </p>
              <p>
                <strong>Risk Level:</strong>{" "}
                {doc.riskSnapshot.riskLevel}
              </p>
              <p>
                <strong>AI Verdict:</strong>{" "}
                {doc.riskSnapshot.aiVerdict}
              </p>
              <p className="text-sm">
                {doc.riskSnapshot.aiReason}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={() =>
                window.open(
                  `${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`,
                  "_blank"
                )
              }
              className="underline text-black font-medium text-left"
            >
              📥 Download Document
            </button>

            <div className="flex gap-4">
              <button
                disabled={actionLoading === doc.id}
                onClick={() => makeDecision(doc.id, "APPROVE")}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded"
              >
                Approve
              </button>

              <button
                disabled={actionLoading === doc.id}
                onClick={() => makeDecision(doc.id, "REJECT")}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded"
              >
                Reject
              </button>

              <button
                disabled={actionLoading === doc.id}
                onClick={() => makeDecision(doc.id, "FLAG")}
                className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded"
              >
                Flag
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
