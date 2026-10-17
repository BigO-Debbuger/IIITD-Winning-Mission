// wavesync_backend/routes/matchingRoutes.js
import express from 'express';
import { getCofounderMatches } from '../controllers/matchingController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/founders', optionalAuth, getCofounderMatches);
router.get('/cofounders', optionalAuth, getCofounderMatches);

export default router;
