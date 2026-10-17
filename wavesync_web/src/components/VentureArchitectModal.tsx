// wavesync_web/src/components/VentureArchitectModal.tsx
import React, { useState } from 'react';
import { api, VenturePlan } from '../services/api';
import { Modal } from './Modal';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Target,
} from 'lucide-react';

interface VentureArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VentureArchitectModal: React.FC<VentureArchitectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [idea, setIdea] = useState('');
  const [targetDomain, setTargetDomain] = useState('Developer Infrastructure & AI');
  const [stage, setStage] = useState('Idea Stage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<VenturePlan | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim().length < 10) {
      setError('Please provide a startup idea description (at least 10 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.generateVenturePlan({
        idea: idea.trim(),
        targetDomain,
        stage,
      });
      setPlan(res.plan);
    } catch (err: any) {
      setError(err.message || 'Failed to generate venture blueprint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Venture Architect"
      subtitle="Deterministic Milestone Planning & Capability Gap Analysis"
      maxWidth={840}
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
          <Sparkles size={22} color="var(--ink)" />
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

      {/* Input Form */}
      <form onSubmit={handleGenerate} style={{ marginBottom: plan ? 24 : 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Target Domain
            </label>
            <select
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="form-input"
            >
              <option value="Developer Infrastructure & AI">Developer Infrastructure & AI</option>
              <option value="Decentralized State & Crypto">Decentralized State & Crypto</option>
              <option value="Autonomous Agents & RLHF">Autonomous Agents & RLHF</option>
              <option value="Bio-Computational Tools">Bio-Computational Tools</option>
              <option value="Fintech & Micro-Grants">Fintech & Micro-Grants</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Current Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="form-input"
            >
              <option value="Idea Stage">Idea Stage</option>
              <option value="Prototype in Progress">Prototype in Progress</option>
              <option value="Seeking Co-Founder">Seeking Co-Founder</option>
              <option value="Applying for Grants">Applying for Grants</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Describe Your Startup Vision *
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A decentralized verification engine where engineers submit verifiable GitHub commits and receive Ed25519-signed credentials, unlocking instant milestone bounties and complementary co-founder matches..."
            rows={3}
            className="form-input"
            style={{ resize: 'vertical' }}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="submit"
            className="btn btn-coral"
            style={{ minHeight: 42, padding: '0 24px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-animate" /> Structuring Venture Blueprint...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Synthesize Venture Architecture
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Blueprint View */}
      {plan && (
        <div
          style={{
            borderTop: '2px solid var(--border-strong)',
            paddingTop: 20,
          }}
        >
          {/* Title & Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: 'var(--ink)' }}>
              {plan.planTitle}
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'var(--accent-lime)',
                border: '1px solid var(--border-strong)',
              }}
            >
              Engine: {plan.generationMode}
            </span>
          </div>

          {/* Problem & Target Users */}
          <div
            style={{
              background: 'var(--paper-deep)',
              border: '2px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 850, margin: '0 0 6px 0', color: 'var(--ink)' }}>
              Problem Statement & Thesis
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              {plan.problemStatement}
            </p>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                Target Stakeholders
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {plan.targetUsers.map((u, i) => (
                  <span key={i} className="opp-tag" style={{ fontSize: '0.75rem' }}>
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* MVP Scope Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                background: '#F0FDF4',
                border: '2px solid #00D7B9',
                borderRadius: 'var(--radius-md)',
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <CheckCircle2 size={16} color="#047857" />
                <span style={{ fontWeight: 850, fontSize: '0.85rem', color: '#047857' }}>
                  MVP Must-Haves
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: 'var(--ink-secondary)' }}>
                {plan.mvpScope.mustHave.map((m, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                background: 'var(--paper)',
                border: '2px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Target size={16} color="var(--ink-secondary)" />
                <span style={{ fontWeight: 850, fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>
                  Deferred to V2
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
                {plan.mvpScope.deferToV2.map((d, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Milestones */}
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                color: 'var(--accent-coral)',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Technical Delivery Milestones
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {plan.technicalMilestones.map((milestone, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--paper)',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 12,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 850, color: 'var(--ink)' }}>
                      {milestone.phase}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-coral)' }}>
                      {milestone.duration}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.35 }}>
                    {milestone.deliverable}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Required Team Capabilities */}
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                color: 'var(--ink-faint)',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Required Founding Capabilities
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              {plan.requiredTeamCapabilities.map((cap, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--paper-deep)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 850, color: 'var(--ink)' }}>
                      {cap.discipline}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 999,
                        background: cap.priority === 'High' ? 'var(--accent-coral)' : 'var(--paper)',
                        color: cap.priority === 'High' ? '#FFF' : 'var(--ink)',
                        border: '1px solid var(--border-strong)',
                      }}
                    >
                      {cap.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {cap.skills.map((s, idx) => (
                      <span key={idx} className="opp-tag" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matched Non-Dilutive Ecosystem Grants */}
          <div>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                color: '#047857',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Eligible Non-Dilutive Capital & Grants
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.matchedGrants.map((grant, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--paper)',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 850, color: 'var(--ink)' }}>
                        {grant.grantName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 900,
                          color: '#047857',
                          background: '#F0FDF4',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {grant.amount}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)', margin: '2px 0 0 0' }}>
                      Criteria: {grant.criteria}
                    </p>
                  </div>
                  <a
                    href={grant.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minHeight: 32, padding: '0 12px', fontSize: '0.76rem' }}
                  >
                    Grant Specs <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
