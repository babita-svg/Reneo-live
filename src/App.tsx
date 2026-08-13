/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LiveProvider, useLive } from './context/LiveContext';
import { Navbar } from './components/Navbar';
import { SellerDashboard } from './components/SellerDashboard';
import { LiveStreamSeller } from './components/LiveStreamSeller';
import { LiveStreamCustomer } from './components/LiveStreamCustomer';
import { LiveSessionsList } from './components/LiveSessionsList';
import { CartDrawer } from './components/CartDrawer';
import { ErrorAlertContainer } from './components/ErrorAlert';
import { LiveSession } from './types';

const MainAppContent: React.FC = () => {
  const { role } = useAuth();
  const { currentSession, startLiveSession, joinLiveStream } = useLive();
  const [viewState, setViewState] = useState<'home' | 'seller_broadcaster' | 'customer_viewer'>('home');

  const handleStartLiveFromDashboard = async (productId: string, title: string) => {
    await startLiveSession(productId, title);
    setViewState('seller_broadcaster');
  };

  const handleSelectSessionFromList = (session: LiveSession) => {
    joinLiveStream(session);
    setViewState('customer_viewer');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="pb-12">
        {/* Render View based on Active Role & State */}
        {role === 'seller' ? (
          viewState === 'seller_broadcaster' ? (
            <LiveStreamSeller onBackToDashboard={() => setViewState('home')} />
          ) : (
            <SellerDashboard onStartLive={handleStartLiveFromDashboard} />
          )
        ) : (
          viewState === 'customer_viewer' ? (
            <LiveStreamCustomer onLeaveStream={() => setViewState('home')} />
          ) : (
            <LiveSessionsList onSelectSession={handleSelectSessionFromList} />
          )
        )}
      </main>

      <CartDrawer />
      <ErrorAlertContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LiveProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </LiveProvider>
    </AuthProvider>
  );
}
