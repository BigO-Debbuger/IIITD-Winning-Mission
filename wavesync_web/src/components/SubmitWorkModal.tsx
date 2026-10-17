// wavesync_web/src/components/SubmitWorkModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Submission } from '../services/api';
import { Modal } from './Modal';
import { FileCode, Send, Loader2 } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onClose();
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
      // Reset
      setTitle('');
      setDescription('');
      setProofUrl('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Proof of Work"
      subtitle="Submit verifiable code, prototypes, or demos to be reviewed and cryptographically signed."
      maxWidth={540}
      icon={
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--accent-mint)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'inherit',
          }}
        >
          <FileCode size={20} color="var(--ink)" />
        </div>
      }
    >
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: '#FFF0F0',
            border: '2px solid #FF4B2F',
            color: '#B91C1C',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Project / Milestone Title *
          </label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="e.g. Verifiable SNARK Indexer Core Engine"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Artifact Type *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { id: 'github', label: 'GitHub Repo' },
              { id: 'live', label: 'Live App' },
              { id: 'pdf', label: 'Technical Spec' },
              { id: 'other', label: 'Design System' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setProofType(type.id as any)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${
                    proofType === type.id ? 'var(--border-strong)' : 'var(--border-subtle)'
                  }`,
                  background: proofType === type.id ? 'var(--accent-lime)' : '#FAF6F0',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  boxShadow: proofType === type.id ? 'var(--shadow-tactile-sm)' : 'none',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Evidence URL *
          </label>
          <input
            type="url"
            required
            className="form-input"
            placeholder="https://github.com/... or https://mydemo.app"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Proof Description & Scope *
          </label>
          <textarea
            required
            rows={3}
            className="form-input"
            style={{ resize: 'vertical' }}
            placeholder="Describe what was built, key algorithmic benchmarks, test coverage, and instructions to verify..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ minHeight: 42, padding: '0 20px' }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-coral"
            style={{ minHeight: 42, padding: '0 24px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-animate" /> Sealing Evidence...
              </>
            ) : (
              <>
                <Send size={15} /> Submit for Review
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
