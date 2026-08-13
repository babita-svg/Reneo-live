import React, { useState } from 'react';
import { X, UserCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { loginDemoUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('seller');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginDemoUser(selectedRole, name.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <UserCheck className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-xl font-bold text-white">Join Reneo Live</h2>
          <p className="text-xs text-slate-400 mt-1">Select your account role to experience live stream shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Select Profile Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('seller')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'seller'
                    ? 'border-amber-500/80 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold">Seller / Host</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Host live sessions & sell products</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === 'customer'
                    ? 'border-amber-500/80 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-semibold">Customer / Buyer</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Watch streams, chat & buy items</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Your Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedRole === 'seller' ? 'Amara Koffi' : 'Kofi Mensah'}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm mt-2"
          >
            Continue as {selectedRole === 'seller' ? 'Seller' : 'Customer'}
          </button>
        </form>
      </div>
    </div>
  );
};
