"use client";

import { Eye, EyeOff, Heart, KeyRound, Loader2, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderCard } from "@/components/orders/order-card";
import { GoogleButton } from "@/components/auth/google";
import { ProductImage } from "@/components/product/product-image";
import { useAuth } from "@/context/auth";
import { useCatalog } from "@/context/catalog";
import { useToast } from "@/context/toast";
import { useWishlist } from "@/context/wishlist";
import { useMyOrders } from "@/hooks/use-my-orders";
import type { PublicOrder } from "@/lib/order-public";
import { cn, formatPrice } from "@/lib/utils";

export default function AccountPage() {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center">
        <Loader2 className="animate-spin text-muted" />
      </div>
    );
  }
  return user ? <Dashboard /> : <AuthForms />;
}

/* ── Sign in / Create account ───────────────────────────────── */
function AuthForms() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "signup" || m === "forgot") setMode(m);
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: String(f.get("email")) }) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error || "Something went wrong.");
        setNotice(d.message);
      } else if (mode === "signin") await signIn(String(f.get("email")), String(f.get("password")));
      else await signUp({ name: String(f.get("name")), email: String(f.get("email")), phone: "", password: String(f.get("password")) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-2xl font-bold sm:text-3xl">
          {mode === "signin" ? "Sign in to your account" : mode === "signup" ? "Create your account" : "Forgot your password?"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          {mode === "signin"
            ? "Track orders, save your details and check out faster."
            : mode === "signup"
              ? "It takes 30 seconds. Your orders follow you on every device."
              : "Enter your account email and we'll send you a link to set a new password."}
        </p>

        {/* tabs */}
        {mode !== "forgot" && <div className="mt-6 grid grid-cols-2 rounded-full bg-surface-2 p-1 text-sm font-semibold">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(""); setNotice(""); }}
              className={cn("rounded-full py-2 transition-colors", mode === m ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground")}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>}

        <form onSubmit={submit} className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          {mode !== "forgot" && <GoogleButton text={mode === "signup" ? "signup_with" : "continue_with"} divider />}
          {mode === "signup" && (
            <Input name="name" label="Full name" autoComplete="name" required minLength={2} maxLength={80} placeholder="Jane Wanjiru" />
          )}
          <Input name="email" type="email" label="Email" autoComplete="email" required maxLength={254} placeholder="name@gmail.com" />
          {mode !== "forgot" && (
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="flex items-center justify-between font-medium">
              <label htmlFor="account-password">Password</label>
              {mode === "signin" && (
                <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="text-xs font-semibold text-brand-600 hover:underline">
                  Forgot password?
                </button>
              )}
            </span>
            <span className="flex h-11 items-center rounded-xl border border-border bg-surface pr-1 focus-within:border-brand-500">
              <input
                id="account-password"
                name="password"
                type={show ? "text" : "password"}
                required
                minLength={mode === "signup" ? 8 : 1}
                maxLength={128}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder={mode === "signup" ? "At least 8 characters, with a number" : "Your password"}
                className="h-full min-w-0 flex-1 bg-transparent px-4 outline-none"
              />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </div>
          )}

          {notice && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>}
          {error && <p role="alert" className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cta font-bold text-white transition-colors hover:bg-cta-600 disabled:opacity-60">
            {busy && <Loader2 size={18} className="animate-spin" />}
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>

          {mode === "forgot" && (
            <button type="button" onClick={() => { setMode("signin"); setError(""); setNotice(""); }} className="text-sm font-semibold text-brand-600 hover:underline">
              ← Back to sign in
            </button>
          )}
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Just want to check an order? <Link href="/track-order" className="font-semibold text-brand-600 hover:underline">My orders</Link> works without an account.
        </p>
      </div>
    </div>
  );
}

function Input({ label, className, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input {...props} className={cn("h-11 rounded-xl border border-border bg-surface px-4 outline-none transition-colors focus:border-brand-500", className)} />
    </label>
  );
}

/* ── Signed-in dashboard ────────────────────────────────────── */
const tabs = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Password", icon: KeyRound },
] as const;

function Dashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("orders");
  const [orders, setOrders] = useState<PublicOrder[] | null>(null);
  const device = useMyOrders();

  // Orders on the account + any placed on this device before signing in.
  useEffect(() => {
    if (!device.hydrated) return;
    (async () => {
      const [acct, local] = await Promise.all([
        fetch("/api/auth/orders", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { orders: [] })).catch(() => ({ orders: [] })),
        device.orders.length
          ? fetch(`/api/my-orders?numbers=${encodeURIComponent(device.orders.map((o) => o.number).join(","))}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : { orders: [] })).catch(() => ({ orders: [] }))
          : { orders: [] },
      ]);
      const merged = new Map<string, PublicOrder>();
      for (const o of [...(acct.orders ?? []), ...(local.orders ?? [])] as PublicOrder[]) merged.set(o.number, o);
      setOrders([...merged.values()].sort((a, b) => +new Date(b.date) - +new Date(a.date)));
    })();
  }, [device.hydrated, device.orders]);

  if (!user) return null;
  const first = user.name.split(" ")[0] || "there";

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-brand-500 font-display text-xl font-bold text-white">
            {first.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Hi, {first}</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold hover:bg-surface-2">
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[14rem_1fr] [&>*]:min-w-0">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors", tab === t.id ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "text-muted hover:bg-surface-2")}
            >
              <t.icon size={17} /> {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "orders" && (
            orders === null ? (
              <div className="h-56 animate-pulse rounded-2xl bg-surface-2" />
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <Package size={28} className="text-muted" />
                <p className="font-semibold">No orders yet</p>
                <p className="max-w-sm text-sm text-muted">Orders you place while signed in show up here on every device.</p>
                <Link href="/shop" className="rounded-full bg-cta px-6 py-2.5 text-sm font-bold text-white hover:bg-cta-600">Start shopping</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((o) => <OrderCard key={o.number} order={o} />)}
              </div>
            )
          )}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "profile" && <ProfileTab />}
          {tab === "security" && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}

function WishlistTab() {
  const wishlist = useWishlist();
  const { productMap } = useCatalog();
  const saved = wishlist.slugs.map((s) => productMap[s]).filter(Boolean);
  if (wishlist.hydrated && saved.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
        <Heart size={28} className="text-muted" />
        <p className="font-semibold">No saved items yet</p>
        <Link href="/shop" className="rounded-full bg-cta px-6 py-2.5 text-sm font-bold text-white hover:bg-cta-600">Browse products</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {saved.map((p) => (
        <Link key={p.slug} href={`/product/${p.slug}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 hover:border-brand-500/40">
          <ProductImage product={p} className="size-16 shrink-0 rounded-xl" sizes="64px" />
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
            <p className="text-sm font-bold text-brand-600">{formatPrice(p.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProfileTab() {
  const { user, update } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!user) return null;
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        try {
          await update({ name: String(f.get("name")), phone: String(f.get("phone")) });
          toast("Profile saved");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save.");
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
    >
      <h2 className="font-display text-lg font-bold">Profile</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Full name" defaultValue={user.name} required minLength={2} maxLength={80} autoComplete="name" />
        <Input name="phone" label="Phone" defaultValue={user.phone} maxLength={20} autoComplete="tel" />
        <Input label="Email" value={user.email} disabled className="bg-surface-2 text-muted" />
      </div>
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      <button disabled={busy} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-cta px-6 text-sm font-bold text-white hover:bg-cta-600 disabled:opacity-60">
        {busy && <Loader2 size={16} className="animate-spin" />} Save changes
      </button>
    </form>
  );
}

function PasswordTab() {
  const { update } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        setBusy(true);
        setError("");
        try {
          await update({ currentPassword: String(f.get("currentPassword")), newPassword: String(f.get("newPassword")) });
          form.reset();
          toast("Password changed — other devices were signed out");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not change password.");
        } finally {
          setBusy(false);
        }
      }}
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
    >
      <h2 className="font-display text-lg font-bold">Change password</h2>
      <p className="mt-1 text-sm text-muted">Changing it signs you out on every other device.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input name="currentPassword" type="password" label="Current password" required autoComplete="current-password" />
        <Input name="newPassword" type="password" label="New password" required minLength={8} maxLength={128} autoComplete="new-password" />
      </div>
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      <button disabled={busy} className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-cta px-6 text-sm font-bold text-white hover:bg-cta-600 disabled:opacity-60">
        {busy && <Loader2 size={16} className="animate-spin" />} Update password
      </button>
    </form>
  );
}
