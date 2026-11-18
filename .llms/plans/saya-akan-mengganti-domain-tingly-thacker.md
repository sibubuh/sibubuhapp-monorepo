# Pindah domain situs: porto.bubuh.id → bubuh.id (+ www)

## Context

Situs portfolio/stories saat ini dilayani di `porto.bubuh.id`. Pemilik ingin situs ini jadi domain utama `bubuh.id`, sekaligus memindahkan `www.bubuh.id` (saat ini blog Blogger, di-proxy Cloudflare) ke VPS yang sama. Hasil akhir: `bubuh.id` dan `www.bubuh.id` melayani aplikasi TanStack SSR di VPS, `porto.bubuh.id` redirect 301 permanen ke `bubuh.id`, dan tidak ada link/SEO lama yang mati.

### Temuan infrastruktur (sudah diverifikasi via `ssh vps`)

| Hal | Nilai aktual |
|---|---|
| IP publik VPS | **77.216.8.104** (bukan 77.216.8.14 seperti disebut di chat — kemungkinan salah ketik) |
| DNS `bubuh.id` | sudah → 77.216.8.104, DNS-only ✅ (saat ini kena 404 nginx karena belum ada vhost) |
| DNS `www.bubuh.id` | masih Cloudflare-proxied → Blogger ❌ perlu diubah |
| DNS `porto.bubuh.id` | → 77.216.8.104 ✅ |
| Proses | pm2: `frontend` (:3000), `strapi-backend` (:3080) |
| nginx vhost | `/etc/nginx/sites-available/frontend` (porto.bubuh.id), `backend` (cms.bubuh.id) |
| Cert | `/etc/letsencrypt/live/porto.bubuh.id`, `cms.bubuh.id` (belum ada untuk bubuh.id) |
| Deploy | GitHub Actions `.github/workflows/deploy.yml` on push `main` → `git reset --hard`, build, `pm2 startOrReload`, `systemctl reload nginx` |
| `.env` frontend VPS | belum punya `VITE_PUBLIC_SITE_URL` → jatuh ke fallback `https://porto.bubuh.id` |

### Dampak memindahkan www.bubuh.id

`apps/frontend/src/services/bubuhApi.ts:3` menarik feed Blogger dari `https://www.bubuh.id/feeds/posts/default` untuk `RecentBlogsSection`. Begitu `www` diarahkan ke VPS, feed itu mati. Sudah diverifikasi feed yang sama tetap bisa diakses lewat blog ID:

```
https://www.blogger.com/feeds/7588128007666021062/posts/default  → HTTP 200
```

URL artikel lama (`/YYYY/MM/slug.html`) **tidak akan mati**: route `apps/frontend/src/routes/$year/$month/$slug.tsx` sudah melayani pola itu dari Strapi lewat `blogspotPathFromParams` (`apps/frontend/libs/story.ts:30`).

---

## Prasyarat Cloudflare — ✅ SELESAI (diverifikasi 2026-11-18)

- `bubuh.id` → A `77.216.8.104`, DNS only ✅
- `www.bubuh.id` → A `77.216.8.104`, DNS only ✅ (dijawab nginx VPS, bukan Cloudflare proxy)
- Feed Blogger via blog ID masih HTTP 200 ✅

Siap lanjut ke Langkah 1.

---

## Langkah 1 — Perubahan repo

Semua di `apps/frontend`.

**Domain situs** (`porto.bubuh.id` → `bubuh.id`):

- `config/metadata.ts:14` — fallback `SITE_URL` jadi `https://bubuh.id`.
- `.env.example:6` dan `:9` — `VITE_PUBLIC_SITE_URL` dan contoh OG image.
- `public/robots.txt:1,85` — komentar header + `Sitemap:`.
- `public/.well-known/ai.txt` — baris 1, 4, 15, 20–23.
- `public/llms.txt` — baris 9, 10, 33–36.
- `public/ai/summary.json` — baris 3, 24, 25, 35–38.
- `public/ai/faq.json:2`.

Tidak perlu menyentuh konsumen `SITE_URL` (`libs/metadata.server.ts`, `src/components/seo/head.ts`, `src/components/seo/schema.ts`) — semuanya membaca konstanta itu.

**Sumber feed Blogger** (karena `www` pindah ke VPS):

- `src/services/bubuhApi.ts:3` — `BUBUH_API_BASE` → `https://www.blogger.com/feeds/7588128007666021062/posts/default`.
- `src/routes/__root.tsx:52` — `href` RSS → `https://www.blogger.com/feeds/7588128007666021062/posts/default?alt=rss`.
- `src/components/sections/RecentBlogsSection.tsx:62` — tombol "lihat semua" sekarang menunjuk ke situs kita sendiri; arahkan ke route internal `/stories`.
- `apps/backend/scripts/scrape-blogspot.mjs:21` — `BLOG_URL` ikut diganti ke feed blog ID (script sekali-jalan, tapi biar tidak menyesatkan).

