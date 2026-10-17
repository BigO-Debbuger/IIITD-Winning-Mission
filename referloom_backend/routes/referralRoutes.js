// referloom_backend/routes/referralRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { referCandidate } from "../controllers/referralController.js";

const router = express.Router();

router.use(protect);

router.post("/refer", referCandidate); // Triggers the Alumni "Refer" button

export default router;