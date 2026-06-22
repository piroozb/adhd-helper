"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

type User = {
  id: string;
  email: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (updates: {
    email?: string;
    password?: string;
  }) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      setUser(authUser ? { id: authUser.id, email: authUser.email } : null);
      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const authUser = session?.user;
      setUser(authUser ? { id: authUser.id, email: authUser.email } : null);
    });

    subscription = listener?.subscription ?? listener;

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: error?.message };
  };

  const updateUser = async (updates: { email?: string; password?: string }) => {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) {
      return { error: error.message };
    }
    const authUser = data.user;
    setUser(authUser ? { id: authUser.id, email: authUser.email } : null);
    return { error: undefined };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, updateUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
