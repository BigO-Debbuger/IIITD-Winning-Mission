// wavesync_web/src/pages/BuildToEarnPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Submission } from '../services/api';
import { SubmitWorkModal } from '../components/SubmitWorkModal';
import { ReviewQueueModal } from '../components/ReviewQueueModal';
import { CredentialModal } from '../components/CredentialModal';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import { ShieldCheck, CheckCircle2, Award, Plus, Layers } from 'lucide-react';

export const BuildToEarnPage: React.FC = () => {
  const { openAuthModal, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [reviewQueueModalOpen, setReviewQueueModalOpen] = useState(false);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const sList = await api.getSubmissions();
        setSubmissions(sList);
      } catch (err) {
        console.error('Failed to load submissions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  const handleSubmissionAdded = (newSub: Submission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  const handleOpenCredential = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setCredentialModalOpen(true);
  };

  return (
    <div className="bte-page-root" style={{ background: '#F7EFE4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <section
        className="section"
        style={{
          paddingTop: 'clamp(100px, 12vw, 140px)',
          paddingBottom: 'clamp(60px, 8vw, 100px)',
          flex: '1 0 auto',
        }}
      >
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
              <div>
                <div className="pill-badge pill-badge-mint" style={{ marginBottom: 14 }}>
                  <ShieldCheck size={13} /> Ed25519 Cryptographic Verification Protocol
                </div>
                <h1 className="section-title" style={{ marginBottom: 8 }}>
                  Build-to-Earn Proof Ledger
                </h1>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '1.05rem', maxWidth: 680 }}>
                  Every submission below has been evaluated with Ed25519 cryptographic signatures by senior reviewers,
                  establishing tamper-proof reputation that cannot be inflated.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal('login');
                    else setSubmitModalOpen(true);
                  }}
                  className="btn btn-coral"
                  style={{ minHeight: 44, padding: '0 22px' }}
                >
                  <Plus size={16} /> Submit Proof of Work
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal('login');
                    else setReviewQueueModalOpen(true);
                  }}
                  className="btn btn-dark"
                  style={{ minHeight: 44, padding: '0 20px' }}
                >
                  <Award size={16} /> Reviewer Queue
                </button>
              </div>
            </div>
          </Reveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)', fontWeight: 800 }}>
              Loading cryptographic proof records...
            </div>
          ) : submissions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#FFFFFF',
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <ShieldCheck size={40} color="var(--accent-mint)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 10 }}>No proofs submitted yet.</p>
              <p style={{ color: 'var(--ink-secondary)', marginBottom: 20 }}>
                Be the first builder to submit a verifiable deliverable to the cryptographic ledger.
              </p>
              <button
                onClick={() => {
                  if (!isAuthenticated) openAuthModal('login');
                  else setSubmitModalOpen(true);
                }}
                className="btn btn-primary"
              >
                Submit First Proof
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
              {submissions.map((sub, idx) => (
                <Reveal key={sub.id} staggerIndex={idx} delay={30}>
                  <div className="bte-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span
                          className={`bte-status ${
                            sub.status === 'approved' ? 'bte-status-approved' : 'bte-status-pending'
                          }`}
                        >
                          <CheckCircle2 size={12} /> {sub.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleOpenCredential(sub.id)}
                          className="bte-signature-badge"
                          style={{
                            cursor: 'pointer',
                            border: '1.5px solid var(--border-strong)',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                          title="Click to verify cryptographic signature"
                        >
                          <ShieldCheck size={12} color="#047857" /> Signed (Audit)
                        </button>
                      </div>

                      <h3 style={{ fontSize: '1.28rem', marginBottom: 8 }}>{sub.title}</h3>
                      <p style={{ fontSize: '0.88rem', marginBottom: 16 }}>{sub.description}</p>

                      {sub.reviews && sub.reviews.length > 0 && (
                        <div
                          onClick={() => handleOpenCredential(sub.id)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: 14,
                            marginBottom: 16,
                            cursor: 'pointer',
                            transition: 'border-color 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)' }}>
                              {sub.reviews[0].reviewer?.fullName || 'Verified Alumni Reviewer'}
                            </span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 850, color: 'var(--accent-coral)' }}>
                              Inspect Signature &rarr;
                            </span>
                          </div>
                          <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--ink-secondary)', margin: 0 }}>
                            "{sub.reviews[0].feedback}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 12,
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
                        by {sub.author?.fullName || 'Builder'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenCredential(sub.id)}
                        className="btn btn-outline"
                        style={{
                          minHeight: 34,
                          padding: '0 14px',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          background: '#FFFFFF',
                        }}
                        title="Inspect cryptographic proof deliverable and audit record"
                      >
                        Inspect Proof Artifact <ShieldCheck size={13} color="#047857" />
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <SubmitWorkModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmitted={handleSubmissionAdded}
      />

      <ReviewQueueModal
        isOpen={reviewQueueModalOpen}
        onClose={() => setReviewQueueModalOpen(false)}
        onReviewSubmitted={async () => {
          const fresh = await api.getSubmissions();
          setSubmissions(fresh);
        }}
      />

      <CredentialModal
        submissionId={selectedSubmissionId}
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
      />
    </div>
  );
};
