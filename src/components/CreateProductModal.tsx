import React, { useState } from 'react';
import { X, Package, Upload } from 'lucide-react';
import { useLive } from '../context/LiveContext';
import { useAuth } from '../context/AuthContext';

export const CreateProductModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createProduct } = useLive();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const DEFAULT_IMAGES = [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;

    setLoading(true);
    try {
      await createProduct({
        seller_id: user?.id || 'demo-seller-101',
        title,
        description,
        price: parseFloat(price) || 0,
        currency: 'USD',
        stock: parseInt(stock, 10) || 1,
        image_url: imageUrl || DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)],
        status: 'active',
      });
      onClose();
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Create New Product</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Handcrafted Leather Sandal"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Product Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Preset Image</label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageUrl(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    imageUrl === img ? 'border-amber-500 scale-105' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe craftsmanship, size, materials..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Save & Publish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
