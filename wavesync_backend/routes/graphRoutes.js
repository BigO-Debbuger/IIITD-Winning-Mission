// wavesync_backend/routes/graphRoutes.js
import express from 'express';
import { getOpportunityGraph } from '../controllers/graphController.js';

const router = express.Router();

router.get('/', getOpportunityGraph);

export default router;
