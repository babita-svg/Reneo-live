import React from 'react';
import { X, Code, ShieldCheck, Server, Database, Video, Cpu, FileText } from 'lucide-react';

export const ArchitectureModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 text-slate-900 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Reneo Live — Technical Assessment & Architecture Brief</h2>
            <p className="text-xs text-slate-500"> Candidate Submission Brief & Security Review </p>
          </div>
        </div>

        <div className="space-y-8 text-xs leading-relaxed text-slate-700">
          
          {/* ASCII Architecture Diagram */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              A12. System Architecture Diagram
            </h3>
            <pre className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto leading-tight shadow-sm">
{`+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  [ React 19 / Vite SPA ]                                                         |
|  +-----------------------------------+   +------------------------------------+  |
|  | Seller Studio (Broadcaster Role)  |   | Customer View (Audience Subscriber)|  |
|  | - Agora Publisher Track (VP8)     |   | - Non-disruptive Product Drawer    |  |
|  | - Mute/Video/Switch Controls      |   | - Realtime Chat & Floating Emoji   |  |
|  +-----------------------------------+   +------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                EXPRESS BACKEND SERVER                             |
|  - POST /api/agora-token  ==> Generates RTC tokens using Agora App Certificate     |
|  - GET  /api/health       ==> Environment & Service Status Healthcheck            |
+------------------------------------------+----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
+------------------------------------+           +----------------------------------+
|           SUPABASE AUTH & DB       |           |            AGORA RTC             |
| - Profiles & Products (RLS Policies)|          | - Broadcaster / Audience Channels|
| - Live Sessions & Storage Buckets  |           | - Low-latency HD Video Broadcast |
| - Supabase Realtime WebSocket Chat |           +----------------------------------+
+------------------------------------+`}
            </pre>
          </div>

          {/* Security Answer (Requirement A10) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              A10. Security Question: "What stops a user from editing the ID in a request and deleting another seller's product?"
            </h3>
            <p className="text-slate-700 leading-relaxed mb-2">
              <strong>Answer:</strong> Row Level Security (RLS) enabled on the PostgreSQL <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">public.products</code> table. A hidden UI button is never treated as an access control mechanism.
            </p>
            <pre className="bg-[#0F172A] p-3 rounded-lg text-[11px] font-mono text-blue-300 border border-slate-800 overflow-x-auto">
{`CREATE POLICY "Sellers can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = seller_id);`}
            </pre>
            <p className="mt-2 text-slate-600 text-[11px]">
              When an API or Supabase client query sends a request to delete product <code className="text-slate-900 font-bold">ID=123</code>, PostgreSQL compares <code className="text-slate-900 font-bold">auth.uid()</code> from the cryptographically signed JWT token against the row's <code className="text-slate-900 font-bold">seller_id</code> column. If they do not match, the query affects 0 rows and returns permission denied, regardless of modified request bodies or client manipulation.
            </p>
          </div>

          {/* Written Section (Part C) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              PART C — Candidate Written Answers
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">1. Which part of this would break first if 500 customers joined the same live? What would you change?</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                The database read queries for real-time chat messages and viewer count heartbeats. If 500 viewers query Supabase simultaneously on every message or send high-frequency updates to the same row, database connection pools will exhaust.
                <br /><br />
                <strong>Mitigation:</strong> Move real-time chat to dedicated WebSocket pub/sub (e.g. Supabase Broadcast Channel or Redis Pub/Sub) without persisting every transient reaction or viewer heartbeat into PostgreSQL immediately. Aggregate viewer counts via server-side Redis counters flushed in batches.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">2. What did you not have time to do, and what would you do next with two more days?</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                I completed all Core (Part A) and key Bonus features (Part B: real-time viewer count, floating emoji reactions, switching featured product on the fly). With two more days, I would implement server-side Agora HLS cloud recording for archived streams, integrate real Mobile Money (M-Pesa / MTN MoMo) payment webhook handling, and implement offline PWA push notifications.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">3. Where did you use a library or an AI assistant to do something you would not have been able to write yourself, and what did you learn about it afterwards?</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                I leveraged <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">agora-access-token</code> / <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">agora-token</code> for building privilege expiration timestamps and cryptographic token generation server-side. I learned how Agora handles token privileges (<code className="text-slate-900 font-bold">RtcRole.PUBLISHER</code> vs <code className="text-slate-900 font-bold">RtcRole.SUBSCRIBER</code>) and privilege expiration timestamps to enforce broadcaster vs audience separation.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
