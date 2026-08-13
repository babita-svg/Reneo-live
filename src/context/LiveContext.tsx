import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChatMessage, LiveSession, Product } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    seller_id: 'demo-seller-101',
    title: 'Handcrafted Kente Pattern Tote Bag',
    description: 'Authentic Ghanaian woven Kente canvas tote bag with reinforced leather handles. Spacious, durable, and stylish for daily work or travel.',
    price: 45,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    stock: 12,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    seller_id: 'demo-seller-101',
    title: 'Organic Raw Shea Butter Cream (250g)',
    description: '100% natural cold-pressed shea butter infused with lavender and baobab oil. Deeply moisturizing for skin and hair.',
    price: 18,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1608248597261-833258657640?auto=format&fit=crop&q=80&w=600',
    stock: 25,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    seller_id: 'demo-seller-101',
    title: 'Ankara Print Kimono Jacket',
    description: 'Vibrant African Ankara print lightweight unisex kimono jacket. Perfect statement piece for modern fashion enthusiasts.',
    price: 65,
    currency: 'USD',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    stock: 8,
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_SESSIONS: LiveSession[] = [
  {
    id: 'session-live-1',
    seller_id: 'demo-seller-101',
    seller_name: 'Amara Koffi',
    title: '✨ Live Showcase: Handwoven Kente Bags & Summer Kimonos!',
    channel_name: 'reneo-live-kente-showcase',
    current_product_id: 'prod-1',
    featured_product: INITIAL_PRODUCTS[0],
    status: 'live',
    viewer_count: 142,
    created_at: new Date().toISOString(),
  },
];

interface LiveContextType {
  products: Product[];
  liveSessions: LiveSession[];
  activeSession: LiveSession | null;
  chatMessages: ChatMessage[];
  error: string | null;
  setError: (err: string | null) => void;
  createProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  startLiveSession: (title: string, selectedProductId?: string) => Promise<LiveSession>;
  endLiveSession: (sessionId: string) => Promise<void>;
  joinLiveSession: (session: LiveSession) => void;
  leaveActiveSession: () => void;
  switchFeaturedProduct: (sessionId: string, productId: string) => void;
  sendChatMessage: (message: string, userName: string, role: 'seller' | 'customer') => void;
  sendEmojiReaction: (emoji: string) => void;
  floatingEmojis: { id: string; emoji: string; left: number }[];
}

const LiveContext = createContext<LiveContextType | undefined>(undefined);

