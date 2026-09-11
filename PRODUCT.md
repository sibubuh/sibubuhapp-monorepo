# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

General audience ("semua orang"). Visitors arrive without a fixed role — recruiters, potential collaborators/clients, friends, and blog readers — and browse casually. Confirmed by the owner; no single professional segment is the target.

## Product Purpose

Sibubuh Playground is a personal portfolio and blog site. It showcases the owner's digital work (web development, mobile apps, UI/UX, KOL/influencer activity) and shares stories via the blog. Confirmed direction: the product keeps its current role and content, but its presentation must become more interactive and fresh ("lebih interaktif dan segar"). Success = a visit feels alive and engaging, not like a static brochure.

## Positioning

A personal playground, not a corporate agency site: one place where the owner's projects, clients, social presence, and blog (from bubuh.id) live together. A neighboring portfolio site could not truthfully claim the same personal archive and story stream.

## Operating Context

- Content is authored in Strapi 5 CMS (`apps/backend`); the TanStack Start frontend (`apps/frontend`) renders pages from dynamic Strapi sections.
- Blog posts are not stored in Strapi; they are pulled live from the Blogger blog at `bubuh.id` through RSS2JSON.
- Local development: `pnpm dev` (frontend + backend), Docker Compose for backing services (`compose.yaml`).

## Capabilities and Constraints

- Frontend: TanStack Start + TanStack Router, React 18, Tailwind 4, framer-motion/motion, lottie-react, lucide-react. SSR routes: home (`/`), generic CMS pages (`/$slug`), projects (`/projects`, `/projects/$slug`), plus `/dashboard` and `/login` utility routes.
- Backend: Strapi 5 with collection types (page, post, project, client, home-slider, social-media, navbar, footer, share-button, web-intro, analytic) and ~27 section components for the page dynamic zone; i18n plugin enabled (localized content).
- Blog feed is client-side via RSS2JSON with a 5-minute cache; keeping the `VITE_RSS2JSON_API_KEY` client-side is a deliberate decision (source data is a public Blogger feed, not Strapi data).
- Open decisions: the `/dashboard` and `/login` routes are minimal utility pages (health-check demo); no confirmed product plan for a richer dashboard.

## Brand Commitments

- The name "Sibubuh" / "Sibubuh Playground" is binding.
- The blog feed must come from bubuh.id (Blogger) — keep it as the story source.
- Everything else stays "tetap sama" per the owner: preserve the incumbent identity while the presentation gets fresher and more interactive.

## Evidence on Hand

- Existing implementation: full frontend + Strapi content types in this monorepo (see `apps/`).
- Existing performance/security analysis with agreed priorities: `plan.md` (dependency upgrades, lazy loading, code splitting, sanitization, CSP).
- Real client/partner content lives in Strapi (`client`, `home-slider`, `project` types); blog content is live on bubuh.id.
- Absences future work must not fabricate: no testimonials, pricing, press coverage, or client lists exist in the repo — only what Strapi content actually provides.

## Product Principles

1. Same story, fresher stage — content and identity stay; the presentation earns interactivity.
2. Content-driven, never hardcoded — Strapi sections and the bubuh.id feed remain the source of truth for anything shown.
3. Alive by default — a page that only scrolls is a miss; motion, response, and play are part of the product's job.
4. Fast while playful — interactivity must not regress load performance (see `plan.md` priorities).
