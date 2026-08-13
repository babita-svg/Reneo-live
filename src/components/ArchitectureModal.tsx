import React from 'react';
import { X, Layers, Server, ShieldCheck, Database, Radio, Sparkles } from 'lucide-react';

export const ArchitectureModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Architecture & Security Audit</h2>
              <p className="text-xs text-slate-400">Reneo Live Full-Stack Live Commerce Platform</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ASCII Architecture Diagram */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-amber-300 leading-relaxed overflow-x-auto">
          <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                      RENEO FRONTEND CLIENT                      │
│        React 19 + Vite + Tailwind CSS + Agora Web SDK NG        │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
    HTTP / REST (JWT Auth)               Agora Low-Latency RTC
               │                                  │
┌──────────────▼─────────────────┐   ┌────────────▼───────────────┐
│      EXPRESS BACKEND SERVER    │   │      AGORA RTC ENGINE      │
│  - Token Signer (/agora-token) │   │ - Broadcaster (Host)       │
│  - Healthcheck API             │   │ - Audience (Subscriber)    │
└──────────────┬─────────────────┘   └────────────────────────────┘
               │
   Row Level Security (RLS)
               │
┌──────────────▼─────────────────┐
│       SUPABASE DATABASE        │
│ - PostgreSQL Tables (Products) │
│ - Realtime WebSocket (Chat)    │
└────────────────────────────────┘
          `}</pre>
        </div>

        {/* Key Architectural Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>A10: Server-Side Token Generation</span>
            </div>
            <p className="text-slate-300 leading-normal">
              Agora App Certificate is never exposed client-side. Cryptographic RTC tokens signed server-side with strict 24-hour expiration and roles (<code className="text-amber-300">PUBLISHER</code> vs <code className="text-amber-300">SUBSCRIBER</code>).
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Database className="w-4 h-4" />
              <span>Row Level Security (RLS)</span>
            </div>
            <p className="text-slate-300 leading-normal">
              PostgreSQL policies enforce strict row level authorization. Sellers can only update or delete products matching their verified JWT <code className="text-amber-300">auth.uid() = seller_id</code>.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
