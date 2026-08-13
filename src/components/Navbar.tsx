import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Radio, User, ShieldCheck, LogOut, Code, Sparkles, Store, ShoppingCart } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ArchitectureModal } from './ArchitectureModal';

export const Navbar: React.FC = () => {
  const { user, role, switchRole, signOut } = useAuth();
  const { totalItemsCount, setIsOpen: setCartOpen } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 text-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    Reneo
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white rounded-md flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  African Solo-Entrepreneur Live Commerce Platform
                </p>
              </div>
            </div>
          </div>

          {/* Quick Evaluator Role Switcher (A1) */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              id="role-switch-seller"
              onClick={() => switchRole('seller')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                role === 'seller'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Seller Studio
            </button>
            <button
              id="role-switch-customer"
              onClick={() => switchRole('customer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                role === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Customer View
            </button>
          </div>

          {/* Action Icons & User Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Architecture Brief Button (A12) */}
            <button
              id="open-architecture-btn"
              onClick={() => setShowArchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition shadow-sm"
              title="View Architecture & Technical Brief"
            >
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Architecture & Brief</span>
            </button>

            {/* Shopping Cart Trigger (A8) */}
            <button
              id="open-cart-btn"
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/50"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                    {user.name}
                  </p>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Architecture Brief Modal */}
      {showArchModal && <ArchitectureModal onClose={() => setShowArchModal(false)} />}
    </>
  );
};
