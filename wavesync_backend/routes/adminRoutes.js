import express from "express";
import { getPendingUsers, verifyUser } from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin views pending verifications
router.get("/pending", protect, authorizeRoles("admin"), getPendingUsers);

// Admin verifies a user
router.put("/verify/:id", protect, authorizeRoles("admin"), verifyUser);

export default router;