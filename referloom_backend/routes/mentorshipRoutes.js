// referloom_backend/routes/mentorshipRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
  requestMentorship, 
  getMentorshipRequests, 
  updateMentorshipStatus 
} from "../controllers/mentorshipController.js";

const router = express.Router();

router.use(protect);

router.post("/request", requestMentorship); // Student
router.get("/requests", getMentorshipRequests); // Student & Alumni
router.put("/requests/:id", updateMentorshipStatus); // Alumni

export default router;