export const LiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('reneo_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => {
    const saved = localStorage.getItem('reneo_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [activeSession, setActiveSession] = useState<LiveSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      user_name: 'Fatou',
      user_role: 'customer',
      message: 'Hello Amara! Loving the fabric pattern on that Kente tote! 😍',
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'msg-2',
      user_name: 'Kofi',
      user_role: 'customer',
      message: 'Is shipping available to Nairobi, Kenya?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 'msg-3',
      user_name: 'Amara Koffi',
      user_role: 'seller',
      message: 'Yes Kofi! We ship across East & West Africa via express delivery 🚚',
      timestamp: new Date(Date.now() - 30000).toISOString(),
    },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; left: number }[]>([]);

  useEffect(() => {
    localStorage.setItem('reneo_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('reneo_sessions', JSON.stringify(liveSessions));
  }, [liveSessions]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Supabase Realtime subscription for live_sessions
    const sessionChannel = supabase
      .channel('public:live_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLiveSessions((prev) => [payload.new as LiveSession, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setLiveSessions((prev) =>
            prev.map((s) => (s.id === payload.new.id ? { ...s, ...payload.new } : s))
          );
          if (activeSession && activeSession.id === payload.new.id) {
            setActiveSession((prev) => (prev ? { ...prev, ...payload.new } : null));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [activeSession?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured || !activeSession) return;

    // Realtime subscription specifically for current live session messages
    const messageChannel = supabase
      .channel(`live_messages:${activeSession.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_messages',
        filter: `live_id=eq.${activeSession.id}`,
      }, (payload) => {
        const newMsg = payload.new;
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            user_name: newMsg.user_name || 'Anonymous',
            user_role: newMsg.user_role || 'customer',
            message: newMsg.message,
            timestamp: newMsg.created_at || new Date().toISOString(),
          }];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [activeSession?.id]);

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').insert([newProd]).select().single();
      if (!error && data) {
        setProducts((prev) => [data, ...prev]);
        return data;
      }
    }

    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const startLiveSession = async (title: string, selectedProductId?: string): Promise<LiveSession> => {
    const featured = products.find((p) => p.id === selectedProductId) || products[0];
    const newSession: LiveSession = {
      id: `session-${Date.now()}`,
      seller_id: 'demo-seller-101',
      seller_name: 'Amara Koffi',
      title: title || '🔥 Live Shopping Special',
      channel_name: `channel-${Date.now()}`,
      current_product_id: featured?.id,
      featured_product: featured,
      status: 'live',
      viewer_count: 1,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('live_sessions').insert([newSession]).select().single();
      if (!error && data) {
        setLiveSessions((prev) => [data, ...prev]);
        setActiveSession(data);
        return data;
      }
    }

    setLiveSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
    return newSession;
  };

  const endLiveSession = async (sessionId: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'ended' } : s))
    );

    if (activeSession?.id === sessionId) {
      setActiveSession((prev) => (prev ? { ...prev, status: 'ended' } : null));
    }

    if (isSupabaseConfigured) {
      await supabase.from('live_sessions').update({ status: 'ended' }).eq('id', sessionId);
    }
  };

  const joinLiveSession = (session: LiveSession) => {
    const updated = {
      ...session,
      viewer_count: session.viewer_count + 1,
      featured_product: session.featured_product || products.find((p) => p.id === session.current_product_id) || products[0],
    };
    setActiveSession(updated);
  };

  const leaveActiveSession = () => {
    setActiveSession(null);
  };

  const switchFeaturedProduct = (sessionId: string, productId: string) => {
    const newFeatured = products.find((p) => p.id === productId);
    if (!newFeatured) return;

    setLiveSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, current_product_id: productId, featured_product: newFeatured }
          : s
      )
    );

    if (activeSession && activeSession.id === sessionId) {
      setActiveSession((prev) =>
        prev ? { ...prev, current_product_id: productId, featured_product: newFeatured } : null
      );
    }

    if (isSupabaseConfigured) {
      supabase
        .from('live_sessions')
        .update({ current_product_id: productId })
        .eq('id', sessionId);
    }
  };

  const sendChatMessage = (message: string, userName: string, role: 'seller' | 'customer') => {
    const trimmed = message.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      setError('Chat message is too long (maximum 500 characters).');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_name: userName,
      user_role: role,
      message: trimmed,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    if (isSupabaseConfigured && activeSession) {
      supabase.from('live_messages').insert([
        {
          live_id: activeSession.id,
          user_name: userName,
          user_role: role,
          message: trimmed,
        },
      ]).then(({ error }) => {
        if (error) {
          console.warn('Live message insert error:', error.message);
        }
      });
    }
  };

  const sendEmojiReaction = (emoji: string) => {
    const reactionId = `reaction-${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 70) + 15; // 15% to 85% width position
    setFloatingEmojis((prev) => [...prev, { id: reactionId, emoji, left }]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== reactionId));
    }, 2500);
  };

  return (
    <LiveContext.Provider
      value={{
        products,
        liveSessions,
        activeSession,
        chatMessages,
        error,
        setError,
        createProduct,
        startLiveSession,
        endLiveSession,
        joinLiveSession,
        leaveActiveSession,
        switchFeaturedProduct,
        sendChatMessage,
        sendEmojiReaction,
        floatingEmojis,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
};

export const useLive = () => {
  const context = useContext(LiveContext);
  if (!context) {
    throw new Error('useLive must be used within a LiveProvider');
  }
  return context;
};
