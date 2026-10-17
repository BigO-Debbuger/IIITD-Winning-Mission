// wavesync_web/src/App.tsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('landing');

  return (
    <AuthProvider>
      <div className="wavesync-app">
        <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main>
          <LandingPage />
        </main>
        <AuthModal />
      </div>
    </AuthProvider>
  );
};

export default App;
