import React, { useEffect, useRef, useState } from 'react';
import { useLive } from '../context/LiveContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AgoraManager } from '../lib/agora';
import { ProductDetailModal } from './ProductDetailModal';
import {
  Radio,
  Users,
  Send,
  Eye,
  ShoppingCart,
  Heart,
  Flame,
  ThumbsUp,
  Sparkles,
  ArrowLeft,
  X,
  Share2,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';

export const LiveStreamCustomer: React.FC<{ onLeaveStream: () => void }> = ({ onLeaveStream }) => {
  const {
    currentSession,
    chatMessages,
    sendChatMessage,
    sendEmojiReaction,
    floatingEmojis,
    selectedProductForDetail,
    setSelectedProductForDetail,
    addStreamError
  } = useLive();

  const { user } = useAuth();
  const { addToCart } = useCart();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const agoraRef = useRef<AgoraManager | null>(null);

  const [messageText, setMessageText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Requirement A5: Customer joins stream as AUDIENCE / SUBSCRIBER role. Must NOT publish stream.
  useEffect(() => {
    const manager = new AgoraManager();
    agoraRef.current = manager;

    const channelName = currentSession?.live_id || 'reneo_demo_channel';
    const numericUid = Math.floor(Math.random() * 899999) + 100000;

    manager.joinAudience(
      channelName,
      numericUid,
      (remoteVideoTrack) => {
        if (videoContainerRef.current) {
          videoContainerRef.current.innerHTML = '';
          remoteVideoTrack.play(videoContainerRef.current);
        }
      },
      (_remoteAudioTrack) => {
        // Remote host audio played automatically
      },
      {
        onStreamEnded: () => {
          addStreamError({
            id: `err_${Date.now()}`,
            type: 'ended',
            title: 'Live Stream Ended',
            message: 'The seller has ended this live broadcast session.',
          });
        },
      }
    );

    return () => {
      manager.stopAndLeave();
    };
  }, [currentSession?.live_id, addStreamError]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendChatMessage(messageText);
    setMessageText('');
  };

  const handleQuickAddToCart = () => {
    if (currentSession?.product) {
      addToCart(currentSession.product, 1);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    sendEmojiReaction(emoji);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onLeaveStream}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Live Feed
        </button>

        {addedToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg animate-bounce flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Item added to your cart!
          </div>
        )}
      </div>

      {/* Requirement A9: Responsive Layout (Mobile overlay & Desktop Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Stream Stage (2 cols on Desktop, Full Overlay on Mobile) */}
        <div className="lg:col-span-2 relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl aspect-[9/16] sm:aspect-video flex flex-col justify-between">
          
          {/* Agora Stream Video Canvas */}
          <div ref={videoContainerRef} className="absolute inset-0 w-full h-full object-cover z-0" />

          {/* Floating Emoji Reaction Layer (Part B Bonus) */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {floatingEmojis.map((e) => (
              <span
                key={e.id}
                style={{ left: `${e.leftPercent}%` }}
                className="absolute bottom-20 text-2xl animate-floatUp opacity-90 transition-all"
              >
                {e.emoji}
              </span>
            ))}
          </div>

          {/* Top Host Info Overlay */}
          <div className="relative z-20 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800">
              <img
                src={currentSession?.host_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                alt={currentSession?.host_name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-red-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{currentSession?.host_name}</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase bg-red-600 text-white rounded-full">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Host Broadcaster</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-xs font-bold text-amber-400">
                <Users className="w-3.5 h-3.5" />
                <span>{currentSession?.viewer_count || 1}</span>
              </div>

              <button
                onClick={handleToggleMute}
                className="p-2 bg-slate-950/70 backdrop-blur-md text-slate-200 rounded-2xl border border-slate-800"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bottom Live Commerce Product Showcase Banner (Requirement A6) */}
          <div className="relative z-20 p-4 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent">
            {currentSession?.product && (
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl">
                <div className="flex items-center gap-3">
                  <img
                    src={currentSession.product.image}
                    alt={currentSession.product.name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-500/50"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Featured Product
                    </span>
                    <p className="text-xs font-extrabold text-slate-100 line-clamp-1">
                      {currentSession.product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-amber-400">
                        ${currentSession.product.price.toFixed(2)} USD
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Stock: {currentSession.product.stock}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirement A6: "View Product" & "Add to Cart" */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProductForDetail(currentSession.product!)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    View Product
                  </button>

                  <button
                    onClick={handleQuickAddToCart}
                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Live Stream Chat & Emoji Bar (Requirement A7 & Part B) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between h-[520px]">
          
          <div>
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                Live Customer Chat
              </h3>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
                Real-Time
              </span>
            </div>

            {/* Chat Messages */}
            <div className="mt-3 space-y-3 overflow-y-auto max-h-[340px] pr-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 text-xs">
                  <img
                    src={msg.user_avatar}
                    alt={msg.user_name}
                    className="w-6 h-6 rounded-full object-cover mt-0.5 ring-1 ring-slate-700"
                  />
                  <div className="flex-1 bg-slate-800/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-bold text-[11px] ${msg.user_role === 'seller' ? 'text-amber-400' : 'text-orange-400'}`}>
                        {msg.user_name} {msg.user_role === 'seller' && '(Host)'}
                      </span>
                      <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-snug">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Quick Floating Emoji Reaction Bar (Part B Bonus) */}
            <div className="flex items-center justify-around py-2 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2">
              {['❤️', '🔥', '👏', '🛍️', '😍'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-lg hover:scale-125 transition-transform p-1"
                  title="Send Reaction"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask seller a question or comment..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-md shadow-amber-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Non-Disruptive Product Inspection Modal Overlay (Requirement A6) */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
        />
      )}
    </div>
  );
};
