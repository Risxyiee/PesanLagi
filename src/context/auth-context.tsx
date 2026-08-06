"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error?: string; requireEmailVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<any>(null);

  const getSupabase = useCallback(async () => {
    if (supabaseRef.current) return supabaseRef.current;
    const { createSupabaseBrowserClient } = await import('@/lib/supabase/client');
    supabaseRef.current = createSupabaseBrowserClient();
    return supabaseRef.current;
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const supabase = await getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [getSupabase]);

  useEffect(() => {
    fetchUser();

    // Listen for auth state changes — FIX: properly clean up subscription
    let subscription: { unsubscribe: () => void } | undefined;

    getSupabase().then(supabase => {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });
      subscription = data.subscription;
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUser, getSupabase]);

  const signUp = async (email: string, password: string) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user && !data.session) return { requireEmailVerification: true };
    return {};
  };

  const signIn = async (email: string, password: string) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signInWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const signOut = async () => {
    try {
      // Clear server-side cookies first
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch {
      // Continue even if server sign-out fails
    }
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
