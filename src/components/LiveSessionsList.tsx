import React from 'react';
import { Radio, Users, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { useLive } from '../context/LiveContext';
import { LiveSession } from '../types';

export const LiveSessionsList: React.FC<{
  onSelectSession: (session: LiveSession) => void;
  onNavigateToSeller: () => void;
}> = ({ onSelectSession, onNavigateToSeller }) => {
  const { liveSessions, products } = useLive();

  const activeLiveStreams = liveSessions.filter((s) => s.status === 'live');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Interactive Live Commerce Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Stream, Chat & Shop <br />
            <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 bg-clip-text text-transparent">
              In Real Time
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Connect directly with African entrepreneurs and creators. Watch live video showcases, chat in real-time, and buy authentic products with instant checkout.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={onNavigateToSeller}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Broadcasting as Seller</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Live Streams Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-xl font-bold text-white">Active Live Streams ({activeLiveStreams.length})</h2>
          </div>
          <span className="text-xs text-slate-400">Low-Latency Video Powered by Agora RTC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeLiveStreams.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-950">
                <img
                  src={session.featured_product?.image_url || products[0]?.image_url}
                  alt={session.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                {/* Live Badge */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>LIVE</span>
                </div>

                {/* Viewers Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-md text-slate-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5 border border-slate-800">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{session.viewer_count}</span>
                </div>

                {/* Host Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                    {session.seller_name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow">{session.seller_name}</span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                    {session.title}
                  </h3>
                  {session.featured_product && (
                    <div className="mt-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center space-x-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300 font-medium truncate">
                        Featured: {session.featured_product.title} (${session.featured_product.price})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Join Stream & Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products Catalog Grid */}
      <div className="space-y-6 pt-6 border-t border-slate-800">
        <h2 className="text-xl font-bold text-white">Explore Artisan Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-950">
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-sm font-extrabold text-amber-400">${p.price} USD</span>
                <span className="text-xs text-slate-500">{p.stock} in stock</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
