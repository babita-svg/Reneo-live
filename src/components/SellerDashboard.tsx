import React, { useState } from 'react';
import { useLive } from '../context/LiveContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { CreateProductModal } from './CreateProductModal';
import { Store, Plus, Radio, Trash2, PackageCheck, AlertCircle, ShoppingBag, Eye } from 'lucide-react';

export const SellerDashboard: React.FC<{ onStartLive: (productId: string, title: string) => void }> = ({ onStartLive }) => {
  const { sellerProducts, deleteProduct } = useLive();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductForLive, setSelectedProductForLive] = useState<Product | null>(null);
  const [streamTitle, setStreamTitle] = useState('');
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  const handleOpenLaunch = (product: Product) => {
    setSelectedProductForLive(product);
    setStreamTitle(`Live Showcase: ${product.name}`);
    setShowLaunchModal(true);
  };

  const handleConfirmGoLive = () => {
    if (selectedProductForLive) {
      onStartLive(selectedProductForLive.id, streamTitle);
      setShowLaunchModal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Seller Header Banner */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
              alt={user?.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-500/40 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {user?.name || 'Seller Dashboard'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Verified Seller
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage your artisan inventory, launch HD live streams, and process direct shopper orders.
              </p>
            </div>
          </div>

          <button
            id="create-product-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product to Catalog
          </button>
        </div>
      </div>

      {/* Product Catalog Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Your Product Catalog</h2>
            <span className="px-2.5 py-0.5 text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-full font-semibold">
              {sellerProducts.length} items
            </span>
          </div>
        </div>

        {sellerProducts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <Store className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800">No products added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create your first product listing to go live and start presenting to live shoppers.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-blue-500 transition"
            >
              Add First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden transition-all duration-200 shadow-sm flex flex-col"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[11px] font-bold bg-white/95 text-blue-700 rounded-md border border-blue-200 shadow-sm">
                      ${product.price.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-[10px] font-bold bg-slate-900/80 text-white rounded-md backdrop-blur-sm">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>

                {/* Info & Description */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {product.description}
                    </p>
                  </div>

                  {/* Actions: Go Live or Delete */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition"
                      title="Delete Product (RLS Protected)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      id={`go-live-prod-${product.id}`}
                      onClick={() => handleOpenLaunch(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition shadow-sm"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      GO LIVE NOW
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && <CreateProductModal onClose={() => setShowCreateModal(false)} />}

      {/* Launch Live Session Confirmation Modal (A4) */}
      {showLaunchModal && selectedProductForLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold">Start Agora Live Broadcast</h3>
                <p className="text-xs text-slate-500">Presents product directly to shoppers</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <img
                src={selectedProductForLive.image}
                alt={selectedProductForLive.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{selectedProductForLive.name}</p>
                <p className="text-[11px] text-blue-600 font-semibold">${selectedProductForLive.price.toFixed(2)} USD</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Live Broadcast Title</label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLaunchModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGoLive}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Launch Broadcaster Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
