// wavesync_web/src/App.tsx
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './components/AuthModal';
import { NetworkHubModal } from './components/NetworkHubModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('landing');
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [networkInitialTab, setNetworkInitialTab] = useState<'directory' | 'recommendations' | 'connections' | 'messages' | 'outcomes' | 'profile'>('directory');
  const [networkTargetUserId, setNetworkTargetUserId] = useState<string | null>(null);

  const handleOpenNetwork = (
    tab: 'directory' | 'recommendations' | 'connections' | 'messages' | 'outcomes' | 'profile' = 'directory',
    targetId: string | null = null
  ) => {
    setNetworkInitialTab(tab);
    setNetworkTargetUserId(targetId);
    setNetworkModalOpen(true);
  };

  return (
    <AuthProvider>
      <div className="wavesync-app">
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenNetwork={() => handleOpenNetwork('directory')}
        />
        <main>
          <LandingPage onOpenNetwork={handleOpenNetwork} />
        </main>
        <AuthModal />
        <NetworkHubModal
          isOpen={networkModalOpen}
          onClose={() => setNetworkModalOpen(false)}
          initialTab={networkInitialTab}
          targetUserId={networkTargetUserId}
        />
      </div>
    </AuthProvider>
  );
};

export default App;
