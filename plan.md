# Plan: Performance & Vulnerability Improvements

Hasil analisa menemukan 206 dependency vulnerabilities (12 critical) dan beberapa performance bottlenecks. Berikut prioritas perbaikannya:

---

## Phase 1 — Critical: Security Fixes

### 1.1 Upgrade Strapi (backend) to fix critical CVEs
**Files:** `apps/backend/package.json`

Strapi 5.25.0 punya critical vulnerabilities:
- SQL Injection di Content Type Builder (`<5.33.2`) — GHSA-3xcq-8mjw-h6mx
- Sensitive data leak via relational filtering (`<5.37.0`) — GHSA-rjg2-95x7-8qmx
- CASL Prototype Pollution via Strapi admin

**Action:** Update `@strapi/strapi` and all `@strapi/*` packages to `^5.37.0` (or latest).

### 1.2 Upgrade happy-dom (frontend devDep) — critical RCE
**Files:** `apps/frontend/package.json`

happy-dom `<20.0.0` punya VM Context Escape → RCE (GHSA-37j7-fg3j-429f).

**Action:** Update `happy-dom` to `^17.4.4` or latest compatible.

### 1.3 Sanitize raw HTML content
**Files:** `apps/frontend/src/components/sections/RawHtmlSection.tsx`

`dangerouslySetInnerHTML` render konten dari Strapi CMS tanpa sanitasi. Jika CMS terkompromi, ini XSS langsung.

**Action:** Install `DOMPurify` package, wrap content dengan `DOMPurify.sanitize(content)`.

### 1.4 Add Content-Security-Policy & security headers
**Files:** `apps/frontend/src/routes/__root.tsx`

Tidak ada CSP, X-Frame-Options, atau security headers di frontend. Rentan clickjacking dan XSS.

**Action:** Tambah `<meta http-equiv="Content-Security-Policy">` di `<head>` dengan policy yang sesuai (allow Strapi API, Google Fonts, RSS2JSON, dll).

### 1.5 Fix all auto-fixable dependency vulnerabilities
**Command:** `cd apps/frontend && pnpm audit --fix` and `cd apps/backend && pnpm audit --fix`

---

## Phase 2 — High Impact Performance

### 2.1 Add `loading="lazy"` to all below-the-fold images
**Files:** ~30 `<img>` tags across 20+ component files

Hanya 4/34 images yang punya `loading="lazy"`. Semua section banners, gallery thumbs, dan partner logos eager-load.

**Action:** Tambah `loading="lazy"` ke semua `<img>` yang bukan hero/above-the-fold.

### 2.2 Add code splitting with React.lazy + Suspense
**Files:** `apps/frontend/src/routes/__root.tsx`

**Root cause:** Zero dynamic imports — semua komponen dieager-load di bundle awal.

**Action:** Bungkus komponen section besar dan jarang terlihat dengan `React.lazy()` + `<Suspense>`:
- `InstagramReelsSection`
- `TiktokReelsSection`
- `PortfolioSlider`
- `SocialMediaSection`
- `ClientSection`

### 2.3 Add aspect-ratio containers to images missing them
**Files:** Multiple section components

Beberapa section (`AboutUsSection`, `HeroPageSection`, `HeroAnchorSection`, `ImageSection`, `ImageWithContentSection`, `PartnersSection`, `CompanyIntroSection`) render `<img>` tanpa `aspect-*` container — menyebabkan CLS.

**Action:** Bungkus `<img>` dengan `<div className="aspect-[...]">` sesuai rasio gambarnya.

### 2.4 Add request cancellation on unmount
**Files:** All components with `useEffect(() => { fetch(); }, [])`

Tidak ada `AbortController` atau cleanup — jika user navigasi sebelum fetch selesai, terjadi state update on unmounted.

**Action:** Tambah `AbortController` ke semua data-fetching useEffect.

---

## Phase 3 — Medium Impact

### 3.1 Move RSS2JSON API key server-side
**Files:** `apps/frontend/src/services/bubuhApi.ts`

`VITE_RSS2JSON_API_KEY` terekspos di client bundle karena prefix `VITE_`.

**Action:** Dibiarkan seperti awal — API key tetap disimpan di ENV dengan prefix `VITE_` karena data RSS berasal dari Blogger via RSS2JSON, bukan dari database Strapi.

### 3.2 Add React.memo to heavy section components
**Files:** Large section components (`InstagramReelsSection`, `SocialMediaSection`, `GallerySlider`, `PortfolioSlider`)

**Action:** Bungkus export dengan `React.memo()` untuk mencegah re-render tidak perlu.

### 3.3 Add width/height attributes to critical images
**Files:** Priority pada images di atas fold (hero sections)

**Action:** Tambah `width` dan `height` ke `<img>` di hero components.

---

## Recommended execution order:
1. Phase 1 (Security) — urgent, cepat dilakukan
2. Phase 2.1 (lazy loading) — high impact, mechanical changes
3. Phase 2.4 (AbortController) — prevents runtime errors
4. Phase 2.2 (code splitting) — biggest perf gain
5. Rest of Phase 2 & 3

---

## Status — [2026-07-30, 18:10 WIB]

### ✅ Completed

- **Phase 1** (Security): Semua item selesai — Strapi aman di 5.37.0+, overrides vuln ditambahkan, CSP + DOMPurify aktif.
- **2.1** Lazy loading: Semua `<img>` di bawah fold sudah dapat `loading="lazy" decoding="async"`.
- **2.2** Code splitting: `React.lazy()` + `<Suspense>` untuk `SocialMediaSection`, `InstagramReelsSection`, `TiktokReelsSection`, `PortfolioSlider`, `ClientSection`.
- **2.4** AbortController: Ditambahkan ke `Navbar`, `Footer`, `WebIntro`, `PortfolioSlider`, `ClientSection`, `SocialMediaSection`, `RecentBlogsSection`.
- **3.2** React.memo: Ditambahkan ke `InstagramReelsSection`, `TiktokReelsSection`, `GallerySlider`, `PortfolioSlider`, `ClientsParallax`, `SocialMediaSection`.
- **3.3 (partial)** Hero width/height + fetchpriority: Ditambahkan ke `HeroHomeSection`, `HeroPageSection`, `HeroAnchorSection`, `HeroSection`.
- **2.3 (partial)** Aspect-ratio: `ImageSection` sudah dapat `aspect-video`. `AboutUsSection` maps_lottie image juga sudah dapat `aspect-video`.

### ⏳ Remaining

- **3.1** RSS2JSON: Dibiarkan seperti awal — API key tetap di ENV dengan prefix `VITE_` karena data RSS dari Blogger via RSS2JSON, bukan dari DB Strapi. Tidak ada perubahan backend untuk item ini.
- **2.3 (sisa)** Aspect-ratio lanjutan: Beberapa section lain masih bisa ditambahkan `aspect-*` wrapper, tetapi yang paling kritis (ImageSection, AboutUsSection maps_lottie) sudah diterapkan.
