// wavesync_backend/controllers/submissionController.js
import { prisma } from "../config/prisma.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const VALID_PROOF_TYPES = ["github", "live", "pdf", "other"];
const VALID_STATUSES = ["pending", "in_review", "approved", "rejected"];

// Validates that a URL begins with https:// (or http:// for local dev only)
const isValidProofUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// POST /api/submissions
// Create a new submission. Any authenticated user can submit.
// ---------------------------------------------------------------------------
export const createSubmission = async (req, res) => {
  try {
    const { title, description, proofUrl, proofType, collabPostId } = req.body;

    // Required field validation
    if (!title || !description || !proofUrl || !proofType) {
      return res.status(400).json({
        message: "title, description, proofUrl, and proofType are all required.",
      });
    }

    if (typeof title !== "string" || title.trim().length < 3) {
      return res.status(400).json({ message: "title must be at least 3 characters." });
    }

    if (!VALID_PROOF_TYPES.includes(proofType)) {
      return res.status(400).json({
        message: `proofType must be one of: ${VALID_PROOF_TYPES.join(", ")}`,
      });
    }

    if (!isValidProofUrl(proofUrl)) {
      return res.status(400).json({
        message: "proofUrl must be a valid https:// URL.",
      });
    }

    // If collabPostId supplied, verify the post exists
    if (collabPostId) {
      const post = await prisma.collabPost.findUnique({ where: { id: collabPostId } });
      if (!post) {
        return res.status(404).json({ message: "CollabPost not found." });
      }
    }

    const submission = await prisma.submission.create({
      data: {
        authorId: req.user.id,
        title: title.trim(),
        description: description.trim(),
        proofUrl: proofUrl.trim(),
        proofType,
        collabPostId: collabPostId || null,
        status: "pending",
      },
      include: {
        author: { select: { id: true, fullName: true, profileImage: true } },
        collabPost: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({ message: "Submission created successfully.", submission });
  } catch (error) {
    console.error("createSubmission error:", error.message);
    res.status(500).json({ message: "Failed to create submission.", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/submissions/mine
// List the authenticated user's own submissions.
// ---------------------------------------------------------------------------
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { authorId: req.user.id },
      include: {
        collabPost: { select: { id: true, title: true } },
        reviews: {
          select: {
            id: true,
            verdict: true,
            feedback: true,
            signatureVerified: true,
            createdAt: true,
            reviewer: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions.", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/submissions/:id
// Fetch a single submission.
// - Author always has access.
// - Alumni and admin always have access.
// - Others: 403.
// ---------------------------------------------------------------------------
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, fullName: true, profileImage: true, headline: true } },
        collabPost: { select: { id: true, title: true } },
        reviews: {
          select: {
            id: true,
            verdict: true,
            feedback: true,
            signedPayload: true,
            signature: true,
            signatureVerified: true,
            createdAt: true,
            reviewer: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    const isOwner = submission.authorId === req.user.id;
    const isReviewer = req.user.role === "alumni" || req.user.role === "admin";

    if (!isOwner && !isReviewer) {
      return res.status(403).json({ message: "Not authorized to view this submission." });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submission.", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/submissions/collab/:collabPostId
// List all submissions linked to a specific collab post.
// Only alumni and admin can view the full list.
// ---------------------------------------------------------------------------
export const getSubmissionsForCollabPost = async (req, res) => {
  try {
    const { collabPostId } = req.params;

    if (req.user.role !== "alumni" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only alumni and admin can list submissions for a collaboration post.",
      });
    }

    const post = await prisma.collabPost.findUnique({ where: { id: collabPostId } });
    if (!post) {
      return res.status(404).json({ message: "CollabPost not found." });
    }

    const submissions = await prisma.submission.findMany({
      where: { collabPostId },
      include: {
        author: { select: { id: true, fullName: true, profileImage: true } },
        reviews: {
          select: {
            id: true,
            verdict: true,
            signatureVerified: true,
            reviewer: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ collabPost: { id: post.id, title: post.title }, submissions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions.", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/submissions/pending
// List all pending / in_review submissions (for reviewers).
// Only alumni and admin.
// ---------------------------------------------------------------------------
export const getPendingSubmissions = async (req, res) => {
  try {
    if (req.user.role !== "alumni" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only alumni and admin can view the review queue." });
    }

    const { status } = req.query; // optional filter
    const where = {};
    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    } else {
      where.status = { in: ["pending", "in_review"] };
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        author: { select: { id: true, fullName: true, profileImage: true } },
        reviews: {
          select: {
            id: true,
            verdict: true,
            reviewer: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" }, // oldest first (fair queue)
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch review queue.", error: error.message });
  }
};
