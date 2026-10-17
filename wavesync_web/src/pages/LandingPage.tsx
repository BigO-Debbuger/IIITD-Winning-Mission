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
import { OpportunitySlideOver } from '../components/OpportunitySlideOver';
import { VentureSlideOver } from '../components/VentureSlideOver';
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
  Search,
} from 'lucide-react';

export const LandingPage: React.FC<{
  onOpenNetwork?: (tab?: any, targetId?: string | null) => void;
}> = ({ onOpenNetwork }) => {
  const { user, openAuthModal, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [collabs, setCollabs] = useState<CollabProject[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [activeJobFilter, setActiveJobFilter] = useState<'all' | 'fulltime' | 'bounty' | 'applied'>('all');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [myApplications, setMyApplications] = useState<any[]>([]);

  // Modal & Slide-Over States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobOpportunity | null>(null);
  const [slideOverJob, setSlideOverJob] = useState<JobOpportunity | null>(null);
  const [slideOverJobOpen, setSlideOverJobOpen] = useState(false);

  const [launchProjectModalOpen, setLaunchProjectModalOpen] = useState(false);
  const [joinCollabModalOpen, setJoinCollabModalOpen] = useState(false);
  const [selectedCollabForJoin, setSelectedCollabForJoin] = useState<CollabProject | null>(null);
  const [slideOverCollab, setSlideOverCollab] = useState<CollabProject | null>(null);
  const [slideOverCollabOpen, setSlideOverCollabOpen] = useState(false);

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

  useEffect(() => {
    async function loadApplications() {
      if (isAuthenticated) {
        try {
          const apps = await api.getMyApplications();
          setMyApplications(apps);
        } catch (err) {
          console.error('Failed to load user applications:', err);
        }
      } else {
        setMyApplications([]);
      }
    }
    loadApplications();
  }, [isAuthenticated]);

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

  const handleOpenJobDetails = (job: JobOpportunity) => {
    setSlideOverJob(job);
    setSlideOverJobOpen(true);
  };

  const handleOpenJoinCollab = (collab: CollabProject) => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      setSelectedCollabForJoin(collab);
      setJoinCollabModalOpen(true);
    }
  };

  const handleOpenCollabDetails = (collab: CollabProject) => {
    setSlideOverCollab(collab);
    setSlideOverCollabOpen(true);
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

  const handleScrollToBounties = () => {
    setActiveJobFilter('bounty');
    scrollToSection('opportunities');
  };

  const handleApplySuccess = async () => {
    if (isAuthenticated) {
      try {
        const apps = await api.getMyApplications();
        setMyApplications(apps);
      } catch (err) {
        console.error('Failed to refresh applications:', err);
      }
    }
  };

  const filteredJobs = jobs.filter((j) => {
    // 1. Category / Status filter
    if (activeJobFilter === 'fulltime' && !j.jobType.toLowerCase().includes('full')) return false;
    if (activeJobFilter === 'bounty' && j.jobType.toLowerCase().includes('full')) return false;
    if (activeJobFilter === 'applied' && !myApplications.some((app) => app.jobId === j.id)) return false;

    // 2. Text Search Query
    if (jobSearchQuery.trim()) {
      const q = jobSearchQuery.toLowerCase();
      const matchTitle = (j.title || '').toLowerCase().includes(q);
      const matchCompany = (j.companyName || j.company || '').toLowerCase().includes(q);
      const matchDesc = (j.description || '').toLowerCase().includes(q);
      const matchLocation = (j.location || '').toLowerCase().includes(q);
      const matchReq = (j.requirements || []).some((req) => req.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchDesc && !matchLocation && !matchReq) return false;
    }
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

          {/* Primary Action Row with Clear Visual Hierarchy */}
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
            <a
              href="#graph"
              className="btn btn-dark"
              style={{ minHeight: 52, padding: '0 24px', fontSize: '1rem' }}
            >
              Explore 3D Ecosystem Graph
            </a>
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
              onClick={handleScrollToBounties}
            >
              <span className="tactile-card-tag" style={{ background: '#FDF4FF', color: '#7E22CE' }}>
                Ecosystem Grants
              </span>
              <h3>Open-Source Grants & Bounties</h3>
              <p>
                Discover verified external foundation programs and community micro-grants (such as Ethereum Foundation ESP, Protocol Labs DevGrants, and Gitcoin) based on transparent milestones.
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

      {/* 2. THE PROBLEM (PS 1: ALUMNI NETWORK & PROFESSIONAL CONNECTIONS) */}
      <ProblemSection
        onExploreGraph={() => scrollToSection('graph')}
        onOpenNetwork={(tab) => onOpenNetwork ? onOpenNetwork(tab) : scrollToSection('directory')}
        onOpenCoFounders={() => setCofounderMatchingModalOpen(true)}
        onOpenReviewQueue={() => {
          if (!isAuthenticated) openAuthModal('login');
          else setReviewQueueModalOpen(true);
        }}
        onOpenBounties={handleScrollToBounties}
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

      {/* 7. OPPORTUNITIES & PROJECTS */}
      <section id="opportunities" className="section" style={{ background: '#FAF5EE', borderTop: '2px solid var(--border-strong)' }}>
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
              <div>
                <span className="section-eyebrow">
                  Open Roles & Grants
                </span>
                <h2 className="section-title" style={{ marginBottom: 8 }}>
                  Current Opportunities
                </h2>
                <p>Direct equity roles, founding engineering positions, and funded bounties.</p>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ position: 'relative', width: '100%', minWidth: 260 }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search role, skill, company..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="form-input"
                    style={{
                      paddingLeft: 34,
                      paddingRight: jobSearchQuery ? 30 : 12,
                      height: 38,
                      fontSize: '0.84rem',
                      borderRadius: 999,
                      background: '#FFFFFF',
                      width: '100%',
                    }}
                  />
                  {jobSearchQuery && (
                    <button
                      onClick={() => setJobSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--ink-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className={`btn ${activeJobFilter === 'all' ? 'btn-dark' : 'btn-outline'}`}
                    onClick={() => setActiveJobFilter('all')}
                    style={{ minHeight: 36, padding: '0 14px', fontSize: '0.82rem' }}
                  >
                    All Opportunities
                  </button>
                  <button
                    className={`btn ${activeJobFilter === 'fulltime' ? 'btn-dark' : 'btn-outline'}`}
                    onClick={() => setActiveJobFilter('fulltime')}
                    style={{ minHeight: 36, padding: '0 14px', fontSize: '0.82rem' }}
                  >
                    Founding Roles
                  </button>
                  <button
                    className={`btn ${activeJobFilter === 'bounty' ? 'btn-dark' : 'btn-outline'}`}
                    onClick={() => setActiveJobFilter('bounty')}
                    style={{ minHeight: 36, padding: '0 14px', fontSize: '0.82rem' }}
                  >
                    Bounties & Grants
                  </button>
                  {isAuthenticated && (
                    <button
                      className={`btn ${activeJobFilter === 'applied' ? 'btn-dark' : 'btn-outline'}`}
                      onClick={() => setActiveJobFilter('applied')}
                      style={{
                        minHeight: 36,
                        padding: '0 14px',
                        fontSize: '0.82rem',
                        borderColor: activeJobFilter === 'applied' ? 'var(--ink)' : 'var(--accent-coral)',
                        color: activeJobFilter === 'applied' ? '#FFFFFF' : 'var(--accent-coral)',
                      }}
                    >
                      My Applications ({myApplications.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="opportunities-grid">
            {filteredJobs.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '48px 20px',
                  background: 'var(--paper)',
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
                  No opportunities match "{jobSearchQuery || activeJobFilter}".
                </p>
                <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', marginBottom: 14 }}>
                  {activeJobFilter === 'applied'
                    ? "You haven't applied to any roles yet. Explore the listings below to submit your first application."
                    : "Try clearing search keywords or changing filters to view all active opportunities."}
                </p>
                <button
                  onClick={() => {
                    setJobSearchQuery('');
                    setActiveJobFilter('all');
                  }}
                  className="btn btn-outline"
                  style={{ minHeight: 34, padding: '0 16px', fontSize: '0.82rem' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job, idx) => {
                const myApp = myApplications.find((app) => app.jobId === job.id);
                return (
                  <Reveal key={job.id} staggerIndex={idx} delay={30}>
                    <div
                      className="opp-card"
                      onClick={() => handleOpenJobDetails(job)}
                      style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                      <div>
                        <div className="opp-meta-row">
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: !job.jobType.toLowerCase().includes('full') ? 'var(--accent-violet)' : 'var(--accent-coral)',
                            }}
                          >
                            {job.companyName || job.company}
                          </span>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            {myApp && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 850,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  background: '#EFFDF5',
                                  color: '#047857',
                                  border: '1px solid #10B981',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <CheckCircle2 size={11} /> {myApp.status.toUpperCase()}
                              </span>
                            )}
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
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 999,
                                background: !job.jobType.toLowerCase().includes('full') ? '#FDF4FF' : '#EFFDF5',
                                color: !job.jobType.toLowerCase().includes('full') ? '#7E22CE' : '#047857',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              {job.jobType}
                            </span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.35rem', marginBottom: 10, lineHeight: 1.25 }}>{job.title}</h3>
                        <p className="opp-card-desc">{job.description}</p>

                        <div className="opp-tags">
                          {job.requirements.slice(0, 3).map((req, i) => (
                            <span key={i} className="opp-tag">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="opp-tag" style={{ background: 'var(--paper-deep)', fontWeight: 800 }}>
                              +{job.requirements.length - 3} more
                            </span>
                          )}
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenJobDetails(job);
                            }}
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              textDecoration: 'underline',
                              color: 'var(--ink)',
                              cursor: 'pointer',
                            }}
                          >
                            View Scope &rarr;
                          </button>

                          {myApp ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenJobDetails(job);
                              }}
                              className="btn btn-outline"
                              style={{
                                minHeight: 36,
                                padding: '0 14px',
                                fontSize: '0.82rem',
                                background: '#F0FDF4',
                                color: '#047857',
                                borderColor: '#10B981',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <CheckCircle2 size={13} /> Applied
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenApply(job);
                              }}
                              className="btn btn-primary"
                              style={{ minHeight: 36, padding: '0 16px', fontSize: '0.84rem' }}
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })
            )}
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
                  Co-Founder Discovery
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
                  Launch Venture
                </button>
                <button
                  onClick={() => setCofounderMatchingModalOpen(true)}
                  className="btn btn-outline"
                  style={{ minHeight: 40, padding: '0 18px', fontSize: '0.85rem', background: '#FFFFFF' }}
                >
                  Analyze Synergy
                </button>
              </div>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {collabs.map((collab, idx) => (
              <Reveal key={collab.id} staggerIndex={idx} delay={30}>
                <div
                  className="tactile-card"
                  onClick={() => handleOpenCollabDetails(collab)}
                  style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="tactile-card-tag" style={{ background: 'var(--accent-lime)', marginBottom: 0 }}>
                        {collab.projectStage || 'Active Discovery'}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-muted)' }}>
                        by {collab.author?.fullName || 'Venture Lead'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: 10, lineHeight: 1.25 }}>{collab.title}</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      marginBottom: 16,
                      color: 'var(--ink-muted)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.55,
                    }}>
                      {collab.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                      {collab.skillsRequired.slice(0, 3).map((skill, sIdx) => (
                        <span key={sIdx} className="opp-tag">
                          {skill}
                        </span>
                      ))}
                      {collab.skillsRequired.length > 3 && (
                        <span className="opp-tag" style={{ background: 'var(--paper-deep)', fontWeight: 800 }}>
                          +{collab.skillsRequired.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 14,
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: 'auto',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline', color: 'var(--ink)' }}>
                      Roadmap Details &rarr;
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenJoinCollab(collab);
                      }}
                      className="btn btn-outline"
                      style={{ minHeight: 36, padding: '0 16px', fontSize: '0.82rem' }}
                    >
                      Join Venture
                    </button>
                  </div>
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
                  Build-to-Earn Proof Ledger
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
                    if (!isAuthenticated) openAuthModal('login');
                    else setSubmitModalOpen(true);
                  }}
                  className="btn btn-coral"
                  style={{ minHeight: 44, padding: '0 22px' }}
                >
                  Submit Proof of Work
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal('login');
                    else setReviewQueueModalOpen(true);
                  }}
                  className="btn btn-dark"
                  style={{ minHeight: 44, padding: '0 18px' }}
                >
                  Reviewer Queue
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
                    <button
                      type="button"
                      onClick={() => handleOpenCredential(sub.id)}
                      className="btn btn-outline"
                      style={{
                        minHeight: 34,
                        padding: '0 14px',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        background: '#FFFFFF',
                      }}
                      title="Inspect cryptographic proof deliverable and audit record"
                    >
                      Inspect Proof Artifact <ShieldCheck size={13} color="#047857" />
                    </button>
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
                <li><a href="#bte">Ed25519 Signing Standards</a></li>
                <li><a href="#graph">PostgreSQL & Prisma Core</a></li>
                <li><a href="#opportunities">Live Ecosystem Grants</a></li>
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
        onSuccess={() => {
          api.getMyApplications().then(setMyApplications).catch(() => {});
        }}
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
        onProjectCreated={handleProjectCreated}
      />

      <CofounderMatchingModal
        isOpen={cofounderMatchingModalOpen}
        onClose={() => setCofounderMatchingModalOpen(false)}
        onSelectCandidate={(cand) => {
          if (onOpenNetwork) {
            onOpenNetwork('directory', cand.id);
          } else {
            setLaunchProjectModalOpen(true);
          }
        }}
      />

      {/* Contextual Slide-Over Drawers (Progressive Disclosure) */}
      <OpportunitySlideOver
        job={slideOverJob}
        isOpen={slideOverJobOpen}
        onClose={() => setSlideOverJobOpen(false)}
        onApply={(job) => handleOpenApply(job)}
      />

      <VentureSlideOver
        collab={slideOverCollab}
        isOpen={slideOverCollabOpen}
        onClose={() => setSlideOverCollabOpen(false)}
        onRequestJoin={(collab) => handleOpenJoinCollab(collab)}
        onOpenCoFounders={() => setCofounderMatchingModalOpen(true)}
      />
    </div>
  );
};
