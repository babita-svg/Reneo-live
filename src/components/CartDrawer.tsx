import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    totalAmount,
  } = useCart();

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Your Shopping Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {checkoutSuccess ? (
            <div className="text-center py-12 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Order Confirmed!</h3>
              <p className="text-xs text-slate-400">
                Thank you for supporting African live commerce creators. A confirmation receipt has been sent.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">Your cart is empty</p>
              <p className="text-xs text-slate-500">Explore live streams to add featured products</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center space-x-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.title}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.product.title}</h4>
                  <p className="text-xs text-amber-400 font-extrabold mt-0.5">
                    ${item.product.price} USD
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center hover:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && !checkoutSuccess && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Subtotal</span>
              <span className="text-lg font-bold text-amber-400">${totalAmount.toFixed(2)} USD</span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Mobile Money & Card Payments Secured</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Complete Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
