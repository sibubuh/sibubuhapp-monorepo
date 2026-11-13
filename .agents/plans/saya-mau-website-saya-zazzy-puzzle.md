# Efek VHS (canvasui.dev) pada Hero Section halaman `/$slug`

## Context

Website frontend (`apps/frontend`, TanStack Start + React 18 + Tailwind v4) merender halaman CMS Strapi lewat route catch-all `/$slug`. Saat ini tidak ada satu pun efek visual berbasis canvas/WebGL di codebase — semua animasi memakai `motion/react` + CSS.

Tujuan: memberi nuansa retro "kaset VHS" pada **hero section** halaman slug, memakai komponen `VHS` dari https://canvasui.dev/docs/components/vhs.

Keputusan yang sudah diambil bersama user:
- **Cakupan**: hanya hero section (bukan seluruh halaman) → konten lain tetap DOM murni, link/form/scroll aman, beban GPU kecil.
- **Intensitas**: nilai default library (wave 1, jitter 0.25, crease 0.1, switching 0.05, bloom 0.4, aberration 2, grain 0.1, scanlines 0.1).
- **Instalasi**: copy manual 1 file (bukan `shadcn init`).

### Kenapa manual copy, bukan `npx shadcn@latest add`

| Fakta repo | Implikasi |
|---|---|
| Tidak ada `components.json` di mana pun | `shadcn add` akan memaksa `shadcn init` |
| Alias path adalah `#/*` → `./src/*`, bukan `@/*` | Output CLI perlu di-rewrite manual |
| Tailwind v4 CSS-first (`src/styles/global.css` + `colors.css`), tanpa `tailwind.config.*` | `init` berisiko menimpa/menambah blok di `global.css` |
| `tailwind-merge` & `cva` tidak terpasang (`libs/cx.ts` saat ini broken kalau di-import) | `init` akan menambah dependency yang tidak dipakai |
| Registry `vhs-react.json`: `dependencies: []`, `registryDependencies: []`, **1 file saja** | Tidak ada yang hilang kalau di-copy manual |

### Verifikasi kompatibilitas (sudah dicek dari sumber `vhs-react.json`)

- Import React-nya: `useEffect, useRef, useState, useSyncExternalStore, type ReactNode` → **semua ada di React 18.3.1** (versi yang di-pin root `pnpm.overrides`). Tidak ada `use()` / `useActionState` / ref-as-prop. Aman.
- `useSyncExternalStore(emptySubscribe, supportsHtmlInCanvas, () => false)` punya `getServerSnapshot` → **SSR-safe** untuk TanStack Start.
- Tidak ada akses `window`/`document`/`navigator` di top-level module — semuanya di dalam fungsi/effect. Tidak perlu `ClientOnly` wrapper.
- Library sudah menghormati `prefers-reduced-motion`, pakai `IntersectionObserver` (berhenti render saat keluar viewport) dan `ResizeObserver`. Selaras dengan blok `prefers-reduced-motion` yang sudah ada di `src/styles/global.css`.

---

## Implementasi

### 1. Ambil sumber komponen → `src/components/canvasui/VHS.tsx`

Buat direktori baru `apps/frontend/src/components/canvasui/` dan tulis isi `files[0].content` dari registry ke `VHS.tsx`:

```bash
# dijalankan dari apps/frontend
curl -s https://canvasui.dev/r/vhs-react.json \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);require('fs').mkdirSync('src/components/canvasui',{recursive:true});require('fs').writeFileSync('src/components/canvasui/VHS.tsx',j.files[0].content)})"
```

> Butuh izin jaringan ke `canvasui.dev` saat eksekusi. Fallback kalau diblokir: copy manual dari tab "Code" di halaman dokumentasi.

Penyesuaian kecil setelah file masuk:
- Baris `"use client";` boleh dibiarkan — di Vite/TanStack Start itu no-op yang tidak berbahaya.
- Jalankan `pnpm --filter=frontend run check` (Biome) untuk menyesuaikan format tab/indentasi repo. File ini **tidak perlu diedit isinya**; perlakukan sebagai vendored source.

Ekspor yang tersedia: `VHS`, `createVHS`, `supportsHtmlInCanvas`, plus tipe `VHSOptions`, `VHSElements`, `VHSInstance`, `VHSProps`.

### 2. Buat wrapper preset → `src/components/ui/VHSHero.tsx`

Ketiga hero section (`HeroSection.tsx`, `HeroPageSection.tsx`, `HeroAnchorSection.tsx`) punya bentuk identik:

```tsx
<section className="relative h-[Xvh] overflow-hidden bg-ink md:h-[Yvh]">
  <img className="absolute inset-0 ..." />
  <div className="absolute inset-0 flex items-center justify-center">…</div>
</section>
```

Jadi satu wrapper tipis cukup untuk semuanya. Komponen baru menerima `className` (untuk mewarisi tinggi `h-[50vh] md:h-[60vh]` dsb) dan `children`:

