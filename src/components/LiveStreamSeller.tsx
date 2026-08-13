import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Radio,
  Send,
  Sparkles,
  ShoppingBag,
  Heart,
  Smile,
  X,
  RefreshCw,
  Users,
} from 'lucide-react';
import { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { createAgoraClient, createLocalTracks, fetchAgoraToken } from '../lib/agora';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLive } from '../context/LiveContext';
import { Product } from '../types';

export const LiveStreamSeller: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const {
    activeSession,
    endLiveSession,
    products,
    switchFeaturedProduct,
    chatMessages,
    sendChatMessage,
    floatingEmojis,
    setError,
  } = useLive();

  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(142);
  const [hardwareError, setHardwareError] = useState<string | null>(null);

  const videoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<{ audio: IMicrophoneAudioTrack | null; video: ICameraVideoTrack | null }>({
    audio: null,
    video: null,
  });

  useEffect(() => {
    let mounted = true;

    async function initBroadcaster() {
      try {
        setHardwareError(null);
        const client = createAgoraClient();
        agoraClientRef.current = client;

        const channelName = activeSession?.channel_name || 'reneo-live-kente-showcase';
        const uid = Math.floor(Math.random() * 10000);

        // Get auth token from Supabase if configured
        let sessionAuthToken: string | undefined = undefined;
        try {
          const { data } = await supabase.auth.getSession();
          sessionAuthToken = data?.session?.access_token;
        } catch {
          // ignore if no session
        }

        // Fetch token from server with authentication & session ID
        let tokenData;
        try {
          tokenData = await fetchAgoraToken(channelName, uid, activeSession?.id, sessionAuthToken);
          if (tokenData.token && tokenData.appId) {
            await client.join(tokenData.appId, channelName, tokenData.token, uid);
          }
        } catch (tokenErr: any) {
          console.warn('Agora token request notice:', tokenErr);
          if (mounted) {
            setError(tokenErr.message || 'Agora token server error.');
          }
        }

        // Create mic & camera tracks
        try {
          const { audioTrack, videoTrack } = await createLocalTracks();
          localTracksRef.current = { audio: audioTrack, video: videoTrack };

          if (videoRef.current && videoTrack) {
            videoTrack.play(videoRef.current);
          }

          if (tokenData?.token) {
            await client.publish([audioTrack, videoTrack]);
          }

          if (mounted) {
            setIsLiveConnected(true);
          }
        } catch (mediaErr: any) {
          console.error('Hardware track error:', mediaErr);
          if (mounted) {
            setHardwareError(mediaErr.message || 'Camera or microphone access denied.');
            setError(mediaErr.message || 'Camera or microphone access denied.');
            setIsLiveConnected(true);
          }
        }
      } catch (err: any) {
        console.error('Broadcaster initialization error:', err);
        if (mounted) {
          setError(err.message || 'Failed to start live stream broadcast.');
          setIsLiveConnected(true);
        }
      }
    }

    initBroadcaster();

    return () => {
      mounted = false;
      if (localTracksRef.current.audio) {
        localTracksRef.current.audio.stop();
        localTracksRef.current.audio.close();
      }
      if (localTracksRef.current.video) {
        localTracksRef.current.video.stop();
        localTracksRef.current.video.close();
      }
      if (agoraClientRef.current) {
        agoraClientRef.current.leave();
      }
    };
  }, [activeSession]);

  const toggleMic = async () => {
    if (localTracksRef.current.audio) {
      await localTracksRef.current.audio.setEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
    }
  };

  const toggleVideo = async () => {
    if (localTracksRef.current.video) {
      await localTracksRef.current.video.setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleEndStream = async () => {
    if (activeSession) {
      await endLiveSession(activeSession.id);
    }
    onClose();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput.trim(), user?.name || 'Seller', 'seller');
    setMessageInput('');
  };

  const currentFeatured = activeSession?.featured_product || products[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Video Stream Stage */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Floating Emoji Reaction Canvas Overlay */}
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

        {/* Video Player */}
        <div ref={videoRef} className="w-full h-full object-cover bg-slate-900 flex items-center justify-center">
          {!videoEnabled && (
            <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
              <VideoOff className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-semibold">Camera is paused</p>
            </div>
          )}
        </div>

        {/* Floating Top Controls & Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">LIVE</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{viewerCount}</span>
            </div>
          </div>

          <button
            onClick={handleEndStream}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 transition-all"
          >
            <X className="w-4 h-4" />
            <span>End Live Session</span>
          </button>
        </div>

        {/* Featured Product Overlay on Stream */}
        {currentFeatured && (
          <div className="absolute bottom-20 left-4 right-4 sm:right-auto sm:max-w-sm bg-slate-900/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 z-20 shadow-2xl flex items-center space-x-3">
            <img
              src={currentFeatured.image_url}
              alt={currentFeatured.title}
              className="w-14 h-14 rounded-xl object-cover border border-slate-800"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Featured Product</span>
              </div>
              <p className="text-xs font-bold text-white truncate">{currentFeatured.title}</p>
              <p className="text-xs font-extrabold text-amber-400">${currentFeatured.price} USD</p>
            </div>
          </div>
        )}

        {/* Broadcaster Bottom Bar Studio Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 z-20 shadow-2xl">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-xl transition-all ${
              micEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
            title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
          >
            {micEnabled ? <Mic className="w-5 h-5 text-amber-400" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-xl transition-all ${
              videoEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
            title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {videoEnabled ? <Video className="w-5 h-5 text-amber-400" /> : <VideoOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Right Sidebar: Product Switcher & Live Chat Room */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-80 lg:h-full">
        {/* Product Switcher Panel */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Switch Featured Product Live</span>
          </p>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => activeSession && switchFeaturedProduct(activeSession.id, p.id)}
                className={`flex-shrink-0 flex items-center space-x-2 p-2 rounded-xl border text-left transition-all ${
                  p.id === currentFeatured?.id
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <img src={p.image_url} alt={p.title} className="w-8 h-8 rounded-lg object-cover" />
                <div className="text-left">
                  <p className="text-xs font-semibold truncate max-w-[100px]">{p.title}</p>
                  <p className="text-[10px] text-amber-400 font-bold">${p.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Chat Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="text-center my-2">
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live Room Chat
            </span>
          </div>

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
              <p className="text-slate-200 bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                {msg.message}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Reply in live chat..."
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
    </div>
  );
};
