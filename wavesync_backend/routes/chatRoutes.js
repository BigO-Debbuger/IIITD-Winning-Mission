// wavesync_backend/routes/chatRoutes.js
import express from "express";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import {
  sendMessage,
  getHistory,
  clearHistory,
  getStatus,
} from "../controllers/chatController.js";

const router = express.Router();

// All chat routes support optional authentication so both guests and logged-in users are served seamlessly
router.use(optionalAuth);

router.post("/", sendMessage);
router.get("/history", getHistory);
router.delete("/history/:conversationId", clearHistory);
router.delete("/history", clearHistory);
router.get("/status", getStatus);

export default router;
