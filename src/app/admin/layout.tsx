"use client";

import {
  ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Package,
  Settings as SettingsIcon, ShapesIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/banners", label: "Banners & hero", icon: ImageIcon },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: ShapesIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  const logout = async () => {
    await api("/api/admin/login", "DELETE").catch(() => {});
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface p-4 lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-2">
          <span className="grid size-8 place-items-center rounded-lg bg-brand-500 text-brand-950">
            <LayoutDashboard size={17} />
          </span>
          <span className="font-display font-bold">Oraimo Admin</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-brand-500/12 text-brand-700 dark:text-brand-300" : "text-muted hover:bg-surface-2",
                )}
              >
                <n.icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2">
            <ExternalLink size={18} /> View store
          </Link>
          <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-2">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        {/* mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <span className="font-display font-bold">Oraimo Admin</span>
          <button onClick={logout} className="text-sm text-muted">Sign out</button>
        </div>
        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 lg:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface-2">
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-5xl p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
