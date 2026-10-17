// wavesync_web/src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Submission, JobOpportunity } from '../services/api';
import { CredentialModal } from '../components/CredentialModal';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import {
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Award,
  ShieldCheck,
  Briefcase,
  Loader2,
  Edit3,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // Profile Form State
  const [editHeadline, setEditHeadline] = useState(user?.headline || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editInstitution, setEditInstitution] = useState('');
  const [editGradYear, setEditGradYear] = useState<number | ''>('');
  const [editMentoring, setEditMentoring] = useState(true);
  const [editRefer, setEditRefer] = useState(true);
  const [editSkillsStr, setEditSkillsStr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // User Track Record State
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);

  // Status Notification
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadProfileData();
      loadTrackRecord();
    }
  }, [isAuthenticated, user?.id]);

  const loadProfileData = async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const data = await api.getPersonProfile(user.id);
      if (data.person) {
        setEditHeadline(data.person.headline || '');
        setEditBio(data.person.bio || '');
        setEditInstitution(data.person.institution || '');
        setEditGradYear(data.person.graduationYear || '');
        setEditMentoring(data.person.isAvailableForMentoring ?? true);
        setEditRefer(data.person.willingToRefer ?? true);
        setEditSkillsStr(data.person.skills?.join(', ') || '');
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadTrackRecord = async () => {
    try {
      const [subs, apps] = await Promise.all([
        api.getMySubmissions().catch(() => []),
        api.getMyApplications().catch(() => []),
      ]);
      setMySubmissions(subs);
      setMyApplications(apps);
    } catch (err) {
      console.error('Error loading user track record:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArr = editSkillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.updateNetworkProfile({
        headline: editHeadline,
        bio: editBio,
        institution: editInstitution,
        graduationYear: editGradYear === '' ? undefined : Number(editGradYear),
        isAvailableForMentoring: editMentoring,
        willingToRefer: editRefer,
        skills: skillsArr,
      });

      showNotification('success', 'Your institutional profile has been successfully updated!');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenCredential = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setCredentialModalOpen(true);
  };

  return (
    <div className="profile-page-root" style={{ background: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 28 }}>
              <div>
                <div className="pill-badge pill-badge-lime" style={{ marginBottom: 14 }}>
                  <UserIcon size={13} /> Verified Member Profile
                </div>
                <h1 className="section-title" style={{ marginBottom: 8 }}>
                  My Network Profile
                </h1>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '1.05rem', maxWidth: 640 }}>
                  Manage your institutional credentials, mentorship availability, and cryptographic proof portfolio.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Toast Notification */}
          {statusMessage && (
            <div
              style={{
                marginBottom: 20,
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                background: statusMessage.type === 'success' ? '#EFFDF5' : '#FFF1F2',
                color: statusMessage.type === 'success' ? '#047857' : '#BE123C',
                fontWeight: 800,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-tactile-sm)',
              }}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {!isAuthenticated || !user ? (
            <div
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '2px dashed var(--border-strong)',
                boxShadow: 'var(--shadow-tactile-sm)',
                maxWidth: 580,
                margin: '40px auto',
              }}
            >
              <UserIcon size={44} color="var(--accent-coral)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 10 }}>Sign In to View Profile</h2>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.5 }}>
                Access your verified reputation badges, proof submissions, and mentor availability settings.
              </p>
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-primary"
                style={{ minHeight: 46, padding: '0 28px' }}
              >
                Sign In to WaveSync
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Profile Overview & Edit Form */}
              <div
                className="tactile-card"
                style={{
                  background: '#FFFFFF',
                  padding: 28,
                }}
              >
                {/* Profile Header Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1.5px solid var(--border-subtle)' }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background: 'var(--accent-lime)',
                      border: '2px solid var(--border-strong)',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: '1.4rem',
                      boxShadow: 'var(--shadow-tactile-sm)',
                      flexShrink: 0,
                    }}
                  >
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: 4 }}>{user.fullName}</h2>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 850,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'var(--paper-deep)',
                          border: '1px solid var(--border-strong)',
                        }}
                      >
                        {user.role}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontWeight: 600 }}>{user.email}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: 6 }}>
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CS Undergrad @ University · Distributed Systems & Verifiable Execution"
                      value={editHeadline}
                      onChange={(e) => setEditHeadline(e.target.value)}
                      maxLength={160}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: 6 }}>
                        College / Alma Mater
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Stanford, MIT, IIT Delhi"
                        value={editInstitution}
                        onChange={(e) => setEditInstitution(e.target.value)}
                        maxLength={100}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: 6 }}>
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2026"
                        value={editGradYear}
                        onChange={(e) => setEditGradYear(e.target.value === '' ? '' : Number(e.target.value))}
                        min={1970}
                        max={2035}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: 6 }}>
                      Technical Skills (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, PyTorch, Go, Rust, System Design"
                      value={editSkillsStr}
                      onChange={(e) => setEditSkillsStr(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: 6 }}>
                      Bio & Collaboration Goals
                    </label>
                    <textarea
                      placeholder="Tell peers what you are building, what technical challenges you are tackling, or what mentorship you can provide..."
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      maxLength={800}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '6px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.86rem', fontWeight: 750, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editMentoring}
                        onChange={(e) => setEditMentoring(e.target.checked)}
                      />
                      <span>Accept 1:1 Mentorship Requests from Students & Peers</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.86rem', fontWeight: 750, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editRefer}
                        onChange={(e) => setEditRefer(e.target.checked)}
                      />
                      <span>Willing to Provide Company Referrals for Verified Builders</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn btn-primary"
                      style={{ minHeight: 44, padding: '0 28px' }}
                    >
                      {savingProfile ? <Loader2 className="spin" size={16} /> : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Portfolio & Track Record Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Submitted Proofs of Work */}
                <div className="tactile-card" style={{ background: '#FFFFFF', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ShieldCheck size={18} color="#047857" />
                      My Proof-of-Work Deliverables ({mySubmissions.length})
                    </h3>
                  </div>

                  {mySubmissions.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-muted)', fontSize: '0.86rem', background: 'var(--paper-light)', borderRadius: 'var(--radius-md)' }}>
                      You haven't submitted any proof deliverables yet.
                      <div style={{ marginTop: 8 }}>
                        <a href="/build-to-earn" style={{ color: 'var(--accent-coral)', fontWeight: 800 }}>
                          Submit Proof on Build-to-Earn &rarr;
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {mySubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            padding: 14,
                            border: '1.5px solid var(--border-strong)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--paper-light)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <strong style={{ fontSize: '0.92rem' }}>{sub.title}</strong>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 850,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: sub.status === 'approved' ? '#EFFDF5' : '#FFF7ED',
                                color: sub.status === 'approved' ? '#047857' : '#C2410C',
                                border: '1px solid currentColor',
                              }}
                            >
                              {sub.status}
                            </span>
                          </div>
                          {sub.description && (
                            <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', margin: '4px 0 10px 0' }}>
                              {sub.description}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenCredential(sub.id)}
                            className="btn btn-outline"
                            style={{ minHeight: 30, padding: '0 10px', fontSize: '0.74rem', background: '#FFFFFF' }}
                          >
                            Inspect Certificate &rarr;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Applications Track Record */}
                <div className="tactile-card" style={{ background: '#FFFFFF', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Briefcase size={18} color="var(--accent-coral)" />
                      Submitted Applications ({myApplications.length})
                    </h3>
                  </div>

                  {myApplications.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-muted)', fontSize: '0.86rem', background: 'var(--paper-light)', borderRadius: 'var(--radius-md)' }}>
                      No active applications. Explore open roles on the Opportunities page.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {myApplications.map((app) => (
                        <div
                          key={app.id}
                          style={{
                            padding: 12,
                            border: '1.5px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '0.88rem' }}>{app.job?.title || 'Applied Position'}</strong>
                            <div style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                              {app.job?.companyName || app.job?.company || 'Ecosystem Partner'}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 850,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: '#EFFDF5',
                              color: '#047857',
                            }}
                          >
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Credential Modal */}
      <CredentialModal
        submissionId={selectedSubmissionId}
        isOpen={credentialModalOpen}
        onClose={() => setCredentialModalOpen(false)}
      />
    </div>
  );
};