```tsx
import type { ReactNode } from "react";
import { VHS } from "../canvasui/VHS";

export function VHSHero({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <VHS
      className={className}
      speed={0.5}
      wave={1}
      jitter={0.25}
      crease={0.1}
      switching={0.05}
      switchingHeight={0.02}
      bloom={0.4}
      aberration={2}
      acBeat={1}
      grain={0.1}
      scanlines={0.1}
      vignette={0}
      barrel={0}
      saturation={1}
      exposure={1}
    >
      {children}
    </VHS>
  );
}
```

Props ditulis eksplisit (walau nilainya = default library) supaya tuning intensitas nanti cukup di satu tempat ini.

Gunakan path relatif (`../canvasui/VHS`) agar konsisten dengan mayoritas file di `src/components/`, atau `#/components/canvasui/VHS` jika ingin mengikuti `__root.tsx`/`index.tsx`.

### 3. Pasang di hero section

File utama: **`src/components/sections/HeroPageSection.tsx`** (ini hero yang dipakai halaman slug via `sections.hero-page` di `SectionRenderer.tsx`).

Pola perubahan — tinggi dipindah ke wrapper, `<section>` jadi `h-full`:

```tsx
<VHSHero className="relative h-[50vh] overflow-hidden bg-ink md:h-[60vh]">
  <section className="relative h-full w-full overflow-hidden">
    {/* isi lama tidak berubah */}
  </section>
</VHSHero>
```

Alasan: `VHS` merender wrapper `position: relative` dan content-wrapper `overflow: auto`; kalau tinggi tetap di `<section>` sementara wrapper-nya auto-height, canvas output bisa ter-collapse ke 0px atau memunculkan scrollbar internal.

Terapkan pola yang sama — satu edit per file, nilai tinggi mengikuti aslinya — jika hero lain juga ingin kena efek:
- `src/components/sections/HeroSection.tsx` (`h-[60vh] md:h-[80vh]`)
- `src/components/sections/HeroAnchorSection.tsx` (`h-[60vh] md:h-[70vh]`)

Default rencana ini hanya menyentuh `HeroPageSection.tsx`; dua sisanya opsional dan tinggal mengulang pola yang sama.

### 4. Hal yang perlu diperhatikan saat integrasi

- **Gambar cross-origin.** `HeroPageSection` memuat `baseURL + item.image.url` dari Strapi (origin berbeda). Pada browser dengan dukungan native `html-in-canvas` (Chrome 157+), gambar cross-origin tanpa header CORS akan men-*taint* canvas dan bikin render gagal. Kalau itu terjadi, tambahkan `crossOrigin="anonymous"` pada `<img>` dan pastikan Strapi mengirim `Access-Control-Allow-Origin`. Di browser lain komponen otomatis jatuh ke mode DOM-overlay yang tidak terpengaruh masalah ini.
- **Mode fallback.** Di luar Chrome 157+, efek yang tampil adalah overlay (grain, scanline, vignette, aberration) tanpa distorsi wave/jitter pada konten. Ini perilaku normal library, bukan bug.
- **Hydration.** `useSyncExternalStore` mengembalikan `false` di server dan bisa `true` di client; React 18 menangani ini dengan re-render client-side. Peringatan dev yang muncul (kalau ada) tidak memengaruhi produksi.
- **Dark mode.** Hero memakai `bg-ink` dan teks putih, jadi efek VHS akan terbaca baik di kedua tema tanpa penyesuaian token di `src/styles/colors.css`.

---

## Verifikasi

1. **Typecheck**: `pnpm --filter=frontend run typecheck` — memastikan `VHS.tsx` lolos `strict: true` di TypeScript 5.3.3.
2. **Lint/format**: `pnpm --filter=frontend run check`.
3. **Unit test**: `pnpm --filter=frontend run test` — pastikan test yang merender section tidak pecah (lingkungan `happy-dom` tidak punya WebGL; `createVHS` harus mengembalikan `null` dengan aman — kalau ada test yang gagal, mock `src/components/canvasui/VHS` di test tersebut).
4. **Manual di browser**: `pnpm run dev:frontend` (port 3000), buka salah satu halaman slug dari Strapi yang punya `sections.hero-page`, lalu cek:
   - hero tampil dengan grain/scanline/wave, tinggi tidak berubah dari sebelumnya, tidak ada scrollbar internal;
   - console bersih dari `SecurityError` (indikasi masalah tainted canvas);
   - scroll ke bawah lalu kembali — render harus berhenti/lanjut sesuai `IntersectionObserver`;
   - aktifkan "Reduce motion" di OS → animasi berhenti;
   - resize window & zoom browser → canvas ikut menyesuaikan.
5. **E2E**: `pnpm --filter=frontend run e2e-chrome` untuk memastikan tidak ada regresi pada halaman slug yang sudah di-cover Playwright.
