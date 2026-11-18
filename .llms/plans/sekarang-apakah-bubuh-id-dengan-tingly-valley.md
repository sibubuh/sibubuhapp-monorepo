# Pasang Google AdSense di bubuh.id

## Context

bubuh.id adalah migrasi dari blog Blogspot (~219 story di-scrape via `apps/backend/scripts/scrape-blogspot.mjs`) ke stack Strapi + TanStack Start. Akun AdSense yang sudah disetujui untuk Blogspot **tetap dipakai** — Google hanya mengizinkan satu akun per orang — tapi bubuh.id adalah domain baru dan wajib didaftarkan ulang di menu *Sites* lalu melewati review tersendiri. Persetujuan Blogspot tidak otomatis menurun ke domain baru.

Secara teknis situs sudah memenuhi hampir semua prasyarat (konten orisinal & banyak, domain sendiri, SSR, sitemap, robots.txt, redirect 301 dari URL Blogspot lama). Yang hilang untuk bisa diverifikasi dan di-approve:

1. Tidak ada script AdSense sama sekali (`grep adsbygoogle|ca-pub|pagead2` → 0 hit).
2. Tidak ada `ads.txt` → AdSense akan menandai "Earnings at risk".
3. Tidak ada halaman Privacy Policy / About / Contact — ini penyebab penolakan paling umum di review manual.

Branch `ads-setting` saat ini identik dengan `main` (belum ada pekerjaan).

Keputusan yang sudah diambil: **Auto Ads** (bukan unit manual) dan publisher ID disimpan di **Strapi single type `analytic`**, mengikuti pola GA4 yang sudah ada.

## Perubahan

### 1. Field baru di Strapi

`apps/backend/src/api/analytic/content-types/analytic/schema.json` — tambah satu atribut di samping `google_analytic_tracking_id`:

```json
"adsense_publisher_id": { "type": "string", "required": false, "maxLength": 255 }
```

`required: false` supaya entry yang sudah ada tidak jadi invalid. Nilainya diisi lengkap dengan prefix: `ca-pub-4905236457470605`.

Controller/router tidak perlu diubah (pakai `createCore*` default). Permission `find` untuk role Public sudah aktif karena GA4 sudah jalan lewat endpoint yang sama.

### 2. Service: perluas `getAnalyticsId` jadi `getAnalyticsConfig`

`apps/frontend/services/api.ts` (~baris 604–627). Fungsi `getAnalyticsId()` sudah memanggil `/api/analytic` dan meng-cache hasilnya 5 menit dengan fallback ke cache lama saat CMS error. Jangan bikin fungsi fetch kedua — ubah cache agar menyimpan objek:

- Rename jadi `getAnalyticsConfig(): Promise<{ gaId: string | null; adsensePubId: string | null }>`.
- Cache jadi `{ config, at }`, fallback error mengembalikan `config` terakhir (atau `{ gaId: null, adsensePubId: null }` kalau belum pernah sukses).
- Pertahankan `.trim() || null` untuk kedua field dan komentar "kenapa di-cache" yang sudah ada.
- Satu-satunya pemanggil adalah `__root.tsx` (loader), jadi rename aman — tetap grep `getAnalyticsId` untuk memastikan.

### 3. Script AdSense di root route

`apps/frontend/src/routes/__root.tsx` baris 21 dan 59–67. Loader sekarang `loader: async () => ({ gaId: await getAnalyticsId() })` → ganti jadi mengembalikan seluruh config. Di `head()`, array `scripts` yang sekarang kondisional terhadap `gaId` dipecah jadi dua blok kondisional yang digabung, agar GA4 dan AdSense independen:

- GA4: tetap seperti sekarang, gated oleh `loaderData?.gaId`.
- AdSense: gated oleh `loaderData?.adsensePubId`, satu tag saja —
  `src: https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`, `async: true`, `crossOrigin: "anonymous"`.

Auto Ads tidak butuh komponen `<AdSlot>` atau perubahan di `StoryDetail` / `ProjectDetail`. Script yang sama inilah yang dipakai AdSense untuk verifikasi kepemilikan site, jadi tidak perlu meta tag verifikasi terpisah.

### 4. `ads.txt` sebagai file statis

File baru `apps/frontend/public/ads.txt`, sebelahan dengan `robots.txt` dan `llms.txt` yang sudah ada. Isi persis satu baris:

```
google.com, pub-4905236457470605, DIRECT, f08c47fec0942fa0
```

Nol baris kode; isi file `public/` sudah otomatis disalin ke root build (`dist/client/`) dan disajikan dari root domain, sama seperti `robots.txt` hari ini.

Perhatikan: baris `ads.txt` memakai `pub-...` **tanpa** prefix `ca-`, sedangkan tag script di root route memakai `ca-pub-...`. Keduanya nilai yang sama, formatnya saja beda — jangan tertukar.

### 5. `robots.txt`

`apps/frontend/public/robots.txt` sudah mengizinkan Googlebot dan tidak memblokir apa pun yang relevan, jadi crawler AdSense (`Mediapartners-Google`) sudah lolos lewat aturan default. **Tidak perlu diubah.**

### 6. Halaman legal — dikerjakan di Strapi, bukan di kode

Route `$slug.tsx` sudah merender content-type `page` apa pun dari CMS. Jadi Privacy Policy, About, dan Contact cukup dibuat sebagai entry `page` baru di admin Strapi dengan slug `privacy-policy`, `about`, `contact` — nol baris kode. Yang perlu dicek manual: apakah link ke halaman-halaman ini muncul di Footer (content-type `footer`); kalau belum, tambahkan lewat admin Strapi juga.

Privacy policy wajib menyebut penggunaan cookie oleh Google/pihak ketiga dan link ke kebijakan iklan Google — ini syarat eksplisit program AdSense.

## Yang sengaja tidak dikerjakan

- **Komponen unit iklan manual** — Auto Ads sudah cukup untuk review; unit manual bisa menyusul setelah status *Ready*.
- **Consent Management Platform (CMP)** — wajib hanya kalau menargetkan trafik EEA/UK/Swiss. Untuk audiens Indonesia bisa dilewati; AdSense menyediakan CMP bawaan kalau nanti dibutuhkan.
- **Perubahan CSP** — repo tidak punya header CSP, jadi tidak ada yang memblokir `pagead2.googlesyndication.com`. Kalau CDN/hosting produksi menambahkan CSP sendiri, domain itu perlu di-allowlist.

## Verifikasi

1. Isi `adsense_publisher_id` di Strapi admin (`/admin` → Content Manager → Analytic), publish.
2. `bun run dev` (atau script dev yang dipakai repo), buka halaman mana saja → view-source dan pastikan ada `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-...` **dan** tag GA4 masih ada. Keduanya harus hidup bersamaan.
3. `curl -i http://localhost:3000/ads.txt` → `200`, isi satu baris `google.com, pub-..., DIRECT, f08c47fec0942fa0`.
4. Kosongkan field di Strapi, tunggu cache 5 menit lewat (atau restart dev server) → script AdSense hilang, situs tetap normal.
5. Matikan Strapi, reload frontend → halaman tetap render (jalur `catch` di service), tidak white screen.
6. Setelah deploy: `curl https://bubuh.id/ads.txt`, lalu di AdSense → *Sites* → *Add site* `bubuh.id` → *Request review*. Review biasanya beberapa hari, bisa sampai 2–4 minggu; jangan ubah situs besar-besaran atau submit ulang selama proses berjalan.
