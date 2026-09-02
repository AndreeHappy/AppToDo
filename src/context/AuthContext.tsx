import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';


interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isMockMode: boolean;
  isPasswordRecovery: boolean;
  sessionExpiredNotice: string | null;
  clearSessionExpiredNotice: () => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  logout: (reason?: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ error?: string }>;
  resendVerificationEmail: (email: string) => Promise<{ error?: string }>;
  updateProtectedReserve: (newBase: number) => Promise<void>;
  updateProfile: (data: {
    fullName?: string;
    phoneNumber?: string;
    age?: number;
    country?: string;
    occupation?: string;
    protectedReserveBase?: number;
  }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'app_portal_auth_user_v1';
const SESSION_EXPIRED_KEY = 'app_portal_session_expired_notice';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_EXPIRED_KEY) || null;
  });

  const LAST_ACTIVE_KEY = 'app_portal_last_active_timestamp';
  const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes strictly for mobile and web

  const lastActivityRef = useRef<number>(Date.now());

  const clearSessionExpiredNotice = () => {
    setSessionExpiredNotice(null);
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  };

  const logout = useCallback(async (reason?: string) => {
    if (reason) {
      sessionStorage.setItem(SESSION_EXPIRED_KEY, reason);
      setSessionExpiredNotice(reason);
    } else {
      clearSessionExpiredNotice();
    }

    localStorage.removeItem(LAST_ACTIVE_KEY);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
    setUser(null);
    setProfile(null);
  }, []);

  // Track User Activity for Inactivity Auto-Logout (10 min on mobile & web)
  useEffect(() => {
    if (!user) return;

    const checkAndLogActivity = () => {
      const now = Date.now();
      const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || `${lastActivityRef.current}`, 10);
      const timeIdle = now - lastActive;

      // If user was idle for >= 10 minutes, immediately log out
      if (timeIdle >= INACTIVITY_TIMEOUT_MS) {
        logout('Tu sesión se cerró automáticamente por inactividad tras 10 minutos.');
        return;
      }

      // Update activity timestamp in memory and localStorage
      lastActivityRef.current = now;
      localStorage.setItem(LAST_ACTIVE_KEY, `${now}`);
    };

    // Initial check on mount
    checkAndLogActivity();

    // Listen to all touch, click, scroll and visibility events
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
      'focus',
      'visibilitychange',
      'pageshow'
    ];

    const onEvent = () => {
      checkAndLogActivity();
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, onEvent, { passive: true });
    });

    // Periodic check every 10 seconds in foreground
    const interval = setInterval(() => {
      checkAndLogActivity();
    }, 10000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, onEvent);
      });
      clearInterval(interval);
    };
  }, [user, logout]);

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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setIsPasswordRecovery(true);
          }

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
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setUser({ id: parsed.id, email: parsed.email });
            setProfile(parsed);
          } catch {
            // ignored
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
    clearSessionExpiredNotice();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
        await fetchProfile(data.user.id, data.user.email || '');
        lastActivityRef.current = Date.now();
      }
      return {};
    } else {
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
      lastActivityRef.current = Date.now();
      return {};
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error?: string; requiresEmailConfirmation?: boolean }> => {
    clearSessionExpiredNotice();
    if (isSupabaseConfigured && supabase) {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) return { error: error.message };

      if (data.user && !data.session) {
        return { requiresEmailConfirmation: true };
      }

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
        await fetchProfile(data.user.id, data.user.email || '');
        lastActivityRef.current = Date.now();
      }
      return {};
    } else {
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
      lastActivityRef.current = Date.now();
      return {};
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) return { error: error.message };
      return {};
    }
    return {};
  };

  const resetPasswordForEmail = async (email: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) return { error: error.message };
      return {};
    }
    return {};
  };

  const updateUserPassword = async (newPassword: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      setIsPasswordRecovery(false);
      return {};
    } else {
      setIsPasswordRecovery(false);
      return {};
    }
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

  const updateProfile = async (data: {
    fullName?: string;
    phoneNumber?: string;
    age?: number;
    country?: string;
    occupation?: string;
    protectedReserveBase?: number;
  }): Promise<{ error?: string }> => {
    if (!profile || !user) return { error: 'No hay usuario autenticado' };

    const updated: UserProfile = {
      ...profile,
      full_name: data.fullName !== undefined ? data.fullName : profile.full_name,
      phone_number: data.phoneNumber !== undefined ? data.phoneNumber : profile.phone_number,
      age: data.age !== undefined ? data.age : profile.age,
      country: data.country !== undefined ? data.country : profile.country,
      occupation: data.occupation !== undefined ? data.occupation : profile.occupation,
      protected_reserve_base: data.protectedReserveBase !== undefined ? data.protectedReserveBase : profile.protected_reserve_base,
    };
    setProfile(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updated.full_name,
            phone_number: updated.phone_number,
            age: updated.age,
            country: updated.country,
            occupation: updated.occupation,
            protected_reserve_base: updated.protected_reserve_base,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          // If custom columns don't exist yet, fallback updating standard fields
          await supabase
            .from('profiles')
            .update({
              full_name: updated.full_name,
              protected_reserve_base: updated.protected_reserve_base,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        }
      } catch (err: any) {
        console.error('Error updating profile in Supabase:', err);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }

    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isMockMode: !isSupabaseConfigured,
        isPasswordRecovery,
        sessionExpiredNotice,
        clearSessionExpiredNotice,
        login,
        register,
        logout,
        resetPasswordForEmail,
        updateUserPassword,
        resendVerificationEmail,
        updateProtectedReserve,
        updateProfile,
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