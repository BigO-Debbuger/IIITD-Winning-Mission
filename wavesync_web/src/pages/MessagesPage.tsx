// wavesync_web/src/pages/MessagesPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Conversation, Message } from '../services/api';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import { MessageSquare, Send, Loader2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MessagesPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await api.getConversations();
      const list = data.conversations || [];
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const data = await api.getConversationMessages(convId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !newMessageText.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await api.sendMessage(activeConvId, newMessageText.trim());
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
      setNewMessageText('');
      loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const activePartner = conversations.find((c) => c.id === activeConvId)?.partner;

  return (
    <div className="messages-page-root" style={{ background: 'var(--paper)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                  <MessageSquare size={13} /> Direct Communication Rails
                </div>
                <h1 className="section-title" style={{ marginBottom: 8 }}>
                  Direct Messages
                </h1>
                <p style={{ color: 'var(--ink-secondary)', fontSize: '1.05rem', maxWidth: 640 }}>
                  Peer-to-peer conversations, mentorship discussions, and venture alignment.
                </p>
              </div>

              <div>
                <Link to="/network" className="btn btn-outline" style={{ background: '#FFFFFF', fontSize: '0.84rem' }}>
                  <Users size={14} /> Find More Connections
                </Link>
              </div>
            </div>
          </Reveal>

          {!isAuthenticated ? (
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
              <MessageSquare size={44} color="var(--accent-coral)" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 10 }}>Sign In to Access Messages</h2>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.5 }}>
                Connect with verified alumni mentors, prospective co-founders, and recruiters in your network.
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 340px) 1fr',
                minHeight: 620,
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '2.5px solid var(--border-strong)',
                boxShadow: 'var(--shadow-tactile)',
                overflow: 'hidden',
              }}
            >
              {/* Conversations Left Pane */}
              <div
                style={{
                  borderRight: '2px solid var(--border-strong)',
                  background: 'var(--paper-light)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    borderBottom: '1.5px solid var(--border-strong)',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Conversations</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: 'var(--accent-lime)',
                    }}
                  >
                    {conversations.length}
                  </span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {loadingConversations ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-muted)' }}>
                      <Loader2 className="spin" size={24} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Loading conversations...</div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                      <p style={{ marginBottom: 14 }}>No conversations yet.</p>
                      <Link to="/network" className="btn btn-primary" style={{ fontSize: '0.78rem', minHeight: 34 }}>
                        Find Peers to Chat &rarr;
                      </Link>
                    </div>
                  ) : (
                    conversations.map((c) => {
                      const isSelected = c.id === activeConvId;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setActiveConvId(c.id)}
                          style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--paper-deep)' : 'transparent',
                            borderLeft: isSelected ? '4px solid var(--ink)' : '4px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: 'var(--accent-lime)',
                              border: '1.5px solid var(--border-strong)',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 900,
                              fontSize: '0.95rem',
                              flexShrink: 0,
                            }}
                          >
                            {c.partner?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 2 }}>
                              {c.partner?.fullName}
                            </div>
                            <div
                              style={{
                                fontSize: '0.76rem',
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

              {/* Chat View Right Pane */}
              <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
                {activeConvId && activePartner ? (
                  <>
                    {/* Header */}
                    <div
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1.5px solid var(--border-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--paper-light)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--accent-coral)',
                            color: '#FFFFFF',
                            border: '1.5px solid var(--border-strong)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                          }}
                        >
                          {activePartner.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>{activePartner.fullName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', fontWeight: 700 }}>
                            {activePartner.role ? activePartner.role.toUpperCase() : 'VERIFIED CONNECTION'}
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/network?target=${activePartner.id}`}
                        className="btn btn-outline"
                        style={{ padding: '0 12px', minHeight: 32, fontSize: '0.74rem', background: '#FFFFFF' }}
                      >
                        View Profile
                      </Link>
                    </div>

                    {/* Messages Feed */}
                    <div
                      style={{
                        flex: 1,
                        padding: 24,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        background: 'var(--paper-light)',
                      }}
                    >
                      {loadingMessages ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                          <Loader2 className="spin" size={28} style={{ margin: '0 auto 8px' }} />
                          <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Loading thread...</div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                          Say hello and discuss your collaborative project or mentorship questions!
                        </div>
                      ) : (
                        messages.map((m) => {
                          const isMe = m.senderId === user?.id;
                          return (
                            <div
                              key={m.id}
                              style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                              }}
                            >
                              <div
                                style={{
                                  padding: '10px 16px',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1.5px solid var(--border-strong)',
                                  background: isMe ? 'var(--accent-mint)' : '#FFFFFF',
                                  color: '#05020B',
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  boxShadow: 'var(--shadow-tactile-sm)',
                                  lineHeight: 1.45,
                                }}
                              >
                                {m.content}
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Composer */}
                    <form
                      onSubmit={handleSendMessage}
                      style={{
                        padding: 16,
                        borderTop: '1.5px solid var(--border-strong)',
                        display: 'flex',
                        gap: 10,
                        background: '#FFFFFF',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        maxLength={1000}
                        className="form-input"
                        style={{
                          flex: 1,
                          minHeight: 44,
                          borderRadius: 'var(--radius-pill)',
                          background: 'var(--paper-light)',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessageText.trim()}
                        className="btn btn-primary"
                        style={{ minHeight: 44, padding: '0 20px' }}
                      >
                        {sendingMessage ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 40, color: 'var(--ink-muted)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <MessageSquare size={36} color="var(--ink-muted)" style={{ margin: '0 auto 12px' }} />
                      <p style={{ fontWeight: 800 }}>Select a conversation from the left to start chatting.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
