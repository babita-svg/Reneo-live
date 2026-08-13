import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    totalAmount,
    totalItemsCount,
    checkoutSuccess,
    processCheckout
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 p-6 text-slate-900 flex flex-col justify-between shadow-2xl">
          
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Your Live Cart</h2>
                <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full font-bold border border-blue-200">
                  {totalItemsCount}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkout Celebration Banner */}
            {checkoutSuccess ? (
              <div className="my-8 text-center p-6 bg-emerald-50 border border-emerald-200 rounded-xl animate-scaleUp">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-emerald-900">Order Placed Successfully!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Thank you for supporting African solo entrepreneurs on Reneo Live.
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Watch live streams to explore artisan goods and add them directly to your cart.
                </p>
              </div>
            ) : (
              /* Cart Items List */
              <div className="my-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-blue-600 font-bold mt-0.5">
                        ${item.product.price.toFixed(2)} USD
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary & Order Processing */}
          {items.length > 0 && !checkoutSuccess && (
            <div className="pt-4 border-t border-slate-200">
              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-blue-600">${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-3 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulated Order Checkout • No real charge</span>
              </div>

              <button
                onClick={processCheckout}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-2"
              >
                Complete Live Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
