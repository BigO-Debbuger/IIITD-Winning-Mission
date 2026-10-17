// wavesync_web/src/components/Navbar.tsx
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, Menu, X, Users, MessageSquare } from 'lucide-react';

export const Navbar: React.FC<{
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenNetwork?: () => void;
}> = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <div className="wavesync-navbar-wrap">
      <nav className="wavesync-navbar">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            closeMobile();
          }}
          className="brand-badge"
        >
          <div className="brand-mark">W</div>
          <span>WAVESYNC</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/graph"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              3D Graph
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/opportunities"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Opportunities
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/ventures"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Ventures
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/network"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Network
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/build-to-earn"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Build-to-Earn
            </NavLink>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <NavLink
                to="/messages"
                className={({ isActive }) => `btn ${isActive ? 'btn-dark' : 'btn-outline'}`}
                style={{
                  minHeight: 36,
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
                title="Direct Messages"
              >
                <MessageSquare size={14} />
                <span>Messages</span>
              </NavLink>

              <Link
                to="/profile"
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
                  cursor: 'pointer',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
                title="View & Edit Profile"
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
                <span>{user?.fullName}</span>
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
                  {user?.role}
                </span>
              </Link>

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
            maxHeight: 'calc(100vh - 110px)',
            overflowY: 'auto',
          }}
        >
          {[
            { label: 'Home', path: '/' },
            { label: '3D Graph', path: '/graph' },
            { label: 'Opportunities', path: '/opportunities' },
            { label: 'Ventures', path: '/ventures' },
            { label: 'Network', path: '/network' },
            { label: 'Build-to-Earn', path: '/build-to-earn' },
            { label: 'Messages', path: '/messages' },
            ...(isAuthenticated ? [{ label: 'Profile', path: '/profile' }] : []),
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--ink-primary)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ))}

          {!isAuthenticated ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <button
                onClick={() => {
                  closeMobile();
                  openAuthModal('login');
                }}
                className="btn btn-outline"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  closeMobile();
                  openAuthModal('register');
                }}
                className="btn btn-primary"
              >
                Register
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                closeMobile();
                logout();
              }}
              className="btn btn-outline"
              style={{ marginTop: 10 }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
};
