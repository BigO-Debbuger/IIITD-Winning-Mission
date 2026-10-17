// wavesync_backend/controllers/credentialController.js
import { prisma } from "../config/prisma.js";
import { verifySignature } from "../utils/signatureUtils.js";
import { createHash } from "crypto";

export const getPublicKey = (req, res) => {
  const publicKey = process.env.WAVESYNC_SIGNING_PUBLIC_KEY || null;
  res.json({
    algorithm: "Ed25519",
    publicKey,
    format: "spki-base64url",
    network: "WaveSync Verifiable Proof Registry v1",
  });
};

export const verifySubmissionCredential = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        author: { select: { id: true, fullName: true, role: true } },
        reviews: {
          include: {
            reviewer: { select: { id: true, fullName: true, role: true, headline: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Compute SHA-256 integrity hash of evidence
    const evidenceContent = `${submission.proofUrl}:${submission.title}:${submission.description}`;
    const sha256EvidenceHash = createHash("sha256").update(evidenceContent).digest("hex");

    const latestReview = submission.reviews[0] || null;
    let isSignatureValid = false;

    if (latestReview?.signedPayload && latestReview?.signature) {
      isSignatureValid = verifySignature(latestReview.signedPayload, latestReview.signature);
    }

    res.json({
      submissionId: submission.id,
      title: submission.title,
      proofUrl: submission.proofUrl,
      proofType: submission.proofType,
      status: submission.status,
      author: submission.author,
      sha256EvidenceHash,
      review: latestReview ? {
        id: latestReview.id,
        verdict: latestReview.verdict,
        feedback: latestReview.feedback,
        reviewer: latestReview.reviewer,
        signedPayload: latestReview.signedPayload,
        signature: latestReview.signature,
        signatureVerified: isSignatureValid,
        createdAt: latestReview.createdAt,
      } : null,
      verification: {
        isAuthentic: isSignatureValid && submission.status === "approved",
        algorithm: "Ed25519 + SHA256",
        publicKey: process.env.WAVESYNC_SIGNING_PUBLIC_KEY || null,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify credential", error: error.message });
  }
};
