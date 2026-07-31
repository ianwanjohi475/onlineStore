"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categories } from "@/lib/data/categories";
import { useCart } from "@/context/cart";
import { useWishlist } from "@/context/wishlist";
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "./announcement-bar";
import { CartDrawer } from "./cart-drawer";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { SearchCommand } from "./search-command";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
    <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[0.6rem] font-bold text-brand-950 tabular-nums">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function SiteHeader() {
  const cart = useCart();
  const wishlist = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
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
        <header className={cn("transition-all duration-300", scrolled ? "glass shadow-card" : "bg-background")}>
          <div className="container-x flex h-16 items-center justify-between gap-4">
            {/* left */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="grid size-10 place-items-center rounded-full hover:bg-surface-2 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <Logo />
            </div>

            {/* center nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              <div
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
                className="relative"
              >
                <Link
                  href="/categories"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
                >
                  Categories
                </Link>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-1/2 top-full w-[42rem] -translate-x-1/2 pt-3"
                    >
                      <div className="card-surface grid grid-cols-2 gap-2 p-3 shadow-card">
                        {categories.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/categories/${c.slug}`}
                            className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2"
                          >
                            <span
                              className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
                              style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
                            >
                              <span className="size-2.5 rounded-full bg-white/90" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                {c.name}
                              </span>
                              <span className="block text-xs text-muted">{c.tagline}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* right actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="grid size-10 place-items-center rounded-full hover:bg-surface-2"
              >
                <Search size={19} />
              </button>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Link
                href="/account"
                aria-label="Account"
                className="hidden size-10 place-items-center rounded-full hover:bg-surface-2 sm:grid"
              >
                <User size={19} />
              </Link>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative grid size-10 place-items-center rounded-full hover:bg-surface-2"
              >
                <Heart size={19} />
                <CountBadge count={wishlist.hydrated ? wishlist.count : 0} />
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
                className="relative grid size-10 place-items-center rounded-full hover:bg-surface-2"
              >
                <ShoppingBag size={19} />
                <CountBadge count={cart.hydrated ? cart.count : 0} />
              </button>
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
