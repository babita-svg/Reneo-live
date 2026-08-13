import React, { useState } from 'react';
import { useLive } from '../context/LiveContext';
import { X, Plus, Image as ImageIcon, CheckCircle, Package } from 'lucide-react';

// Curated high quality African artisan product image presets for instant selection
const PRESET_PRODUCT_IMAGES = [
  {
    label: 'Handwoven Kente Tote Bag',
    url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600',
  },
  {
    label: 'Organic Unrefined Shea Butter',
    url: 'https://images.unsplash.com/photo-1608248597262-8382d6451634?auto=format&fit=crop&q=80&w=600',
  },
  {
    label: 'Maasai Tribal Beaded Necklace',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
  },
  {
    label: 'Ethiopian Highland Coffee Beans',
    url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
  },
  {
    label: 'Handmade African Print Kimono',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
  },
  {
    label: 'Carved Ebony Wooden Sculpture',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
  },
];

export const CreateProductModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createProduct } = useLive();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('25.00');
  const [stock, setStock] = useState('15');
  const [imageUrl, setImageUrl] = useState(PRESET_PRODUCT_IMAGES[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) return;

    setIsSubmitting(true);
    try {
      await createProduct({
        name,
        description: description || 'Handcrafted authentic product sourced directly from local African solo entrepreneurs.',
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        image: imageUrl,
        status: 'active',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-y-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Add New Product to Catalog</h2>
            <p className="text-xs text-slate-400">Stored in Supabase database & storage</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handmade Batik Silk Scarf"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail craft materials, heritage story, or specifications..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Product Image Selection or Custom URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Product Image or Enter URL</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                    imageUrl === preset.url ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  {imageUrl === preset.url && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste custom image URL https://..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
