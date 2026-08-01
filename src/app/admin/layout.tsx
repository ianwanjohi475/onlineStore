"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent, CreditCard, ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Menu,
  MessageSquareQuote, Package, Settings as SettingsIcon, ShapesIcon, ShoppingCart,
  Sparkles, Tag, Users, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/components/admin/kit";
import { LiveDot } from "@/components/admin/live-dot";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const groups = [
  { label: "Overview", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ] },
  { label: "Catalog", items: [
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: ShapesIcon },
    { href: "/admin/brands", label: "Brands", icon: Tag },
  ] },
  { label: "Content", items: [
    { href: "/admin/banners", label: "Banners", icon: ImageIcon },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  ] },
  { label: "Store", items: [
    { href: "/admin/coupons", label: "Coupons", icon: BadgePercent },
    { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const current = [...groups.flatMap((g) => g.items)].find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)));

  if (pathname === "/admin/login") return <>{children}</>;

  const logout = async () => {
    await api("/api/admin/login", "DELETE").catch(() => {});
    router.push("/admin/login");
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const SidebarInner = (
    <>
      <Link href="/admin" className="flex items-center gap-2.5 px-2 py-1" onClick={() => setMobileOpen(false)}>
        <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-brand-950"><Sparkles size={18} /></span>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold">SIR VERT</p>
          <p className="text-[0.7rem] text-muted">Commerce admin</p>
        </div>
      </Link>
      <nav className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-1.5 px-3 text-[0.65rem] font-bold uppercase tracking-wider text-muted">{g.label}</p>
            <div className="flex flex-col gap-0.5">
              {g.items.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(n.href) ? "bg-brand-500/12 text-brand-700 dark:text-brand-300" : "text-muted hover:bg-surface-2 hover:text-foreground")}>
                  <n.icon size={17} /> {n.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-4 flex flex-col gap-0.5 border-t border-border pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2"><ExternalLink size={17} /> View store</Link>
        <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2"><LogOut size={17} /> Sign out</button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">{SidebarInner}</aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[95] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface p-4">
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground">
                <X size={18} />
              </button>
              {SidebarInner}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-lg hover:bg-surface-2 lg:hidden"><Menu size={20} /></button>
            <span className="font-display text-sm font-semibold">{current?.label ?? "Admin"}</span>
          </div>
          <div className="flex items-center gap-2">
            <LiveDot />
            <ThemeToggle />
            <Link href="/" className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-brand-500 sm:inline-flex"><ExternalLink size={15} /> View store</Link>
            <div className="relative">
              <button onClick={() => setProfileOpen((o) => !o)} aria-label="Account menu" className="grid size-9 place-items-center rounded-full bg-brand-500 text-sm font-bold text-brand-950">A</button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold">Administrator</p>
                        <p className="text-xs text-muted">Signed in</p>
                      </div>
                      <Link href="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-2"><ExternalLink size={15} /> View store</Link>
                      <button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-surface-2"><LogOut size={15} /> Sign out</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
