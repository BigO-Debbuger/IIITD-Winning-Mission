// wavesync_web/src/components/chat/WaveSyncAssistant.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, ChatMessage, ChatAction } from '../../services/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Send,
  ArrowRight,
  RefreshCw,
  Square,
  Bot,
  User as UserIcon,
  Compass,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Find internships that match my skills.',
  'How do I find a co-founder?',
  'Help me turn my idea into a startup.',
  'How does Build-to-Earn work?',
  'Where can I see my applications?',
  'Explain my co-founder match.',
  'How do I verify a work credential?',
  'Take me to the Opportunity Graph.',
];

export const WaveSyncAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [providerInfo, setProviderInfo] = useState<{ isConfigured: boolean; provider: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize or restore session ID
  useEffect(() => {
    let sess = sessionStorage.getItem('wavesync_ai_session');
    if (!sess) {
      sess = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('wavesync_ai_session', sess);
    }
    setSessionId(sess);

    // Check backend AI provider status
    api.getChatStatus().then((status) => {
      setProviderInfo(status);
    });

    // Load active session history
    api.getChatHistory(sess).then((res) => {
      if (res.history && res.history.length > 0) {
        setMessages(res.history);
      }
    });
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : inputMessage;
    const text = rawText.trim();
    if (!text || loading) return;

    setError(null);
    setInputMessage('');

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await api.sendChatMessage({
        message: text,
        currentPath: location.pathname,
        sessionId,
      });

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        actions: response.actions,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            id: `aborted_${Date.now()}`,
            role: 'assistant',
            content: '*Generation cancelled by user.*',
          },
        ]);
      } else {
        setError(err.message || 'Failed to get response. Please check your connection.');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClearConversation = async () => {
    if (loading) return;
    try {
      await api.clearChatHistory(sessionId);
      setMessages([]);
      setError(null);
    } catch (err: any) {
      setError('Failed to clear conversation.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (action: ChatAction) => {
    navigate(action.path);
    // On small screens, close the panel so user sees destination page
    if (window.innerWidth <= 640) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* 1. FLOATING CHAT LAUNCHER PILL */}
      <div
        className="wavesync-chat-launcher-root"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          pointerEvents: 'auto',
        }}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="btn btn-dark"
            style={{
              minHeight: 48,
              padding: '0 20px',
              borderRadius: 'var(--radius-pill)',
              border: '2.5px solid var(--border-strong)',
              boxShadow: 'var(--shadow-tactile-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.92rem',
              fontWeight: 850,
              cursor: 'pointer',
              background: 'var(--ink)',
              color: '#FFFFFF',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
            }}
            aria-label="Open WaveSync AI Assistant"
            title="Chat with WaveSync AI Assistant"
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--accent-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ink)',
              }}
            >
              <Sparkles size={15} />
            </div>
            <span>WaveSync AI</span>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent-mint)',
                boxShadow: '0 0 8px var(--accent-mint)',
              }}
            />
          </button>
        )}
      </div>

      {/* 2. CONVERSATIONAL WORKSPACE PANEL */}
      {isOpen && (
        <div
          className="wavesync-chat-panel"
          style={{
            position: 'fixed',
            bottom: window.innerWidth <= 640 ? 0 : 24,
            right: window.innerWidth <= 640 ? 0 : 24,
            left: window.innerWidth <= 640 ? 0 : 'auto',
            width: window.innerWidth <= 640 ? '100%' : isExpanded ? 640 : 400,
            height: window.innerWidth <= 640 ? '88vh' : isExpanded ? '720px' : '560px',
            maxHeight: window.innerWidth <= 640 ? '90vh' : 'calc(100vh - 48px)',
            background: 'var(--paper)',
            border: '2.5px solid var(--border-strong)',
            borderRadius: window.innerWidth <= 640 ? '24px 24px 0 0' : 'var(--radius-xl)',
            boxShadow: 'var(--shadow-tactile-lg)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            transition: 'width 0.25s ease, height 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--ink)',
              color: '#FFFFFF',
              borderBottom: '2px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--accent-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                  fontWeight: 900,
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 850, fontSize: '0.98rem' }}>WaveSync AI</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 999,
                      background: providerInfo?.isConfigured ? '#EFFDF5' : '#FFF7ED',
                      color: providerInfo?.isConfigured ? '#047857' : '#C2410C',
                    }}
                  >
                    {providerInfo?.isConfigured ? 'LLM Ready' : 'Knowledge Engine'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  {isAuthenticated ? `Signed in as ${user?.fullName}` : 'Guest Visitor'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {messages.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  className="btn-icon"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                  }}
                  title="Clear Conversation"
                >
                  <Trash2 size={16} />
                </button>
              )}

              {window.innerWidth > 640 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="btn-icon"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                  }}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="btn-icon"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6,
                }}
                title="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: 'var(--paper)',
            }}
          >
            {/* Empty State / Suggested Prompts */}
            {messages.length === 0 && (
              <div style={{ padding: '8px 4px' }}>
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid var(--border-strong)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    boxShadow: 'var(--shadow-tactile-sm)',
                    marginBottom: 16,
                  }}
                >
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 850, marginBottom: 6 }}>
                    Welcome to WaveSync Assistant 👋
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.5 }}>
                    I can help you navigate opportunities, match with technical co-founders, verify Build-to-Earn proofs,
                    and discover mentors from your alumni network.
                  </p>
                </div>

                <div style={{ fontSize: '0.76rem', fontWeight: 850, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Suggested Inquiries:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      style={{
                        textAlign: 'left',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-md)',
                        padding: '9px 12px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '1px 1px 0px var(--border-strong)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <span>{prompt}</span>
                      <ArrowRight size={13} color="var(--accent-coral)" style={{ flexShrink: 0, marginLeft: 8 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: msg.role === 'user' ? '10px 16px' : '14px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? 'var(--ink)' : '#FFFFFF',
                    color: msg.role === 'user' ? '#FFFFFF' : 'var(--ink)',
                    border: '1.5px solid var(--border-strong)',
                    boxShadow: 'var(--shadow-tactile-sm)',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {msg.role === 'user' ? (
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                  ) : (
                    <div>
                      <MarkdownRenderer content={msg.content} />

                      {/* Clickable Real Route Navigation Actions */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 10,
                            borderTop: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                          }}
                        >
                          {msg.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleActionClick(act)}
                              className="btn btn-primary"
                              style={{
                                minHeight: 34,
                                padding: '0 14px',
                                fontSize: '0.8rem',
                                borderRadius: 'var(--radius-pill)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <Compass size={13} />
                              {act.label}
                              <ArrowRight size={13} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--ink-faint)',
                    marginTop: 3,
                    padding: '0 4px',
                  }}
                >
                  {msg.role === 'user' ? 'You' : 'WaveSync AI'}
                </span>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    padding: '12px 18px',
                    background: '#FFFFFF',
                    border: '1.5px solid var(--border-strong)',
                    borderRadius: '18px 18px 18px 4px',
                    boxShadow: 'var(--shadow-tactile-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--ink)' }}>
                    Analyzing WaveSync graph...
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--accent-mint)',
                        animation: 'heroEntrance 0.8s infinite alternate',
                      }}
                    />
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--accent-coral)',
                        animation: 'heroEntrance 0.8s infinite alternate 0.2s',
                      }}
                    />
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--accent-lime)',
                        animation: 'heroEntrance 0.8s infinite alternate 0.4s',
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleStopGeneration}
                  className="btn btn-outline"
                  style={{
                    minHeight: 32,
                    padding: '0 10px',
                    fontSize: '0.75rem',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Square size={12} fill="currentColor" /> Stop
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                style={{
                  background: '#FFF1F2',
                  border: '1.5px solid #BE123C',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  color: '#9F1239',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span>{error}</span>
                <button
                  onClick={() => handleSendMessage()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#BE123C',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 14px',
              background: '#FFFFFF',
              borderTop: '2px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about opportunities, co-founders, proofs, or pages..."
                disabled={loading}
                maxLength={2000}
                rows={2}
                style={{
                  flex: 1,
                  resize: 'none',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-strong)',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: 'var(--ink)',
                  background: 'var(--paper)',
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="btn btn-dark"
                style={{
                  minHeight: 44,
                  width: 44,
                  padding: 0,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  opacity: loading || !inputMessage.trim() ? 0.45 : 1,
                  cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                }}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: 'var(--ink-muted)',
                padding: '0 4px',
              }}
            >
              <span>Press Enter to send, Shift+Enter for newline</span>
              <span>{inputMessage.length}/2000</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
