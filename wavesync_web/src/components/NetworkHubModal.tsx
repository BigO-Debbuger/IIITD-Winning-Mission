// wavesync_web/src/components/NetworkHubModal.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  api,
  PersonProfile,
  ConnectionRequest,
  AcceptedConnection,
  MentorshipRequest,
  Conversation,
  Message,
  ExplainableRecommendation,
  NetworkOutcome,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import {
  Users,
  Search,
  Sparkles,
  UserCheck,
  MessageSquare,
  Award,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2,
  Filter,
  Check,
  X,
  Compass,
  FileCheck,
  RefreshCw,
  Edit3,
} from 'lucide-react';

interface NetworkHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'directory' | 'recommendations' | 'connections' | 'messages' | 'outcomes' | 'profile';
  targetUserId?: string | null;
}

export const NetworkHubModal: React.FC<NetworkHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'directory',
  targetUserId = null,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'recommendations' | 'connections' | 'messages' | 'outcomes' | 'profile'>(initialTab);

  // Directory state
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('');
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

  // Messaging state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Outcomes state
  const [outcomes, setOutcomes] = useState<NetworkOutcome[]>([]);
  const [totalEcosystemOutcomes, setTotalEcosystemOutcomes] = useState(0);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);
  const [recordingOutcome, setRecordingOutcome] = useState(false);
  const [outcomePartnerId, setOutcomePartnerId] = useState('');
  const [outcomeType, setOutcomeType] = useState('mentorship_completed');
  const [outcomeTitle, setOutcomeTitle] = useState('');
  const [outcomeDesc, setOutcomeDesc] = useState('');

  // Profile View Modal / Drawer State
  const [viewingProfile, setViewingProfile] = useState<PersonProfile | null>(null);
  const [loadingProfileView, setLoadingProfileView] = useState(false);

  // Connection & Mentorship Action Modals
  const [connectModalTarget, setConnectModalTarget] = useState<PersonProfile | null>(null);
  const [connectIntroMessage, setConnectIntroMessage] = useState('');
  const [sendingConnect, setSendingConnect] = useState(false);

  const [mentorModalTarget, setMentorModalTarget] = useState<PersonProfile | null>(null);
  const [mentorTopic, setMentorTopic] = useState('');
  const [mentorNote, setMentorNote] = useState('');
  const [sendingMentorRequest, setSendingMentorRequest] = useState(false);

  // Notification banners
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Edit State
  const [editHeadline, setEditHeadline] = useState(user?.headline || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editInstitution, setEditInstitution] = useState('');
  const [editGradYear, setEditGradYear] = useState<number | ''>('');
  const [editMentoring, setEditMentoring] = useState(true);
  const [editRefer, setEditRefer] = useState(true);
  const [editSkillsStr, setEditSkillsStr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync tab on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadDirectory();
      if (isAuthenticated) {
        loadRecommendations();
        loadConnectionsData();
        loadConversations();
        loadOutcomes();
        loadUserProfileData();
      }
      if (targetUserId) {
        openPersonProfile(targetUserId);
      }
    }
  }, [isOpen, initialTab, targetUserId, isAuthenticated]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // LOADERS
  // --------------------------------------------------------------------------
  const loadDirectory = async () => {
    setLoadingPeople(true);
    try {
      const params: Record<string, string | number | boolean> = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (institutionFilter.trim()) params.institution = institutionFilter.trim();
      if (mentorshipOnly) params.mentorship = true;
      if (referralsOnly) params.referral = true;
      if (selectedSkill) params.skill = selectedSkill;

      const data = await api.getPeople(params);
      setPeople(data.people || []);
    } catch (err: any) {
      console.error('Directory load error:', err);
    } finally {
      setLoadingPeople(false);
    }
  };

  const loadRecommendations = async () => {
    if (!isAuthenticated) return;
    setLoadingRecs(true);
    try {
      const data = await api.getExplainableRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Recommendations load error:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const loadConnectionsData = async () => {
    if (!isAuthenticated) return;
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
      console.error('Connections data load error:', err);
    } finally {
      setLoadingConnections(false);
    }
  };

  const loadConversations = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getConversations();
      setConversations(data.conversations || []);
      if (!activeConvId && data.conversations?.length > 0) {
        selectConversation(data.conversations[0].id);
      }
    } catch (err) {
      console.error('Conversations error:', err);
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    setLoadingMessages(true);
    try {
      const data = await api.getConversationMessages(convId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Messages error:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadOutcomes = async () => {
    setLoadingOutcomes(true);
    try {
      const data = await api.getOutcomes();
      setOutcomes(data.outcomes || data.userOutcomes || []);
      setTotalEcosystemOutcomes(data.totalEcosystemOutcomes || 0);
    } catch (err) {
      console.error('Outcomes load error:', err);
    } finally {
      setLoadingOutcomes(false);
    }
  };

  const loadUserProfileData = async () => {
    if (!user) return;
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
      console.error('User profile load error:', err);
    }
  };

  const openPersonProfile = async (id: string) => {
    setLoadingProfileView(true);
    try {
      const data = await api.getPersonProfile(id);
      setViewingProfile(data.person);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to view profile.');
    } finally {
      setLoadingProfileView(false);
    }
  };

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const handleSendConnection = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!connectModalTarget) return;

    setSendingConnect(true);
    try {
      await api.sendConnectionRequest(connectModalTarget.id, connectIntroMessage);
      showNotification('success', `Connection request sent to ${connectModalTarget.fullName}!`);
      setConnectModalTarget(null);
      setConnectIntroMessage('');
      loadDirectory();
      loadConnectionsData();
      if (viewingProfile?.id === connectModalTarget.id) {
        openPersonProfile(connectModalTarget.id);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to send connection request.');
    } finally {
      setSendingConnect(false);
    }
  };

  const handleRespondConnection = async (reqId: string, action: 'accept' | 'decline') => {
    try {
      await api.respondToConnectionRequest(reqId, action);
      showNotification('success', `Connection request ${action}ed.`);
      loadConnectionsData();
      loadConversations();
      loadDirectory();
    } catch (err: any) {
      showNotification('error', err.message || `Failed to ${action} request.`);
    }
  };

  const handleSendMentorshipRequest = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!mentorModalTarget) return;
    if (!mentorTopic.trim()) {
      showNotification('error', 'Please specify a mentorship topic or focus area.');
      return;
    }

    setSendingMentorRequest(true);
    try {
      await api.sendMentorshipRequest(mentorModalTarget.id, mentorTopic.trim(), mentorNote.trim());
      showNotification('success', `Mentorship request sent to ${mentorModalTarget.fullName}!`);
      setMentorModalTarget(null);
      setMentorTopic('');
      setMentorNote('');
      loadConnectionsData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to send mentorship request.');
    } finally {
      setSendingMentorRequest(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConvId || !newMessageText.trim()) return;

    setSendingMessage(true);
    try {
      const data = await api.sendMessage(activeConvId, newMessageText.trim());
      setMessages((prev) => [...prev, data.message]);
      setNewMessageText('');
      loadConversations();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRecordOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomePartnerId) {
      showNotification('error', 'Please select a connected peer or mentor.');
      return;
    }
    if (!outcomeTitle.trim()) {
      showNotification('error', 'Please provide an outcome title.');
      return;
    }

    setRecordingOutcome(true);
    try {
      await api.recordOutcome({
        partnerId: outcomePartnerId,
        type: outcomeType,
        title: outcomeTitle.trim(),
        description: outcomeDesc.trim() || undefined,
      });
      showNotification('success', 'Tangible career outcome recorded and verified on-chain!');
      setOutcomeTitle('');
      setOutcomeDesc('');
      loadOutcomes();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to record outcome.');
    } finally {
      setRecordingOutcome(false);
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
      showNotification('success', 'Your institutional profile has been updated!');
      loadDirectory();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Distinct institutions and skills from people list for quick chip filtering
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => p.skills?.forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 10);
  }, [people]);

  const activeConversationPartner = useMemo(() => {
    const conv = conversations.find((c) => c.id === activeConvId);
    return conv?.partner;
  }, [conversations, activeConvId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={1120}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'var(--accent-mint)',
              border: '2px solid var(--border-strong)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'var(--shadow-tactile-sm)',
            }}
          >
            <Users size={20} color="#05020B" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Alumni Network & Connections
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
              Connect with Alumni, Mentors, Faculty & Institutional Founders
            </div>
          </div>
        </div>
      }
    >
      <div className="network-hub-container" style={{ minHeight: 620, display: 'flex', flexDirection: 'column' }}>
        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              marginBottom: 16,
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: statusMessage.type === 'success' ? 'var(--accent-mint)' : 'var(--accent-coral)',
              color: '#05020B',
              boxShadow: 'var(--shadow-tactile-sm)',
            }}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tactile Tab Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px',
            background: 'var(--paper-deep)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border-strong)',
            marginBottom: 20,
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'directory', label: 'People Directory', icon: <Users size={15} /> },
            {
              id: 'recommendations',
              label: 'Recommended Matches',
              icon: <Sparkles size={15} />,
              badge: recommendations.length > 0 ? recommendations.length : null,
            },
            {
              id: 'connections',
              label: 'My Connections',
              icon: <UserCheck size={15} />,
              badge: incomingRequests.length > 0 ? incomingRequests.length : null,
            },
            { id: 'messages', label: 'Direct Messages', icon: <MessageSquare size={15} /> },
            { id: 'outcomes', label: 'Career Outcomes', icon: <Award size={15} /> },
            { id: 'profile', label: 'My Network Profile', icon: <Edit3 size={15} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'directory') loadDirectory();
                  if (tab.id === 'recommendations') loadRecommendations();
                  if (tab.id === 'connections') loadConnectionsData();
                  if (tab.id === 'messages') loadConversations();
                  if (tab.id === 'outcomes') loadOutcomes();
                }}
                className="btn"
                style={{
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: 'var(--ink-primary)',
                  border: isActive ? '2px solid var(--border-strong)' : '2px solid transparent',
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
                      color: '#05020B',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: 999,
                      border: '1px solid var(--border-strong)',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PEOPLE DIRECTORY */}
        {activeTab === 'directory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search & Filter Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'center',
                padding: 12,
                background: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                boxShadow: 'var(--shadow-tactile-sm)',
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search by name, headline, skills, or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadDirectory()}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-strong)',
                    fontSize: '0.85rem',
                    background: 'var(--paper-light)',
                  }}
                />
              </div>

              {/* Role Filter Pills */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Roles' },
                  { id: 'alumni', label: 'Alumni' },
                  { id: 'student', label: 'Students' },
                  { id: 'admin', label: 'Faculty' },
                  { id: 'company', label: 'Founders & Recruiters' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRoleFilter(r.id);
                    }}
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      borderRadius: 999,
                      border: '1.5px solid var(--border-strong)',
                      background: roleFilter === r.id ? 'var(--accent-lime)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Filter Toggles */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={mentorshipOnly}
                    onChange={(e) => setMentorshipOnly(e.target.checked)}
                  />
                  <span>Mentors Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}>
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
                  style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: 34 }}
                >
                  <RefreshCw size={13} />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Quick Skill Tags */}
            {allSkills.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--ink-muted)' }}>Top Domains:</span>
                {allSkills.map((sk) => (
                  <button
                    key={sk}
                    onClick={() => {
                      setSelectedSkill(selectedSkill === sk ? null : sk);
                      setTimeout(loadDirectory, 10);
                    }}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
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
                    style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
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
                <div style={{ fontWeight: 700 }}>Searching database for alumni & professionals...</div>
              </div>
            ) : people.length === 0 ? (
              <div
                style={{
                  padding: 48,
                  textAlign: 'center',
                  background: 'var(--paper-light)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--border-subtle)',
                }}
              >
                <Users size={36} color="var(--ink-muted)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 4 }}>No profiles matched your filters</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 16 }}>
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
                  gap: 16,
                }}
              >
                {people.map((p) => {
                  const isCurrentAuthUser = user?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      style={{
                        background: '#FFFFFF',
                        border: '2px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 12,
                        boxShadow: 'var(--shadow-tactile-sm)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {/* Top Header */}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background:
                              p.role === 'alumni'
                                ? 'var(--accent-coral)'
                                : p.role === 'admin'
                                ? 'var(--accent-lime)'
                                : 'var(--accent-mint)',
                            border: '1.5px solid var(--border-strong)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 900,
                            fontSize: '1rem',
                            flexShrink: 0,
                          }}
                        >
                          {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 900, fontSize: '0.96rem', letterSpacing: '-0.01em' }}>
                              {p.fullName}
                            </span>
                            <span
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: 999,
                                background: 'var(--paper-deep)',
                                border: '1px solid var(--border-strong)',
                              }}
                            >
                              {p.role}
                            </span>
                            {p.isVerified && (
                              <ShieldCheck size={14} color="var(--accent-mint)" style={{ flexShrink: 0 }} />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--ink-secondary)',
                              fontWeight: 600,
                              lineHeight: 1.3,
                              marginTop: 2,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {p.headline || 'Member of WaveSync Ecosystem'}
                          </div>
                        </div>
                      </div>

                      {/* Institution & Stats line */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          fontSize: '0.74rem',
                          color: 'var(--ink-muted)',
                          fontWeight: 600,
                        }}
                      >
                        {p.institution && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <GraduationCap size={13} />
                            {p.institution} {p.graduationYear ? `'${String(p.graduationYear).slice(-2)}` : ''}
                          </span>
                        )}
                        {p._count?.submissions ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-primary)' }}>
                            <FileCheck size={13} />
                            {p._count.submissions} Signed Proofs
                          </span>
                        ) : null}
                      </div>

                      {/* Skills Tags */}
                      {p.skills && p.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {p.skills.slice(0, 4).map((sk) => (
                            <span
                              key={sk}
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: 'var(--paper-deep)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Badges for Mentorship / Referrals */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {p.isAvailableForMentoring && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#eefcf5',
                              color: '#086338',
                              border: '1px solid #c2eed5',
                            }}
                          >
                            ✓ Available for Mentorship
                          </span>
                        )}
                        {p.willingToRefer && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#fef7ee',
                              color: '#9a4e00',
                              border: '1px solid #f9ddba',
                            }}
                          >
                            ✓ Open to Refer
                          </span>
                        )}
                      </div>

                      {/* Card Action Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          paddingTop: 8,
                          borderTop: '1px solid var(--border-subtle)',
                        }}
                      >
                        <button
                          onClick={() => openPersonProfile(p.id)}
                          className="btn btn-outline"
                          style={{
                            flex: 1,
                            minHeight: 34,
                            padding: '0 8px',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                          }}
                        >
                          View Profile
                        </button>

                        {!isCurrentAuthUser && (
                          <>
                            {p.connectionStatus === 'connected' ? (
                              <button
                                onClick={() => {
                                  setActiveTab('messages');
                                  loadConversations();
                                }}
                                className="btn"
                                style={{
                                  background: 'var(--accent-mint)',
                                  border: '1.5px solid var(--border-strong)',
                                  minHeight: 34,
                                  padding: '0 10px',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <MessageSquare size={13} />
                                <span>Message</span>
                              </button>
                            ) : p.connectionStatus === 'pending_sent' ? (
                              <button
                                disabled
                                className="btn"
                                style={{
                                  background: 'var(--paper-deep)',
                                  border: '1.5px solid var(--border-strong)',
                                  minHeight: 34,
                                  padding: '0 10px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  color: 'var(--ink-muted)',
                                  cursor: 'not-allowed',
                                }}
                              >
                                Pending
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!isAuthenticated) openAuthModal('login');
                                  else setConnectModalTarget(p);
                                }}
                                className="btn btn-primary"
                                style={{
                                  minHeight: 34,
                                  padding: '0 10px',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                }}
                              >
                                Connect
                              </button>
                            )}

                            {p.isAvailableForMentoring && (
                              <button
                                onClick={() => {
                                  if (!isAuthenticated) openAuthModal('login');
                                  else {
                                    setMentorModalTarget(p);
                                    setMentorTopic('Career & Technical Guidance');
                                  }
                                }}
                                className="btn"
                                style={{
                                  background: 'var(--accent-lime)',
                                  border: '1.5px solid var(--border-strong)',
                                  minHeight: 34,
                                  padding: '0 8px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                }}
                                title="Request 1:1 Mentorship"
                              >
                                Mentor
                              </button>
                            )}
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

        {/* TAB 2: EXPLAINABLE RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--accent-mint)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                boxShadow: 'var(--shadow-tactile-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#05020B' }}>
                  Smart Alumni & Mentor Matches
                </div>
                <div style={{ fontSize: '0.82rem', color: '#1b4a34', fontWeight: 600 }}>
                  Deterministic explainable matching evaluating shared alma mater, domain expertise, and active mentoring availability.
                </div>
              </div>
              <button
                onClick={loadRecommendations}
                className="btn"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid var(--border-strong)',
                  minHeight: 34,
                  padding: '0 12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RefreshCw size={14} />
                <span>Re-evaluate Matches</span>
              </button>
            </div>

            {loadingRecs ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-muted)' }}>
                <Loader2 className="spin" size={32} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700 }}>Calculating explainable match scores...</div>
              </div>
            ) : recommendations.length === 0 ? (
              <div
                style={{
                  padding: 48,
                  textAlign: 'center',
                  background: 'var(--paper-light)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--border-subtle)',
                }}
              >
                <Sparkles size={36} color="var(--ink-muted)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 4 }}>
                  No Personalized Matches Found
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 16 }}>
                  Update your skills and institution in "My Network Profile" to receive high-confidence alumni recommendations!
                </div>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="btn btn-primary"
                  style={{ minHeight: 38, padding: '0 16px' }}
                >
                  Complete Your Profile
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 16,
                      boxShadow: 'var(--shadow-tactile-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: '1 1 380px' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'var(--accent-lime)',
                          border: '2px solid var(--border-strong)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 900,
                          fontSize: '1.1rem',
                          flexShrink: 0,
                        }}
                      >
                        {rec.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 900, fontSize: '1rem' }}>{rec.fullName}</span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 6px',
                              borderRadius: 999,
                              background: 'var(--paper-deep)',
                              border: '1px solid var(--border-strong)',
                            }}
                          >
                            {rec.role}
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: 'var(--accent-coral)',
                              color: '#05020B',
                              border: '1.5px solid var(--border-strong)',
                            }}
                          >
                            {rec.score}% Match Fit
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', fontWeight: 600, marginTop: 2 }}>
                          {rec.headline || rec.institution || 'WaveSync Professional'}
                        </div>

                        {/* Explainability Breakdown */}
                        <div
                          style={{
                            marginTop: 8,
                            padding: '6px 10px',
                            background: 'var(--paper-deep)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.76rem',
                            color: 'var(--ink-primary)',
                            fontWeight: 600,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          <div style={{ fontWeight: 800, color: 'var(--ink-muted)', fontSize: '0.7rem' }}>
                            WHY RECOMMENDED:
                          </div>
                          <div>{rec.explanation}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={() => openPersonProfile(rec.id)}
                        className="btn btn-outline"
                        style={{ minHeight: 36, padding: '0 12px', fontSize: '0.78rem', fontWeight: 800 }}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setConnectModalTarget({
                            id: rec.id,
                            fullName: rec.fullName,
                            role: rec.role,
                            headline: rec.headline,
                          } as any);
                        }}
                        className="btn btn-primary"
                        style={{ minHeight: 36, padding: '0 14px', fontSize: '0.78rem', fontWeight: 800 }}
                      >
                        Connect
                      </button>
                      {rec.isAvailableForMentoring && (
                        <button
                          onClick={() => {
                            setMentorModalTarget({
                              id: rec.id,
                              fullName: rec.fullName,
                              role: rec.role,
                            } as any);
                            setMentorTopic('Career & Technical Guidance');
                          }}
                          className="btn"
                          style={{
                            background: 'var(--accent-lime)',
                            border: '1.5px solid var(--border-strong)',
                            minHeight: 36,
                            padding: '0 12px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                          }}
                        >
                          Request Mentor
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONNECTIONS & REQUESTS */}
        {activeTab === 'connections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Incoming Connection Requests */}
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span>Incoming Connection Requests</span>
                <span
                  style={{
                    background: 'var(--accent-coral)',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    padding: '1px 8px',
                    borderRadius: 999,
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  {incomingRequests.length}
                </span>
              </div>

              {incomingRequests.length === 0 ? (
                <div
                  style={{
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'var(--paper-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--border-subtle)',
                    fontSize: '0.82rem',
                    color: 'var(--ink-muted)',
                    fontWeight: 600,
                  }}
                >
                  No pending connection requests awaiting your response.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        background: '#FFFFFF',
                        border: '2px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        padding: 14,
                        boxShadow: 'var(--shadow-tactile-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: 'var(--accent-mint)',
                            border: '1.5px solid var(--border-strong)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 900,
                          }}
                        >
                          {req.requester?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{req.requester?.fullName}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--ink-muted)' }}>
                            {req.requester?.headline || req.requester?.role}
                          </div>
                        </div>
                      </div>

                      {req.message && (
                        <div
                          style={{
                            padding: '8px 10px',
                            background: 'var(--paper-deep)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            fontStyle: 'italic',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          "{req.message}"
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleRespondConnection(req.id, 'accept')}
                          className="btn"
                          style={{
                            flex: 1,
                            background: 'var(--accent-mint)',
                            border: '1.5px solid var(--border-strong)',
                            minHeight: 34,
                            fontSize: '0.78rem',
                            fontWeight: 800,
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondConnection(req.id, 'decline')}
                          className="btn btn-outline"
                          style={{
                            flex: 1,
                            minHeight: 34,
                            fontSize: '0.78rem',
                            fontWeight: 800,
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Established Connections */}
            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span>Established Connections</span>
                <span
                  style={{
                    background: 'var(--accent-mint)',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    padding: '1px 8px',
                    borderRadius: 999,
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  {connections.length}
                </span>
              </div>

              {connections.length === 0 ? (
                <div
                  style={{
                    padding: '36px 16px',
                    textAlign: 'center',
                    background: 'var(--paper-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--border-subtle)',
                  }}
                >
                  <UserCheck size={32} color="var(--ink-muted)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>No connections established yet</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                    Explore the People Directory to connect with alumni, mentors, and fellow builders.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {connections.map((c) => {
                    const partner = c.partner || c.otherUser;
                    if (!partner) return null;
                    return (
                      <div
                        key={c.connectionId}
                        style={{
                          background: '#FFFFFF',
                          border: '2px solid var(--border-strong)',
                          borderRadius: 'var(--radius-md)',
                          padding: 14,
                          boxShadow: 'var(--shadow-tactile-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'var(--accent-mint)',
                              border: '1.5px solid var(--border-strong)',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 900,
                              fontSize: '0.95rem',
                              flexShrink: 0,
                            }}
                          >
                            {partner.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{partner.fullName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}>
                              {partner.headline || partner.role}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => {
                              setActiveTab('messages');
                              loadConversations();
                            }}
                            className="btn btn-outline"
                            style={{ minHeight: 32, padding: '0 8px' }}
                            title="Direct Message"
                          >
                            <MessageSquare size={13} />
                          </button>
                          <button
                            onClick={() => openPersonProfile(partner.id)}
                            className="btn btn-outline"
                            style={{ minHeight: 32, padding: '0 8px', fontSize: '0.74rem', fontWeight: 800 }}
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outgoing Requests & Mentorship Summary */}
            {outgoingRequests.length > 0 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--ink-muted)', marginBottom: 8 }}>
                  Sent Requests Pending ({outgoingRequests.length})
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {outgoingRequests.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--border-strong)',
                        background: 'var(--paper-deep)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Clock size={12} color="var(--ink-muted)" />
                      <span>Request sent to {req.recipient?.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIRECT 1:1 MESSAGING */}
        {activeTab === 'messages' && (
          <div
            style={{
              display: 'flex',
              height: 520,
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              boxShadow: 'var(--shadow-tactile-sm)',
              overflow: 'hidden',
            }}
          >
            {/* Conversations List Pane */}
            <div
              style={{
                width: 280,
                borderRight: '2px solid var(--border-strong)',
                background: 'var(--paper-light)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  borderBottom: '1px solid var(--border-strong)',
                  background: '#FFFFFF',
                }}
              >
                Direct Conversations
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                    No conversations yet. Connect with a peer or mentor to unlock direct messaging.
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isSelected = c.id === activeConvId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => selectConversation(c.id)}
                        style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--paper-deep)' : 'transparent',
                          borderLeft: isSelected ? '4px solid var(--border-strong)' : '4px solid transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--accent-lime)',
                            border: '1.5px solid var(--border-strong)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {c.partner?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{c.partner?.fullName}</div>
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--ink-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {c.lastMessage?.content || 'Conversation started'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Thread View Pane */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
              {activeConvId ? (
                <>
                  {/* Chat Header */}
                  <div
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--paper-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--accent-coral)',
                          border: '1.5px solid var(--border-strong)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 900,
                          fontSize: '0.85rem',
                        }}
                      >
                        {activeConversationPartner?.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                          {activeConversationPartner?.fullName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>
                          Verified WaveSync Connection
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Feed */}
                  <div
                    style={{
                      flex: 1,
                      padding: 16,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      background: 'var(--paper-light)',
                    }}
                  >
                    {loadingMessages ? (
                      <div style={{ textAlign: 'center', padding: 20 }}>
                        <Loader2 className="spin" size={24} style={{ margin: '0 auto' }} />
                      </div>
                    ) : messages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-muted)', fontSize: '0.82rem' }}>
                        Say hello and propose a collaboration or mentorship agenda!
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.senderId === user?.id;
                        return (
                          <div
                            key={m.id}
                            style={{
                              alignSelf: isMe ? 'flex-end' : 'flex-start',
                              maxWidth: '75%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isMe ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <div
                              style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                border: '1.5px solid var(--border-strong)',
                                background: isMe ? 'var(--accent-mint)' : '#FFFFFF',
                                color: '#05020B',
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                boxShadow: 'var(--shadow-tactile-sm)',
                              }}
                            >
                              {m.content}
                            </div>
                            <span style={{ fontSize: '0.64rem', color: 'var(--ink-muted)', marginTop: 2 }}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Composer */}
                  <form
                    onSubmit={handleSendMessage}
                    style={{
                      padding: 12,
                      borderTop: '1px solid var(--border-strong)',
                      display: 'flex',
                      gap: 8,
                      background: '#FFFFFF',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type a message to your connection..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      maxLength={1000}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border-strong)',
                        fontSize: '0.84rem',
                        background: 'var(--paper-light)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessageText.trim()}
                      className="btn btn-primary"
                      style={{ minHeight: 40, padding: '0 16px' }}
                    >
                      {sendingMessage ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
                  Select a conversation from the left to start chatting.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CAREER OUTCOMES */}
        {activeTab === 'outcomes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Banner */}
            <div
              style={{
                padding: '16px 20px',
                background: 'var(--accent-coral)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                boxShadow: 'var(--shadow-tactile-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#05020B' }}>
                  Measurable Alumni & Student Outcomes
                </div>
                <div style={{ fontSize: '0.82rem', color: '#541705', fontWeight: 600 }}>
                  Turning institutional networking into verifiable results: completed mentorships, internal referrals, and startup ventures.
                </div>
              </div>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1.5px solid var(--border-strong)',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}
              >
                {totalEcosystemOutcomes} Verified Outcomes Platform-Wide
              </div>
            </div>

            {/* Form to Record New Outcome */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-strong)',
                padding: 16,
                boxShadow: 'var(--shadow-tactile-sm)',
              }}
            >
              <div style={{ fontWeight: 900, fontSize: '0.94rem', marginBottom: 12 }}>
                Record a Tangible Connection Outcome
              </div>

              <form onSubmit={handleRecordOutcome} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, marginBottom: 4 }}>
                    Connected Partner / Mentor
                  </label>
                  <select
                    value={outcomePartnerId}
                    onChange={(e) => setOutcomePartnerId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.82rem',
                      background: 'var(--paper-light)',
                    }}
                  >
                    <option value="">Select a connected user...</option>
                    {connections.map((c) => {
                      const p = c.partner || c.otherUser;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.role})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, marginBottom: 4 }}>
                    Outcome Type
                  </label>
                  <select
                    value={outcomeType}
                    onChange={(e) => setOutcomeType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.82rem',
                      background: 'var(--paper-light)',
                    }}
                  >
                    <option value="mentorship_completed">Mentorship Completed (1:1 sessions completed)</option>
                    <option value="referral_received">Referral Received (Internal hiring referral)</option>
                    <option value="job_offer">Job or Internship Offer Received</option>
                    <option value="collab_started">Collaboration Venture Started</option>
                    <option value="project_shipped">Joint Open Source Project Shipped</option>
                    <option value="startup_intro">Incubator / Angel Investor Intro</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, marginBottom: 4 }}>
                    Outcome Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Referred for Full-Stack Engineering role at Stripe"
                    value={outcomeTitle}
                    onChange={(e) => setOutcomeTitle(e.target.value)}
                    required
                    maxLength={140}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.82rem',
                      background: 'var(--paper-light)',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, marginBottom: 4 }}>
                    Details & Impact (Optional)
                  </label>
                  <textarea
                    placeholder="Briefly describe what was achieved or the key outcome metrics..."
                    value={outcomeDesc}
                    onChange={(e) => setOutcomeDesc(e.target.value)}
                    rows={2}
                    maxLength={600}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.82rem',
                      background: 'var(--paper-light)',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={recordingOutcome}
                    className="btn btn-primary"
                    style={{ minHeight: 38, padding: '0 20px', fontSize: '0.84rem' }}
                  >
                    {recordingOutcome ? <Loader2 className="spin" size={16} /> : 'Record Outcome'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Verified Outcomes */}
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.94rem', marginBottom: 10 }}>
                Your Recorded Career Outcomes
              </div>

              {loadingOutcomes ? (
                <div style={{ textAlign: 'center', padding: 30 }}>
                  <Loader2 className="spin" size={24} style={{ margin: '0 auto' }} />
                </div>
              ) : outcomes.length === 0 ? (
                <div
                  style={{
                    padding: 30,
                    textAlign: 'center',
                    background: 'var(--paper-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--border-subtle)',
                    fontSize: '0.82rem',
                    color: 'var(--ink-muted)',
                  }}
                >
                  No outcomes recorded yet. When you complete a mentorship session or get a referral, document it here!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                  {outcomes.map((outc) => (
                    <div
                      key={outc.id}
                      style={{
                        background: '#FFFFFF',
                        border: '2px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        padding: 14,
                        boxShadow: 'var(--shadow-tactile-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: 'var(--accent-lime)',
                            border: '1px solid var(--border-strong)',
                          }}
                        >
                          {outc.type.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                          {new Date(outc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#05020B' }}>
                        {outc.title}
                      </div>
                      {outc.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
                          {outc.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 700, marginTop: 'auto' }}>
                        With {outc.partner?.fullName || 'Ecosystem Connection'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: MY NETWORK PROFILE */}
        {activeTab === 'profile' && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--border-strong)',
              padding: 20,
              boxShadow: 'var(--shadow-tactile-sm)',
            }}
          >
            <div style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: 4 }}>
              Your Network & Mentorship Credentials
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: 16 }}>
              Update your institutional affiliation and availability flags so alumni, founders, and peers can discover you.
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, marginBottom: 4 }}>
                  Professional Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS Undergrad @ IIIT Delhi · Distributed Systems & Verifiable Execution"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  maxLength={160}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-strong)',
                    fontSize: '0.85rem',
                    background: 'var(--paper-light)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, marginBottom: 4 }}>
                    College / Alma Mater
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IIIT Delhi, BITS Pilani, IIT Bombay"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    maxLength={100}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.85rem',
                      background: 'var(--paper-light)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, marginBottom: 4 }}>
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={editGradYear}
                    onChange={(e) => setEditGradYear(e.target.value === '' ? '' : Number(e.target.value))}
                    min={1970}
                    max={2035}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.85rem',
                      background: 'var(--paper-light)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, marginBottom: 4 }}>
                  Technical Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, PyTorch, Go, Rust, System Design"
                  value={editSkillsStr}
                  onChange={(e) => setEditSkillsStr(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-strong)',
                    fontSize: '0.85rem',
                    background: 'var(--paper-light)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, marginBottom: 4 }}>
                  Bio & Professional Goals
                </label>
                <textarea
                  placeholder="Tell peers what you are building, what help you need, or what you can offer..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={800}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border-strong)',
                    fontSize: '0.85rem',
                    background: 'var(--paper-light)',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '10px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editMentoring}
                    onChange={(e) => setEditMentoring(e.target.checked)}
                  />
                  <span>Accept 1:1 Mentorship Requests</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editRefer}
                    onChange={(e) => setEditRefer(e.target.checked)}
                  />
                  <span>Willing to Provide Company / Venture Referrals</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ minHeight: 40, padding: '0 24px', fontSize: '0.86rem' }}
                >
                  {savingProfile ? <Loader2 className="spin" size={16} /> : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* NESTED DRAWER: PERSON PROFILE DETAILS */}
        {viewingProfile && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 480,
              background: '#FFFFFF',
              borderLeft: '3px solid var(--border-strong)',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'var(--paper-deep)',
                  border: '1.5px solid var(--border-strong)',
                }}
              >
                {viewingProfile.role} Profile
              </span>
              <button
                onClick={() => setViewingProfile(null)}
                style={{
                  background: 'none',
                  border: '1.5px solid var(--border-strong)',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Header */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'var(--accent-mint)',
                  border: '2px solid var(--border-strong)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: '1.3rem',
                }}
              >
                {viewingProfile.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.15rem' }}>{viewingProfile.fullName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>
                  {viewingProfile.headline || 'Member of WaveSync'}
                </div>
              </div>
            </div>

            {/* Institution Badge */}
            {viewingProfile.institution && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--paper-deep)',
                  border: '1px solid var(--border-strong)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                <GraduationCap size={16} />
                <span>
                  {viewingProfile.institution}
                  {viewingProfile.graduationYear ? ` · Class of ${viewingProfile.graduationYear}` : ''}
                </span>
              </div>
            )}

            {/* Bio */}
            {viewingProfile.bio && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 4 }}>
                  ABOUT
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--ink-primary)', lineHeight: 1.5 }}>
                  {viewingProfile.bio}
                </div>
              </div>
            )}

            {/* Skills */}
            {viewingProfile.skills && viewingProfile.skills.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 6 }}>
                  SKILLS & EXPERTISE
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {viewingProfile.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: 'var(--paper-deep)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Submissions from Proof-of-Work */}
            {viewingProfile.submissions && viewingProfile.submissions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 6 }}>
                  VERIFIED EVIDENCE ({viewingProfile.submissions.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {viewingProfile.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: 10,
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border-strong)',
                        background: 'var(--paper-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>{sub.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>
                          Proof: {sub.proofType}
                        </div>
                      </div>
                      <a
                        href={sub.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ minHeight: 28, padding: '0 8px', fontSize: '0.7rem' }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '2px solid var(--border-strong)', display: 'flex', gap: 8 }}>
              {viewingProfile.connectionStatus === 'connected' ? (
                <button
                  onClick={() => {
                    setViewingProfile(null);
                    setActiveTab('messages');
                    loadConversations();
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, minHeight: 40, fontSize: '0.84rem' }}
                >
                  <MessageSquare size={16} />
                  <span>Send Message</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setConnectModalTarget(viewingProfile);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, minHeight: 40, fontSize: '0.84rem' }}
                >
                  <Users size={16} />
                  <span>Connect</span>
                </button>
              )}

              {viewingProfile.isAvailableForMentoring && (
                <button
                  onClick={() => {
                    setMentorModalTarget(viewingProfile);
                    setMentorTopic('Career & Technical Guidance');
                  }}
                  className="btn"
                  style={{
                    background: 'var(--accent-lime)',
                    border: '2px solid var(--border-strong)',
                    minHeight: 40,
                    padding: '0 16px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                  }}
                >
                  Mentor
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODAL: CONNECT INTRODUCTION NOTE */}
        {connectModalTarget && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 2, 11, 0.65)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 10001,
              padding: 16,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 440,
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '3px solid var(--border-strong)',
                boxShadow: 'var(--shadow-tactile-lg)',
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>
                  Connect with {connectModalTarget.fullName}
                </div>
                <button
                  onClick={() => setConnectModalTarget(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', marginBottom: 12 }}>
                Add a personal note explaining why you want to connect, your background, or what you are building:
              </div>

              <textarea
                placeholder="e.g. Hi! I saw your work on distributed systems and would love to connect..."
                value={connectIntroMessage}
                onChange={(e) => setConnectIntroMessage(e.target.value)}
                rows={4}
                maxLength={300}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-strong)',
                  fontSize: '0.85rem',
                  background: 'var(--paper-light)',
                  marginBottom: 16,
                }}
              />

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConnectModalTarget(null)}
                  className="btn btn-outline"
                  style={{ minHeight: 38, padding: '0 16px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendConnection}
                  disabled={sendingConnect}
                  className="btn btn-primary"
                  style={{ minHeight: 38, padding: '0 20px' }}
                >
                  {sendingConnect ? <Loader2 className="spin" size={16} /> : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MENTORSHIP REQUEST WITH TOPIC */}
        {mentorModalTarget && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 2, 11, 0.65)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 10001,
              padding: 16,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 480,
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '3px solid var(--border-strong)',
                boxShadow: 'var(--shadow-tactile-lg)',
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.15rem' }}>
                    Request 1:1 Mentorship
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 600 }}>
                    Mentor: {mentorModalTarget.fullName}
                  </div>
                </div>
                <button
                  onClick={() => setMentorModalTarget(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, marginBottom: 4 }}>
                    Mentorship Focus / Topic Area *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed System Architecture & Resume Critique"
                    value={mentorTopic}
                    onChange={(e) => setMentorTopic(e.target.value)}
                    required
                    maxLength={100}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.85rem',
                      background: 'var(--paper-light)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, marginBottom: 4 }}>
                    Your Agenda & Context
                  </label>
                  <textarea
                    placeholder="Briefly state your current questions, project links, or goals for this session..."
                    value={mentorNote}
                    onChange={(e) => setMentorNote(e.target.value)}
                    rows={4}
                    maxLength={600}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-strong)',
                      fontSize: '0.85rem',
                      background: 'var(--paper-light)',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setMentorModalTarget(null)}
                  className="btn btn-outline"
                  style={{ minHeight: 38, padding: '0 16px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMentorshipRequest}
                  disabled={sendingMentorRequest}
                  className="btn"
                  style={{
                    background: 'var(--accent-lime)',
                    border: '2px solid var(--border-strong)',
                    minHeight: 38,
                    padding: '0 20px',
                    fontWeight: 900,
                  }}
                >
                  {sendingMentorRequest ? <Loader2 className="spin" size={16} /> : 'Submit Mentorship Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
