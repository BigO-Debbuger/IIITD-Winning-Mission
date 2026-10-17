// wavesync_web/src/components/ReviewQueueModal.tsx
import React, { useEffect, useState } from 'react';
import { api, Submission } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { Award, CheckCircle2, AlertCircle, ExternalLink, Loader2, ShieldCheck, Lock, LogIn } from 'lucide-react';

interface ReviewQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const ReviewQueueModal: React.FC<ReviewQueueModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [verdict, setVerdict] = useState<'approved' | 'rejected' | 'needs_revision'>('approved');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isReviewerRole = user?.role === 'alumni' || user?.role === 'admin';

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    setIsUnauthorized(false);

    if (!isAuthenticated) {
      setIsUnauthorized(true);
      setLoading(false);
      return;
    }

    if (!isReviewerRole) {
      setIsUnauthorized(true);
      setLoading(false);
      return;
    }

    try {
      const list = await api.getPendingReviews();
      setSubmissions(list);
      if (list.length > 0) setSelectedSub(list[0]);
      else setSelectedSub(null);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('only alumni')) {
        setIsUnauthorized(true);
      } else {
        setError(err.message || 'Failed to load pending submissions.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQueue();
    }
  }, [isOpen, isAuthenticated, user]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!feedback.trim()) {
      setError('Please provide qualitative feedback for the builder.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createReview({
        submissionId: selectedSub.id,
        verdict,
        feedback: feedback.trim(),
      });
      setSuccessMsg(`Submission marked as ${verdict} with Ed25519 signature!`);
      setFeedback('');
      setTimeout(() => {
        setSuccessMsg(null);
        loadQueue();
        if (onReviewSubmitted) onReviewSubmitted();
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reviewer Evaluation Queue"
      subtitle="Audit submissions & generate cryptographic proof signatures"
      maxWidth={760}
      icon={
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--accent-lime)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'inherit',
          }}
        >
          <Award size={22} color="var(--ink)" />
        </div>
      }
    >
      {/* 1. Unauthorized State (e.g. Student or Guest) */}
      {isUnauthorized ? (
        <div
          style={{
            padding: '28px 20px',
            textAlign: 'center',
            background: 'var(--paper-deep)',
            border: '2px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#FFF1F0',
              border: '2px solid #FF4B2F',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px auto',
            }}
          >
            <Lock size={24} color="#B91C1C" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 8, color: 'var(--ink)' }}>
            Reviewer Privileges Required
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', maxWidth: 500, margin: '0 auto 18px auto', lineHeight: 1.5 }}>
            {isAuthenticated ? (
              <>
                You are currently signed in as a <strong>{user?.role}</strong> ({user?.fullName}).
                The evaluation queue is restricted to verified alumni mentors and administrators to ensure peer audit integrity.
              </>
            ) : (
              'You must be signed in with a verified Alumni or Admin account to access the submission evaluation queue.'
            )}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={onClose}
              className="btn btn-outline"
              style={{ minHeight: 40, padding: '0 20px' }}
            >
              Back to Overview
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="btn btn-coral"
                style={{ minHeight: 40, padding: '0 20px' }}
              >
                <LogIn size={15} /> Sign In as Alumni
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 2. Authorized Reviewer State */
        <div>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: '#FFF1F0',
                border: '2px solid #FF4B2F',
                color: '#B91C1C',
                fontSize: '0.84rem',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: '#F0FDF4',
                border: '2px solid #00D7B9',
                color: '#047857',
                fontSize: '0.84rem',
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              <ShieldCheck size={18} />
              {successMsg}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Loader2 size={32} className="spin-animate" style={{ color: 'var(--ink)', marginBottom: 12 }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                Fetching pending queue from database...
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: 'var(--paper-deep)',
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <CheckCircle2 size={36} color="#047857" style={{ marginBottom: 10 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 4 }}>
                Queue is Clear!
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
                No pending Build-to-Earn proofs currently awaiting evaluation.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* List */}
              <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: 16 }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--ink-faint)',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Submissions ({submissions.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      style={{
                        padding: 12,
                        borderRadius: 'var(--radius-sm)',
                        background: selectedSub?.id === sub.id ? 'var(--paper-deep)' : 'var(--paper)',
                        border: `2px solid ${selectedSub?.id === sub.id ? 'var(--border-strong)' : 'var(--border-subtle)'
                          }`,
                        cursor: 'pointer',
                        boxShadow: selectedSub?.id === sub.id ? 'var(--shadow-sm)' : 'none',
                      }}
                    >
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--ink)' }}>
                        {sub.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                        by {sub.author?.fullName || 'Builder'} · {sub.proofType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Action Form */}
              {selectedSub && (
                <form onSubmit={handleReview}>
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 850,
                        textTransform: 'uppercase',
                        color: 'var(--accent-coral)',
                      }}
                    >
                      Selected Deliverable
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '4px 0 6px 0' }}>
                      {selectedSub.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', margin: '0 0 10px 0' }}>
                      {selectedSub.description}
                    </p>
                    <a
                      href={selectedSub.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.82rem',
                        fontWeight: 750,
                        color: 'var(--ink)',
                        textDecoration: 'underline',
                      }}
                    >
                      Open Submitted Artifact ({selectedSub.proofType}) <ExternalLink size={13} />
                    </a>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      Evaluation Verdict *
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className={`btn ${verdict === 'approved' ? 'btn-dark' : 'btn-outline'}`}
                        style={{ flex: 1, minHeight: 34, fontSize: '0.78rem' }}
                        onClick={() => setVerdict('approved')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={`btn ${verdict === 'needs_revision' ? 'btn-dark' : 'btn-outline'}`}
                        style={{ flex: 1, minHeight: 34, fontSize: '0.78rem' }}
                        onClick={() => setVerdict('needs_revision')}
                      >
                        Revision
                      </button>
                      <button
                        type="button"
                        className={`btn ${verdict === 'rejected' ? 'btn-dark' : 'btn-outline'}`}
                        style={{ flex: 1, minHeight: 34, fontSize: '0.78rem' }}
                        onClick={() => setVerdict('rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      Audit Feedback *
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Describe code benchmarks, architecture robustness, test coverage..."
                      rows={3}
                      className="form-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-coral"
                    style={{ width: '100%', minHeight: 40 }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="spin-animate" /> Signing & Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} /> Seal With Ed25519 Signature
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
