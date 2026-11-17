# Migrasi Blogspot bubuh.id → Strapi Collection Type `story`

## Context

Saat ini segmen blog di frontend (`RecentBlogsSection`) menarik data **live** dari Blogger lewat RSS2JSON (`apps/frontend/src/services/bubuhApi.ts`), dan setiap kartu nge-link **keluar** ke `bubuh.id`. Konsekuensinya: tidak ada konten artikel yang dimiliki sendiri, tidak ada `BlogPosting` JSON-LD, SEO value mengalir ke Blogger, dan render bergantung pada API pihak ketiga + API key yang ter-embed di client bundle.

Tujuan perubahan ini: menarik **seluruh 219 post** dari bubuh.id ke database Strapi sebagai collection type baru `story`, dengan **slug yang sama persis** seperti di Blogger sehingga URL lama bisa dipetakan 1:1 (redirect 301 menyusul). Setelah ini, konten jadi milik sendiri, bisa di-query, di-index, dan di-render dengan structured data sendiri.

**Catatan penting:** `PRODUCT.md` saat ini menyatakan *"Blog posts are not stored in Strapi; they are pulled live from the Blogger blog at bubuh.id through RSS2JSON"* dan *"The blog feed must come from bubuh.id (Blogger) — keep it as the story source."* Rencana ini membalik keputusan tersebut, jadi `PRODUCT.md` harus ikut diperbarui sebagai bagian dari pekerjaan.

### Temuan riset yang membentuk rencana ini

| Temuan | Implikasi |
|---|---|
| Feed Blogger di-set **"Short"** — `/feeds/posts/default?alt=json` hanya mengembalikan `summary`, bukan `content` | Konten penuh **harus di-scrape** dari HTML tiap halaman post. Sudah diverifikasi: `<div ... itemprop='articleBody'>` ada dan utuh. |
| `openSearch$totalResults` = **219** post | Feed harus dipaginasi (`start-index` + `max-results=150`), lalu 219 kali fetch halaman post. |
| Sampel post: ~5 gambar CDN Blogger + 1 iframe per post | Estimasi **~1.100 gambar** perlu diunduh & di-upload ke Media Library. |
| Halaman post **tidak punya** JSON-LD, tapi punya meta `og:*` + `description` lengkap | Metadata SEO diambil dari meta tag, bukan ld+json. |
| Strapi **5.25.0** + **Postgres**, `config/plugins.ts` **tidak** mengaktifkan provider S3 (meski `@strapi/provider-upload-aws-s3` terinstal) | Upload default ke `apps/backend/public/uploads/` (local disk). Lihat Risiko. |
| Collection `post` yang ada punya `title` **minLength 50**, `thumbnail` media **required**, `content` bertipe **blocks** | Tidak dipakai — banyak judul Blogger < 50 char dan konten HTML tidak muat di `blocks`. Makanya bikin `story` baru. |
| `src/index.ts` punya `register`/`bootstrap` kosong, tidak ada lifecycle hooks, tidak ada seed script | Infrastruktur import dibangun dari nol. |
| `plan.md` Phase 1.3 sudah menetapkan DOMPurify untuk HTML mentah dari Strapi (`RawHtmlSection.tsx`) | HTML `story` **wajib** lewat jalur sanitasi yang sama saat dirender. |

### Keputusan yang sudah dikonfirmasi owner

1. **Collection baru `story`** — `post` lama dibiarkan apa adanya.
2. **Konten disimpan sebagai HTML** di field `richtext` (lossless: iframe, embed, tabel, styling inline ikut).
3. **Gambar diunduh ke Strapi Media Library** — thumbnail maupun gambar inline, URL di HTML di-rewrite.
4. **Slug saja** (`mengapa-domain-id-itu-penting...`, tanpa `.html`) **+ simpan URL asli** di `blogspotUrl` / `blogspotPath` untuk redirect nanti.

---

## Arsitektur: dua fase terpisah

Scraping dipisah total dari import supaya hasil scrape bisa di-review, di-commit, dan import bisa diulang tanpa menembak bubuh.id 219 kali lagi.

```
Fase A (standalone Node, tanpa Strapi)
  bubuh.id feed + 219 halaman post
    └→ apps/backend/database/seeds/stories.json      (metadata + HTML mentah)
    └→ apps/backend/database/seeds/media/*           (gambar hasil unduh)

Fase B (di dalam Strapi runtime)
  stories.json + media/
    └→ upload service  → Media Library (entri file)
    └→ document service → tabel `stories` (upsert by blogspotId)
```

