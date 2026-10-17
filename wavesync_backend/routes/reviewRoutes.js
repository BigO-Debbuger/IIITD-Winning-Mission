// wavesync_backend/routes/reviewRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createReview, getReviewsForSubmission } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", protect, createReview);                              // POST /api/reviews
router.get("/:submissionId", protect, getReviewsForSubmission);       // GET  /api/reviews/:submissionId

export default router;
