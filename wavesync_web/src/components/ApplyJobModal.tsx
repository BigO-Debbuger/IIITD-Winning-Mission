// wavesync_web/src/components/ApplyJobModal.tsx
import React, { useState } from 'react';
import { api, JobOpportunity } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { Briefcase, CheckCircle2, AlertCircle, ArrowUpRight, Loader2 } from 'lucide-react';

interface ApplyJobModalProps {
  job: JobOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!isAuthenticated) {
      onClose();
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.applyToJob(job.id);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDone}
      title="Apply for Role"
      subtitle={job.companyName || job.company}
      maxWidth={520}
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
          <Briefcase size={20} color="var(--ink)" />
        </div>
      }
    >
      {/* Job Overview */}
      <div
        style={{
          background: 'var(--paper-deep)',
          border: '2px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--ink)' }}>{job.title}</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--paper)',
              border: '1px solid var(--border-strong)',
            }}
          >
            {job.location}
          </span>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
          {job.description}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.requirements.map((req, i) => (
            <span key={i} className="opp-tag" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              {req}
            </span>
          ))}
        </div>
      </div>

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
            Application Submitted!
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', margin: '0 0 16px 0' }}>
            Your student profile and verified credentials have been submitted to {job.companyName || job.company}.
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
        <form onSubmit={handleApply}>
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
              Applicant Profile
            </label>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--paper)',
                border: '2px solid var(--border-strong)',
                fontSize: '0.88rem',
                color: 'var(--ink)',
                fontWeight: 600,
              }}
            >
              {isAuthenticated ? (
                <span>
                  Logged in as <strong>{user?.fullName}</strong> ({user?.role})
                </span>
              ) : (
                <span style={{ color: 'var(--accent-coral)' }}>
                  You need to sign in as a student to apply.
                </span>
              )}
            </div>
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
                  Confirm Application <ArrowUpRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
