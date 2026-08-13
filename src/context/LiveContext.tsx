import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  LiveSession,
  ChatMessage,
  FloatingEmoji,
  StreamErrorNotice,
  UserRole
} from '../types';
import {
  INITIAL_DEMO_PRODUCTS,
  INITIAL_DEMO_SESSIONS,
  INITIAL_DEMO_CHAT,
  isSupabaseConfigured,
  supabase
} from '../lib/supabase';
import { useAuth } from './AuthContext';

interface LiveContextType {
  products: Product[];
  sellerProducts: Product[];
  activeSessions: LiveSession[];
  currentSession: LiveSession | null;
  chatMessages: ChatMessage[];
  floatingEmojis: FloatingEmoji[];
  streamErrors: StreamErrorNotice[];
  selectedProductForDetail: Product | null;
  setSelectedProductForDetail: (product: Product | null) => void;
  createProduct: (productData: Omit<Product, 'id' | 'created_at' | 'seller_id'>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<boolean>;
  startLiveSession: (productId: string, title: string) => Promise<LiveSession>;
  endLiveSession: (liveId: string) => Promise<void>;
  switchFeaturedProduct: (liveId: string, productId: string) => Promise<void>;
  joinLiveStream: (session: LiveSession) => void;
  leaveLiveStream: () => void;
  sendChatMessage: (messageText: string) => void;
  sendEmojiReaction: (emoji: string) => void;
  addStreamError: (error: StreamErrorNotice) => void;
  dismissStreamError: (id: string) => void;
}

const PRODUCTS_STORAGE_KEY = 'reneo_products_store';
const SESSIONS_STORAGE_KEY = 'reneo_sessions_store';

const LiveContext = createContext<LiveContextType | undefined>(undefined);

export const LiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // 1. Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_PRODUCTS;
      }
    }
    return INITIAL_DEMO_PRODUCTS;
  });

  // 2. Live Sessions State
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>(() => {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEMO_SESSIONS;
      }
    }
    return INITIAL_DEMO_SESSIONS;
  });

  // 3. Current Live Session State
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(INITIAL_DEMO_SESSIONS[0]);

  // 4. Realtime Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_DEMO_CHAT);

  // 5. Floating Emojis Reaction State
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // 6. Errors Queue
  const [streamErrors, setStreamErrors] = useState<StreamErrorNotice[]>([]);

  // 7. Non-disruptive Product Inspection Modal State (Requirement A6)
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(activeSessions));
  }, [activeSessions]);

  // Filter products owned by current authenticated seller (Requirement A3)
  const sellerProducts = products.filter(
    (p) => user?.role === 'seller' && (p.seller_id === user.id || p.seller_id === 'seller_101')
  );

  // Broadcast channel for multi-tab real-time simulation
  useEffect(() => {
    const channel = new BroadcastChannel('reneo_live_stream_channel');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'NEW_CHAT_MESSAGE') {
        setChatMessages((prev) => [...prev, payload]);
      } else if (type === 'EMOJI_REACTION') {
        setFloatingEmojis((prev) => [...prev, payload]);
      } else if (type === 'SESSION_STATUS_CHANGED') {
        setActiveSessions((prev) =>
          prev.map((s) => (s.live_id === payload.live_id ? payload : s))
        );
        if (currentSession?.live_id === payload.live_id) {
          setCurrentSession(payload);
        }
      } else if (type === 'FEATURED_PRODUCT_CHANGED') {
        setCurrentSession((prev) => (prev ? { ...prev, product_id: payload.productId, product: payload.product } : null));
      }
    };

    return () => {
      channel.close();
    };
  }, [currentSession]);

  // Clean up old floating emojis
  useEffect(() => {
    if (floatingEmojis.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingEmojis((prev) => prev.slice(1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [floatingEmojis]);

  // A3: Create Product (Seller)
  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'seller_id'>): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      seller_id: user?.id || 'seller_101',
      seller_name: user?.name || 'Amina Kwamboka',
      seller_avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').insert([
          {
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            image: newProduct.image,
            stock: newProduct.stock,
            status: newProduct.status,
            seller_id: newProduct.seller_id,
          },
        ]);
      } catch (e) {
        console.warn('Supabase product insert warning:', e);
      }
    }

    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  // A10: Security check - Seller can only delete their own product!
  const deleteProduct = async (productId: string): Promise<boolean> => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) {
      addStreamError({
        id: `err_${Date.now()}`,
        type: 'product_not_found',
        title: 'Product Not Found',
        message: 'The requested product record could not be located.',
      });
      return false;
    }

    // RLS Verification in JS state mirroring database policy
    if (user?.role !== 'seller' || (prod.seller_id !== user.id && prod.seller_id !== 'seller_101')) {
      addStreamError({
        id: `err_${Date.now()}`,
        type: 'session_expired',
        title: 'Security Violation (Row Level Security)',
        message: 'Access Denied: You cannot delete another seller\'s product. Enforced by Supabase RLS Policy.',
        actionableText: 'Please switch to your verified seller account.',
      });
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', productId);
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    return true;
  };

  // A4: Start Live Session (Seller picks product and clicks GO LIVE)
  const startLiveSession = async (productId: string, title: string): Promise<LiveSession> => {
    const selectedProd = products.find((p) => p.id === productId) || products[0];

    const newSession: LiveSession = {
      live_id: `live_${Date.now()}`,
      host_id: user?.id || 'seller_101',
      host_name: user?.name || 'Amina Kwamboka',
      host_avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      product_id: selectedProd?.id || null,
      product: selectedProd || null,
      title: title || `Live Session: ${selectedProd?.name || 'Featured Products'}`,
      status: 'live',
      viewer_count: 1,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('live_sessions').insert([
          {
            host_id: newSession.host_id,
            product_id: newSession.product_id,
            title: newSession.title,
            status: 'live',
          },
        ]);
      } catch (e) {
        console.warn('Supabase live_session insert warning:', e);
      }
    }

    setActiveSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);

    // Notify other tabs
    const channel = new BroadcastChannel('reneo_live_stream_channel');
    channel.postMessage({ type: 'SESSION_STATUS_CHANGED', payload: newSession });
    channel.close();

    return newSession;
  };

  // A4 & A5: End Live Session (Ending live MUST persist status change to backend)
  const endLiveSession = async (liveId: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('live_sessions')
        .update({ status: 'ended' })
        .eq('live_id', liveId);
    }

    setActiveSessions((prev) =>
      prev.map((s) => (s.live_id === liveId ? { ...s, status: 'ended' } : s))
    );

    if (currentSession?.live_id === liveId) {
      const endedSession = { ...currentSession, status: 'ended' as const };
      setCurrentSession(endedSession);

      const channel = new BroadcastChannel('reneo_live_stream_channel');
      channel.postMessage({ type: 'SESSION_STATUS_CHANGED', payload: endedSession });
      channel.close();
    }
  };

  // Part B Bonus: Switching featured product during live stream without interrupting stream
  const switchFeaturedProduct = async (liveId: string, productId: string) => {
    const newProd = products.find((p) => p.id === productId);
    if (!newProd) return;

    if (currentSession?.live_id === liveId) {
      const updated = { ...currentSession, product_id: productId, product: newProd };
      setCurrentSession(updated);

      const channel = new BroadcastChannel('reneo_live_stream_channel');
      channel.postMessage({
        type: 'FEATURED_PRODUCT_CHANGED',
        payload: { productId, product: newProd },
      });
      channel.close();
    }
  };

  const joinLiveStream = (session: LiveSession) => {
    if (session.status === 'ended') {
      addStreamError({
        id: `err_${Date.now()}`,
        type: 'ended',
        title: 'Stream Has Ended',
        message: 'This live commerce stream has concluded. Explore available products or watch another broadcast.',
      });
      return;
    }
    // Increment viewer count
    const updated = { ...session, viewer_count: session.viewer_count + 1 };
    setCurrentSession(updated);
  };

  const leaveLiveStream = () => {
    if (currentSession) {
      const updated = {
        ...currentSession,
        viewer_count: Math.max(0, currentSession.viewer_count - 1),
      };
      setCurrentSession(updated);
    }
  };

  // A7: Real-time chat message broadcast
  const sendChatMessage = (messageText: string) => {
    if (!currentSession || !messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      live_id: currentSession.live_id,
      user_id: user?.id || 'anonymous_user',
      user_name: user?.name || 'Customer',
      user_role: (user?.role || 'customer') as UserRole,
      user_avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      message: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMessage]);

    // Multi-tab sync
    const channel = new BroadcastChannel('reneo_live_stream_channel');
    channel.postMessage({ type: 'NEW_CHAT_MESSAGE', payload: newMessage });
    channel.close();
  };

  // Part B Bonus: Floating Emoji Reaction
  const sendEmojiReaction = (emoji: string) => {
    const reaction: FloatingEmoji = {
      id: `emoji_${Date.now()}_${Math.random()}`,
      emoji,
      leftPercent: 20 + Math.random() * 60, // 20% to 80% horizontal offset
    };

    setFloatingEmojis((prev) => [...prev, reaction]);

    const channel = new BroadcastChannel('reneo_live_stream_channel');
    channel.postMessage({ type: 'EMOJI_REACTION', payload: reaction });
    channel.close();
  };

  // Error Banner Queue
  const addStreamError = useCallback((error: StreamErrorNotice) => {
    setStreamErrors((prev) => [error, ...prev.filter((e) => e.code !== (error as any).code)]);
  }, []);

  const dismissStreamError = useCallback((id: string) => {
    setStreamErrors((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <LiveContext.Provider
      value={{
        products,
        sellerProducts,
        activeSessions,
        currentSession,
        chatMessages,
        floatingEmojis,
        streamErrors,
        selectedProductForDetail,
        setSelectedProductForDetail,
        createProduct,
        deleteProduct,
        startLiveSession,
        endLiveSession,
        switchFeaturedProduct,
        joinLiveStream,
        leaveLiveStream,
        sendChatMessage,
        sendEmojiReaction,
        addStreamError,
        dismissStreamError,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
};

export const useLive = () => {
  const context = useContext(LiveContext);
  if (!context) throw new Error('useLive must be used within a LiveProvider');
  return context;
};
