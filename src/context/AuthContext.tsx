import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginDemoUser: (role: UserRole, name?: string) => void;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('reneo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Default demo user as Seller for instant evaluation
    return {
      id: 'demo-seller-101',
      name: 'Amara Koffi',
      email: 'amara@reneo.africa',
      role: 'seller',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      created_at: new Date().toISOString(),
    };
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('reneo_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('reneo_user');
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch or create profile in Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile);
        } else {
          const newProfile: UserProfile = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'Live Creator',
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as UserRole) || 'customer',
            created_at: new Date().toISOString(),
          };
          setUser(newProfile);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loginDemoUser = (role: UserRole, name?: string) => {
    const newUser: UserProfile = {
      id: role === 'seller' ? 'demo-seller-101' : 'demo-customer-202',
      name: name || (role === 'seller' ? 'Amara Koffi (Seller)' : 'Kofi Mensah (Buyer)'),
      email: role === 'seller' ? 'amara@reneo.africa' : 'kofi@reneo.africa',
      role,
      avatar_url: role === 'seller' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('reneo_user');
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginDemoUser, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
