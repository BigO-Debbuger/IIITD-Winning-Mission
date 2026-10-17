// wavesync_web/src/pages/HomePage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProblemSection } from '../components/ProblemSection';
import { EcosystemSection } from '../components/EcosystemSection';
import { VentureArchitectModal } from '../components/VentureArchitectModal';
import { CofounderMatchingModal } from '../components/CofounderMatchingModal';
import { LaunchProjectModal } from '../components/LaunchProjectModal';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Zap,
  Code2,
  TrendingUp,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { openAuthModal, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Modals for actions triggered directly from Home hero / tools
  const [ventureArchitectModalOpen, setVentureArchitectModalOpen] = useState(false);
  const [cofounderMatchingModalOpen, setCofounderMatchingModalOpen] = useState(false);
  const [launchProjectModalOpen, setLaunchProjectModalOpen] = useState(false);

  return (
    <div className="landing-page-root">
      {/* 1. HERO SECTION WITH CO-ORDINATED ENTRANCE CASCADE */}
      <section className="hero-section">
        <div className="hero-grid-pattern" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Eyebrow Badge */}
          <div className="pill-badge pill-badge-lime hero-enter-1" style={{ marginBottom: 20 }}>
            <Sparkles size={14} /> The Verified Alumni & Venture Network Protocol
          </div>

          {/* Main Editorial Headline */}
          <h1 className="hero-title hero-enter-2">
            Where Founders Meet Builders <span>& Proof Speaks.</span>
          </h1>

          {/* Editorial Subtitle */}
          <p className="hero-subtitle hero-enter-3">
            WaveSync eliminates static alumni directories and resume inflation.{' '}
            <span className="serif-italic" style={{ color: 'var(--ink)' }}>
              Connect with high-conviction mentors and co-founders
            </span>
            , contribute to vetted venture roadmaps, and validate technical craft through peer-reviewed,
            cryptographically signed proofs of work.
          </p>

          {/* Primary Action Row */}
          <div className="hero-actions hero-enter-4" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('register');
                } else {
                  setLaunchProjectModalOpen(true);
                }
              }}
              className="btn btn-coral"
              style={{ minHeight: 52, padding: '0 28px', fontSize: '1rem' }}
            >
              Launch or Discover a Project <ArrowUpRight size={18} />
            </button>
            <button
              onClick={() => navigate('/graph')}
              className="btn btn-dark"
              style={{ minHeight: 52, padding: '0 24px', fontSize: '1rem' }}
            >
              Explore 3D Ecosystem Graph
            </button>
            <button
              onClick={() => setVentureArchitectModalOpen(true)}
              className="btn btn-outline"
              style={{
                minHeight: 52,
                padding: '0 22px',
                fontSize: '0.95rem',
                background: '#FFFFFF',
              }}
            >
              AI Venture Architect
            </button>
          </div>

          {/* Tactile Demand Showcase Cards */}
          <div className="hero-cards-grid hero-enter-5">
            <div
              className="tactile-card"
              style={{ background: '#FFFFFF', cursor: 'pointer' }}
              onClick={() => navigate('/network')}
            >
              <span className="tactile-card-tag" style={{ background: '#EFFDF5', color: '#047857' }}>
                Alumni Network
              </span>
              <h3>Verified Alumni & Peer Directory</h3>
              <p>
                Discover and connect with alumni from your university, request 1:1 mentorship sessions,
                gain internal company referrals, and collaborate on real-world projects.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="var(--accent-mint)" /> Mentorship & Referrals Active
                </span>
                <span style={{ color: 'var(--accent-mint)', textDecoration: 'underline' }}>
                  Explore Network &rarr;
                </span>
              </div>
            </div>

            <div
              className="tactile-card"
              style={{ background: '#FFFFFF', cursor: 'pointer' }}
              onClick={() => setCofounderMatchingModalOpen(true)}
            >
              <span className="tactile-card-tag" style={{ background: '#EAFBFF', color: '#0369A1' }}>
                Co-Founder Matching
              </span>
              <h3>Deterministic Skill & Vision Graph</h3>
              <p>
                Find complementary partners using explainable fit vectors based on actual commits,
                domain expertise, and execution velocity.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="var(--accent-coral)" /> Complementary 4-Pillar Synergy
                </span>
                <span style={{ color: 'var(--accent-coral)', textDecoration: 'underline' }}>
                  Analyze Synergy &rarr;
                </span>
              </div>
            </div>

            <div
              className="tactile-card"
              style={{ background: '#FFFFFF', cursor: 'pointer' }}
              onClick={() => navigate('/build-to-earn')}
            >
              <span className="tactile-card-tag" style={{ background: '#EFFDF5', color: '#047857' }}>
                Build-to-Earn
              </span>
              <h3>Cryptographic Proof of Work</h3>
              <p>
                Every submission is evaluated against rigorous benchmarks and sealed with native Ed25519
                reviewer signatures for tamper-proof reputation.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="var(--accent-mint)" /> Ed25519 Signing Layer Active
                </span>
                <span style={{ color: 'var(--accent-mint)', textDecoration: 'underline' }}>
                  Review Queue &rarr;
                </span>
              </div>
            </div>

            <div
              className="tactile-card"
              style={{ background: '#FFFFFF', cursor: 'pointer' }}
              onClick={() => navigate('/opportunities')}
            >
              <span className="tactile-card-tag" style={{ background: '#FDF4FF', color: '#7E22CE' }}>
                Ecosystem Grants
              </span>
              <h3>Open-Source Grants & Bounties</h3>
              <p>
                Discover verified external foundation programs and community micro-grants based on transparent milestones.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 18,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={16} color="var(--accent-violet)" /> Sponsor-Verified Acceptance Criteria
                </span>
                <span style={{ color: 'var(--accent-violet)', textDecoration: 'underline' }}>
                  Browse Bounties &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <ProblemSection
        onExploreGraph={() => navigate('/graph')}
        onOpenNetwork={() => navigate('/network')}
        onOpenCoFounders={() => setCofounderMatchingModalOpen(true)}
        onOpenReviewQueue={() => navigate('/build-to-earn')}
        onOpenBounties={() => navigate('/opportunities')}
        onOpenEcosystem={() => {
          const el = document.getElementById('ecosystem');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. THE CONNECTED ECOSYSTEM */}
      <EcosystemSection
        onOpenCoFounders={() => setCofounderMatchingModalOpen(true)}
        onOpenReviewQueue={() => navigate('/build-to-earn')}
        onOpenLaunchProject={() => {
          if (!isAuthenticated) openAuthModal('register');
          else setLaunchProjectModalOpen(true);
        }}
        onScrollToOpportunities={() => navigate('/opportunities')}
      />

      {/* 4. CONTINUOUS LIVE MARQUEE TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          <div className="ticker-item">
            <span>FOUNDING ENGINEERS IN DEMAND</span>
            <span className="ticker-star">✶</span>
            <span>AI CO-FOUNDER MATCH ENGINE ONLINE</span>
            <span className="ticker-star">✶</span>
            <span>$25K DISTRIBUTED STATE GRANT LIVE</span>
            <span className="ticker-star">✶</span>
            <span>ED25519 PROOF VERIFICATION ENFORCED</span>
            <span className="ticker-star">✶</span>
            <span>ALUMNI MENTOR EVALUATIONS</span>
            <span className="ticker-star">✶</span>
            <span>RUST · TYPESCRIPT · THREE.JS · PYTORCH</span>
            <span className="ticker-star">✶</span>
          </div>
          <div className="ticker-item">
            <span>FOUNDING ENGINEERS IN DEMAND</span>
            <span className="ticker-star">✶</span>
            <span>AI CO-FOUNDER MATCH ENGINE ONLINE</span>
            <span className="ticker-star">✶</span>
            <span>$25K DISTRIBUTED STATE GRANT LIVE</span>
            <span className="ticker-star">✶</span>
            <span>ED25519 PROOF VERIFICATION ENFORCED</span>
            <span className="ticker-star">✶</span>
            <span>ALUMNI MENTOR EVALUATIONS</span>
            <span className="ticker-star">✶</span>
            <span>RUST · TYPESCRIPT · THREE.JS · PYTORCH</span>
            <span className="ticker-star">✶</span>
          </div>
        </div>
      </div>

      {/* 5. PROTOCOL: HOW WAVESYNC WORKS */}
      <section id="how-it-works" className="section" style={{ background: 'var(--paper)' }}>
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="section-eyebrow">
                The WaveSync Architecture
              </span>
              <h2 className="section-title">
                From First Commit to Venture Capital.
              </h2>
              <p style={{ maxWidth: 680 }}>
                Three high-conviction steps that replace unverified CVs and blind networking with transparent,
                peer-audited execution.
              </p>
            </div>
          </Reveal>

          <div className="workflow-grid">
            <Reveal staggerIndex={0}>
              <div className="workflow-card">
                <div className="workflow-number">01</div>
                <div className="workflow-icon">
                  <Code2 size={24} color="var(--accent-coral)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Propose or Discover</h3>
                <p>
                  Founders post ambitious open-source or commercial roadmaps with granular skill requirements.
                  Engineers discover high-signal initiatives matching their exact technical appetite.
                </p>
              </div>
            </Reveal>

            <Reveal staggerIndex={1}>
              <div className="workflow-card">
                <div className="workflow-number">02</div>
                <div className="workflow-icon">
                  <ShieldCheck size={24} color="var(--accent-mint)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Build With Proof</h3>
                <p>
                  Builders submit GitHub repos, live testbeds, or Figma design systems. Senior alumni mentors
                  audit the code quality and issue cryptographically verifiable verdict signatures.
                </p>
              </div>
            </Reveal>

            <Reveal staggerIndex={2}>
              <div className="workflow-card">
                <div className="workflow-number">03</div>
                <div className="workflow-icon">
                  <TrendingUp size={24} color="var(--accent-lime)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Earn & Accelerate</h3>
                <p>
                  Approved proofs unlock instant milestone grant bounties, verified talent ratings, and equity
                  partnership offers from venture-backed founder syndicates.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. FINAL EDITORIAL CTA BANNER */}
      <section className="section" style={{ background: 'var(--paper)', paddingBottom: 100 }}>
        <div className="container">
          <Reveal>
            <div
              style={{
                background: 'var(--ink)',
                color: '#FFFFFF',
                border: '2.5px solid var(--border-strong)',
                borderRadius: 'var(--radius-xl)',
                padding: 'clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)',
                boxShadow: 'var(--shadow-tactile-lg)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40%',
                  right: '-10%',
                  width: '60%',
                  height: '180%',
                  background: 'radial-gradient(circle, rgba(201, 255, 79, 0.15), transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ position: 'relative', zIndex: 2, maxWidth: 720 }}>
                <div className="pill-badge pill-badge-lime" style={{ marginBottom: 18 }}>
                  <Sparkles size={14} /> WaveSync Cohort 04 Open
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
                    fontWeight: 900,
                    lineHeight: 1.0,
                    letterSpacing: '-0.04em',
                    color: '#FFFFFF',
                    marginBottom: 18,
                  }}
                >
                  Build What Cannot Be Faked.
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '1.15rem', marginBottom: 32 }}>
                  Join founders, elite builders, and alumni evaluating work that speaks louder than pedigree.
                  Start with a verifiable submission today.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="btn btn-primary"
                    style={{ minHeight: 52, padding: '0 28px', fontSize: '1rem' }}
                  >
                    Create Verified Account <ArrowUpRight size={18} />
                  </button>
                  <button
                    onClick={() => navigate('/graph')}
                    className="btn btn-outline"
                    style={{
                      minHeight: 52,
                      padding: '0 24px',
                      fontSize: '1rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    Inspect Ecosystem
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals triggered from Home Hero */}
      <VentureArchitectModal
        isOpen={ventureArchitectModalOpen}
        onClose={() => setVentureArchitectModalOpen(false)}
        onProjectCreated={() => {
          navigate('/ventures');
        }}
      />

      <CofounderMatchingModal
        isOpen={cofounderMatchingModalOpen}
        onClose={() => setCofounderMatchingModalOpen(false)}
        onSelectCandidate={() => {
          navigate('/network');
        }}
      />

      <LaunchProjectModal
        isOpen={launchProjectModalOpen}
        onClose={() => setLaunchProjectModalOpen(false)}
        onProjectCreated={() => {
          navigate('/ventures');
        }}
      />
    </div>
  );
};
