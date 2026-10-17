// wavesync_web/src/components/ProblemSection.tsx
import React from 'react';
import { Reveal } from './Reveal';
import {
  AlertCircle,
  Users,
  Sparkles,
  Target,
  ShieldCheck,
  Zap,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

interface ProblemItem {
  id: string;
  code: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  title: string;
  symptom: string;
  icon: LucideIcon;
  status: string;
  accent: string;
  cta: string;
  actionKey: 'network' | 'co-founders' | 'review' | 'bounties' | 'graph' | 'ecosystem';
}

const PROBLEMS: ProblemItem[] = [
  {
    id: 'fragmentation',
    code: '01',
    tag: 'Alumni Network',
    tagBg: '#EFFDF5',
    tagColor: '#047857',
    title: 'Static Directories & Dormant Alumni',
    symptom:
      'University alumni directories exist as dead spreadsheets and forgotten lists. Meaningful mentorship decays because students and alumni lack a shared project layer to collaborate on.',
    icon: Users,
    status: 'Mentorship & Referrals Active',
    accent: 'var(--accent-mint)',
    cta: 'Explore Network \u2192',
    actionKey: 'network',
  },
  {
    id: 'outreach',
    code: '02',
    tag: 'Cognitive Outreach',
    tagBg: '#FFF1F2',
    tagColor: '#BE123C',
    title: 'High-Friction Blind Outreach',
    symptom:
      'Cold messages on generic professional sites yield sub-5% responses. Students reach out without verified build proof or contextual repos to substantiate their talent.',
    icon: Sparkles,
    status: 'Contextual In-Project Intros',
    accent: 'var(--accent-coral)',
    cta: 'Connect on Projects \u2192',
    actionKey: 'network',
  },
  {
    id: 'mismatch',
    code: '03',
    tag: 'Co-Founder Matching',
    tagBg: '#EAFBFF',
    tagColor: '#0369A1',
    title: 'Co-Founders Pair on Vibe, Not Synergy',
    symptom:
      'Early teams form based on casual social rapport rather than complementary execution skills, resulting in severe early-stage friction and high venture churn.',
    icon: Target,
    status: 'Complementary 4-Pillar Synergy',
    accent: '#0284C7',
    cta: 'Analyze Synergy \u2192',
    actionKey: 'co-founders',
  },
  {
    id: 'credentials',
    code: '04',
    tag: 'Build-to-Earn',
    tagBg: '#EFFDF5',
    tagColor: '#047857',
    title: 'Recruiters Cannot Trust Inflated CVs',
    symptom:
      'Resumes and profiles are easily inflated with generative AI text. Hiring managers spend hundreds of hours screening noise without seeing tamper-proof evidence of craft.',
    icon: ShieldCheck,
    status: 'Ed25519 Signing Layer Active',
    accent: '#059669',
    cta: 'Audit Review Queue \u2192',
    actionKey: 'review',
  },
  {
    id: 'capital',
    code: '05',
    tag: 'Capital & Grants',
    tagBg: '#FDF4FF',
    tagColor: '#7E22CE',
    title: 'Prototypes Stranded in Bureaucracy',
    symptom:
      'Campus innovation grants and micro-funds require months of administrative red tape, starving promising builder prototypes before reaching their initial milestone.',
    icon: Zap,
    status: 'External Foundation Grants',
    accent: 'var(--accent-violet)',
    cta: 'Browse Grants \u2192',
    actionKey: 'bounties',
  },
  {
    id: 'outcomes',
    code: '06',
    tag: 'Outcome Telemetry',
    tagBg: '#FEFCE8',
    tagColor: '#A16207',
    title: 'Institutions Lack Visibility Into Impact',
    symptom:
      'Colleges and incubators struggle to quantify alumni mentorship impact, cross-disciplinary venture formation, or student placement velocity in real-time telemetry.',
    icon: BarChart3,
    status: 'Transparent Ecosystem Telemetry',
    accent: '#D97706',
    cta: 'Explore Ecosystem \u2192',
    actionKey: 'ecosystem',
  },
];

interface ProblemSectionProps {
  onExploreGraph: () => void;
  onOpenNetwork?: (tab?: 'directory' | 'mentors' | 'requests' | 'synergy') => void;
  onOpenCoFounders?: () => void;
  onOpenReviewQueue?: () => void;
  onOpenBounties?: () => void;
  onOpenEcosystem?: () => void;
}

export const ProblemSection: React.FC<ProblemSectionProps> = ({
  onExploreGraph,
  onOpenNetwork,
  onOpenCoFounders,
  onOpenReviewQueue,
  onOpenBounties,
  onOpenEcosystem,
}) => {
  const handleCardClick = (actionKey: ProblemItem['actionKey']) => {
    switch (actionKey) {
      case 'network':
        if (onOpenNetwork) onOpenNetwork('directory');
        else onExploreGraph();
        break;
      case 'co-founders':
        if (onOpenCoFounders) onOpenCoFounders();
        else onExploreGraph();
        break;
      case 'review':
        if (onOpenReviewQueue) onOpenReviewQueue();
        else onExploreGraph();
        break;
      case 'bounties':
        if (onOpenBounties) onOpenBounties();
        else onExploreGraph();
        break;
      case 'ecosystem':
        if (onOpenEcosystem) onOpenEcosystem();
        else onExploreGraph();
        break;
      case 'graph':
      default:
        onExploreGraph();
        break;
    }
  };

  return (
    <section id="problem" className="section" style={{ background: 'var(--paper)', borderTop: '2px solid var(--border-strong)' }}>
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-eyebrow">
              The Network Breakdown
            </span>
            <h2 className="section-title">
              Why Traditional Professional Networks Fail.
            </h2>
            <p style={{ maxWidth: 740 }}>
              Professional relationships fail to create upward mobility when they exist as passive contact lists.
              WaveSync replaces hollow networking with verified execution, contextual introductions, and proof of work.
            </p>
          </div>
        </Reveal>

        <div className="problem-grid">
          {PROBLEMS.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Reveal key={item.id} staggerIndex={idx} delay={40}>
                <div
                  className="problem-card"
                  onClick={() => handleCardClick(item.actionKey)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="problem-card-header">
                      <span
                        className="tactile-card-tag"
                        style={{
                          background: item.tagBg,
                          color: item.tagColor,
                          marginBottom: 0,
                        }}
                      >
                        {item.tag}
                      </span>
                      <span className="problem-card-index">#{item.code}</span>
                    </div>

                    <h3 className="problem-card-title">{item.title}</h3>
                    <p className="problem-card-body">{item.symptom}</p>
                  </div>

                  <div className="problem-card-footer">
                    <span className="problem-card-status">
                      <IconComponent size={15} color={item.accent} style={{ flexShrink: 0 }} />
                      <span>{item.status}</span>
                    </span>
                    <span
                      className="problem-card-action"
                      style={{ color: item.accent }}
                    >
                      {item.cta}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
