import React from 'react';
import { useLive } from '../context/LiveContext';
import { LiveSession } from '../types';
import { Radio, Users, Eye, ShoppingCart, Sparkles, Store, ShieldCheck } from 'lucide-react';

export const LiveSessionsList: React.FC<{ onSelectSession: (session: LiveSession) => void }> = ({ onSelectSession }) => {
  const { activeSessions, products } = useLive();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Live Stream Discover Banner */}
      <div className="relative rounded-2xl bg-[#0F172A] border border-slate-800 p-6 md:p-8 mb-8 overflow-hidden shadow-sm text-white">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            LIVE COMMERCE FEED
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Watch, Chat & Shop Direct From African Entrepreneurs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Discover real-time broadcasts hosted by local artisans and creators across Africa. Watch HD video streams, chat with hosts live, and buy featured goods without interrupting the show.
          </p>
        </div>
      </div>

      {/* Active Live Broadcasts */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-600 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900">Ongoing Live Sessions</h2>
            <span className="px-2.5 py-0.5 text-xs bg-red-50 text-red-600 rounded-full font-bold border border-red-200">
              {activeSessions.filter((s) => s.status === 'live').length} Streaming
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSessions.map((session) => (
            <div
              key={session.live_id}
              onClick={() => onSelectSession(session)}
              className="group bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Live Stream Thumbnail Canvas */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={session.product?.image || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600'}
                    alt={session.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  
                  {/* Top Live Overlay Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {session.status === 'live' ? (
                      <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white rounded-md flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE NOW
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-slate-800 text-slate-300 rounded-md">
                        CONCLUDED
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{session.viewer_count} watching</span>
                  </div>
                </div>

                {/* Stream Session Title & Host */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={session.host_avatar}
                      alt={session.host_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{session.host_name}</h4>
                      <p className="text-[11px] text-blue-600 font-medium">Verified Seller</p>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug mb-3">
                    {session.title}
                  </h3>

                  {/* Featured Product Snapshot */}
                  {session.product && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={session.product.image}
                          alt={session.product.name}
                          className="w-10 h-10 rounded-md object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                            {session.product.name}
                          </p>
                          <p className="text-[10px] font-bold text-blue-600">
                            ${session.product.price.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Join Stream Action Footer */}
              <div className="p-5 pt-0">
                <button
                  id={`join-stream-btn-${session.live_id}`}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  JOIN LIVE STREAM
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Featured Artisan Catalog Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            African Artisan Product Catalog
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-slate-300 transition shadow-sm"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h4>
                <p className="text-blue-600 font-extrabold text-xs mt-1">${p.price.toFixed(2)} USD</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
