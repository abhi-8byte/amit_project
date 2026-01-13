import { Response } from "express";
import path from "path";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { writeAuditLog } from "../utils/audit.util";
import { extractDocumentSignals } from "../ai/extractors/document.extractor";
import { runDocumentIntelligence } from "../ai/orchestrators/documentIntelligence.orchestrator";
import { evaluateDocumentRisk } from "../security/orchestrator/documentRisk.orchestrator";

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await prisma.document.create({
      data: {
        title: req.file.originalname,
        content: req.body.description || "Uploaded document",
        filePath: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        ownerId: req.user.userId,
      },
    });

    const absolutePath = path.resolve(
      process.cwd(),
      "uploads",
      req.file.filename
    );

    const extraction = await extractDocumentSignals(
      absolutePath,
      req.file.mimetype
    );

    await prisma.documentAIExtraction.create({
      data: {
        documentId: document.id,
        rawText: extraction.text?.rawText ?? null,
        wordCount: extraction.text?.wordCount ?? null,
        containsSensitive: extraction.text?.containsSensitiveTerms ?? false,
        detectedKeywords: extraction.text?.detectedKeywords ?? [],
        isBlurry: extraction.image?.isBlurry ?? null,
        possibleForgery: extraction.image?.possibleForgery ?? null,
        imageNotes: extraction.image?.notes ?? [],
      },
    });

    const intelligence = runDocumentIntelligence({
      rawText: extraction.text?.rawText ?? "",
      wordCount: extraction.text?.wordCount ?? 0,
      containsSensitive: extraction.text?.containsSensitiveTerms ?? false,
      isBlurry: extraction.image?.isBlurry,
      possibleForgery: extraction.image?.possibleForgery,
    });

    await evaluateDocumentRisk({
      documentId: document.id,
      userId: req.user.userId,
      ip: req.ip ?? "0.0.0.0",
      userAgent: req.headers["user-agent"],
      documentIntelligence: {
        isDummy: intelligence.isDummy,
        suspectedForgery: intelligence.suspectedForgery,
        documentType: intelligence.documentType,
      },
    });

    await writeAuditLog({
      action: "DOCUMENT_UPLOADED",
      userId: req.user.userId,
      payload: { documentId: document.id },
    });

    res.status(201).json({ document, intelligence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};
