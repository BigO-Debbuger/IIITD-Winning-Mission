// wavesync_web/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ScrollToTop } from './components/ScrollToTop';

// Dedicated Feature Pages
import { HomePage } from './pages/HomePage';
import { OpportunityGraphPage } from './pages/OpportunityGraphPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { VenturesPage } from './pages/VenturesPage';
import { NetworkPage } from './pages/NetworkPage';
import { BuildToEarnPage } from './pages/BuildToEarnPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { WaveSyncAssistant } from './components/chat/WaveSyncAssistant';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="wavesync-app">
          <Navbar />
          <main>
            <Routes>
              {/* 1. Home Page */}
              <Route path="/" element={<HomePage />} />

              {/* 2. Interactive 3D Opportunity Graph */}
              <Route path="/graph" element={<OpportunityGraphPage />} />

              {/* 3. Opportunities & Discovery */}
              <Route path="/opportunities" element={<OpportunitiesPage />} />

              {/* 4. Ventures & Co-Founder Matching */}
              <Route path="/ventures" element={<VenturesPage />} />

              {/* 5. Talent Discovery & Alumni Network */}
              <Route path="/network" element={<NetworkPage />} />

              {/* 6. Build-to-Earn Proof Ledger */}
              <Route path="/build-to-earn" element={<BuildToEarnPage />} />
              <Route path="/bte" element={<Navigate to="/build-to-earn" replace />} />

              {/* 7. Direct 1:1 Messaging */}
              <Route path="/messages" element={<MessagesPage />} />

              {/* 8. My Network Profile */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <AuthModal />
          <WaveSyncAssistant />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
