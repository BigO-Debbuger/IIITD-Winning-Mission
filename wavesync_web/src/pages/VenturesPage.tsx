// wavesync_web/src/pages/VenturesPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, CollabProject } from '../services/api';
import { LaunchProjectModal } from '../components/LaunchProjectModal';
import { JoinCollabModal } from '../components/JoinCollabModal';
import { VentureArchitectModal } from '../components/VentureArchitectModal';
import { CofounderMatchingModal } from '../components/CofounderMatchingModal';
import { VentureSlideOver } from '../components/VentureSlideOver';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import { Sparkles, Plus, Users, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const VenturesPage: React.FC = () => {
  const { openAuthModal, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [collabs, setCollabs] = useState<CollabProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Slide-Over States
  const [launchProjectModalOpen, setLaunchProjectModalOpen] = useState(false);
  const [joinCollabModalOpen, setJoinCollabModalOpen] = useState(false);
  const [selectedCollabForJoin, setSelectedCollabForJoin] = useState<CollabProject | null>(null);
  const [slideOverCollab, setSlideOverCollab] = useState<CollabProject | null>(null);
  const [slideOverCollabOpen, setSlideOverCollabOpen] = useState(false);
  const [ventureArchitectModalOpen, setVentureArchitectModalOpen] = useState(false);
  const [cofounderMatchingModalOpen, setCofounderMatchingModalOpen] = useState(false);

  useEffect(() => {
    async function loadCollabs() {
      try {
        const cList = await api.getCollabs();
        setCollabs(cList);
      } catch (err) {
        console.error('Failed to load ventures:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCollabs();
  }, []);

  const handleProjectCreated = (newCollab: CollabProject) => {
    setCollabs((prev) => [newCollab, ...prev]);
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

  return (
    <div className="ventures-page-root" style={{ background: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                <div className="pill-badge pill-badge-lime" style={{ marginBottom: 14 }}>
                  <Sparkles size={13} /> Venture Builder & Founder Matchmaking
                </div>
                <h1 className="section-title" style={{ marginBottom: 8 }}>
                  Ambitious Ventures Seeking Technical Partners
                </h1>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '1.05rem', maxWidth: 680 }}>
                  Connect directly with vetted founders looking for complementary technical execution leads,
                  or architect your own startup venture with verified milestones.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (!isAuthenticated) openAuthModal('register');
                    else setLaunchProjectModalOpen(true);
                  }}
                  className="btn btn-coral"
                  style={{ minHeight: 44, padding: '0 20px', fontSize: '0.88rem' }}
                >
                  <Plus size={16} /> Launch Venture
                </button>
                <button
                  onClick={() => setVentureArchitectModalOpen(true)}
                  className="btn btn-primary"
                  style={{ minHeight: 44, padding: '0 18px', fontSize: '0.88rem' }}
                >
                  <Sparkles size={15} /> AI Venture Architect
                </button>
                <button
                  onClick={() => setCofounderMatchingModalOpen(true)}
                  className="btn btn-outline"
                  style={{ minHeight: 44, padding: '0 18px', fontSize: '0.88rem', background: '#FFFFFF' }}
                >
                  <Users size={15} /> Analyze Synergy
                </button>
              </div>
            </div>
          </Reveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-muted)', fontWeight: 800 }}>
              Loading venture initiatives...
            </div>
          ) : collabs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#FFFFFF',
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <p style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 10 }}>No active ventures yet.</p>
              <p style={{ color: 'var(--ink-secondary)', marginBottom: 20 }}>
                Be the first founder to post a venture roadmap or use the AI Venture Architect.
              </p>
              <button
                onClick={() => {
                  if (!isAuthenticated) openAuthModal('register');
                  else setLaunchProjectModalOpen(true);
                }}
                className="btn btn-primary"
              >
                Launch First Venture
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      <Footer />

      {/* Modals & Slide-Overs */}
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

      <VentureArchitectModal
        isOpen={ventureArchitectModalOpen}
        onClose={() => setVentureArchitectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <CofounderMatchingModal
        isOpen={cofounderMatchingModalOpen}
        onClose={() => setCofounderMatchingModalOpen(false)}
        onSelectCandidate={() => {
          navigate('/network');
        }}
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
