// wavesync_web/src/components/JoinCollabModal.tsx
import React, { useState } from 'react';
import { api, CollabProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { Users, AlertCircle, ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react';

interface JoinCollabModalProps {
  collab: CollabProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinCollabModal: React.FC<JoinCollabModalProps> = ({
  collab,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collab) return;

    if (!isAuthenticated) {
      onClose();
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.applyToCollab(collab.id, {
        role: role.trim() || undefined,
        message: message.trim() || undefined,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit collaboration request.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setSuccess(false);
    setRole('');
    setMessage('');
    onClose();
  };

  if (!collab) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDone}
      title="Request to Join Venture"
      subtitle={collab.title}
      maxWidth={520}
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
          <Users size={20} color="var(--ink)" />
        </div>
      }
    >
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

      {success ? (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            background: '#F0FDF4',
            border: '2px solid #00D7B9',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <CheckCircle2 size={40} color="#047857" style={{ marginBottom: 10 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 6, color: 'var(--ink)' }}>
            Collaboration Request Sent!
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', margin: '0 0 16px 0' }}>
            The project lead ({collab.author?.fullName || 'Venture Lead'}) has received your application.
          </p>
          <button
            onClick={handleDone}
            className="btn btn-dark"
            style={{ minHeight: 38, padding: '0 20px', width: '100%' }}
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
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
              Intended Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Founding Frontend Engineer / Systems Lead"
              className="form-input"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
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
              Why are you a strong complement?
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly state your relevant experience, GitHub repo link, or verified proof..."
              rows={3}
              className="form-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
              className="btn btn-coral"
              style={{ minHeight: 42, padding: '0 24px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-animate" /> Submitting...
                </>
              ) : (
                <>
                  Submit Request <ArrowUpRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
