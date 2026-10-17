// wavesync_web/src/components/EcosystemSection.tsx
import React, { useState } from 'react';
import { Reveal } from './Reveal';
import {
  GraduationCap,
  Users,
  Compass,
  Briefcase,
  Search,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Stakeholder {
  id: string;
  title: string;
  roleTag: string;
  accent: string;
  icon: React.ReactNode;
  summary: string;
  pathway: string[];
  actionLabel: string;
  actionType: 'find_founders' | 'review_queue' | 'browse_jobs' | 'launch_project';
  status: 'Live Feature' | 'Ecosystem Roadmap';
}

const STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'students',
    title: 'Students & Builders',
    roleTag: 'Craft & Acceleration',
    accent: 'var(--accent-mint)',
    icon: <GraduationCap size={22} color="#05020B" />,
    summary:
      'Discover active student & alumni venture roadmaps, connect with senior technical mentors, and build tamper-proof credibility via Build-to-Earn proofs.',
    pathway: ['1:1 Alumni Mentorship', 'Real Collab Ventures', 'Ed25519 Signed Proofs', 'Direct Hiring Offers'],
    actionLabel: 'Explore Open Roles',
    actionType: 'browse_jobs',
    status: 'Live Feature',
  },
  {
    id: 'alumni',
    title: 'Alumni & Mentors',
    roleTag: 'Evaluation & Guidance',
    accent: 'var(--accent-coral)',
    icon: <Users size={22} color="#05020B" />,
    summary:
      'Give back through structured code reviews and 1:1 sessions. Sign off on high-quality student deliverables using cryptographic verification.',
    pathway: ['Mentorship Sessions', 'Code Auditing Queue', 'Signature Sealing', 'Venture Dealflow'],
    actionLabel: 'Access Review Queue',
    actionType: 'review_queue',
    status: 'Live Feature',
  },
  {
    id: 'faculty',
    title: 'Faculty & Advisors',
    roleTag: 'Academic Guidance',
    accent: 'var(--accent-lime)',
    icon: <Compass size={22} color="#05020B" />,
    summary:
      'Align semester capstones and academic research with live industry bounties. Endorse promising student founders for non-dilutive ecosystem grants.',
    pathway: ['Capstone Alignment', 'Grant Recommendations', 'Research Collabs', 'Cohort Tracking'],
    actionLabel: 'Inspect Grants',
    actionType: 'browse_jobs',
    status: 'Live Feature',
  },
  {
    id: 'founders',
    title: 'Founders & Startups',
    roleTag: 'Venture Formation',
    accent: 'var(--accent-violet)',
    icon: <Sparkles size={22} color="#FFFFFF" />,
    summary:
      'Publish venture collab posts with granular skill requirements. Use deterministic 4-pillar gap analysis to find complementary co-founders.',
    pathway: ['Venture Blueprint', 'Complementary Gap Search', 'Team Assembly', 'Milestone Bounties'],
    actionLabel: 'Find Co-Founders',
    actionType: 'find_founders',
    status: 'Live Feature',
  },
  {
    id: 'recruiters',
    title: 'Recruiters & Companies',
    roleTag: 'Verified Hiring',
    accent: 'var(--accent-coral)',
    icon: <Search size={22} color="#05020B" />,
    summary:
      'Filter candidates by actual signed proof-of-work artifacts and technical accuracy scores, completely skipping resume bloat and unverified claims.',
    pathway: ['Bounty Publishing', 'Artifact Inspection', 'Cryptographic Proof Check', 'Direct Pipeline'],
    actionLabel: 'Post an Opportunity',
    actionType: 'launch_project',
    status: 'Live Feature',
  },
  {
    id: 'institutions',
    title: 'Institutions & Admins',
    roleTag: 'Outcome Intelligence',
    accent: 'var(--accent-mint)',
    icon: <Building2 size={22} color="#05020B" />,
    summary:
      'Gain verifiable telemetry on alumni engagement, student project completion, career velocity, and interdisciplinary venture formation.',
    pathway: ['Engagement Telemetry', 'Mentorship Hours Log', 'Placement Tracking', 'Accreditation Reports'],
    actionLabel: 'View Architecture',
    actionType: 'browse_jobs',
    status: 'Ecosystem Roadmap',
  },
];

