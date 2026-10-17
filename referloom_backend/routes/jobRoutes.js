// referloom_backend/routes/jobRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createJob,
  getCompanyJobs,
  getJobById,
  getStudentMatches, 
  applyForJob,
  getCompanyApplicants,
  updateApplicationStatusATS,
  getMyApplications,
  updateApplicationStatus,
  getAlumniApplicants,
  getMyJobs,             
  getJobMatchesForAlumni,
  updateJobStatus
} from '../controllers/jobController.js';

const router = express.Router();

// ==========================
// 1. SPECIFIC TEXT ROUTES (Must be at the top to prevent ID clashing)
// ==========================

// Company & Alumni
router.post('/', protect, createJob);                                    
router.get('/company', protect, getCompanyJobs);                         
router.get('/company/applicants', protect, getCompanyApplicants);        
router.get("/alumni-applicants", protect, getAlumniApplicants); // ✅ ADDED protect
router.get("/mine", protect, getMyJobs);                        // ✅ ADDED protect

// Students
router.get('/matches', protect, getStudentMatches);             // ✅ MOVED UP above dynamic routes
router.get('/my-applications', protect, getMyApplications);              

// ==========================
// 2. DYNAMIC ID ROUTES (Must go at the bottom)
// ==========================

router.put('/company/applications/:id/status', protect, updateApplicationStatusATS);
router.put('/applications/:id/status', protect, updateApplicationStatus); 
router.get("/:id/matches", protect, getJobMatchesForAlumni);    // ✅ ADDED protect
router.post('/:id/apply', protect, applyForJob);   
router.put('/:id/status', protect, updateJobStatus);                      

// 🚨 THIS MUST BE THE ABSOLUTE LAST ROUTE 🚨
router.get('/:id', protect, getJobById);                                 

export default router;