// wavesync_web/src/components/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import { X, Sparkles, ShieldCheck, ArrowRight, Loader2, KeyRound, Mail, RefreshCw } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    closeAuthModal,
    authModalMode,
    initialEmail,
    login,
    register,
    sendOtp,
    verifyOtp,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(authModalMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'alumni' | 'company'>('student');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    setMode(authModalMode);
    if (initialEmail) {
      setEmail(initialEmail);
    }
    setError(null);
    setStatusNotice(null);
    setDevOtpHint(null);
  }, [authModalMode, initialEmail, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSendVerificationCode = async (targetEmail: string) => {
    try {
      const res = await sendOtp(targetEmail);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setStatusNotice(`Verification code sent to ${targetEmail}`);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusNotice(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        try {
          await login(email, password);
        } catch (loginErr: any) {
          // If unverified account, transition to OTP flow seamlessly
          if (loginErr.message?.toLowerCase().includes('verify your email') || loginErr.status === 403) {
            setMode('otp');
            await handleSendVerificationCode(email);
            return;
          }
          throw loginErr;
        }
      } else if (mode === 'register') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        // Option: Send OTP first to guarantee account verification
        await handleSendVerificationCode(email);
        setMode('otp');
      } else if (mode === 'otp') {
        if (!otpCode || otpCode.trim().length !== 6) {
          throw new Error('Please enter the 6-digit verification code.');
        }
        await verifyOtp(email, otpCode);
        
        // If registering, now finish registration transaction
        if (fullName && password) {
          await register(fullName, email, password, role);
        } else {
          // If verifying existing account for login, prompt password or attempt login
          setStatusNotice('Email verified! You can now sign in.');
          setMode('login');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please review your input.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectRegisterBypass = async () => {
    setError(null);
    setLoading(true);
    try {
      await register(fullName, email, password, role);
    } catch (err: any) {
      setError(err.message || 'Direct registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuthModal}
      hideHeader={true}
      maxWidth={520}
    >
      <div style={{ position: 'relative' }}>
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px solid var(--border-strong)',
            background: '#FAF6F0',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-tactile-sm)',
            zIndex: 10,
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div className="pill-badge pill-badge-lime" style={{ marginBottom: 12 }}>
            <Sparkles size={13} /> WaveSync Gateway
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, letterSpacing: -0.04 }}>
            {mode === 'login'
              ? 'Enter the Ecosystem'
              : mode === 'register'
              ? 'Join WaveSync'
              : 'Verify Your Email'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', marginTop: 4 }}>
            {mode === 'login'
              ? 'Connect to opportunities, proofs of work, and collaborators.'
              : mode === 'register'
              ? 'Create a verified builder, founder, or mentor identity.'
              : `Enter the 6-digit code sent to ${email} to activate your credentials.`}
          </p>
        </div>

        {/* Mode Toggle Pills (when not in OTP mode) */}
        {mode !== 'otp' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              padding: 4,
              borderRadius: 'var(--radius-pill)',
              border: '2px solid var(--border-strong)',
              background: '#F5EEE2',
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setStatusNotice(null);
              }}
              style={{
                padding: '8px 0',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '0.85rem',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: 'var(--ink)',
                border: mode === 'login' ? '1.5px solid var(--border-strong)' : 'none',
                boxShadow: mode === 'login' ? 'var(--shadow-tactile-sm)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setStatusNotice(null);
              }}
              style={{
                padding: '8px 0',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 800,
                fontSize: '0.85rem',
                background: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: 'var(--ink)',
                border: mode === 'register' ? '1.5px solid var(--border-strong)' : 'none',
                boxShadow: mode === 'register' ? 'var(--shadow-tactile-sm)' : 'none',
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Informative Status Notice */}
        {statusNotice && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: '#F0FDF4',
              border: '1.5px solid #22C55E',
              color: '#15803D',
              fontSize: '0.84rem',
              fontWeight: 650,
              marginBottom: 14,
            }}
          >
            {statusNotice}
          </div>
        )}

        {/* Dev Mode Code Hint */}
        {devOtpHint && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: '#FEF9C3',
              border: '1.5px solid #EAB308',
              color: '#854D0E',
              fontSize: '0.8rem',
              fontWeight: 750,
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>[Dev Mode Code]: <strong>{devOtpHint}</strong></span>
            <button
              type="button"
              onClick={() => setOtpCode(devOtpHint)}
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 4,
                background: '#EAB308',
                color: '#FFFFFF',
                fontWeight: 800,
              }}
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* Actionable Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: '#FFF0F0',
              border: '1.5px solid var(--accent-coral)',
              color: '#B91C1C',
              fontSize: '0.85rem',
              fontWeight: 650,
              marginBottom: 16,
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  className="text-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Platform Role</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {[
                    { id: 'student', label: 'Builder / Seeker' },
                    { id: 'company', label: 'Founder / Co' },
                    { id: 'alumni', label: 'Mentor / Reviewer' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-strong)',
                        background: role === r.id ? 'var(--accent-lime)' : '#FAF6F0',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        color: 'var(--ink)',
                        boxShadow: role === r.id ? 'var(--shadow-tactile-sm)' : 'none',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode !== 'otp' && (
            <>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@domain.xyz"
                  className="text-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="text-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {mode === 'otp' && (
            <div className="input-group">
              <label className="input-label">6-Digit Verification Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="text-input"
                  style={{ letterSpacing: '0.25em', fontSize: '1.2rem', fontWeight: 900, textAlign: 'center' }}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => handleSendVerificationCode(email)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--ink-secondary)',
                  }}
                >
                  <RefreshCw size={12} /> Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ink-muted)' }}
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-coral"
            style={{ width: '100%', marginTop: 14, minHeight: 48 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying...
              </>
            ) : mode === 'login' ? (
              <>
                Sign In to WaveSync <ArrowRight size={16} />
              </>
            ) : mode === 'register' ? (
              <>
                Verify Email & Create Account <ArrowRight size={16} />
              </>
            ) : (
              <>
                Confirm & Activate Account <ArrowRight size={16} />
              </>
            )}
          </button>

          {mode === 'register' && (
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <button
                type="button"
                onClick={handleDirectRegisterBypass}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 750,
                  color: 'var(--ink-faint)',
                  textDecoration: 'underline',
                }}
              >
                Instant registration (skip OTP verification)
              </button>
            </div>
          )}
        </form>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '0.78rem',
            color: 'var(--ink-faint)',
          }}
        >
          <ShieldCheck size={14} /> End-to-end Ed25519 verified credentials
        </div>
      </div>
    </Modal>
  );
};
