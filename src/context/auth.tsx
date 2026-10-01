"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

interface AuthValue {
  user: SessionUser | null;
  /** false until the first /api/auth/me check finishes */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  /** sign in / sign up with a Google ID token from Google Identity Services */
  signInWithGoogle: (credential: string) => Promise<{ created: boolean }>;
  update: (patch: Record<string, string>) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

async function call(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

/** Customer session, backed by the httpOnly cookie set by /api/auth/*. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    call("/api/auth/me", "GET")
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser((await call("/api/auth/login", "POST", { email, password })).user);
  }, []);
  const signUp = useCallback(async (input: { name: string; email: string; phone: string; password: string }) => {
    setUser((await call("/api/auth/signup", "POST", input)).user);
  }, []);
  const signInWithGoogle = useCallback(async (credential: string) => {
    const d = await call("/api/auth/google", "POST", { credential });
    setUser(d.user);
    return { created: !!d.created };
  }, []);
  const signOut = useCallback(async () => {
    await call("/api/auth/logout", "POST").catch(() => {});
    // don't let Google One Tap sign them straight back in
    (window as unknown as { google?: { accounts?: { id?: { disableAutoSelect?: () => void } } } }).google?.accounts?.id?.disableAutoSelect?.();
    setUser(null);
  }, []);
  const update = useCallback(async (patch: Record<string, string>) => {
    setUser((await call("/api/auth/me", "PATCH", patch)).user);
  }, []);

  return <AuthContext.Provider value={{ user, ready, signIn, signUp, signOut, update, signInWithGoogle }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
