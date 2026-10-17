// wavesync_backend/controllers/reviewController.js
import { prisma } from "../config/prisma.js";
import {
  buildCanonicalPayload,
  signPayload,
  verifySignature,
  isSigningConfigured,
} from "../utils/signatureUtils.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const VALID_VERDICTS = ["approved", "rejected", "needs_revision"];

// Maps each verdict to the resulting Submission.status
const VERDICT_TO_STATUS = {
  approved: "approved",
  rejected: "rejected",
  needs_revision: "pending", // opens the submission for a new review round
};

// ---------------------------------------------------------------------------
// POST /api/reviews
// Submit a review for a submission.
// Only alumni and admin can review. Authors cannot self-review.
// Duplicate review by the same reviewer is prevented by @@unique constraint.
// ---------------------------------------------------------------------------
export const createReview = async (req, res) => {
  try {
    const { submissionId, verdict, feedback } = req.body;

    // 1. Input validation
    if (!submissionId || !verdict || !feedback) {
      return res.status(400).json({
        message: "submissionId, verdict, and feedback are all required.",
      });
    }

    if (!VALID_VERDICTS.includes(verdict)) {
      return res.status(400).json({
        message: `verdict must be one of: ${VALID_VERDICTS.join(", ")}`,
      });
    }

    if (typeof feedback !== "string" || feedback.trim().length < 10) {
      return res.status(400).json({
        message: "feedback must be at least 10 characters.",
      });
    }

    // 2. Fetch submission and enforce access rules atomically
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    // 3. Self-review prevention
    if (submission.authorId === req.user.id) {
      return res.status(403).json({
        message: "You cannot review your own submission.",
      });
    }

    // 4. Role check — only alumni and admin may review
    if (req.user.role !== "alumni" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only alumni and admin can submit reviews.",
      });
    }

    // 5. Status gate — only pending and in_review submissions accept new reviews
    if (submission.status === "approved" || submission.status === "rejected") {
      return res.status(409).json({
        message: `This submission is already '${submission.status}' and cannot receive further reviews.`,
        currentStatus: submission.status,
      });
    }

    // 6. Duplicate review check (also enforced by @@unique at DB level)
    const existingReview = await prisma.submissionReview.findUnique({
      where: {
        submissionId_reviewerId: {
          submissionId,
          reviewerId: req.user.id,
        },
      },
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already submitted a review for this submission.",
        existingVerdict: existingReview.verdict,
      });
    }

    // 7. Build Ed25519 signature (graceful degradation if key not configured)
    const isoTimestamp = new Date().toISOString();
    let signatureData = null;
    let signatureVerified = false;

    try {
      const canonicalPayload = buildCanonicalPayload(
        submissionId,
        req.user.id,
        verdict,
        isoTimestamp
      );
      signatureData = signPayload(canonicalPayload);
      if (signatureData) {
        // Immediately verify to confirm the signature round-trips correctly
        signatureVerified = verifySignature(
          signatureData.signedPayload,
          signatureData.signature
        );
      }
    } catch (sigErr) {
      // Signature failure must not block the review workflow
      console.warn("⚠️ Signature generation skipped:", sigErr.message);
    }

    // 8. Persist review + update submission status atomically
    const newStatus = VERDICT_TO_STATUS[verdict];

    const [review] = await prisma.$transaction([
      prisma.submissionReview.create({
        data: {
          submissionId,
          reviewerId: req.user.id,
          verdict,
          feedback: feedback.trim(),
          signedPayload: signatureData?.signedPayload ?? null,
          signature: signatureData?.signature ?? null,
          signatureVerified,
        },
        include: {
          reviewer: { select: { id: true, fullName: true } },
        },
      }),
      prisma.submission.update({
        where: { id: submissionId },
        data: { status: newStatus },
      }),
    ]);

    res.status(201).json({
      message: `Review submitted. Submission is now '${newStatus}'.`,
      review,
      submissionStatus: newStatus,
      signingActive: isSigningConfigured(),
      signatureVerified,
    });
  } catch (error) {
    // Prisma unique constraint violation (duplicate review race condition)
    if (error.code === "P2002" && error.meta?.target?.includes("reviewerId")) {
      return res.status(409).json({
        message: "You have already submitted a review for this submission.",
      });
    }
    console.error("createReview error:", error.message);
    res.status(500).json({ message: "Failed to submit review.", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/reviews/:submissionId
// Fetch all reviews for a submission, including signature verification status.
// - Author of the submission can view their own reviews.
// - Alumni and admin can view all reviews.
// ---------------------------------------------------------------------------
export const getReviewsForSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, authorId: true, title: true, status: true },
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    const isOwner = submission.authorId === req.user.id;
    const isReviewer = req.user.role === "alumni" || req.user.role === "admin";

    if (!isOwner && !isReviewer) {
      return res.status(403).json({
        message: "Not authorized to view reviews for this submission.",
      });
    }

    const reviews = await prisma.submissionReview.findMany({
      where: { submissionId },
      include: {
        reviewer: { select: { id: true, fullName: true, headline: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Re-verify stored signatures at read time so callers can detect tampering
    const enrichedReviews = reviews.map((r) => ({
      ...r,
      signatureIntact: r.signedPayload && r.signature
        ? verifySignature(r.signedPayload, r.signature)
        : null, // null = no signature was generated (key not configured)
    }));

    res.json({
      submission: { id: submission.id, title: submission.title, status: submission.status },
      reviews: enrichedReviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews.", error: error.message });
  }
};