---

## Fase 0 — Content Type `story`

**File baru:**
- `apps/backend/src/api/story/content-types/story/schema.json`
- `apps/backend/src/api/story/controllers/story.ts` — `factories.createCoreController('api::story.story')`
- `apps/backend/src/api/story/routes/story.ts` — `factories.createCoreRouter('api::story.story')`
- `apps/backend/src/api/story/services/story.ts` — `factories.createCoreService('api::story.story')`

Ketiga file controller/routes/services persis meniru pola `apps/backend/src/api/post/` (semuanya default factory, tanpa kustomisasi).

**Skema:**

| Field | Tipe | Keterangan |
|---|---|---|
| `title` | `string`, required, max 255 | **Tanpa** `minLength` — berbeda dari `post`, karena judul Blogger banyak yang pendek |
| `slug` | `uid`, `targetField: "title"`, required, max 255 | Diisi eksplisit dari slug Blogger saat import, bukan hasil auto-generate |
| `excerpt` | `text`, max 500 | Dari `<meta name='description'>`, fallback ke `summary` feed |
| `content` | `richtext`, required | HTML mentah dari `div[itemprop='articleBody']`, URL gambar sudah di-rewrite |
| `contentText` | `text` | Plain text hasil strip tag — untuk search & reading time |
| `thumbnail` | `media` single, images only, **tidak** required | Tidak semua post punya `media$thumbnail` |
| `labels` | `json` | Array string dari `category[].term` Blogger |
| `blogspotId` | `string`, required, **`unique: true`** | Post ID numerik dari `tag:blogger.com,1999:blog-<blog>.post-<id>` — kunci idempotensi |
| `blogspotUrl` | `string`, max 500 | URL absolut asli |
| `blogspotPath` | `string`, max 500 | `/2025/12/slug.html` — bahan redirect 301 |
| `publishedDate` | `datetime`, required | Dari `entry.published` (offset `+07:00` dipertahankan) |
| `updatedDate` | `datetime` | Dari `entry.updated` |
| `commentCount` | `integer`, default 0 | Dari `thr$total` |
| `author` | `string`, max 255 | Dari `entry.author[0].name` |
| `seo` | component `shared.seo`, non-repeatable | **Reuse** `apps/backend/src/components/shared/seo.json` yang sudah ada |

**Options:** `draftAndPublish: true`. **i18n: tidak diaktifkan** — seluruh konten bubuh.id berbahasa Indonesia tunggal; mengaktifkan i18n hanya menambah kompleksitas `localizations` tanpa data pasangan.

> **Hati-hati dengan `shared.seo`:** `metaTitle` required max **60**, `metaDescription` required **min 50** max **160**. Banyak judul/deskripsi Blogger akan melanggar batas ini. Importer **wajib** memotong `metaTitle` ke 60 char dan hanya mengisi komponen `seo` bila `metaDescription` hasil sumber panjangnya 50–160; kalau tidak, biarkan `seo` kosong (field-nya optional) dan andalkan `excerpt`. Jangan melonggarkan constraint di `shared.seo` — komponen itu dipakai bersama oleh `post` dan `page`.

Setelah schema dibuat, jalankan `pnpm --filter=backend run dev` sekali supaya Strapi membuat tabel `stories` + menulis ulang `apps/backend/types/generated/contentTypes.d.ts`. **Jangan** mengedit file generated itu manual.

---

## Fase A — Scraper standalone

**File baru:** `apps/backend/scripts/scrape-blogspot.mjs` (plain ESM Node, nol dependency di luar `node:*` + `undici`/`fetch` bawaan).

Langkah:

