// wavesync_backend/routes/networkRoutes.js
import express from 'express';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';
import {
  getPeopleDirectory,
  getPersonProfile,
  updateNetworkProfile,
  sendConnectionRequest,
  getAcceptedConnections,
  getConnectionRequests,
  respondToConnectionRequest,
  sendMentorshipRequest,
  getMyMentorshipRequests,
  respondToMentorshipRequest,
  getConversations,
  getConversationMessages,
  sendMessage,
  getExplainableRecommendations,
  recordNetworkOutcome,
  getNetworkOutcomes
} from '../controllers/networkController.js';

const router = express.Router();

// --- People & Directory ---
router.get('/people', optionalAuth, getPeopleDirectory);
router.get('/people/:id', optionalAuth, getPersonProfile);
router.patch('/profile', protect, updateNetworkProfile);

// --- Connections ---
router.post('/connections', protect, sendConnectionRequest);
router.get('/connections', protect, getAcceptedConnections);
router.get('/connections/requests', protect, getConnectionRequests);
router.patch('/connections/:id', protect, respondToConnectionRequest);

// --- Mentorship ---
router.post('/mentorship-requests', protect, sendMentorshipRequest);
router.get('/mentorship-requests', protect, getMyMentorshipRequests);
router.patch('/mentorship-requests/:id', protect, respondToMentorshipRequest);

// --- Direct Messaging (Accepted peers) ---
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id/messages', protect, getConversationMessages);
router.post('/conversations/:id/messages', protect, sendMessage);

// --- Explainable Recommendations ---
router.get('/recommendations', protect, getExplainableRecommendations);

// --- Outcome Tracking ---
router.post('/outcomes', protect, recordNetworkOutcome);
router.get('/outcomes', protect, getNetworkOutcomes);

export default router;
