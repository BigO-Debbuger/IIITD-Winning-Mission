// wavesync_web/src/components/CredentialModal.tsx
import React, { useEffect, useState } from 'react';
import { api, CredentialVerificationResult } from '../services/api';
import { Modal } from './Modal';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  FileCode,
  Globe,
  FileText,
  Lock,
} from 'lucide-react';

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
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    let mounted = true;
    setLoading(true);
    setError(null);
    setCopiedHash(false);
    setCopiedUrl(false);

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

  const handleCopyHash = () => {
    if (!data?.sha256EvidenceHash) return;
    navigator.clipboard.writeText(data.sha256EvidenceHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyUrl = () => {
    if (!data?.proofUrl) return;
    navigator.clipboard.writeText(data.proofUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getProofTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'github':
        return <FileCode size={14} />;
      case 'live':
        return <Globe size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proof Artifact & Credential Audit"
      subtitle="Ed25519 Cryptographic Verification & Deliverable Inspection"
      maxWidth={640}
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
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <Loader2 size={34} className="spin-animate" style={{ color: 'var(--ink)', marginBottom: 12 }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>
            Inspecting proof artifact evidence and verifying Ed25519 signatures...
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: 18,
            borderRadius: 'var(--radius-md)',
            background: '#FFF1F0',
            border: '2px solid #FF4B2F',
            color: '#B91C1C',
            fontSize: '0.88rem',
            fontWeight: 750,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <AlertTriangle size={22} />
          <div>
            <div style={{ fontWeight: 900, marginBottom: 2 }}>Audit Verification Error</div>
            <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>{error}</div>
          </div>
        </div>
      ) : data ? (
        <div>
          {/* Status Verification Banner */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {data.verification.isAuthentic ? (
                <CheckCircle2 size={20} color="#047857" />
              ) : (
                <AlertTriangle size={20} color="#B45309" />
              )}
              <div>
                <span
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 900,
                    color: data.verification.isAuthentic ? '#047857' : '#B45309',
                    display: 'block',
                  }}
                >
                  {data.verification.isAuthentic
                    ? 'Cryptographically Verified Authentic'
                    : 'Pending or Signature Unverified'}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--ink-secondary)' }}>
                  Tamper-proof registry check passed with status: <strong>{data.status.toUpperCase()}</strong>
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 999,
                background: '#FFFFFF',
                border: '1px solid var(--border-strong)',
                color: 'var(--ink)',
              }}
            >
              {data.verification.algorithm}
            </span>
          </div>

          {/* Deliverable Artifact Details */}
          <div
            style={{
              background: '#FFFFFF',
              border: '2px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 16,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--accent-coral)',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Proof Deliverable
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 850, margin: 0, color: 'var(--ink)', lineHeight: 1.3 }}>
                  {data.title}
                </h3>
              </div>

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 850,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'var(--paper-deep)',
                  border: '1px solid var(--border-strong)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
                }}
              >
                {getProofTypeIcon(data.proofType)} {data.proofType}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)' }}>
                Submitted by: <strong>{data.author.fullName}</strong> ({data.author.role})
              </span>
            </div>

            {/* Direct Artifact Action Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--paper)',
                border: '1px solid var(--border-subtle)',
                gap: 12,
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--ink-muted)', display: 'block' }}>
                  Artifact Resource Location:
                </span>
                <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--ink)', fontWeight: 600 }}>
                  {data.proofUrl}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="btn btn-outline"
                  style={{ minHeight: 32, padding: '0 10px', fontSize: '0.75rem', background: '#FFFFFF' }}
                  title="Copy artifact link"
                >
                  {copiedUrl ? <Check size={12} color="#047857" /> : <Copy size={12} />}
                  {copiedUrl ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={data.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-coral"
                  style={{ minHeight: 32, padding: '0 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Open Artifact <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Evidence SHA-256 Hash */}
          <div
            style={{
              background: 'var(--paper-deep)',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Lock size={12} /> SHA-256 Evidence Integrity Hash
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: copiedHash ? '#047857' : 'var(--accent-coral)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {copiedHash ? <Check size={12} /> : <Copy size={12} />}
                {copiedHash ? 'Hash Copied!' : 'Copy Hash'}
              </button>
            </div>
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                wordBreak: 'break-all',
                color: 'var(--ink)',
                display: 'block',
                background: 'rgba(255, 255, 255, 0.6)',
                padding: '6px 8px',
                borderRadius: 4,
                border: '1px solid var(--border-subtle)',
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
                <span style={{ fontSize: '0.86rem', fontWeight: 850, color: 'var(--ink)' }}>
                  Audit Review by {data.review.reviewer?.fullName || 'Verified Alumni Reviewer'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: data.review.verdict === 'approved' ? 'var(--accent-lime)' : '#FFF1F0',
                    color: data.review.verdict === 'approved' ? 'var(--ink)' : '#B91C1C',
                    border: '1px solid var(--border-strong)',
                    textTransform: 'uppercase',
                  }}
                >
                  Verdict: {data.review.verdict}
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', fontStyle: 'italic', margin: '0 0 12px 0', lineHeight: 1.45 }}>
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
                    Ed25519 Cryptographic Signature Seal
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

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--paper-deep)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--ink-faint)',
              lineHeight: 1.45,
              marginBottom: 16,
            }}
          >
            <strong>Cryptographic Scope:</strong> The SHA-256 digest covers submitted evidence metadata (URL, title, description). The Ed25519 signature confirms that an authorized reviewer evaluated this record and signed it under the WaveSync public key.
          </div>

          <button
            onClick={onClose}
            className="btn btn-dark"
            style={{ width: '100%', minHeight: 40 }}
          >
            Close Audit Inspector
          </button>
        </div>
      ) : null}
    </Modal>
  );
};
