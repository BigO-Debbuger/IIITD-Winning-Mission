// wavesync_web/src/components/OpportunitySlideOver.tsx
import React, { useEffect } from 'react';
import { JobOpportunity } from '../services/api';
import { X, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface OpportunitySlideOverProps {
  job: JobOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: JobOpportunity) => void;
}

export const OpportunitySlideOver: React.FC<OpportunitySlideOverProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const isBounty = !job.jobType.toLowerCase().includes('full');

  return (
    <div
      className="slide-over-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Opportunity Details"
    >
      <div
        className="slide-over-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="slide-over-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isBounty ? 'var(--accent-violet)' : 'var(--accent-coral)',
                }}
              >
                {job.companyName || job.company}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'var(--paper-deep)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {job.location}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: isBounty ? '#FDF4FF' : '#EFFDF5',
                  color: isBounty ? '#7E22CE' : '#047857',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {job.jobType}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 850, lineHeight: 1.2 }}>
              {job.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="slide-over-close-btn"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (Scrollable progressive disclosure) */}
        <div className="slide-over-body">
          {/* Key Terms Card */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: 2 }}>
                {isBounty ? 'Total Grant Bounty' : 'Compensation Package'}
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--ink)' }}>
                {job.salaryRange || job.salary || 'Competitive'}
              </span>
            </div>

            {job.equity && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: 2 }}>
                  Venture Stake
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>
                  {job.equity} Equity
                </span>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: -6 }}>
            * Note: Compensation packages and equity stakes are determined directly by the posting venture team, subject to mutual agreement and deliverable audits.
          </div>

          {/* Role Overview */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-secondary)', marginBottom: 8 }}>
              Overview & Objectives
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink-muted)' }}>
              {job.description}
            </p>
          </div>

          {/* Technical Requirements & Tech Stack */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-secondary)', marginBottom: 10 }}>
                Required Skill Stack & Experience
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {job.requirements.map((req, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 750,
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--paper-deep)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--ink)',
                    }}
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Verification Guarantee */}
          <div
            style={{
              background: '#EFFDF5',
              border: '1.5px solid #047857',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              display: 'flex',
              gap: 12,
            }}
          >
            <ShieldCheck size={20} color="#047857" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 850, color: '#047857', marginBottom: 4 }}>
                Verifiable Proof Advantage
              </h5>
              <p style={{ fontSize: '0.82rem', color: '#065F46', lineHeight: 1.5, margin: 0 }}>
                Applicants with verified cryptographic proofs in the Build-to-Earn ledger present tamper-evident proof of work directly to hiring leads alongside their application.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="slide-over-footer">
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ minHeight: 44, padding: '0 20px' }}
          >
            Back to Feed
          </button>

          <button
            onClick={() => {
              onClose();
              onApply(job);
            }}
            className="btn btn-primary"
            style={{ minHeight: 44, padding: '0 24px', flex: 1 }}
          >
            Submit Application <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
