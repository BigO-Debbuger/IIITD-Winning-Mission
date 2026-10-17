// wavesync_web/src/components/Navbar.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User as UserIcon, LogOut, Menu, X, ArrowUpRight, Users } from 'lucide-react';

export const Navbar: React.FC<{
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenNetwork?: () => void;
}> = ({
  activeTab = 'landing',
  onSelectTab,
  onOpenNetwork,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string, anchorId?: string) => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    if (anchorId) {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="wavesync-navbar-wrap">
      <nav className="wavesync-navbar">
        {/* Brand Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="brand-badge"
        >
          <div className="brand-mark">W</div>
          <span>WAVESYNC</span>
        </a>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li>
            <a
              href="#ecosystem"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('landing', 'ecosystem');
              }}
            >
              Ecosystem
            </a>
          </li>
          <li>
            <a
              href="#graph"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('landing', 'graph');
              }}
            >
              3D Graph
            </a>
          </li>
          <li>
            <a
              href="#opportunities"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('landing', 'opportunities');
              }}
            >
              Opportunities
            </a>
          </li>
          <li>
            <a
              href="#founders"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('landing', 'founders');
              }}
            >
              Founders
            </a>
          </li>
          <li>
            <a
              href="#bte"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('landing', 'bte');
              }}
            >
              Build-to-Earn
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('landing', 'how-it-works');
              }}
            >
              Protocol
            </a>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="nav-actions">
          <button
            onClick={() => onOpenNetwork && onOpenNetwork()}
            className="btn btn-outline"
            style={{
              minHeight: 36,
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(61, 242, 157, 0.78)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(5, 2, 11, 0.2)',
              fontWeight: 900,
              fontSize: '0.8rem',
              boxShadow: 'var(--shadow-tactile-sm)',
              flexShrink: 0,
            }}
            title="Alumni Network & Directory"
          >
            <Users size={14} />
            <span>Network</span>
          </button>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px 4px 6px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid rgba(5, 2, 11, 0.16)',
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: 'var(--shadow-tactile-sm)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--accent-lime)',
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid var(--border-strong)',
                    flexShrink: 0,
                  }}
                >
                  <UserIcon size={13} />
                </div>
                <span>{user.fullName}</span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 999,
                    background: 'rgba(5, 2, 11, 0.06)',
                    color: 'var(--ink-muted)',
                  }}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{
                  minHeight: 34,
                  width: 34,
                  padding: 0,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(5, 2, 11, 0.16)',
                  flexShrink: 0,
                }}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-outline"
                style={{
                  minHeight: 36,
                  padding: '0 14px',
                  fontSize: '0.82rem',
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1.5px solid rgba(5, 2, 11, 0.16)',
                  flexShrink: 0,
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{ minHeight: 36, padding: '0 16px', fontSize: '0.82rem', flexShrink: 0 }}
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-outline"
            style={{
              minHeight: 40,
              width: 40,
              padding: 0,
              display: 'none',
            }}
            id="mobile-nav-toggle"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 86,
            left: 16,
            right: 16,
            background: '#FFFFFF',
            border: '2px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            boxShadow: 'var(--shadow-tactile-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            pointerEvents: 'auto',
          }}
        >
          <a
            href="#network"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              if (onOpenNetwork) onOpenNetwork();
            }}
            style={{
              fontSize: '1rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              padding: '8px 0',
              borderBottom: '1.5px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--ink-primary)',
            }}
          >
            <Users size={16} />
            <span>Alumni Network</span>
          </a>
          {['ecosystem', 'graph', 'opportunities', 'founders', 'bte', 'how-it-works'].map((item) => (
            <a
              key={item}
              href={`#${item}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('landing', item);
              }}
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {item.replace('-', ' ')}
            </a>
          ))}
          {!isAuthenticated && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="btn btn-outline"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('register');
                }}
                className="btn btn-primary"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
