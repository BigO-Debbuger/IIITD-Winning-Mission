import express from "express";
import { getPublicKey, verifySubmissionCredential } from "../controllers/credentialController.js";

const router = express.Router();

router.get("/public-key", getPublicKey);
router.get("/verify/:submissionId", verifySubmissionCredential);

export default router;
