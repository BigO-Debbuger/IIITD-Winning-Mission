// wavesync_web/src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div style={{ maxWidth: 360 }}>
            <Link to="/" className="brand-badge" style={{ color: '#FFFFFF', marginBottom: 14 }}>
              <div className="brand-mark">W</div>
              <span>WAVESYNC</span>
            </Link>
            <p style={{ fontSize: '0.88rem' }}>
              The high-conviction platform connecting founders, verified technical collaborators,
              opportunities, and non-dilutive grants.
            </p>
          </div>

          <div>
            <h4>Ecosystem</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0 }}>
              <li><Link to="/#problem">Problem Analysis</Link></li>
              <li><Link to="/#ecosystem">Connected Pathways</Link></li>
              <li><Link to="/#graph">3D Opportunity Graph</Link></li>
              <li><Link to="/opportunities">Open Opportunities</Link></li>
              <li><Link to="/ventures">Founder Matchmaking</Link></li>
              <li><Link to="/build-to-earn">Build-to-Earn Proofs</Link></li>
            </ul>
          </div>

          <div>
            <h4>Protocol</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0 }}>
              <li><Link to="/#how-it-works">Architecture & Audits</Link></li>
              <li><Link to="/build-to-earn">Ed25519 Signing Standards</Link></li>
              <li><Link to="/graph">PostgreSQL & Prisma Core</Link></li>
              <li><Link to="/opportunities">Live Ecosystem Grants</Link></li>
            </ul>
          </div>

          <div>
            <h4>System Integrity</h4>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.8rem',
                fontWeight: 750,
                color: 'var(--accent-mint)',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--accent-mint)',
                  boxShadow: '0 0 10px var(--accent-mint)',
                }}
              />
              Backend & DB Online
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              PostgreSQL · Node/Express · React Three Fiber
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 WaveSync Ecosystem. All rights reserved.</span>
          <span>Where Influence & Craft Meet Real Capital.</span>
        </div>
      </div>
    </footer>
  );
};
