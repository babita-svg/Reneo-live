import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { X, ShoppingCart, Check, ShieldCheck, Truck, ArrowRight, Star } from 'lucide-react';

export const ProductDetailModal: React.FC<{
  product: Product;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      
      {/* Product Detail Card Overlay */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row gap-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product High-Res Image */}
        <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-slate-950 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
            In Stock ({product.stock})
          </div>
        </div>

        {/* Product Information & Actions */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-slate-400 text-[11px] ml-1">(4.9/5)</span>
            </div>

            <h3 className="text-lg font-extrabold text-slate-100 mb-2 leading-tight">
              {product.name}
            </h3>

            <div className="text-2xl font-black text-amber-400 mb-3">
              ${product.price.toFixed(2)} <span className="text-xs text-slate-400 font-medium">USD</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-4">
              {product.description}
            </p>

            <div className="space-y-1.5 py-3 border-y border-slate-800 text-[11px] text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct artisan trade • Verified seller</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Express courier delivery across East & West Africa</span>
              </div>
            </div>
          </div>

          {/* Quantity Controls & Add To Cart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Quantity</span>
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-slate-300 font-bold hover:text-white"
                >
                  -
                </button>
                <span className="px-2 text-xs font-bold text-amber-400">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1 text-slate-300 font-bold hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                added
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart • ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
