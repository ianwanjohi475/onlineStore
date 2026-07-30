# Oraimo Store — Premium E-commerce (Next.js)

An award-style, conversion-focused e-commerce front-end for Oraimo smart accessories.
Built with the **Next.js App Router, TypeScript, Tailwind CSS v4 and Framer Motion**, with a
modern, luxurious, green-and-black aesthetic and full dark/light theming.

> Demo project. Product imagery is **generated placeholder artwork** (no proprietary photos) and
> model names/copy are illustrative. Not affiliated with Oraimo.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Tech

- **Next.js 16 (App Router)** — Server Components by default, static generation for product &
  category pages via `generateStaticParams`, streaming `loading.tsx` skeletons.
- **TypeScript** throughout, strict.
- **Tailwind CSS v4** — CSS-based `@theme` tokens in `globals.css`, semantic tokens that flip
  per theme, brand green scale, custom animations.
- **Framer Motion** — hero transitions, scroll reveals, drawers/modals, toasts, counters.
- **next-themes** — class-based dark/light with system default.
- **lucide-react** — iconography.

## Features

- Full-screen animated hero with rotating promos and floating stat chips
- Product cards with hover actions, wishlist, quick-add and **quick-view** modal
- Categories: Earbuds, Smartwatches, Power Banks, Chargers, Cables, Speakers, Accessories, New Arrivals
- Sticky **mega header** with search + autocomplete, wishlist, cart drawer, account, mobile menu
- Flash sales with **countdown timers**, best sellers, featured collections, brand stats, testimonials
- Product detail: gallery with **hover zoom** + thumbnails, specs, ratings, reviews, related, recently viewed
- Shop with **filtering & sorting**; cart, multi-step **checkout**, wishlist, account, order tracking
- Newsletter, blog previews, FAQ accordion, trust badges, warranty section
- Floating **WhatsApp** support, scroll progress, **toast** notifications, skeleton loading
- Professional **empty states**, `404` and `error` pages
- SEO: metadata, Open Graph, Twitter cards, JSON-LD (Organization + Product)
- Fully responsive, `prefers-reduced-motion` respected, keyboard-focusable

## Structure

```
src/
├── app/                     # routes (home, shop, product/[slug], categories, cart, checkout, …)
│   ├── layout.tsx           # fonts, metadata, providers, header/footer/whatsapp
│   ├── globals.css          # Tailwind v4 @theme design tokens + dark/light
│   ├── loading.tsx · error.tsx · not-found.tsx
├── components/
│   ├── layout/              # header, footer, cart drawer, search, mobile menu, whatsapp…
│   ├── home/                # hero, categories, flash sale, stats, testimonials, collections…
│   ├── product/             # card, quick-view, gallery, detail, reviews, related, art
│   ├── shop/ · contact/     # feature-specific composites
│   └── ui/                  # button, badge, rating, countdown, skeleton, accordion, reveal…
├── context/                 # cart, wishlist, toast, recently-viewed, theme providers
├── hooks/                   # useLocalStorage
└── lib/                     # types, data (products/categories/content), utils
```

## Design tokens

Brand green scale (`--color-brand-50…950`) plus semantic surface/text/border tokens that flip
between light and dark in `globals.css`. Two-font system: **Space Grotesk** (display) + **Inter**
(body). Adapted from the studio's design-system reference library — original components, not copies.
