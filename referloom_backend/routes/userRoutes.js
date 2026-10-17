// referloom_backend/routes/userRoutes.js
import express from "express";
import { 
  getMyProfile, 
  getUserById, 
  updateVisibility, 
  updateProfile,
  updateCareerPreferences,
  getAllAlumni,
  resetCareerGoals // ✅ Imported the missing controller
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getMyProfile);
router.put("/profile", updateProfile); 
router.put("/visibility", updateVisibility);
router.post("/career-preferences", updateCareerPreferences);
// userRoutes.js
router.post("/reset-career-goals", protect, resetCareerGoals);

// ✅ Added the missing alumni route
router.get("/alumni", getAllAlumni);

// Note: /:id must always be at the bottom, otherwise "/alumni" is treated as an ID!
router.get("/:id", getUserById); 

export default router;