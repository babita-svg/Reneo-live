import React, { useState } from 'react';
import { Plus, Radio, Package, DollarSign, Eye, Sparkles } from 'lucide-react';
import { useLive } from '../context/LiveContext';
import { CreateProductModal } from './CreateProductModal';

export const SellerDashboard: React.FC<{ onStartLive: () => void }> = ({ onStartLive }) => {
  const { products, liveSessions } = useLive();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  const totalSales = 1240; // Demo summary metric
  const totalViewers = liveSessions.reduce((sum, s) => sum + s.viewer_count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Seller Studio & Live Broadcasting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Manage Products & Stream Live</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Host high-definition low-latency live commerce streams powered by Agora RTC. Feature products live, engage buyers in chat, and sell instantly.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto z-10">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 md:flex-initial px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all text-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Active Products</p>
            <p className="text-xl font-bold text-white">{products.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Estimated Live Revenue</p>
            <p className="text-xl font-bold text-white">${totalSales}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Stream Viewers</p>
            <p className="text-xl font-bold text-white">{totalViewers}</p>
          </div>
        </div>
      </div>

      {/* Start Live Stream Config Card */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Go Live Now</h2>
            <p className="text-xs text-slate-400">Broadcast live camera & mic stream to viewers across Africa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Stream Session Title</label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. ✨ Summer Handwoven Collection Showcase & Live Q&A"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Featured Product to Showcase</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onStartLive}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 flex items-center space-x-2 transition-all text-sm"
          >
            <Radio className="w-4 h-4 animate-ping" />
            <span>Launch Live Stream Studio</span>
          </button>
        </div>
      </div>

      {/* Product Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Product Catalog ({products.length})</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            + Add New
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-md transition-all group"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-950">
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold rounded-lg border border-slate-800">
                  ${p.price} {p.currency}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-white line-clamp-1">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80">
                  <span>Stock: {p.stock} units</span>
                  <span className="text-emerald-400 font-medium capitalize">{p.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to add new product */}
      {isCreateModalOpen && <CreateProductModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
};
