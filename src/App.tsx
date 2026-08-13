import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LiveSessionsList } from './components/LiveSessionsList';
import { SellerDashboard } from './components/SellerDashboard';
import { LiveStreamSeller } from './components/LiveStreamSeller';
import { LiveStreamCustomer } from './components/LiveStreamCustomer';
import { CartDrawer } from './components/CartDrawer';
import { ErrorAlert } from './components/ErrorAlert';
import { useAuth } from './context/AuthContext';
import { useLive } from './context/LiveContext';
import { LiveSession } from './types';

export function App() {
  const { user } = useAuth();
  const { liveSessions, startLiveSession, activeSession, joinLiveSession, leaveActiveSession } = useLive();

  const [currentView, setCurrentView] = useState<'buyer' | 'seller'>('buyer');
  const [selectedSessionForCustomer, setSelectedSessionForCustomer] = useState<LiveSession | null>(null);
  const [isSellerStreaming, setIsSellerStreaming] = useState(false);

  const handleStartLiveSeller = async () => {
    const session = await startLiveSession('✨ Live Showcase: Handwoven Kente Bags & Summer Kimonos!');
    setIsSellerStreaming(true);
  };

  const handleSelectSessionCustomer = (session: LiveSession) => {
    joinLiveSession(session);
    setSelectedSessionForCustomer(session);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        onNavigateToSeller={() => setCurrentView('seller')}
        onNavigateToLive={() => {
          setCurrentView('buyer');
          setSelectedSessionForCustomer(null);
          setIsSellerStreaming(false);
        }}
      />

      <main className="flex-1 pb-16">
        {currentView === 'seller' ? (
          <SellerDashboard onStartLive={handleStartLiveSeller} />
        ) : (
          <LiveSessionsList
            onSelectSession={handleSelectSessionCustomer}
            onNavigateToSeller={() => setCurrentView('seller')}
          />
        )}
      </main>

      {/* Broadcaster (Seller Studio) Fullscreen Overlay */}
      {isSellerStreaming && (
        <LiveStreamSeller
          onClose={() => {
            setIsSellerStreaming(false);
            leaveActiveSession();
          }}
        />
      )}

      {/* Audience (Customer Live Stream) Fullscreen Overlay */}
      {selectedSessionForCustomer && (
        <LiveStreamCustomer
          session={selectedSessionForCustomer}
          onClose={() => {
            setSelectedSessionForCustomer(null);
            leaveActiveSession();
          }}
        />
      )}

      {/* Cart Drawer & Global Error Alert Toast */}
      <CartDrawer />
      <ErrorAlert />
    </div>
  );
}

export default App;
