import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_DEMO_PROFILES, isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsDemoSeller: () => void;
  loginAsDemoCustomer: () => void;
  loginWithEmail: (email: string, role: UserRole) => Promise<void>;
  signUpWithEmail: (name: string, email: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'reneo_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default seller
      }
    }
    return INITIAL_DEMO_PROFILES[0] as UserProfile; // Default to Seller for rich immediate interface
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user]);

  const loginAsDemoSeller = () => {
    const seller = INITIAL_DEMO_PROFILES.find((p) => p.role === 'seller') || INITIAL_DEMO_PROFILES[0];
    setUser(seller as UserProfile);
  };

  const loginAsDemoCustomer = () => {
    const customer = INITIAL_DEMO_PROFILES.find((p) => p.role === 'customer') || INITIAL_DEMO_PROFILES[1];
    setUser(customer as UserProfile);
  };

  const loginWithEmail = async (email: string, targetRole: UserRole) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'password123',
        });
        if (error) console.warn('Supabase auth sign in notice:', error.message);
      }

      const existingProfile = INITIAL_DEMO_PROFILES.find((p) => p.email === email);
      if (existingProfile) {
        setUser({ ...existingProfile, role: targetRole } as UserProfile);
      } else {
        const newProfile: UserProfile = {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0],
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300`,
          role: targetRole,
          email,
          created_at: new Date().toISOString(),
        };
        setUser(newProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, newRole: UserRole) => {
    setIsLoading(true);
    try {
      const newProfile: UserProfile = {
        id: `usr_${Date.now()}`,
        name,
        avatar: newRole === 'seller' 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        role: newRole,
        email,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signUp({
          email,
          password: 'password123',
          options: {
            data: { name, role: newRole, avatar: newProfile.avatar },
          },
        });
      }

      setUser(newProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    } else {
      if (newRole === 'seller') loginAsDemoSeller();
      else loginAsDemoCustomer();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAuthenticated: Boolean(user),
        isLoading,
        loginAsDemoSeller,
        loginAsDemoCustomer,
        loginWithEmail,
        signUpWithEmail,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
