// wavesync_web/src/components/Navbar.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User as UserIcon, LogOut, Menu, X, ArrowUpRight } from 'lucide-react';

export const Navbar: React.FC<{ activeTab?: string; onSelectTab?: (tab: string) => void }> = ({
  activeTab = 'landing',
  onSelectTab,
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
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px 4px 6px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.5px solid var(--border-strong)',
                  background: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  boxShadow: 'var(--shadow-tactile-sm)',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--accent-lime)',
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  <UserIcon size={14} />
                </div>
                <span>{user.fullName}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 999,
                    background: 'var(--paper-deep)',
                    color: 'var(--ink-muted)',
                  }}
                >
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{ minHeight: 38, padding: '0 12px' }}
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-outline"
                style={{ minHeight: 40, padding: '0 16px' }}
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{ minHeight: 40, padding: '0 18px' }}
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
