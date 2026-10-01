"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/context/toast";

/**
 * "Continue with Google" via Google Identity Services.
 *  • <GoogleOneTap/>  — the Google prompt in the corner ("Continue as Jane")
 *    that appears when the shopper is already signed in to Google on this
 *    browser. Shown to signed-out visitors only.
 *  • <GoogleButton/>  — the official "Continue with Google" button.
 * Both send Google's ID token to /api/auth/google, which verifies it.
 * Hidden entirely until NEXT_PUBLIC_GOOGLE_CLIENT_ID is set.
 */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface GoogleId {
  initialize: (cfg: Record<string, unknown>) => void;
  prompt: () => void;
  cancel: () => void;
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
}
type Win = Window & { google?: { accounts?: { id?: GoogleId } } };

let scriptPromise: Promise<GoogleId | null> | null = null;
let initialized = false;
let handler: ((credential: string) => void) | null = null;

function loadGis(): Promise<GoogleId | null> {
  if (!GOOGLE_CLIENT_ID || typeof window === "undefined") return Promise.resolve(null);
  scriptPromise ??= new Promise((resolve) => {
    const done = () => resolve((window as Win).google?.accounts?.id ?? null);
    if ((window as Win).google?.accounts?.id) return done();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = done;
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return scriptPromise.then((gis) => {
    if (gis && !initialized) {
      gis.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: { credential?: string }) => res.credential && handler?.(res.credential),
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        itp_support: true,
        use_fedcm_for_prompt: true,
      });
      initialized = true;
    }
    return gis;
  });
}

/** Shared sign-in handler (toast + optional redirect). */
function useGoogleHandler(onSignedIn?: () => void) {
  const { signInWithGoogle } = useAuth();
  const toast = useToast();
  useEffect(() => {
    handler = async (credential: string) => {
      try {
        const { created } = await signInWithGoogle(credential);
        toast(created ? "Welcome! Your account is ready." : "Signed in with Google");
        onSignedIn?.();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Google sign-in failed", "info");
      }
    };
  }, [signInWithGoogle, toast, onSignedIn]);
}

export function GoogleOneTap() {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  useGoogleHandler();
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !ready || user || pathname?.startsWith("/admin") || pathname?.startsWith("/account/reset")) return;
    let cancelled = false;
    const t = setTimeout(() => {
      loadGis().then((gis) => !cancelled && gis?.prompt());
    }, 2500); // let the page settle first
    return () => {
      cancelled = true;
      clearTimeout(t);
      (window as Win).google?.accounts?.id?.cancel();
    };
  }, [ready, user, pathname]);
  return null;
}

export function GoogleButton({ text = "continue_with", onSignedIn, divider = false }: { text?: "continue_with" | "signin_with" | "signup_with"; onSignedIn?: () => void; /** show "or with email" under the button */ divider?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useGoogleHandler(onSignedIn);
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGis().then((gis) => {
      if (!gis) return setFailed(true);
      if (ref.current) {
        ref.current.innerHTML = "";
        gis.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          width: Math.min(400, ref.current.offsetWidth || 320),
        });
      }
    });
  }, [text]);
  if (!GOOGLE_CLIENT_ID || failed) return null;
  return (
    <>
      <div ref={ref} className="flex h-11 w-full justify-center" aria-label="Continue with Google" />
      {divider && (
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
        </div>
      )}
    </>
  );
}
