// wavesync_web/src/components/SubmitWorkModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Submission } from '../services/api';
import { X, Send, Link, FileCode, CheckCircle, Loader2 } from 'lucide-react';

export const SubmitWorkModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (submission: Submission) => void;
}> = ({ isOpen, onClose, onSubmitted }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofType, setProofType] = useState<'github' | 'live' | 'pdf' | 'other'>('github');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const newSub = await api.createSubmission({
        title,
        description,
        proofUrl,
        proofType,
      });
      onSubmitted(newSub);
      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setProofUrl('');
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1.5px solid var(--border-strong)',
            background: '#FAF6F0',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: 20 }}>
          <div className="pill-badge pill-badge-mint" style={{ marginBottom: 12 }}>
            <FileCode size={13} /> Build-to-Earn
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: -0.04 }}>
            Submit Proof of Work
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginTop: 4 }}>
            Submit verifiable code, prototypes, or demos to be reviewed and cryptographically signed by alumni mentors.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: '#FFF0F0',
              border: '1.5px solid var(--accent-coral)',
              color: '#B91C1C',
              fontSize: '0.85rem',
              fontWeight: 650,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Project or Artifact Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Optimistic Rollup Fraud Prover"
              className="text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Proof Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { id: 'github', label: 'GitHub Repo' },
                { id: 'live', label: 'Live Demo' },
                { id: 'pdf', label: 'PDF Spec' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setProofType(t.id as any)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-strong)',
                    background: proofType === t.id ? 'var(--accent-lime)' : '#FAF6F0',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    boxShadow: proofType === t.id ? 'var(--shadow-tactile-sm)' : 'none',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Verifiable Evidence URL</label>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                required
                placeholder="https://github.com/username/project"
                className="text-input"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
              <Link
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--ink-muted)',
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Work Description & Technical Highlights</label>
            <textarea
              required
              rows={4}
              placeholder="Detail your engineering decisions, test coverage, algorithms implemented, and instructions to verify the work."
              className="text-input"
              style={{ padding: '12px 14px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-coral"
            style={{ width: '100%', marginTop: 12, minHeight: 48 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying & Transacting...
              </>
            ) : (
              <>
                <Send size={16} /> Broadcast Proof to Reviewers
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