interface EcosystemSectionProps {
  onOpenCoFounders: () => void;
  onOpenReviewQueue: () => void;
  onOpenLaunchProject: () => void;
  onScrollToOpportunities: () => void;
}

export const EcosystemSection: React.FC<EcosystemSectionProps> = ({
  onOpenCoFounders,
  onOpenReviewQueue,
  onOpenLaunchProject,
  onScrollToOpportunities,
}) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState<string>('all');

  const handleAction = (type: Stakeholder['actionType']) => {
    switch (type) {
      case 'find_founders':
        onOpenCoFounders();
        break;
      case 'review_queue':
        onOpenReviewQueue();
        break;
      case 'launch_project':
        onOpenLaunchProject();
        break;
      case 'browse_jobs':
      default:
        onScrollToOpportunities();
        break;
    }
  };

  const displayedStakeholders =
    selectedStakeholder === 'all'
      ? STAKEHOLDERS
      : STAKEHOLDERS.filter((s) => s.id === selectedStakeholder);

  return (
    <section id="ecosystem" className="section" style={{ background: '#FAF5EE', borderTop: '2px solid var(--border-strong)' }}>
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-eyebrow">
              The Connected Ecosystem
            </span>
            <h2 className="section-title">
              One Unified Network. Six Stakeholders.
            </h2>
            <p style={{ maxWidth: 740 }}>
              WaveSync bridges the complete lifecycle from education to employment: Find the right people ➔
              build something together ➔ prove your capabilities ➔ unlock meaningful opportunities ➔ measure real outcomes.
            </p>
          </div>
        </Reveal>

        {/* Stakeholder Filter Bar */}
        <Reveal delay={60}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div className="ecosystem-stakeholders-bar">
              <button
                className={`ecosystem-pill ${selectedStakeholder === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStakeholder('all')}
              >
                All Stakeholders ({STAKEHOLDERS.length})
              </button>
              {STAKEHOLDERS.map((s) => (
                <button
                  key={s.id}
                  className={`ecosystem-pill ${selectedStakeholder === s.id ? 'active' : ''}`}
                  onClick={() => setSelectedStakeholder(s.id)}
                >
                  {s.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Stakeholder Cards Grid */}
        <div className="ecosystem-grid">
          {displayedStakeholders.map((s, idx) => (
            <Reveal key={s.id} staggerIndex={idx} delay={40}>
              <div className="ecosystem-card" style={{ height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div
                    className="ecosystem-icon-wrap"
                    style={{ background: s.accent }}
                  >
                    {s.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 850,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: s.status === 'Live Feature' ? '#EFFDF5' : '#FFF7ED',
                      color: s.status === 'Live Feature' ? '#047857' : '#C2410C',
                      border: '1px solid var(--border-strong)',
                    }}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="ecosystem-pathway-tag" style={{ background: 'var(--paper-deep)' }}>
                  {s.roleTag}
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: 'var(--ink)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: 18, flexGrow: 1, color: 'var(--ink-muted)' }}>
                  {s.summary}
                </p>

                {/* Structured Pathway */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 850, textTransform: 'uppercase', color: 'var(--ink)', marginBottom: 8 }}>
                    Ecosystem Pathway:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {s.pathway.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>
                        <CheckCircle2 size={13} color="var(--accent-mint)" style={{ flexShrink: 0 }} />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAction(s.actionType)}
                  className="btn btn-outline"
                  style={{ width: '100%', minHeight: 38, fontSize: '0.82rem', background: '#FFFFFF' }}
                >
                  {s.actionLabel} <ArrowRight size={14} />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
