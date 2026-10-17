// wavesync_web/src/components/CofounderMatchingModal.tsx
import React, { useEffect, useState } from 'react';
import { api, CofounderMatch, CapabilityPillars } from '../services/api';
import { Modal } from './Modal';
import {
  Users,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';

interface CofounderMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate?: (candidate: CofounderMatch) => void;
}

export const CofounderMatchingModal: React.FC<CofounderMatchingModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidate,
}) => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<CofounderMatch[]>([]);
  const [myPillars, setMyPillars] = useState<CapabilityPillars | null>(null);
  const [hasCapabilityData, setHasCapabilityData] = useState<boolean>(true);
  const [filterMinScore, setFilterMinScore] = useState(60);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    api
      .getCofounderMatches()
      .then((res: any) => {
        if (mounted) {
          setMatches(res.matches || []);
          setMyPillars(res.currentUserPillars || null);
          const hasData =
            res.hasCapabilityData ??
            (res.currentUserPillars
              ? Object.values(res.currentUserPillars as Record<string, number>).some((v) => v > 0)
              : false);
          setHasCapabilityData(hasData);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to calculate cofounder matches.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const filteredMatches = matches.filter((m) => m.matchScore >= filterMinScore);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complementary Co-Founder Matching"
      subtitle="Deterministic 4-Pillar Synergy Engine"
      maxWidth={840}
      icon={
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--accent-coral)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'inherit',
          }}
        >
          <Users size={22} color="#FFFFFF" />
        </div>
      }
    >
      {/* Explainability Banner */}
      <div
        style={{
          background: 'var(--paper-deep)',
          border: '2px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 850, color: 'var(--ink)' }}>
            Deterministic Capability Gap Analysis
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--accent-lime)',
              border: '1px solid var(--border-strong)',
            }}
          >
            Rule-Based Fitting
          </span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
          Matches are scored deterministically by comparing your capability pillars against candidate builders
          to fill venture gaps across Engineering, Product, Marketing, and Operations. Verified Build-to-Earn proofs
          grant cryptographic synergy boosts.
        </p>

        {/* User Pillars */}
        {myPillars && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--border-strong)', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-secondary)' }}>ENG</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-coral)' }}>{myPillars.engineering}%</strong>
              </div>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--border-strong)', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-secondary)' }}>PRODUCT</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-mint)' }}>{myPillars.product}%</strong>
              </div>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--border-strong)', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-secondary)' }}>MKTG</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent-violet)' }}>{myPillars.marketing}%</strong>
              </div>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--border-strong)', padding: 8, borderRadius: 6, textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--ink-secondary)' }}>OPS</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{myPillars.operations}%</strong>
              </div>
            </div>

            {!hasCapabilityData && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  marginTop: 10,
                  fontSize: '0.78rem',
                  color: '#92400E',
                  fontWeight: 650,
                }}
              >
                <Info size={15} style={{ flexShrink: 0 }} />
                <span>
                  Your profile skills are not yet specified. Capability pillars evaluate your stated skills,
                  course, and projects.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Slider (only shown if there are matches) */}
      {matches.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ink)' }}>
            Filter Candidates with Synergy &ge; {filterMinScore}%
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(Number(e.target.value))}
              style={{ accentColor: 'var(--ink)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 850 }}>{filterMinScore}%</span>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Loader2 size={32} className="spin-animate" style={{ color: 'var(--ink)', marginBottom: 12 }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>
            Computing deterministic capability synergy matrix...
          </p>
        </div>
      ) : error ? (
        <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: '#FFF1F0', border: '2px solid #FF4B2F', color: '#B91C1C' }}>
          <AlertCircle size={16} /> {error}
        </div>
      ) : matches.length === 0 ? (
        /* Honest empty state when no other registered candidates exist in database */
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: 'var(--paper-deep)',
            border: '2px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Users size={36} color="var(--ink-secondary)" style={{ marginBottom: 10 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 6, color: 'var(--ink)' }}>
            Ecosystem Directory Seed State
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', maxWidth: 480, margin: '0 auto 16px auto', lineHeight: 1.5 }}>
            No other verified co-founders are registered in the local database yet. As new founders and engineers
            register accounts and publish verified proofs of work, they will automatically appear here with deterministic synergy scores.
          </p>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ minHeight: 38, padding: '0 18px' }}
          >
            Back to Overview
          </button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{ padding: '30px 20px', textAlign: 'center', background: 'var(--paper-deep)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
            No candidates found matching synergy threshold &ge; {filterMinScore}%. Try lowering the filter slider.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filteredMatches.map((cand) => (
            <div
              key={cand.id}
              className="tactile-card"
              style={{
                background: '#FFFFFF',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Top Row: Name and Fit Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: 'var(--ink)' }}>
                      {cand.fullName}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                      {cand.headline}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: cand.matchScore >= 80 ? '#F0FDF4' : '#FEF3C7',
                      border: `1.5px solid ${cand.matchScore >= 80 ? '#00D7B9' : '#F59E0B'}`,
                      fontSize: '0.82rem',
                      fontWeight: 900,
                      color: cand.matchScore >= 80 ? '#047857' : '#B45309',
                    }}
                  >
                    {cand.matchScore}% Synergy
                  </div>
                </div>

                {/* Candidate Pillars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, margin: '10px 0 12px 0' }}>
                  <div style={{ background: 'var(--paper-deep)', padding: 4, borderRadius: 4, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800 }}>ENG</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>{cand.candidatePillars.engineering}%</span>
                  </div>
                  <div style={{ background: 'var(--paper-deep)', padding: 4, borderRadius: 4, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800 }}>PROD</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>{cand.candidatePillars.product}%</span>
                  </div>
                  <div style={{ background: 'var(--paper-deep)', padding: 4, borderRadius: 4, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800 }}>MKTG</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>{cand.candidatePillars.marketing}%</span>
                  </div>
                  <div style={{ background: 'var(--paper-deep)', padding: 4, borderRadius: 4, textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800 }}>OPS</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900 }}>{cand.candidatePillars.operations}%</span>
                  </div>
                </div>

                {/* Synergy Factors (Explainable) */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 850, textTransform: 'uppercase', color: 'var(--ink-faint)', display: 'block', marginBottom: 4 }}>
                    Why You Complement
                  </span>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                    {cand.synergyFactors.map((factor, i) => (
                      <li key={i} style={{ marginBottom: 2 }}>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                {cand.verifiedProofsCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.76rem', fontWeight: 800, color: '#047857' }}>
                    <ShieldCheck size={14} /> {cand.verifiedProofsCount} Cryptographically Signed Proofs
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSelectCandidate) onSelectCandidate(cand);
                  onClose();
                }}
                className="btn btn-dark"
                style={{ width: '100%', minHeight: 36, fontSize: '0.82rem' }}
              >
                Initiate Co-Founder Dialogue <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
