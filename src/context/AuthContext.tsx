import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isMockMode: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProtectedReserve: (newBase: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'app_portal_auth_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            await fetchProfile(session.user.id, session.user.email || '');
          }
        } catch (err) {
          console.error('Error fetching Supabase session:', err);
        } finally {
          setLoading(false);
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email || '' });
            await fetchProfile(session.user.id, session.user.email || '');
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } else {
        // Local fallback mode
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser({ id: parsed.id, email: parsed.email });
            setProfile(parsed);
          } catch {
            // reset if corrupted
          }
        }
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data as UserProfile);
      } else {
        // Fallback default profile if trigger hasn't fired yet
        const defaultProf: UserProfile = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          protected_reserve_base: 950.00,
          created_at: new Date().toISOString(),
        };
        setProfile(defaultProf);
      }
    } catch {
      // Ignored
    }
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
        await fetchProfile(data.user.id, data.user.email || '');
      }
      return {};
    } else {
      // Local Mock Login
      const mockUser: UserProfile = {
        id: 'usr_' + btoa(email).slice(0, 12),
        email,
        full_name: email.split('@')[0].toUpperCase(),
        protected_reserve_base: 950.00,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      setUser({ id: mockUser.id, email: mockUser.email });
      setProfile(mockUser);
      return {};
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
        await fetchProfile(data.user.id, data.user.email || '');
      }
      return {};
    } else {
      // Local Mock Register
      const mockUser: UserProfile = {
        id: 'usr_' + btoa(email).slice(0, 12),
        email,
        full_name: fullName.toUpperCase(),
        protected_reserve_base: 950.00,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      setUser({ id: mockUser.id, email: mockUser.email });
      setProfile(mockUser);
      return {};
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
    setUser(null);
    setProfile(null);
  };

  const updateProtectedReserve = async (newBase: number) => {
    if (!profile) return;
    const updated = { ...profile, protected_reserve_base: newBase };
    setProfile(updated);

    if (isSupabaseConfigured && supabase && user) {
      await supabase
        .from('profiles')
        .update({ protected_reserve_base: newBase, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    } else {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isMockMode: !isSupabaseConfigured,
        login,
        register,
        logout,
        updateProtectedReserve,
      }}
    >
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