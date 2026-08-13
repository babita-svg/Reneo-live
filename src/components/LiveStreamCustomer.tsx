import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Send,
  ShoppingBag,
  Sparkles,
  Users,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { IAgoraRTCClient, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import { createAgoraClient, fetchAgoraToken } from '../lib/agora';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLive } from '../context/LiveContext';
import { LiveSession } from '../types';
import { ProductDetailModal } from './ProductDetailModal';

export const LiveStreamCustomer: React.FC<{
  session: LiveSession;
  onClose: () => void;
}> = ({ session, onClose }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const {
    products,
    chatMessages,
    sendChatMessage,
    sendEmojiReaction,
    floatingEmojis,
  } = useLive();

  const [messageInput, setMessageInput] = useState('');
  const [muted, setMuted] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any>(null);

  const videoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initAudience() {
      try {
        const client = createAgoraClient();
        agoraClientRef.current = client;

        const channelName = session.channel_name || 'reneo-live-kente-showcase';
        const uid = Math.floor(Math.random() * 10000);

        // Fetch token from server with SUBSCRIBER role
        const tokenData = await fetchAgoraToken(channelName, uid, 'audience');

        // Handle remote stream publishing events
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video' && videoRef.current) {
            user.videoTrack?.play(videoRef.current);
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        if (tokenData.token && tokenData.appId && !tokenData.isMock) {
          await client.join(tokenData.appId, channelName, tokenData.token, uid);
        }
      } catch (err) {
        console.warn('Audience Agora stream fallback:', err);
      }
    }

    initAudience();

    return () => {
      mounted = false;
      if (agoraClientRef.current) {
        agoraClientRef.current.leave();
      }
    };
  }, [session]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput.trim(), user?.name || 'Customer', 'customer');
    setMessageInput('');
  };

  const handleEmojiClick = (emoji: string) => {
    sendEmojiReaction(emoji);
  };

  const currentFeatured = session.featured_product || products[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Video Stream Viewer Screen */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Floating Emoji Canvas Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingEmojis.map((e) => (
            <div
              key={e.id}
              style={{ left: `${e.left}%` }}
              className="absolute bottom-12 text-3xl animate-float opacity-90 transition-all duration-1000"
            >
              {e.emoji}
            </div>
          ))}
        </div>

        {/* Video Canvas Container */}
        <div
          ref={videoRef}
          className="w-full h-full object-cover bg-slate-900 flex items-center justify-center relative"
        >
          {/* Simulated HD Live Stream Video background when camera feed is simulated */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentFeatured?.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200'}
              alt="Live Stream Streamer"
              className="w-full h-full object-cover opacity-80 filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />
          </div>
        </div>

        {/* Top Bar Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">LIVE</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{session.viewer_count || 142}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Left: Featured Commerce Overlay Card */}
        {currentFeatured && (
          <div className="absolute bottom-6 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-4 z-20 shadow-2xl flex items-center space-x-4">
            <img
              src={currentFeatured.image_url}
              alt={currentFeatured.title}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-800 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Now Showcasing</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">{currentFeatured.title}</h4>
              <p className="text-sm font-extrabold text-amber-400">${currentFeatured.price} USD</p>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => addToCart(currentFeatured)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy</span>
              </button>

              <button
                onClick={() => setSelectedProductForModal(currentFeatured)}
                className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 underline text-center"
              >
                Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Chat Room & Interactive Reactions */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-80 lg:h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs font-bold text-white">Stream Chat</p>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold">{session.seller_name}</span>
        </div>

        {/* Live Chat Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="text-xs space-y-0.5 animate-fade-in">
              <div className="flex items-center space-x-1.5">
                <span
                  className={`font-bold ${
                    msg.user_role === 'seller' ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  {msg.user_name}
                </span>
                {msg.user_role === 'seller' && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    HOST
                  </span>
                )}
              </div>
              <p className="text-slate-200 bg-slate-800/60 p-2.5 rounded-xl border border-slate-800/80">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {/* Floating Reaction Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-around">
          {['❤️', '🔥', '👏', '😍', '🎉'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1.5 bg-slate-800/40 hover:bg-slate-800 rounded-xl"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask a question or comment..."
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="p-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </div>
  );
};
