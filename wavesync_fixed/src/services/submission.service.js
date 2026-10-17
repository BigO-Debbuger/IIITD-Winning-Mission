// wavesync_fixed/src/services/submission.service.js
import api from './api';

// ─── Submission endpoints ───────────────────────────────────────────────────

/** Create a new proof-of-work submission. */
export const createSubmission = (data) => api.post('/submissions', data);

/** List submissions authored by the current user. */
export const getMySubmissions = () => api.get('/submissions/mine');

/** Get a single submission by ID (includes reviews). */
export const getSubmissionById = (id) => api.get(`/submissions/${id}`);

/** Get all submissions for a collaboration post (alumni/admin only). */
export const getSubmissionsForCollabPost = (collabPostId) =>
  api.get(`/submissions/collab/${collabPostId}`);

/** Get the pending/in_review queue (alumni/admin only). */
export const getPendingSubmissions = (status) => {
  const params = status ? `?status=${status}` : '';
  return api.get(`/submissions/pending${params}`);
};

// ─── Review endpoints ────────────────────────────────────────────────────────

/** Submit a review for a submission (alumni/admin only). */
export const createReview = (data) => api.post('/reviews', data);

/** Get all reviews for a submission. */
export const getReviewsForSubmission = (submissionId) =>
  api.get(`/reviews/${submissionId}`);