1. **Paginasi feed.** Loop `https://www.bubuh.id/feeds/posts/default?alt=json&max-results=150&start-index=N` sampai `startIndex + itemsPerPage > totalResults`. Kumpulkan per entry: `id`, `title.$t`, `published.$t`, `updated.$t`, `category[].term`, `thr$total.$t`, `author[0].name.$t`, `media$thumbnail.url`, dan `link[rel='alternate'].href`.
2. **Turunkan slug.** Dari `link[rel='alternate'].href` → path `/2025/12/xxx.html`. `slug` = basename tanpa `.html`. Simpan `blogspotUrl` (href penuh) dan `blogspotPath`. Deteksi slug duplikat dan hentikan proses dengan error bila ada — slug adalah `uid` yang harus unik.
3. **Fetch tiap halaman post** dengan konkurensi dibatasi (**4 paralel**, jeda ~250 ms, `User-Agent` wajar, retry 3× dengan backoff eksponensial). Jangan pakai `Promise.all` tanpa batas — 219 request serentak akan kena rate limit.
4. **Ekstrak `articleBody`.** Cari `<div ... itemprop='articleBody' ...>` lalu ambil isinya dengan **penghitung kedalaman `<div>`** (balanced-tag counting), bukan regex non-greedy — isi post penuh dengan `<div>` bersarang. Dari `<head>`, ambil `meta[name=description]`, `meta[property=og:image]`, `meta[property=og:title]`.
5. **Bersihkan HTML:** buang `<script>`, atribut `on*`, dan `img[src*='resources.blogblog.com/img/blank.gif']` (placeholder lazy-load Blogger — terkonfirmasi ada di sampel). Normalisasi URL protocol-relative `//blogger.googleusercontent.com/...` → `https://`.
6. **Unduh gambar.** Kumpulkan semua `src` CDN Blogger (thumbnail + inline), simpan ke `apps/backend/database/seeds/media/<sha1-url>.<ext>`, dedupe lewat hash URL. Lewati yang gagal unduh dan catat di laporan — jangan gagalkan post utuh karena satu gambar mati. Upgrade URL thumbnail ke resolusi penuh (ganti segmen ukuran `/s72-c/` → `/s1600/`).
7. **Tulis `apps/backend/database/seeds/stories.json`** — array object, HTML masih memakai URL CDN asli ditambah peta `images: [{ originalUrl, localFile }]`. Rewrite URL dilakukan di Fase B setelah tahu URL Strapi final.
8. **Cetak ringkasan:** jumlah post berhasil, gagal, gambar terunduh, gambar gagal, slug duplikat.

Gitignore `apps/backend/database/seeds/media/` (bisa ratusan MB); `stories.json` boleh di-commit sebagai artefak yang bisa di-review.

---

## Fase B — Importer ke Strapi

**File baru:** `apps/backend/scripts/import-stories.ts`

Karena Strapi 5 tidak punya CLI runner script, bootstrap instance-nya langsung:

```ts
import { createStrapi, compileStrapi } from '@strapi/strapi'
const app = await createStrapi({ appDir: process.cwd(), distDir: './dist' }).load()
```

Lalu:

1. **Upload media.** Untuk tiap file di `media/`, panggil `strapi.plugin('upload').service('upload').upload({ data: {}, files: {...} })`. Simpan peta `originalUrl → { id, url }`. Cek dulu berdasarkan `hash`/`name` supaya re-run tidak menduplikasi file.
2. **Rewrite HTML.** Ganti tiap `originalUrl` di `content` dengan URL Strapi hasil upload.
3. **Turunkan `contentText`** — strip tag + normalisasi whitespace.
4. **Susun `seo`** dengan aturan batas panjang di Fase 0 (`metaTitle` ≤ 60; `seo` hanya diisi bila `metaDescription` 50–160 char).
5. **Upsert.** `strapi.documents('api::story.story').findFirst({ filters: { blogspotId } })` → `.update()` kalau ada, `.create()` kalau belum. Set `status: 'published'`. Idempoten, aman dijalankan ulang.
6. **Laporan akhir:** jumlah created / updated / skipped / failed, beserta daftar slug yang gagal.

Tambahkan script di `apps/backend/package.json`:
```json
"scrape:blogspot": "node scripts/scrape-blogspot.mjs",
"import:stories": "strapi ts:run scripts/import-stories.ts"
```
(Kalau `strapi ts:run` tidak tersedia di 5.25.0, pakai `tsx scripts/import-stories.ts` — cek dulu dengan `npx strapi --help`.)

---

## Fase C — Types frontend

**File baru:** `apps/frontend/types/story.ts`

```ts
import { ImageType } from './image'
import { SeoData } from './seo'

export type Story = {
  id: number
  documentId: string
  title: string
  slug: string
  excerpt?: string
  content: string          // HTML — WAJIB disanitasi sebelum render
  contentText?: string
  thumbnail?: ImageType
  labels: string[]
  blogspotId: string
  blogspotUrl?: string
  blogspotPath?: string
  publishedDate: string
  updatedDate?: string
  commentCount: number
  author?: string
  seo?: SeoData
  createdAt: string
  updatedAt: string
  publishedAt: string
}
```

