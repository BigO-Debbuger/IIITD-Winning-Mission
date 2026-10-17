import React, { useEffect } from 'react';
import { CollabProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, ArrowUpRight, ShieldCheck, Target, Users, CheckCircle2 } from 'lucide-react';

interface VentureSlideOverProps {
  collab: CollabProject | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestJoin: (collab: CollabProject) => void;
  onOpenCoFounders?: () => void;
}

export const VentureSlideOver: React.FC<VentureSlideOverProps> = ({
  collab,
  isOpen,
  onClose,
  onRequestJoin,
  onOpenCoFounders,
}) => {
  const { user } = useAuth();
  const isOwner = Boolean(user && (collab?.author?.id === user.id || collab?.authorId === user.id));
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

  if (!isOpen || !collab) return null;

  return (
    <div
      className="slide-over-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Venture Details"
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
                  fontSize: '0.72rem',
                  fontWeight: 850,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'var(--accent-lime)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--ink)',
                }}
              >
                {collab.projectStage || 'Active Discovery'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--ink-muted)',
                }}
              >
                Initiated by {collab.author?.fullName || 'Venture Lead'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 850, lineHeight: 1.2 }}>
              {collab.title}
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

        {/* Body */}
        <div className="slide-over-body">
          {/* Mission & Problem Statement */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-secondary)', marginBottom: 8 }}>
              Venture Thesis & Problem
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink-muted)' }}>
              {collab.description}
            </p>
          </div>

          {/* Technical Execution Pillars Needed */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-secondary)', marginBottom: 10 }}>
              Technical Lead Capabilities Required
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {collab.skillsRequired.map((skill, idx) => (
                <span
                  key={idx}
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
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Milestone Execution Protocol */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1.5px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Target size={16} color="var(--accent-coral)" />
              <h5 style={{ fontSize: '0.9rem', fontWeight: 850, margin: 0 }}>
                Milestone & Equity Framework
              </h5>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-muted)', lineHeight: 1.5, margin: 0 }}>
              Early contributors are allocated milestone equity and deliverable bounties as agreed directly with the venture creator, substantiated through peer-reviewed proof artifacts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="slide-over-footer">
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ minHeight: 44, padding: '0 20px' }}
          >
            Back to Ventures
          </button>

          {isOwner ? (
            <button
              onClick={() => {
                onClose();
                if (onOpenCoFounders) onOpenCoFounders();
              }}
              className="btn btn-dark"
              style={{ minHeight: 44, padding: '0 20px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Users size={15} /> Find Co-Founders for Your Venture
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onRequestJoin(collab);
              }}
              className="btn btn-coral"
              style={{ minHeight: 44, padding: '0 24px', flex: 1 }}
            >
              Request to Join Venture <ArrowUpRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
