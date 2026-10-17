// wavesync_backend/routes/collabRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createPost,
  getActivePosts,
  getMyPosts,
  toggleStatus,
  applyToPost,
  getPostById,
} from '../controllers/collabController.js';

const router = express.Router();

// Route: /api/collab
router.route('/')
  .get(getActivePosts)         // Public list of active collab posts
  .post(protect, createPost);  // Create a new post

router.get('/active', getActivePosts);          // Active posts for Explore feed
router.get('/mine', protect, getMyPosts);       // Get my posts + applicants
router.get('/:id', getPostById);                 // Get single post by ID
router.put('/:id/toggle', protect, toggleStatus); // Toggle Active/Inactive status
router.post('/:id/apply', protect, applyToPost);  // Apply to a specific post

export default router;