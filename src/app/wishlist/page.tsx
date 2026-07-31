"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useWishlist } from "@/context/wishlist";
import { useCatalog } from "@/context/catalog";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const { productMap } = useCatalog();
  const items = wishlist.slugs.map((s) => productMap[s]).filter(Boolean);

  return (
    <div className="container-x py-12">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-rose-500/12 text-rose-500">
          <Heart size={24} className="fill-rose-500" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Your wishlist</h1>
          <p className="text-muted">{wishlist.hydrated ? `${items.length} saved item${items.length !== 1 ? "s" : ""}` : "Loading…"}</p>
        </div>
      </div>

      {wishlist.hydrated && items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-5 rounded-[2rem] border border-border py-24 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-surface-2 text-muted"><Heart size={34} /></div>
          <h2 className="font-display text-2xl font-bold">Nothing saved yet</h2>
          <p className="max-w-sm text-muted">Tap the heart on any product to keep it here for later.</p>
          <Button asChild size="lg"><Link href="/shop">Explore products</Link></Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
