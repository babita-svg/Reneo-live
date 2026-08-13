import React, { useState } from 'react';
import { Radio, ShoppingBag, User, Sparkles, Layers, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AuthModal } from './AuthModal';
import { ArchitectureModal } from './ArchitectureModal';

export const Navbar: React.FC<{ onNavigateToSeller?: () => void; onNavigateToLive?: () => void }> = ({
  onNavigateToSeller,
  onNavigateToLive,
}) => {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={onNavigateToLive}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Radio className="w-5 h-5 text-slate-950 font-bold animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-200 bg-clip-text text-transparent">
                  Reneo Live
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full uppercase tracking-wider">
                  Live Commerce
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Real-time Stream & Shop</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Architecture Inspector Modal Trigger */}
            <button
              onClick={() => setIsArchModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Inspect System Architecture & Documentation"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Architecture</span>
            </button>

            {/* Seller Mode Toggle / Dashboard */}
            {user?.role === 'seller' ? (
              <button
                onClick={onNavigateToSeller}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Seller Studio</span>
              </button>
            ) : (
              <button
                onClick={onNavigateToSeller}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-amber-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors hidden sm:flex items-center space-x-1"
              >
                <span>Switch to Seller</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-300 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Auth Profile */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/30 overflow-hidden flex items-center justify-center text-xs font-bold text-amber-400">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-amber-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

      {/* Architecture Inspector Modal */}
      {isArchModalOpen && <ArchitectureModal onClose={() => setIsArchModalOpen(false)} />}
    </>
  );
};
