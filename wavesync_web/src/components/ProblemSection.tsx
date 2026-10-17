// wavesync_web/src/components/ProblemSection.tsx
import React from 'react';
import { Reveal } from './Reveal';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProblemItem {
  num: string;
  title: string;
  symptom: string;
  solution: string;
  accent: string;
}

const PROBLEMS: ProblemItem[] = [
  {
    num: '01 / FRAGMENTATION',
    title: 'Alumni Networks Are Static & Siloed',
    symptom:
      'Traditional alumni directories are outdated databases or dead mailing lists. Meaningful career guidance and warm introductions decay because there is no active collaborative layer.',
    solution: 'Live 3D opportunity network connecting active builders with mentors through real projects.',
    accent: 'var(--accent-coral)',
  },
  {
    num: '02 / OUTREACH NOISE',
    title: 'Students Face High-Friction Blind Outreach',
    symptom:
      'Cold messages on generic professional networks suffer from single-digit response rates. Students lack a contextual project or verified proof to demonstrate genuine capability.',
    solution: 'Peer-reviewed Build-to-Earn submissions provide instant conversation context for alumni.',
    accent: 'var(--accent-mint)',
  },
  {
    num: '03 / FOUNDER MISMATCH',
    title: 'Co-Founders Pair on Vibe, Not Complementarity',
    symptom:
      'Founders assemble teams based on superficial similarity rather than complementary execution strengths, causing high early-stage venture attrition.',
    solution: 'Deterministic 4-pillar gap analysis across Engineering, Product, Marketing, and Operations.',
    accent: 'var(--accent-lime)',
  },
  {
    num: '04 / CREDENTIAL DECAY',
    title: 'Recruiters Cannot Trust Unverified Claims',
    symptom:
      'Resumes and profiles are easily inflated with generative AI. Hiring teams spend hundreds of hours screening candidates without seeing tamper-proof evidence of craft.',
    solution: 'Ed25519 cryptographically signed reviewer evaluations backed by immutable evidence hashes.',
    accent: 'var(--accent-violet)',
  },
  {
    num: '05 / OUTCOME BLINDNESS',
    title: 'Institutions Lack Visibility Into Real Outcomes',
    symptom:
      'Colleges and institutions struggle to quantify alumni mentorship impact, collaborative venture formation, or student project placement velocity.',
    solution: 'Transparent ecosystem telemetry tracking verified mentorship, projects, and placements.',
    accent: 'var(--accent-coral)',
  },
];

export const ProblemSection: React.FC<{ onExploreGraph: () => void }> = ({ onExploreGraph }) => {
  return (
    <section id="problem" className="section" style={{ background: 'var(--paper)', borderTop: '2px solid var(--border-strong)' }}>
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="section-eyebrow">
              <AlertCircle size={14} color="var(--accent-coral)" /> The Network Breakdown
            </span>
            <h2 className="section-title">
              Why Traditional Professional Networks Fail.
            </h2>
            <p style={{ maxWidth: 720 }}>
              Professional relationships fail to create upward mobility when they exist as passive contact lists.
              WaveSync replaces hollow networking with verified execution.
            </p>
          </div>
        </Reveal>

        <div className="problem-grid">
          {PROBLEMS.map((item, idx) => (
            <Reveal key={item.num} staggerIndex={idx} delay={40}>
              <div className="problem-card" style={{ height: '100%' }}>
                <div>
                  <div className="problem-card-num" style={{ color: item.accent }}>
                    {item.num}
                  </div>
                  <h3 className="problem-card-title">{item.title}</h3>
                  <p className="problem-card-body">{item.symptom}</p>
                </div>

                <div className="problem-card-solution">
                  <CheckCircle2 size={16} color="var(--accent-mint)" style={{ flexShrink: 0 }} />
                  <span>{item.solution}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
