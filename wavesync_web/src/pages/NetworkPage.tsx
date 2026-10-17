// wavesync_web/src/pages/NetworkPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  api,
  PersonProfile,
  ConnectionRequest,
  AcceptedConnection,
  MentorshipRequest,
  ExplainableRecommendation,
  NetworkOutcome,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CofounderMatchingModal } from '../components/CofounderMatchingModal';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import {
  Users,
  Search,
  Sparkles,
  UserCheck,
  Award,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const NetworkPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabFromUrl = searchParams.get('tab') as 'directory' | 'recommendations' | 'connections' | 'outcomes' | null;
  const [activeTab, setActiveTab] = useState<'directory' | 'recommendations' | 'connections' | 'outcomes'>(
    tabFromUrl && ['directory', 'recommendations', 'connections', 'outcomes'].includes(tabFromUrl)
      ? tabFromUrl
      : 'directory'
  );

  const handleSelectTab = (tab: 'directory' | 'recommendations' | 'connections' | 'outcomes') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Directory state
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [mentorshipOnly, setMentorshipOnly] = useState(false);
  const [referralsOnly, setReferralsOnly] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<ExplainableRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Connections state
  const [connections, setConnections] = useState<AcceptedConnection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Outcomes state
  const [outcomes, setOutcomes] = useState<NetworkOutcome[]>([]);
  const [totalEcosystemOutcomes, setTotalEcosystemOutcomes] = useState(0);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);
  const [recordingOutcome, setRecordingOutcome] = useState(false);
  const [outcomePartnerId, setOutcomePartnerId] = useState('');
  const [outcomeType, setOutcomeType] = useState('mentorship_completed');
  const [outcomeTitle, setOutcomeTitle] = useState('');
  const [outcomeDesc, setOutcomeDesc] = useState('');

  // Profile View Drawer State
  const [viewingProfile, setViewingProfile] = useState<PersonProfile | null>(null);
  const [loadingProfileView, setLoadingProfileView] = useState(false);

  // Action Modals
  const [connectModalTarget, setConnectModalTarget] = useState<PersonProfile | null>(null);
  const [connectIntroMessage, setConnectIntroMessage] = useState('');
  const [sendingConnect, setSendingConnect] = useState(false);

  const [mentorModalTarget, setMentorModalTarget] = useState<PersonProfile | null>(null);
  const [mentorTopic, setMentorTopic] = useState('');
  const [mentorNote, setMentorNote] = useState('');
  const [sendingMentorRequest, setSendingMentorRequest] = useState(false);

  // Co-Founder Matching Modal
  const [cofounderModalOpen, setCofounderModalOpen] = useState(false);

  // Notifications
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  useEffect(() => {
    loadDirectory();
    if (isAuthenticated) {
      loadRecommendations();
      loadConnectionsData();
      loadOutcomes();
    }
  }, [isAuthenticated]);

  const loadDirectory = async () => {
    setLoadingPeople(true);
    try {
      const params: Record<string, string | number | boolean> = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (mentorshipOnly) params.mentorship = true;
      if (referralsOnly) params.referral = true;
      if (selectedSkill) params.skill = selectedSkill;

      const data = await api.getPeople(params);
      setPeople(data.people || []);
    } catch (err: any) {
      console.error('Failed to load directory:', err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const data = await api.getExplainableRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const loadConnectionsData = async () => {
    setLoadingConnections(true);
    try {
      const [connRes, reqRes, mentorRes] = await Promise.all([
        api.getAcceptedConnections(),
        api.getConnectionRequests(),
        api.getMyMentorshipRequests(),
      ]);
      setConnections(connRes.connections || []);
      setIncomingRequests(reqRes.incoming || []);
      setOutgoingRequests(reqRes.outgoing || []);
      setMentorshipRequests([...(mentorRes.received || []), ...(mentorRes.sent || [])]);
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoadingConnections(false);
    }
  };

  const loadOutcomes = async () => {
    setLoadingOutcomes(true);
    try {
      const data = await api.getOutcomes();
      setOutcomes(data.outcomes || data.userOutcomes || []);
      setTotalEcosystemOutcomes(data.totalEcosystemOutcomes || 0);
    } catch (err) {
      console.error('Failed to load outcomes:', err);
    } finally {
      setLoadingOutcomes(false);
    }
  };

  const openPersonProfile = async (userId: string) => {
    setLoadingProfileView(true);
    try {
      const data = await api.getPersonProfile(userId);
      setViewingProfile(data.person);
    } catch (err) {
      showNotification('error', 'Could not load person profile');
    } finally {
      setLoadingProfileView(false);
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!connectModalTarget) return;
    setSendingConnect(true);
    try {
      await api.sendConnectionRequest(connectModalTarget.id, connectIntroMessage);
      showNotification('success', `Connection request sent to ${connectModalTarget.fullName}`);
      setConnectModalTarget(null);
      setConnectIntroMessage('');
      loadConnectionsData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to send connection request');
    } finally {
      setSendingConnect(false);
    }
  };

  const handleSendMentorshipRequest = async () => {
    if (!mentorModalTarget) return;
    if (!mentorTopic) {
      showNotification('error', 'Please specify a focus topic for your mentorship session');
      return;
    }
    setSendingMentorRequest(true);
    try {
      await api.sendMentorshipRequest(mentorModalTarget.id, mentorTopic, mentorNote);
      showNotification('success', `Mentorship request sent to ${mentorModalTarget.fullName}`);
      setMentorModalTarget(null);
      setMentorTopic('');
      setMentorNote('');
      loadConnectionsData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to request mentorship');
    } finally {
      setSendingMentorRequest(false);
    }
  };

  const handleRespondConnection = async (reqId: string, action: 'accept' | 'decline') => {
    try {
      await api.respondToConnectionRequest(reqId, action);
      showNotification('success', `Request ${action}ed`);
      loadConnectionsData();
    } catch (err: any) {
      showNotification('error', err.message || 'Action failed');
    }
  };

  const handleRecordOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeTitle.trim() || !outcomePartnerId) {
      showNotification('error', 'Please provide a title and select a partner');
      return;
    }
    setRecordingOutcome(true);
    try {
      await api.recordOutcome({
        partnerId: outcomePartnerId,
        type: outcomeType,
        title: outcomeTitle,
        description: outcomeDesc,
      });
      showNotification('success', 'Career outcome recorded on the tamper-proof ledger!');
      setOutcomeTitle('');
      setOutcomeDesc('');
      setOutcomePartnerId('');
      loadOutcomes();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to record outcome');
    } finally {
      setRecordingOutcome(false);
    }
  };

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => {
      (p.skills || []).forEach((s) => set.add(s));
    });
    return Array.from(set).slice(0, 14);
  }, [people]);

  return (
    <div className="network-page-root" style={{ background: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                <div className="pill-badge pill-badge-mint" style={{ marginBottom: 14 }}>
                  <Users size={13} /> Verified Alumni & Peer Network Protocol
                </div>
                <h1 className="section-title" style={{ marginBottom: 8 }}>
                  Alumni & Talent Network
                </h1>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '1.05rem', maxWidth: 680 }}>
                  Discover alumni from top universities, request 1:1 mentorship sessions, gain internal company referrals,
                  and match with complementary co-founders.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCofounderModalOpen(true)}
                  className="btn btn-coral"
                  style={{ minHeight: 44, padding: '0 20px', fontSize: '0.86rem' }}
                >
                  <Sparkles size={15} /> Co-Founder Synergy
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  className="btn btn-outline"
                  style={{ minHeight: 44, padding: '0 18px', fontSize: '0.86rem', background: '#FFFFFF' }}
                >
                  Go to Messages &rarr;
                </button>
              </div>
            </div>
          </Reveal>

          {/* Status Notification Toast */}
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

          {/* Tab Navigation Pill Bar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: '2px solid var(--border-strong)',
              paddingBottom: 12,
              marginBottom: 24,
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'directory', label: 'Alumni & Peer Directory', icon: <Users size={15} /> },
              {
                id: 'recommendations',
                label: 'Smart Matches & Mentors',
                icon: <Sparkles size={15} />,
                badge: recommendations.length > 0 ? recommendations.length : null,
              },
              {
                id: 'connections',
                label: 'My Connections',
                icon: <UserCheck size={15} />,
                badge: incomingRequests.length > 0 ? incomingRequests.length : null,
              },
              { id: 'outcomes', label: 'Career Outcomes', icon: <Award size={15} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(tab.id as any)}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-pill)',
                    background: isActive ? 'var(--ink)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : 'var(--ink)',
                    border: '2px solid var(--border-strong)',
                    boxShadow: isActive ? 'var(--shadow-tactile-sm)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={{
                        background: 'var(--accent-coral)',
                        color: '#FFFFFF',
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        padding: '1px 6px',
                        borderRadius: 999,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: DIRECTORY */}
          {activeTab === 'directory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Search & Filter Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'center',
                  padding: 16,
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-tactile-sm)',
                }}
              >
                <div style={{ position: 'relative', flex: '1 1 260px' }}>
                  <Search
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, headline, skills, or university..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadDirectory()}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: 999,
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.88rem',
                      background: 'var(--paper-light)',
                    }}
                  />
                </div>

                {/* Role Filter Pills */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All Roles' },
                    { id: 'alumni', label: 'Alumni' },
                    { id: 'student', label: 'Students' },
                    { id: 'admin', label: 'Faculty' },
                    { id: 'company', label: 'Founders & Recruiters' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoleFilter(r.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: 999,
                        border: '1.5px solid var(--border-strong)',
                        background: roleFilter === r.id ? 'var(--accent-lime)' : '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Filter Toggles */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={mentorshipOnly}
                      onChange={(e) => setMentorshipOnly(e.target.checked)}
                    />
                    <span>Mentors Only</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={referralsOnly}
                      onChange={(e) => setReferralsOnly(e.target.checked)}
                    />
                    <span>Willing to Refer</span>
                  </label>
                  <button
                    onClick={loadDirectory}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', minHeight: 36 }}
                  >
                    <RefreshCw size={13} />
                    <span>Apply Filter</span>
                  </button>
                </div>
              </div>

              {/* Quick Skill Tags */}
              {allSkills.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--ink-muted)' }}>Top Domains:</span>
                  {allSkills.map((sk) => (
                    <button
                      key={sk}
                      onClick={() => {
                        setSelectedSkill(selectedSkill === sk ? null : sk);
                        setTimeout(loadDirectory, 10);
                      }}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.75rem',
                        fontWeight: 750,
                        background: selectedSkill === sk ? 'var(--accent-mint)' : '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      {sk}
                    </button>
                  ))}
                  {selectedSkill && (
                    <button
                      onClick={() => {
                        setSelectedSkill(null);
                        setTimeout(loadDirectory, 10);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Clear skill
                    </button>
                  )}
                </div>
              )}

              {/* People Cards Grid */}
              {loadingPeople ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-muted)' }}>
                  <Loader2 className="spin" size={32} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 800 }}>Searching database for alumni & professionals...</div>
                </div>
              ) : people.length === 0 ? (
                <div
                  style={{
                    padding: 48,
                    textAlign: 'center',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px dashed var(--border-subtle)',
                  }}
                >
                  <Users size={36} color="var(--ink-muted)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 6 }}>No profiles matched your filters</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: 16 }}>
                    Try resetting the role filter or clearing the search keyword.
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setMentorshipOnly(false);
                      setReferralsOnly(false);
                      setSelectedSkill(null);
                      setTimeout(loadDirectory, 10);
                    }}
                    className="btn btn-outline"
                    style={{ minHeight: 36, padding: '0 16px' }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 18,
                  }}
                >
                  {people.map((p) => {
                    const isCurrentAuthUser = user?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className="tactile-card"
                        style={{
                          background: '#FFFFFF',
                          padding: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: 280,
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: '50%',
                                  background: p.role === 'alumni' ? 'var(--accent-coral)' : p.role === 'student' ? 'var(--accent-mint)' : 'var(--accent-lime)',
                                  color: '#05020B',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 900,
                                  fontSize: '1rem',
                                  border: '1.5px solid var(--border-strong)',
                                  flexShrink: 0,
                                }}
                              >
                                {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 2 }}>{p.fullName}</h3>
                                <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                                  {p.role} {p.graduationYear ? `· Class of ${p.graduationYear}` : ''}
                                </div>
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 850,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: 'var(--paper-deep)',
                                border: '1px solid var(--border-strong)',
                              }}
                            >
                              {p.institution || 'WaveSync Alum'}
                            </span>
                          </div>

                          <p style={{ fontSize: '0.86rem', color: 'var(--ink)', marginBottom: 12, lineHeight: 1.45, fontWeight: 550 }}>
                            {p.headline || 'Active engineering contributor & ecosystem member.'}
                          </p>

                          {/* Skill badges */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                            {(p.skills || []).slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  background: 'var(--paper-deep)',
                                  border: '1px solid var(--border-strong)',
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Availability Badges */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                            {p.isAvailableForMentoring && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
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
                                <CheckCircle2 size={10} /> Mentoring
                              </span>
                            )}
                            {p.willingToRefer && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 850,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  background: '#FEFCE8',
                                  color: '#A16207',
                                  border: '1px solid #F59E0B',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <Award size={10} /> Referrals
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            paddingTop: 12,
                            borderTop: '1px solid var(--border-subtle)',
                          }}
                        >
                          <button
                            onClick={() => openPersonProfile(p.id)}
                            className="btn btn-outline"
                            style={{ flex: 1, minHeight: 34, padding: '0 10px', fontSize: '0.78rem' }}
                          >
                            View Profile
                          </button>
                          {!isCurrentAuthUser && (
                            <>
                              {p.isAvailableForMentoring && (
                                <button
                                  onClick={() => {
                                    if (!isAuthenticated) openAuthModal('login');
                                    else setMentorModalTarget(p);
                                  }}
                                  className="btn btn-primary"
                                  style={{ minHeight: 34, padding: '0 12px', fontSize: '0.78rem' }}
                                  title="Request 1:1 Mentorship Session"
                                >
                                  Mentorship
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (!isAuthenticated) openAuthModal('login');
                                  else setConnectModalTarget(p);
                                }}
                                className="btn btn-dark"
                                style={{ minHeight: 34, padding: '0 12px', fontSize: '0.78rem' }}
                                title="Connect on Network"
                              >
                                Connect
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!isAuthenticated ? (
                <div style={{ padding: 48, textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-strong)' }}>
                  <Sparkles size={36} color="var(--accent-coral)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8 }}>Sign in for Smart Mentor & Peer Matches</h3>
                  <p style={{ color: 'var(--ink-secondary)', marginBottom: 20, maxWidth: 480, margin: '0 auto 20px' }}>
                    WaveSync calculates explainable synergy vectors based on complementary skills, university affiliation, and project roadmaps.
                  </p>
                  <button onClick={() => openAuthModal('login')} className="btn btn-primary">
                    Sign In to View Matches
                  </button>
                </div>
              ) : loadingRecs ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-muted)' }}>
                  <Loader2 className="spin" size={32} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 800 }}>Generating explainable synergy recommendations...</div>
                </div>
              ) : recommendations.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-subtle)' }}>
                  <p style={{ fontWeight: 800 }}>No personalized recommendations found yet.</p>
                  <p style={{ color: 'var(--ink-muted)' }}>Add more skills and bio details to your profile to generate matches.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="tactile-card"
                      style={{ background: '#FFFFFF', padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                padding: '3px 10px',
                                borderRadius: 999,
                                background: 'var(--accent-lime)',
                                border: '1px solid var(--border-strong)',
                              }}
                            >
                              {rec.matchScore}% Synergy Match
                            </span>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: 8, marginBottom: 2 }}>{rec.fullName}</h3>
                            <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 800 }}>{rec.headline}</div>
                          </div>
                        </div>

                        <div
                          style={{
                            background: 'var(--paper-light)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: 12,
                            marginBottom: 14,
                            fontSize: '0.84rem',
                            lineHeight: 1.5,
                          }}
                        >
                          <strong style={{ color: 'var(--ink)' }}>Why You Match: </strong>
                          <span style={{ color: 'var(--ink-secondary)' }}>{rec.explanation}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                          onClick={() => openPersonProfile(rec.id)}
                          className="btn btn-outline"
                          style={{ flex: 1, minHeight: 34, fontSize: '0.78rem' }}
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => setConnectModalTarget(rec as any)}
                          className="btn btn-primary"
                          style={{ minHeight: 34, padding: '0 14px', fontSize: '0.78rem' }}
                        >
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONNECTIONS */}
          {activeTab === 'connections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {!isAuthenticated ? (
                <div style={{ padding: 48, textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border-strong)' }}>
                  <UserCheck size={36} color="var(--accent-coral)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8 }}>Sign in to View Your Connections</h3>
                  <button onClick={() => openAuthModal('login')} className="btn btn-primary" style={{ marginTop: 10 }}>
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Incoming Requests */}
                  {incomingRequests.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 12 }}>
                        Pending Incoming Requests ({incomingRequests.length})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                        {incomingRequests.map((req) => (
                          <div key={req.id} className="tactile-card" style={{ background: '#FFFFFF', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <strong>{req.requester?.fullName}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>{req.requester?.role}</span>
                            </div>
                            {req.message && (
                              <p style={{ fontSize: '0.82rem', fontStyle: 'italic', marginBottom: 12 }}>"{req.message}"</p>
                            )}
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => handleRespondConnection(req.id, 'accept')}
                                className="btn btn-primary"
                                style={{ minHeight: 32, padding: '0 12px', fontSize: '0.76rem', flex: 1 }}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRespondConnection(req.id, 'decline')}
                                className="btn btn-outline"
                                style={{ minHeight: 32, padding: '0 12px', fontSize: '0.76rem' }}
                              >
                                Ignore
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Connections */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 12 }}>
                      Active Connections ({connections.length})
                    </h3>
                    {connections.length === 0 ? (
                      <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                        No accepted connections yet. Explore the Directory to connect with alumni and founders.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                        {connections.map((c) => (
                          <div key={c.connectionId} className="tactile-card" style={{ background: '#FFFFFF', padding: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <strong>{c.partner?.fullName}</strong>
                              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'var(--accent-lime)' }}>
                                {c.partner?.role}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                              <button
                                onClick={() => openPersonProfile(c.partner.id)}
                                className="btn btn-outline"
                                style={{ flex: 1, minHeight: 32, fontSize: '0.76rem' }}
                              >
                                Profile
                              </button>
                              <button
                                onClick={() => navigate('/messages')}
                                className="btn btn-dark"
                                style={{ minHeight: 32, padding: '0 12px', fontSize: '0.76rem' }}
                              >
                                Message
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mentorship Requests */}
                  {mentorshipRequests.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 12 }}>
                        Mentorship Sessions ({mentorshipRequests.length})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                        {mentorshipRequests.map((m) => (
                          <div key={m.id} className="tactile-card" style={{ background: '#FFFFFF', padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{m.topic}</span>
                              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--accent-coral)' }}>
                                {m.status}
                              </span>
                            </div>
                            {m.message && <p style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>"{m.message}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 4: OUTCOMES */}
          {activeTab === 'outcomes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 20,
                  background: 'var(--ink)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
                    Verifiable Career & Venture Outcomes
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                    Track mentorship sessions, startup formations, and alumni referrals verified in ecosystem telemetry.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-mint)' }}>{totalEcosystemOutcomes}</div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
                    Total Verified Outcomes
                  </div>
                </div>
              </div>

              {/* Record Outcome Form */}
              {isAuthenticated && (
                <div className="tactile-card" style={{ background: '#FFFFFF', padding: 22 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 12 }}>Record a Milestone Outcome</h4>
                  <form onSubmit={handleRecordOutcomeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: 4 }}>Outcome Type</label>
                        <select
                          value={outcomeType}
                          onChange={(e) => setOutcomeType(e.target.value)}
                          className="form-input"
                          style={{ minHeight: 38 }}
                        >
                          <option value="mentorship_completed">Mentorship Completed</option>
                          <option value="referral_interview">Referral & Interview</option>
                          <option value="job_placed">Job Placed</option>
                          <option value="collab_formed">Venture Co-Founding</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: 4 }}>Partner / Mentor</label>
                        <select
                          value={outcomePartnerId}
                          onChange={(e) => setOutcomePartnerId(e.target.value)}
                          className="form-input"
                          style={{ minHeight: 38 }}
                          required
                        >
                          <option value="">Select a connected partner...</option>
                          {connections.map((c) => (
                            <option key={c.connectionId} value={c.partner?.id}>
                              {c.partner?.fullName} ({c.partner?.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: 4 }}>Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Distributed Systems 1:1 with Senior Alum"
                        value={outcomeTitle}
                        onChange={(e) => setOutcomeTitle(e.target.value)}
                        className="form-input"
                        style={{ minHeight: 38 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, marginBottom: 4 }}>Description / Artifact Note</label>
                      <textarea
                        placeholder="Detail the learnings, repos reviewed, or milestone achieved..."
                        value={outcomeDesc}
                        onChange={(e) => setOutcomeDesc(e.target.value)}
                        className="form-input"
                        style={{ minHeight: 64, resize: 'vertical' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={recordingOutcome}
                      className="btn btn-primary"
                      style={{ alignSelf: 'flex-start', minHeight: 38 }}
                    >
                      {recordingOutcome ? 'Recording...' : 'Submit to Outcome Ledger'}
                    </button>
                  </form>
                </div>
              )}

              {/* Outcomes List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {outcomes.map((o) => (
                  <div key={o.id} className="tactile-card" style={{ background: '#FFFFFF', padding: 18 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'var(--paper-deep)',
                        border: '1px solid var(--border-strong)',
                        marginBottom: 8,
                        display: 'inline-block',
                      }}
                    >
                      {(o.type || o.outcomeType || 'Outcome').replace('_', ' ')}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 6 }}>{o.title}</h4>
                    {o.description && <p style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)', marginBottom: 10 }}>{o.description}</p>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: 700 }}>
                      Logged {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Slide-Over Drawer: Person Profile View */}
      {viewingProfile && (
        <div className="slide-over-backdrop" onClick={() => setViewingProfile(null)}>
          <div className="slide-over-panel" onClick={(e) => e.stopPropagation()}>
            <div className="slide-over-header">
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: 2 }}>{viewingProfile.fullName}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                  {viewingProfile.role} {viewingProfile.institution ? `· ${viewingProfile.institution}` : ''}
                </span>
              </div>
              <button onClick={() => setViewingProfile(null)} className="slide-over-close-btn">
                ✕
              </button>
            </div>

            <div className="slide-over-body">
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 6 }}>
                  Headline & Bio
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--ink)' }}>
                  {viewingProfile.headline || 'No headline set.'}
                </p>
                {viewingProfile.bio && (
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginTop: 8 }}>
                    {viewingProfile.bio}
                  </p>
                )}
              </div>

              {viewingProfile.skills && viewingProfile.skills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
                    Verified Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {viewingProfile.skills.map((s, idx) => (
                      <span key={idx} className="opp-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Submissions / Proof-of-Work */}
              {viewingProfile.submissions && viewingProfile.submissions.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>
                    Verified Proof-of-Work Deliverables ({viewingProfile.submissions.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {viewingProfile.submissions.map((sub: any) => (
                      <div key={sub.id} style={{ padding: 12, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--paper-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{sub.title}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="slide-over-footer">
              <button
                onClick={() => {
                  setViewingProfile(null);
                  setConnectModalTarget(viewingProfile);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Connect Note
              </button>
              {viewingProfile.isAvailableForMentoring && (
                <button
                  onClick={() => {
                    setViewingProfile(null);
                    setMentorModalTarget(viewingProfile);
                  }}
                  className="btn btn-coral"
                  style={{ flex: 1 }}
                >
                  Request Mentorship
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Introduction Modal */}
      {connectModalTarget && (
        <div className="wavesync-modal-overlay" onClick={() => setConnectModalTarget(null)}>
          <div className="wavesync-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="wavesync-modal-header">
              <div className="wavesync-modal-title-group">
                <div className="wavesync-modal-icon" style={{ background: 'var(--accent-lime)' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="wavesync-modal-title">Connect with {connectModalTarget.fullName}</h3>
                  <p className="wavesync-modal-subtitle">Add a tailored context note or project intro.</p>
                </div>
              </div>
              <button onClick={() => setConnectModalTarget(null)} className="wavesync-modal-close-btn">
                ✕
              </button>
            </div>
            <div className="wavesync-modal-body">
              <textarea
                placeholder="Hi! I saw your work on distributed systems and would love to connect about..."
                value={connectIntroMessage}
                onChange={(e) => setConnectIntroMessage(e.target.value)}
                className="form-input"
                style={{ minHeight: 120, resize: 'vertical', marginBottom: 16 }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setConnectModalTarget(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  onClick={handleSendConnectionRequest}
                  disabled={sendingConnect}
                  className="btn btn-primary"
                >
                  {sendingConnect ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Request Modal */}
      {mentorModalTarget && (
        <div className="wavesync-modal-overlay" onClick={() => setMentorModalTarget(null)}>
          <div className="wavesync-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="wavesync-modal-header">
              <div className="wavesync-modal-title-group">
                <div className="wavesync-modal-icon" style={{ background: 'var(--accent-coral)', color: '#FFFFFF' }}>
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="wavesync-modal-title">Request Mentorship from {mentorModalTarget.fullName}</h3>
                  <p className="wavesync-modal-subtitle">Structure your session request with an actionable topic.</p>
                </div>
              </div>
              <button onClick={() => setMentorModalTarget(null)} className="wavesync-modal-close-btn">
                ✕
              </button>
            </div>
            <div className="wavesync-modal-body">
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: 4 }}>
                  Focus Topic / Area of Guidance
                </label>
                <input
                  type="text"
                  placeholder="e.g. Code review on WebGPU shaders, Career transition to Systems Engineering"
                  value={mentorTopic}
                  onChange={(e) => setMentorTopic(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: 4 }}>
                  Context / Questions (Optional)
                </label>
                <textarea
                  placeholder="Share details on your current blocker, repository link, or goals for the session..."
                  value={mentorNote}
                  onChange={(e) => setMentorNote(e.target.value)}
                  className="form-input"
                  style={{ minHeight: 90, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setMentorModalTarget(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  onClick={handleSendMentorshipRequest}
                  disabled={sendingMentorRequest}
                  className="btn btn-primary"
                >
                  {sendingMentorRequest ? 'Submitting...' : 'Send Mentorship Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Co-Founder Matching Modal */}
      <CofounderMatchingModal
        isOpen={cofounderModalOpen}
        onClose={() => setCofounderModalOpen(false)}
        onSelectCandidate={(cand) => {
          setCofounderModalOpen(false);
          openPersonProfile(cand.id);
        }}
      />
    </div>
  );
};
