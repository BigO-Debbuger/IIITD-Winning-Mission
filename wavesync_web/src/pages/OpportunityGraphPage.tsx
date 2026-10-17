// wavesync_web/src/pages/OpportunityGraphPage.tsx
import React from 'react';
import { OpportunityGraph3D } from '../components/OpportunityGraph3D';
import { Reveal } from '../components/Reveal';
import { Footer } from '../components/Footer';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OpportunityGraphPage: React.FC = () => {
  return (
    <div className="graph-page-root" style={{ background: '#110B1C', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <section
        className="graph-section"
        style={{
          paddingTop: 'clamp(100px, 12vw, 140px)',
          paddingBottom: 'clamp(60px, 8vw, 100px)',
          flex: '1 0 auto',
          borderBottom: 'none',
        }}
      >
        <div className="container">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 28 }}>
              <div style={{ maxWidth: 840 }}>
                <div className="pill-badge pill-badge-mint" style={{ marginBottom: 14 }}>
                  <Layers size={13} /> Interactive Ecosystem Visualizer
                </div>
                <h1 className="section-title" style={{ color: '#FFFFFF', marginBottom: 14 }}>
                  The Real-Time Opportunity Graph
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.76)', fontSize: '1.08rem', lineHeight: 1.6 }}>
                  Explore active links between vetted founders, projects, verified collaborators, and open grants.
                  Rotate, zoom, and select any node to inspect project requirements, technical stacks, and funding allocations.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link
                  to="/opportunities"
                  className="btn btn-outline"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    fontSize: '0.85rem',
                  }}
                >
                  View All Opportunities <ArrowRight size={14} />
                </Link>
                <Link
                  to="/ventures"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Explore Ventures
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <OpportunityGraph3D />
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};
