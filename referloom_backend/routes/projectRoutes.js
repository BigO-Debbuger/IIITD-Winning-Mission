import express from "express";
import { 
    createProject, 
    getMyProjects, 
    getProjectById,
    updateProject, // ✅ Import the new function
    deleteProject
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.post("/", createProject);
router.get("/mine", getMyProjects);
router.get("/:id", getProjectById);

// ✅ Add the PUT route for updating
router.put("/:id", updateProject);

// Optional: Add a DELETE route if you want to be able to delete straight from the project page later
router.delete("/:id", deleteProject); 

export default router;