- Re-export dari `apps/frontend/types/index.ts` (barrel yang sudah ada).
- Tambahkan `getStories({ limit, page, label? })` dan `getStoryDetail({ slug })` di `apps/frontend/services/api.ts`, **reuse** `fetchWithAuth` dari `services/client.ts` dan pola `QueryString` yang dipakai `getNews`/`getNewsDetail`. Populate `["thumbnail", "seo", "seo.metaImage"]`. Karena `story` tidak i18n, **jangan** pakai `getDataWithLocalization` — panggil `fetchWithAuth` langsung.

**Di luar scope rencana ini (kerjakan terpisah setelah data masuk):** route `/stories/$slug`, mengganti `RecentBlogsSection` dari RSS2JSON ke Strapi, JSON-LD `BlogPosting` di `src/components/seo/schema.ts`, dan redirect 301 dari `blogspotPath`. Field `blogspotPath` sengaja disiapkan supaya pekerjaan itu bisa langsung jalan.

---

## File yang disentuh

**Baru:**
- `apps/backend/src/api/story/{content-types/story/schema.json, controllers/story.ts, routes/story.ts, services/story.ts}`
- `apps/backend/scripts/scrape-blogspot.mjs`
- `apps/backend/scripts/import-stories.ts`
- `apps/backend/database/seeds/stories.json` (artefak hasil scrape)
- `apps/frontend/types/story.ts`

**Dimodifikasi:**
- `apps/backend/package.json` — dua script baru
- `apps/backend/types/generated/contentTypes.d.ts` — regenerate otomatis oleh Strapi
- `apps/frontend/types/index.ts` — re-export `Story`
- `apps/frontend/services/api.ts` — `getStories`, `getStoryDetail`
- `PRODUCT.md` — perbarui pernyataan "blog posts are not stored in Strapi"
- `.gitignore` — abaikan `apps/backend/database/seeds/media/`

---

## Risiko

1. **Upload provider belum dikonfigurasi.** `config/plugins.ts` tidak mendaftarkan provider S3, jadi ~1.100 gambar akan mendarat di `apps/backend/public/uploads/` (disk lokal, ikut image Docker). Opsi: aktifkan provider S3 lebih dulu memakai variabel AWS yang sudah ada di `.env.example`, atau terima penyimpanan lokal untuk sekarang. **Perlu keputusan sebelum menjalankan Fase B.**
2. **Constraint `shared.seo`** (`metaDescription` min 50) akan menolak banyak post. Mitigasinya sudah dirancang: `seo` optional dan hanya diisi kalau valid.
3. **Scraping berbasis struktur HTML** rapuh terhadap perubahan tema Blogger. Karena itu Fase A dipisah dan hasilnya disimpan sebagai JSON — re-scrape hanya perlu dilakukan kalau tema berubah.
4. **Durasi.** 219 halaman + ~1.100 gambar dengan rate limiting ≈ 10–20 menit per run penuh.

---

## Verifikasi

1. `docker compose up -d` — nyalakan Postgres 16.
2. `pnpm --filter=backend run dev` — pastikan Strapi start tanpa error dan tabel `stories` terbentuk. Cek di pgweb bahwa kolomnya sesuai skema.
3. Buka admin Strapi → Content Manager, konfirmasi collection **Story** muncul dengan semua field; buat satu entry manual untuk memvalidasi constraint, lalu hapus.
4. `pnpm --filter=backend run scrape:blogspot` — periksa ringkasan: harus **219** post, nol slug duplikat. Buka `stories.json` dan inspeksi 3 entry acak (HTML utuh, slug benar, tanggal benar).
5. `pnpm --filter=backend run import:stories` — periksa laporan created/updated/failed.
6. Jalankan ulang `import:stories` → semuanya harus **updated**, nol created. Ini membuktikan idempotensi.
7. Berikan permission `find`/`findOne` untuk `story` di Settings → Users & Permissions, lalu:
   `curl 'http://localhost:3080/api/stories?populate=thumbnail&pagination[pageSize]=5'` → cek 5 entry dengan thumbnail ter-resolve ke URL Strapi (bukan CDN Blogger).
8. `curl 'http://localhost:3080/api/stories?filters[slug][$eq]=mengapa-domain-id-itu-penting-untuk-personal-branding-promo-domain-qwords'` → harus mengembalikan tepat 1 entry; bandingkan `content`-nya dengan halaman aslinya di bubuh.id.
9. Grep `content` beberapa entry untuk memastikan **tidak ada** URL `blogger.googleusercontent.com` tersisa dan tidak ada `blank.gif`.
10. `pnpm --filter=frontend run typecheck` (atau `build`) — pastikan `Story` dan fungsi service baru lolos TypeScript.
