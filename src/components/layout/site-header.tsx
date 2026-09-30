"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Package, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCatalog } from "@/context/catalog";
import { useAuth } from "@/context/auth";
import { useCart } from "@/context/cart";
import { useCartDrawer } from "@/context/cart-drawer";
import { useWishlist } from "@/context/wishlist";
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "./announcement-bar";
import { CartDrawer } from "./cart-drawer";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { SearchCommand } from "./search-command";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CategoryIcon } from "@/components/ui/category-icon";
import { CategoryFlyout } from "@/components/market/category-flyout";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/flash-sales", label: "Flash Sales" },
  { href: "/blog", label: "Journal" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span key={count} className="animate-[badge-pop_0.35s_ease-out] absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-deal px-1 text-[0.6rem] font-extrabold text-[#111] tabular-nums ring-2 ring-surface">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function SiteHeader() {
  const { categories, products } = useCatalog();
  const [megaCat, setMegaCat] = useState<string | null>(null);
  const cart = useCart();
  const wishlist = useWishlist();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { open: cartOpen, setOpen: setCartOpen } = useCartDrawer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50">
        <AnnouncementBar />
        <header className={cn("border-b border-border bg-surface text-foreground transition-shadow duration-300", scrolled && "shadow-[0_8px_24px_-16px_rgb(0_0_0/0.35)]")}>
          {/* main row: logo · search · actions */}
          <div className="container-x flex h-16 items-center gap-3">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-full hover:bg-surface-2 lg:hidden">
              <Menu size={20} />
            </button>
            <Logo />

            {/* desktop search bar */}
            <button
              onClick={() => setSearchOpen(true)}
              className="ml-4 hidden h-11 flex-1 items-center gap-2 overflow-hidden rounded-full border-2 border-brand-500 bg-surface pl-4 text-sm text-muted transition-shadow hover:shadow-[0_0_0_4px_rgb(11_87_208/0.15)] lg:flex"
            >
              <Search size={17} />
              <span className="flex-1 text-left">Search products, brands and categories…</span>
              <span className="grid h-full place-items-center bg-brand-500 px-6 text-sm font-bold text-white">Search</span>
            </button>

            <div className="flex-1 lg:hidden" />

            {/* actions */}
            <div className="flex items-center gap-1">
              <div className="hidden sm:block"><ThemeToggle /></div>
              <Link href="/track-order" aria-label="My orders" className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold hover:bg-surface-2 md:flex">
                <Package size={19} /> Orders
              </Link>
              <Link href="/account" aria-label={auth.user ? "Your account" : "Sign in"} className="hidden h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold hover:bg-surface-2 sm:flex">
                <User size={19} />
                <span className="hidden max-w-24 truncate lg:inline">{auth.user ? `Hi, ${auth.user.name.split(" ")[0]}` : "Sign in"}</span>
              </Link>
              <Link href="/wishlist" aria-label="Wishlist" className="relative grid size-10 place-items-center rounded-full hover:bg-surface-2">
                <Heart size={19} />
                <CountBadge count={wishlist.hydrated ? wishlist.count : 0} />
              </Link>
              <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative grid size-10 place-items-center rounded-full hover:bg-surface-2">
                <ShoppingBag size={19} />
                <CountBadge count={cart.hydrated ? cart.count : 0} />
              </button>
            </div>
          </div>

          {/* mobile search bar — always visible, like Amazon / Kilimall apps */}
          <div className="container-x pb-3 lg:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-full items-center gap-2 overflow-hidden rounded-full border-2 border-brand-500 bg-surface pl-3 text-sm text-muted"
            >
              <Search size={17} className="shrink-0" />
              <span className="flex-1 truncate text-left">Search SIR VERT…</span>
              <span className="grid h-full shrink-0 place-items-center bg-brand-500 px-4 text-white"><Search size={17} strokeWidth={2.5} /></span>
            </button>
          </div>

          {/* secondary nav row (desktop) */}
          <div className="hidden border-t border-border lg:block">
            <div className="container-x flex h-10 items-center gap-1">
              <div onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)} className="relative">
                <Link href="/categories" className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-brand-600">
                  <Menu size={15} /> All categories
                </Link>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }} className="absolute left-0 top-full w-[min(76rem,calc(100vw-4rem))] pt-2">
                      <div className="grid h-[30rem] grid-cols-[16rem_1fr] overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-2xl">
                        <nav className="overflow-y-auto border-r border-border bg-surface-2/60 p-2">
                          {categories.map((c) => (
                            <Link
                              key={c.slug}
                              href={`/categories/${c.slug}`}
                              onMouseEnter={() => setMegaCat(c.slug)}
                              onClick={() => setMegaOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                (megaCat ?? categories[0]?.slug) === c.slug ? "bg-surface text-brand-700 shadow-sm dark:text-brand-300" : "hover:bg-surface",
                              )}
                            >
                              <CategoryIcon slug={c.slug} size={22} />
                              <span className="flex-1">{c.name}</span>
                            </Link>
                          ))}
                          <Link href="/categories" onClick={() => setMegaOpen(false)} className="mt-1 block px-3 py-2.5 text-sm font-bold hover:text-brand-600">View all categories</Link>
                        </nav>
                        {(() => {
                          const cat = categories.find((c) => c.slug === (megaCat ?? categories[0]?.slug));
                          return cat ? <CategoryFlyout category={cat} products={products} onNavigate={() => setMegaOpen(false)} /> : null;
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="mx-2 h-4 w-px bg-border" />
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/5">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </header>
      </div>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