Biarkan: `apps/backend/database/seeds/stories.json` (data historis), referensi `blogspot.com` di dalam konten.

## Langkah 2 — Env di VPS

Tambahkan ke `/var/www/sibubuhapp/apps/frontend/.env` (file gitignored, bertahan antar deploy):

```
VITE_PUBLIC_SITE_URL=https://bubuh.id
```

Ini variabel **build-time** — wajib rebuild frontend (dilakukan otomatis oleh GitHub Actions di Langkah 4). `apps/backend/.env` (`URL=https://cms.bubuh.id`) tidak berubah. Strapi CORS pakai default (`strapi::cors` tanpa origin list di `apps/backend/config/middlewares.ts:5`), jadi tidak perlu disesuaikan.

## Langkah 3 — nginx + TLS di VPS

Jalankan setelah DNS `www` sudah menunjuk ke VPS (cek: `dig +short www.bubuh.id A` → `77.216.8.104`).

1. Terbitkan cert:
   ```
   certbot certonly --nginx -d bubuh.id -d www.bubuh.id
   ```
2. Buat vhost baru `/etc/nginx/sites-available/bubuh.id`, salinan dari `frontend` yang ada dengan perubahan:
   - `server_name bubuh.id www.bubuh.id;`
   - cert path → `/etc/letsencrypt/live/bubuh.id/`
   - blok `location /assets/` dan `location /` (proxy ke `127.0.0.1:3000`) dipertahankan persis seperti vhost `frontend` sekarang, termasuk header `X-Forwarded-*`.
   - blok `listen 80` → `return 301 https://bubuh.id$request_uri;`
   - di blok 443, redirect `www` ke apex: `if ($host = www.bubuh.id) { return 301 https://bubuh.id$request_uri; }`
   - `symlink` ke `sites-enabled/`.
3. Ubah `/etc/nginx/sites-available/frontend` jadi redirect murni `porto.bubuh.id` (cert `porto.bubuh.id` tetap dipakai agar HTTPS lama tidak error):
   ```
   server { listen 443 ssl; server_name porto.bubuh.id; <cert porto>; return 301 https://bubuh.id$request_uri; }
   server { listen 80; server_name porto.bubuh.id; return 301 https://bubuh.id$request_uri; }
   ```
4. `nginx -t && systemctl reload nginx`

Urutan penting: vhost baru dinyalakan dulu dan dipastikan hidup, baru `porto` diubah jadi redirect.

## Langkah 4 — Deploy

Push branch → merge ke `main`. GitHub Actions akan `git reset --hard origin/main`, build frontend (mengambil `VITE_PUBLIC_SITE_URL` baru), build backend, `pm2 startOrReload ecosystem.config.js --update-env`, lalu `systemctl reload nginx`.

## Verifikasi

```bash
# 1. DNS
dig +short bubuh.id A www.bubuh.id A      # keduanya 77.216.8.104

# 2. Domain baru hidup + HTTPS valid
curl -sI https://bubuh.id | head -3                      # 200
curl -sI https://www.bubuh.id | head -3                  # 301 → https://bubuh.id/
curl -sI http://bubuh.id | head -3                       # 301 → https://

# 3. Redirect domain lama
curl -sI https://porto.bubuh.id/stories | grep -i location   # https://bubuh.id/stories

# 4. Canonical & SEO pakai domain baru
curl -s https://bubuh.id | grep -o 'rel="canonical" href="[^"]*"'
curl -s https://bubuh.id/robots.txt | grep Sitemap
curl -s https://bubuh.id/sitemap.xml | head -20

# 5. URL blog lama tetap hidup
curl -sI https://bubuh.id/2025/12/mengapa-domain-id-itu-penting-untuk-personal-branding-promo-domain-qwords.html | head -3

# 6. Feed Blogger masih terbaca (RecentBlogsSection tidak kosong)
curl -s "https://www.blogger.com/feeds/7588128007666021062/posts/default?alt=json&max-results=1" | head -c 200
```

Visual: buka `https://bubuh.id` dan pastikan section "Recent Blogs" terisi, dark mode dan halaman stories normal.

## Rollback

Kembalikan symlink `sites-enabled/frontend` ke isi lama (server_name `porto.bubuh.id`, proxy ke :3000), `nginx -t && systemctl reload nginx`, dan di Cloudflare kembalikan `www.bubuh.id` ke CNAME `ghs.google.com` (proxied). Backup kedua file vhost sebelum diedit.
