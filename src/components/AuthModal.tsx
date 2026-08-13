import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, Lock, Mail, User, Store, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { loginWithEmail, signUpWithEmail, loginAsDemoSeller, loginAsDemoCustomer, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isSignUp) {
        if (!name || !email) {
          setErrorMsg('Please fill in all required fields.');
          return;
        }
        await signUpWithEmail(name, email, selectedRole);
      } else {
        if (!email) {
          setErrorMsg('Please enter your email.');
          return;
        }
        await loginWithEmail(email, selectedRole);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isSignUp ? 'Create Reneo Account' : 'Welcome Back to Reneo'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supabase Auth & Role-Based Access Control
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons for Evaluation */}
        <div className="mb-6 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <p className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo Evaluation Profiles (1-Click)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                loginAsDemoSeller();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
            >
              <Store className="w-3.5 h-3.5" />
              Demo Seller
            </button>
            <button
              onClick={() => {
                loginAsDemoCustomer();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg text-xs font-semibold transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Demo Customer
            </button>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-medium">Or custom auth</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amina Kwamboka"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@reneo.live"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('seller')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  selectedRole === 'seller'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                Seller / Entrepreneur
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  selectedRole === 'customer'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Customer / Shopper
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Processing...' : isSignUp ? 'Create Profile & Sign Up' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-amber-400 transition underline underline-offset-4"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
