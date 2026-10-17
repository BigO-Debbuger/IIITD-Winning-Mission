// wavesync_backend/routes/ventureRoutes.js
import express from 'express';
import { generateVenturePlan, getEcosystemGrants } from '../controllers/ventureController.js';

const router = express.Router();

router.post('/plan', generateVenturePlan);
router.get('/grants', getEcosystemGrants);

export default router;
