// wavesync_backend/routes/submissionRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getPublicSubmissions,
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  getSubmissionsForCollabPost,
  getPendingSubmissions,
} from "../controllers/submissionController.js";

const router = express.Router();

// Specific text routes first (prevent ID clash with dynamic segments)
router.get("/", getPublicSubmissions);                                     // GET  /api/submissions
router.get("/mine", protect, getMySubmissions);                           // GET  /api/submissions/mine
router.get("/pending", protect, getPendingSubmissions);                   // GET  /api/submissions/pending
router.get("/collab/:collabPostId", protect, getSubmissionsForCollabPost); // GET  /api/submissions/collab/:id

// Generic create + fetch
router.post("/", protect, createSubmission);                              // POST /api/submissions
router.get("/:id", protect, getSubmissionById);                           // GET  /api/submissions/:id

export default router;
