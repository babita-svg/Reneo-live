import React, { useEffect, useRef, useState } from 'react';
import { useLive } from '../context/LiveContext';
import { useAuth } from '../context/AuthContext';
import { AgoraManager } from '../lib/agora';
import { Product } from '../types';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
  Maximize2,
  PhoneOff,
  Radio,
  Users,
  Send,
  Package,
  Layers,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const LiveStreamSeller: React.FC<{ onBackToDashboard: () => void }> = ({ onBackToDashboard }) => {
  const { currentSession, endLiveSession, chatMessages, sendChatMessage, products, switchFeaturedProduct, addStreamError } = useLive();
  const { user } = useAuth();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const agoraRef = useRef<AgoraManager | null>(null);

  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showProductSwitcher, setShowProductSwitcher] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Broadcaster Stream
  useEffect(() => {
    let isSubscribed = true;
    const manager = new AgoraManager();
    agoraRef.current = manager;

    const channelName = currentSession?.live_id || 'reneo_demo_channel';
    const numericUid = Math.floor(Math.random() * 899999) + 100000;

    const startBroadcasting = async () => {
      if (!videoContainerRef.current) return;

      const result = await manager.startHostBroadcast(
        channelName,
        numericUid,
        videoContainerRef.current,
        {
          onError: (err) => {
            addStreamError({
              id: `err_${Date.now()}`,
              type: 'camera_denied',
              title: err.title,
              message: err.message,
              actionableText: 'System auto-switched to HD test video stream.',
            });
          },
        }
      );

      if (isSubscribed) {
        setAudioMuted(result.audioMuted);
        setVideoMuted(result.videoMuted);
        setUsingFallback(result.usingFallbackVideo);
      }
    };

    startBroadcasting();

    return () => {
      isSubscribed = false;
      manager.stopAndLeave();
    };
  }, [currentSession?.live_id, addStreamError]);

  // Seller Controls
  const handleToggleAudio = async () => {
    const nextState = !audioMuted;
    setAudioMuted(nextState);
    if (agoraRef.current) {
      await agoraRef.current.toggleMuteAudio(nextState);
    }
  };

  const handleToggleVideo = async () => {
    const nextState = !videoMuted;
    setVideoMuted(nextState);
    if (agoraRef.current) {
      await agoraRef.current.toggleMuteVideo(nextState);
    }
  };

  const handleSwitchCamera = async () => {
    if (agoraRef.current) {
      await agoraRef.current.switchCamera();
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Requirement A4/A5: Ending live persists status change to backend!
  const handleEndLive = async () => {
    if (currentSession) {
      await endLiveSession(currentSession.live_id);
    }
    if (agoraRef.current) {
      await agoraRef.current.stopAndLeave();
    }
    onBackToDashboard();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendChatMessage(messageText);
    setMessageText('');
  };

  const handleSelectFeatured = (product: Product) => {
    if (currentSession) {
      switchFeaturedProduct(currentSession.live_id, product.id);
    }
    setShowProductSwitcher(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Broadcaster Video Stage (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Broadcaster Video Canvas Card */}
          <div className="relative aspect-video bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            
            {/* Camera Track Container */}
            <div ref={videoContainerRef} className="w-full h-full object-cover" />

            {/* Top Bar Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE HOST
                </span>
                <span className="text-xs font-bold text-slate-200 line-clamp-1 max-w-[180px]">
                  {currentSession?.title}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-xs font-bold text-amber-400">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{currentSession?.viewer_count || 1} watching</span>
              </div>
            </div>

            {/* Fallback Camera Stream Notice */}
            {usingFallback && (
              <div className="absolute top-16 left-4 bg-amber-500/90 text-slate-950 text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 z-20">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>HD Synthetic Test Video Stream Active</span>
              </div>
            )}

            {/* Featured Product Banner Overlay */}
            {currentSession?.product && (
              <div className="absolute bottom-20 left-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <img
                    src={currentSession.product.image}
                    alt={currentSession.product.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/40"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Currently Presenting
                    </span>
                    <p className="text-xs font-bold text-slate-100 line-clamp-1">
                      {currentSession.product.name}
                    </p>
                    <p className="text-xs text-amber-300 font-bold">
                      ${currentSession.product.price.toFixed(2)} USD • Stock: {currentSession.product.stock}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowProductSwitcher(!showProductSwitcher)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Switch Item
                </button>
              </div>
            )}

            {/* Requirement A5: Seller Controls Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-lg px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-3 z-30 shadow-2xl">
              
              {/* Mute/Unmute Audio */}
              <button
                onClick={handleToggleAudio}
                className={`p-2.5 rounded-xl transition ${
                  audioMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {audioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Camera On/Off */}
              <button
                onClick={handleToggleVideo}
                className={`p-2.5 rounded-xl transition ${
                  videoMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {videoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              {/* Switch Camera */}
              <button
                onClick={handleSwitchCamera}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                title="Switch Camera (Facing Mode)"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={handleToggleFullscreen}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-slate-800 mx-1" />

              {/* End Live Broadcast */}
              <button
                onClick={handleEndLive}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/20 transition"
                title="End Broadcast (Persists to Backend)"
              >
                <PhoneOff className="w-4 h-4" />
                End Stream
              </button>
            </div>
          </div>

          {/* Switch Featured Product Picker Popover */}
          {showProductSwitcher && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Switch Featured Product on the Fly
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectFeatured(p)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                      currentSession?.product_id === p.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-amber-400">${p.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Live Chat Stream Side Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between h-[520px]">
          <div>
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                Host Chat & Live Stream Log
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                Supabase Realtime
              </span>
            </div>

            {/* Chat Messages List */}
            <div className="mt-3 space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 text-xs">
                  <img
                    src={msg.user_avatar}
                    alt={msg.user_name}
                    className="w-6 h-6 rounded-full object-cover mt-0.5 ring-1 ring-slate-700"
                  />
                  <div className="flex-1 bg-slate-800/60 p-2 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-amber-400 text-[11px]">{msg.user_name}</span>
                      <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 text-xs leading-snug">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send Chat Form */}
          <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Announce or reply to viewers..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
