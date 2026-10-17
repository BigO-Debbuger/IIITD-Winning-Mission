// wavesync_web/src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  api,
  JobOpportunity,
  CollabProject,
  Submission,
} from '../services/api';
import { OpportunityGraph3D } from '../components/OpportunityGraph3D';
import { SubmitWorkModal } from '../components/SubmitWorkModal';
import { ApplyJobModal } from '../components/ApplyJobModal';
import { LaunchProjectModal } from '../components/LaunchProjectModal';
import { JoinCollabModal } from '../components/JoinCollabModal';
import { CredentialModal } from '../components/CredentialModal';
import { ReviewQueueModal } from '../components/ReviewQueueModal';
import { VentureArchitectModal } from '../components/VentureArchitectModal';
import { CofounderMatchingModal } from '../components/CofounderMatchingModal';
import { ProblemSection } from '../components/ProblemSection';
import { EcosystemSection } from '../components/EcosystemSection';
import { Reveal } from '../components/Reveal';
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Zap,
  Layers,
  Code2,
  ExternalLink,
  TrendingUp,
  Award,
  Plus,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC<{
  onOpenNetwork?: (tab?: any, targetId?: string | null) => void;
}> = ({ onOpenNetwork }) => {
  const { user, openAuthModal, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [collabs, setCollabs] = useState<CollabProject[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [activeJobFilter, setActiveJobFilter] = useState<'all' | 'fulltime' | 'bounty'>('all');

  // Modal States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobOpportunity | null>(null);
  const [launchProjectModalOpen, setLaunchProjectModalOpen] = useState(false);
  const [joinCollabModalOpen, setJoinCollabModalOpen] = useState(false);
  const [selectedCollabForJoin, setSelectedCollabForJoin] = useState<CollabProject | null>(null);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [reviewQueueModalOpen, setReviewQueueModalOpen] = useState(false);
  const [ventureArchitectModalOpen, setVentureArchitectModalOpen] = useState(false);
  const [cofounderMatchingModalOpen, setCofounderMatchingModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [jList, cList, sList] = await Promise.all([
          api.getJobs(),
          api.getCollabs(),
          api.getSubmissions(),
        ]);
        setJobs(jList);
        setCollabs(cList);
        setSubmissions(sList);
      } catch (err) {
        console.error('Failed to load live data:', err);
      } finally {
        setJobsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmissionAdded = (newSub: Submission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  const handleProjectCreated = (newCollab: CollabProject) => {
    setCollabs((prev) => [newCollab, ...prev]);
  };

  const handleOpenApply = (job: JobOpportunity) => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      setSelectedJobForApply(job);
      setApplyModalOpen(true);
    }
  };

  const handleOpenJoinCollab = (collab: CollabProject) => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      setSelectedCollabForJoin(collab);
      setJoinCollabModalOpen(true);
    }
  };

  const handleOpenCredential = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setCredentialModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (activeJobFilter === 'fulltime') return j.jobType.toLowerCase().includes('full');
    if (activeJobFilter === 'bounty') return !j.jobType.toLowerCase().includes('full');
    return true;
  });

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
          <div className="hero-actions hero-enter-4" style={{ flexWrap: 'wrap' }}>
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
              onClick={() => setVentureArchitectModalOpen(true)}
              className="btn btn-outline"
              style={{
                minHeight: 52,
                padding: '0 24px',
                fontSize: '1rem',
                background: '#FFFFFF',
              }}
            >
              <Sparkles size={16} /> AI Venture Architect
            </button>
            <button
              onClick={() => onOpenNetwork ? onOpenNetwork('directory') : undefined}
              className="btn btn-outline"
              style={{
                minHeight: 52,
                padding: '0 24px',
                fontSize: '1rem',
                background: 'var(--accent-mint)',
                fontWeight: 900,
              }}
            >
              <Users size={16} /> Alumni & Peer Network
            </button>
            <a
              href="#graph"
              className="btn btn-dark"
              style={{ minHeight: 52, padding: '0 24px', fontSize: '1rem' }}
            >
              Explore 3D Ecosystem Graph
            </a>
          </div>

          {/* Tactile Demand Showcase Cards */}
          <div className="hero-cards-grid hero-enter-5">
            <div
              className="tactile-card"
              style={{ background: '#FFFFFF', cursor: 'pointer' }}
              onClick={() => onOpenNetwork ? onOpenNetwork('directory') : undefined}
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
                  <Users size={16} color="var(--accent-coral)" /> 140+ Founder Cohorts Formed
                </span>
                <span style={{ color: 'var(--accent-coral)', textDecoration: 'underline' }}>
                  Analyze Synergy &rarr;
                </span>
              </div>
            </div>

            <div
              className="tactile-card"
              style={{ background: '#FFFFFF', cursor: 'pointer' }}
              onClick={() => {
                if (!isAuthenticated) openAuthModal('login');
                else setReviewQueueModalOpen(true);
              }}
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
              onClick={() => scrollToSection('bounties')}
            >
              <span className="tactile-card-tag" style={{ background: '#FDF4FF', color: '#7E22CE' }}>
                Capital & Grants
              </span>
              <h3>$150k+ Non-Dilutive Bounties</h3>
              <p>
                Direct access to university innovation funds, angel syndicates, and ecosystem micro-grants
                awarded directly to verified build milestones.
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
                  <Zap size={16} color="var(--accent-violet)" /> Average Grant Decision in 48h
                </span>
                <span style={{ color: 'var(--accent-violet)', textDecoration: 'underline' }}>
                  Browse Bounties &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM (PS 1: ALUMNI NETWORK & PROFESSIONAL CONNECTIONS) */}
      <ProblemSection
        onExploreGraph={() => scrollToSection('graph')}
        onOpenNetwork={(tab) => onOpenNetwork ? onOpenNetwork(tab) : scrollToSection('directory')}
        onOpenCoFounders={() => setCofounderMatchingModalOpen(true)}
        onOpenReviewQueue={() => {
          if (!isAuthenticated) openAuthModal('login');
          else setReviewQueueModalOpen(true);
        }}
        onOpenBounties={() => scrollToSection('bounties')}
        onOpenEcosystem={() => scrollToSection('ecosystem')}
      />

      {/* 3. THE CONNECTED ECOSYSTEM (6 STAKEHOLDER PATHWAYS) */}
      <EcosystemSection
        onOpenCoFounders={() => setCofounderMatchingModalOpen(true)}
        onOpenReviewQueue={() => {
          if (!isAuthenticated) openAuthModal('login');
          else setReviewQueueModalOpen(true);
        }}
        onOpenLaunchProject={() => {
          if (!isAuthenticated) openAuthModal('register');
          else setLaunchProjectModalOpen(true);
        }}
        onScrollToOpportunities={() => scrollToSection('opportunities')}
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

      {/* 5. INTERACTIVE 3D OPPORTUNITY GRAPH (PRESERVED) */}
      <section id="graph" className="graph-section">
        <div className="container">
          <Reveal>
            <div className="section-head" style={{ maxWidth: 840 }}>
              <div className="pill-badge pill-badge-mint" style={{ marginBottom: 14 }}>
                <Layers size={13} /> Interactive Ecosystem Visualizer
              </div>
              <h2 className="section-title">
                The Real-Time Opportunity Graph
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '1.1rem' }}>
                Explore active links between vetted founders, projects, verified collaborators, and open grants.
                Rotate, zoom, and select any node to inspect project requirements and funding allocations.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <OpportunityGraph3D />
          </Reveal>
        </div>
      </section>

      {/* 6. PROTOCOL: HOW WAVESYNC WORKS */}
      <section id="how-it-works" className="section" style={{ background: 'var(--paper)' }}>
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="section-eyebrow">
                <Zap size={14} /> The WaveSync Architecture
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

      {/* 7. OPPORTUNITIES & PROJECTS */}
      <section id="opportunities" className="section" style={{ background: '#FAF5EE', borderTop: '2px solid var(--border-strong)' }}>
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
              <div>
                <span className="section-eyebrow">
                  <Briefcase size={14} /> Open Roles & Grants
                </span>
                <h2 className="section-title" style={{ marginBottom: 8 }}>
                  Current Opportunities
                </h2>
                <p>Direct equity roles, founding engineering positions, and funded bounties.</p>
              </div>

              {/* Filter Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`btn ${activeJobFilter === 'all' ? 'btn-dark' : 'btn-outline'}`}
                  onClick={() => setActiveJobFilter('all')}
                  style={{ minHeight: 38, padding: '0 16px' }}
                >
                  All Opportunities
                </button>
                <button
                  className={`btn ${activeJobFilter === 'fulltime' ? 'btn-dark' : 'btn-outline'}`}
                  onClick={() => setActiveJobFilter('fulltime')}
                  style={{ minHeight: 38, padding: '0 16px' }}
                >
                  Founding Roles
                </button>
                <button
                  className={`btn ${activeJobFilter === 'bounty' ? 'btn-dark' : 'btn-outline'}`}
                  onClick={() => setActiveJobFilter('bounty')}
                  style={{ minHeight: 38, padding: '0 16px' }}
                >
                  Bounties & Grants
                </button>
              </div>
            </div>
          </Reveal>

          <div className="opportunities-grid">
            {filteredJobs.map((job, idx) => (
              <Reveal key={job.id} staggerIndex={idx} delay={30}>
                <div className="opp-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="opp-meta-row">
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--accent-coral)',
                        }}
                      >
                        {job.companyName || job.company}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: 'var(--paper-deep)',
                          border: '1px solid var(--border-strong)',
                        }}
                      >
                        {job.location}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', marginBottom: 10 }}>{job.title}</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>{job.description}</p>

                    <div className="opp-tags">
                      {job.requirements.map((req, i) => (
                        <span key={i} className="opp-tag">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 16,
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: 16,
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 900, color: 'var(--ink)' }}>
                        {job.salaryRange || job.salary || 'Competitive'}
                      </span>
                      {job.equity && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857' }}>
                          + {job.equity} Equity
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenApply(job)}
                      className="btn btn-primary"
                      style={{ minHeight: 36, padding: '0 16px' }}
                    >
                      Apply Now <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOUNDER & COLLABORATOR SPOTLIGHT */}
      <section id="founders" className="section" style={{ background: 'var(--paper)' }}>
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
              <div>
                <span className="section-eyebrow">
                  <Users size={14} /> Co-Founder Discovery
                </span>
                <h2 className="section-title" style={{ marginBottom: 8 }}>
                  Ambitious Ventures Seeking Technical Partners.
                </h2>
                <p>
                  Connect directly with vetted founders looking for complementary technical execution leads.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal('register');
                    else setLaunchProjectModalOpen(true);
                  }}
                  className="btn btn-coral"
                  style={{ minHeight: 40, padding: '0 18px', fontSize: '0.85rem' }}
                >
                  <Plus size={15} /> Launch Your Project
                </button>
                <button
                  onClick={() => setCofounderMatchingModalOpen(true)}
                  className="btn btn-outline"
                  style={{ minHeight: 40, padding: '0 18px', fontSize: '0.85rem', background: '#FFFFFF' }}
                >
                  <Users size={15} /> Analyze Co-Founder Synergy
                </button>
              </div>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {collabs.map((collab, idx) => (
              <Reveal key={collab.id} staggerIndex={idx} delay={30}>
                <div className="tactile-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="tactile-card-tag" style={{ background: 'var(--accent-lime)' }}>
                        {collab.projectStage || 'Active Discovery'}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-muted)' }}>
                        by {collab.author?.fullName || 'Venture Lead'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>{collab.title}</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: 18 }}>{collab.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                      {collab.skillsRequired.map((skill, sIdx) => (
                        <span key={sIdx} className="opp-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenJoinCollab(collab)}
                    className="btn btn-outline"
                    style={{ width: '100%', minHeight: 40 }}
                  >
                    Request to Join Venture <ArrowUpRight size={15} />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BUILD-TO-EARN (PROOF-OF-WORK) SHOWCASE */}
      <section id="bte" className="section" style={{ background: '#F7EFE4', borderTop: '2px solid var(--border-strong)' }}>
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
              <div>
                <span className="section-eyebrow">
                  <Award size={14} /> Build-to-Earn Proof Ledger
                </span>
                <h2 className="section-title" style={{ marginBottom: 8 }}>
                  Verified Engineering Proofs
                </h2>
                <p>
                  Every submission below has been evaluated with Ed25519 cryptographic signatures by senior reviewers.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal('login');
                    } else {
                      setReviewQueueModalOpen(true);
                    }
                  }}
                  className="btn btn-dark"
                  style={{ minHeight: 44, padding: '0 18px' }}
                >
                  <Award size={16} /> Reviewer Queue
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuthModal('login');
                    } else {
                      setSubmitModalOpen(true);
                    }
                  }}
                  className="btn btn-coral"
                  style={{ minHeight: 44, padding: '0 22px' }}
                >
                  <Plus size={16} /> Submit Your Proof of Work
                </button>
              </div>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {submissions.map((sub, idx) => (
              <Reveal key={sub.id} staggerIndex={idx} delay={30}>
                <div className="bte-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span
                        className={`bte-status ${
                          sub.status === 'approved' ? 'bte-status-approved' : 'bte-status-pending'
                        }`}
                      >
                        <CheckCircle2 size={12} /> {sub.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => handleOpenCredential(sub.id)}
                        className="bte-signature-badge"
                        style={{
                          cursor: 'pointer',
                          border: '1.5px solid var(--border-strong)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                        title="Click to verify cryptographic signature"
                      >
                        <ShieldCheck size={12} color="#047857" /> Signed (Audit)
                      </button>
                    </div>

                    <h3 style={{ fontSize: '1.28rem', marginBottom: 8 }}>{sub.title}</h3>
                    <p style={{ fontSize: '0.88rem', marginBottom: 16 }}>{sub.description}</p>

                    {sub.reviews && sub.reviews.length > 0 && (
                      <div
                        onClick={() => handleOpenCredential(sub.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: 14,
                          marginBottom: 16,
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink)' }}>
                            {sub.reviews[0].reviewer?.fullName || 'Verified Alumni Reviewer'}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 850, color: 'var(--accent-coral)' }}>
                            Inspect Signature &rarr;
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--ink-secondary)', margin: 0 }}>
                          "{sub.reviews[0].feedback}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 12,
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
                      by {sub.author?.fullName || 'Builder'}
                    </span>
                    <a
                      href={sub.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ minHeight: 34, padding: '0 12px', fontSize: '0.78rem' }}
                    >
                      Inspect Proof Artifact <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL EDITORIAL CTA BANNER */}
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
                  <a
                    href="#graph"
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
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div style={{ maxWidth: 360 }}>
              <div className="brand-badge" style={{ color: '#FFFFFF', marginBottom: 14 }}>
                <div className="brand-mark">W</div>
                <span>WAVESYNC</span>
              </div>
              <p style={{ fontSize: '0.88rem' }}>
                The high-conviction platform connecting founders, verified technical collaborators,
                opportunities, and non-dilutive grants.
              </p>
            </div>

            <div>
              <h4>Ecosystem</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#problem">Problem Analysis</a></li>
                <li><a href="#ecosystem">Connected Pathways</a></li>
                <li><a href="#graph">3D Opportunity Graph</a></li>
                <li><a href="#opportunities">Open Opportunities</a></li>
                <li><a href="#founders">Founder Matchmaking</a></li>
                <li><a href="#bte">Build-to-Earn Proofs</a></li>
              </ul>
            </div>

            <div>
              <h4>Protocol</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><a href="#how-it-works">Architecture & Audits</a></li>
                <li><a href="#">Ed25519 Signing Standards</a></li>
                <li><a href="#">PostgreSQL & Prisma Core</a></li>
                <li><a href="#">React Native Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h4>System Integrity</h4>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.8rem',
                  fontWeight: 750,
                  color: 'var(--accent-mint)',
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent-mint)',
                    boxShadow: '0 0 10px var(--accent-mint)',
                  }}
                />
                Backend & DB Online
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                PostgreSQL · Node/Express · React Three Fiber
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 WaveSync Ecosystem. All rights reserved.</span>
            <span>Where Influence & Craft Meet Real Capital.</span>
          </div>
        </div>
      </footer>

      {/* Modals for Functional Product Workflows */}
      <SubmitWorkModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmitted={handleSubmissionAdded}
      />

      <ApplyJobModal
        job={selectedJobForApply}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />

      <LaunchProjectModal
        isOpen={launchProjectModalOpen}
        onClose={() => setLaunchProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <JoinCollabModal
        collab={selectedCollabForJoin}
        isOpen={joinCollabModalOpen}
        onClose={() => setJoinCollabModalOpen(false)}
      />

      <CredentialModal
        submissionId={selectedSubmissionId}
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
      />

      <ReviewQueueModal
        isOpen={reviewQueueModalOpen}
        onClose={() => setReviewQueueModalOpen(false)}
        onReviewSubmitted={async () => {
          const fresh = await api.getSubmissions();
          setSubmissions(fresh);
        }}
      />

      <VentureArchitectModal
        isOpen={ventureArchitectModalOpen}
        onClose={() => setVentureArchitectModalOpen(false)}
      />

      <CofounderMatchingModal
        isOpen={cofounderMatchingModalOpen}
        onClose={() => setCofounderMatchingModalOpen(false)}
        onSelectCandidate={(cand) => {
          setLaunchProjectModalOpen(true);
        }}
      />
    </div>
  );
};
