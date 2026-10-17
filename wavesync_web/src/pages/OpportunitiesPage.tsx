// wavesync_web/src/pages/OpportunitiesPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, JobOpportunity } from '../services/api';
import { ApplyJobModal } from '../components/ApplyJobModal';
import { OpportunitySlideOver } from '../components/OpportunitySlideOver';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import {
  Briefcase,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const { openAuthModal, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [activeJobFilter, setActiveJobFilter] = useState<'all' | 'fulltime' | 'bounty' | 'applied'>('all');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [myApplications, setMyApplications] = useState<any[]>([]);

  // Modal & Slide-Over States
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobOpportunity | null>(null);
  const [slideOverJob, setSlideOverJob] = useState<JobOpportunity | null>(null);
  const [slideOverJobOpen, setSlideOverJobOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const jList = await api.getJobs();
        setJobs(jList);
      } catch (err) {
        console.error('Failed to load opportunities:', err);
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
    <div className="opportunities-page-root" style={{ background: '#FAF5EE', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <section
        className="section"
        style={{
          paddingTop: 'clamp(100px, 12vw, 140px)',
          paddingBottom: 'clamp(60px, 8vw, 100px)',
          flex: '1 0 auto',
        }}
      >
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 36 }}>
              <div>
                <div className="pill-badge pill-badge-mint" style={{ marginBottom: 14 }}>
                  <Briefcase size={13} /> High-Signal Roles & Bounties
                </div>
                <h1 className="section-title" style={{ marginBottom: 8 }}>
                  Current Opportunities
                </h1>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '1.05rem', maxWidth: 640 }}>
                  Direct equity roles, founding engineering positions, and funded bounties with verified grant milestones.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', width: '100%', maxWidth: 520 }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search role, skill, company, stack..."
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    className="form-input"
                    style={{
                      paddingLeft: 38,
                      paddingRight: jobSearchQuery ? 32 : 14,
                      height: 42,
                      fontSize: '0.86rem',
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
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--ink-muted)',
                        fontSize: '0.85rem',
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

          {jobsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)', fontWeight: 800 }}>
              Loading live opportunities...
            </div>
          ) : (
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
          )}
        </div>
      </section>

      <Footer />

      {/* Modals & Slide-Overs */}
      <ApplyJobModal
        job={selectedJobForApply}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => {
          api.getMyApplications().then(setMyApplications).catch(() => {});
        }}
      />

      <OpportunitySlideOver
        job={slideOverJob}
        isOpen={slideOverJobOpen}
        onClose={() => setSlideOverJobOpen(false)}
        onApply={(job) => handleOpenApply(job)}
      />
    </div>
  );
};
