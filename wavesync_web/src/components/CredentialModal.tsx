// wavesync_web/src/components/CredentialModal.tsx
import React, { useEffect, useState } from 'react';
import { api, CredentialVerificationResult } from '../services/api';
import { Modal } from './Modal';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

interface CredentialModalProps {
  submissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CredentialModal: React.FC<CredentialModalProps> = ({
  submissionId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CredentialVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    api
      .verifyCredential(submissionId)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to verify credential.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, submissionId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verifiable Proof Credential"
      subtitle="Ed25519 & SHA-256 Tamper-Proof Audit"
      maxWidth={620}
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
          <ShieldCheck size={22} color="var(--ink)" />
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Loader2 size={32} className="spin-animate" style={{ color: 'var(--ink)', marginBottom: 12 }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>
            Verifying cryptographic signatures and evidence hashes...
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: '#FFF1F0',
            border: '2px solid #FF4B2F',
            color: '#B91C1C',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={20} />
          {error}
        </div>
      ) : data ? (
        <div>
          {/* Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: data.verification.isAuthentic ? '#F0FDF4' : '#FEF3C7',
              border: `2px solid ${data.verification.isAuthentic ? '#00D7B9' : '#F59E0B'}`,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {data.verification.isAuthentic ? (
                <CheckCircle2 size={18} color="#047857" />
              ) : (
                <AlertTriangle size={18} color="#B45309" />
              )}
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  color: data.verification.isAuthentic ? '#047857' : '#B45309',
                }}
              >
                {data.verification.isAuthentic
                  ? 'Cryptographically Verified Authentic'
                  : 'Pending or Signature Unverified'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink-secondary)' }}>
              {data.verification.algorithm}
            </span>
          </div>

          {/* Submission Details */}
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ink-faint)',
              }}
            >
              Work Deliverable
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 850, margin: '4px 0 6px 0', color: 'var(--ink)' }}>
              {data.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                Author: <strong>{data.author.fullName}</strong>
              </span>
              <a
                href={data.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.8rem',
                  fontWeight: 750,
                  color: 'var(--accent-coral)',
                }}
              >
                View Artifact <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Evidence SHA-256 Hash */}
          <div
            style={{
              background: 'var(--paper-deep)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 850,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ink-secondary)',
                display: 'block',
                marginBottom: 4,
              }}
            >
              SHA-256 Evidence Integrity Hash
            </span>
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                wordBreak: 'break-all',
                color: 'var(--ink)',
              }}
            >
              {data.sha256EvidenceHash}
            </code>
          </div>

          {/* Reviewer & Digital Signature */}
          {data.review && (
            <div
              style={{
                background: 'var(--paper)',
                border: '2px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                marginBottom: 20,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--ink)' }}>
                  Review by {data.review.reviewer?.fullName || 'Verified Alumni Reviewer'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'var(--accent-lime)',
                    border: '1px solid var(--border-strong)',
                    textTransform: 'uppercase',
                  }}
                >
                  Verdict: {data.review.verdict}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', fontStyle: 'italic', margin: '0 0 12px 0' }}>
                "{data.review.feedback}"
              </p>

              {data.review.signature && (
                <div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 850,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--ink-secondary)',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Ed25519 Digital Signature
                  </span>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.76rem',
                      wordBreak: 'break-all',
                      background: 'var(--paper-deep)',
                      padding: '6px 10px',
                      borderRadius: 4,
                      display: 'block',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {data.review.signature}
                  </code>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="btn btn-dark"
            style={{ width: '100%', minHeight: 40 }}
          >
            Close Verification Record
          </button>
        </div>
      ) : null}
    </Modal>
  );
};
