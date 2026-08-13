import React from 'react';
import { X, ShoppingBag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailModal: React.FC<{
  product: Product;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const { addToCart } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Stream Item</span>
          </div>
          <h2 className="text-xl font-bold text-white">{product.title}</h2>
          <p className="text-2xl font-extrabold text-amber-400">${product.price} USD</p>
          <p className="text-xs text-slate-300 leading-relaxed">{product.description}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Direct Express Delivery across East & West Africa</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Escrow Guarantee & Verified Artisan Seller</span>
          </div>
        </div>

        <button
          onClick={() => {
            addToCart(product);
            onClose();
          }}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart - ${product.price} USD</span>
        </button>
      </div>
    </div>
  );
};
