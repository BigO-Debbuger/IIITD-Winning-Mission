import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
const router = express.Router();

// Changed from "/send-otp" to "/send" to match frontend AuthContext
router.post("/send", sendOtp); 
router.post("/verify-otp", verifyOtp);
router.post("/verify", verifyOtp);

export default router;