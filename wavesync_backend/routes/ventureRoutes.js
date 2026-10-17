// wavesync_backend/routes/ventureRoutes.js
import express from 'express';
import { generateVenturePlan } from '../controllers/ventureController.js';

const router = express.Router();

router.post('/plan', generateVenturePlan);

export default router;
