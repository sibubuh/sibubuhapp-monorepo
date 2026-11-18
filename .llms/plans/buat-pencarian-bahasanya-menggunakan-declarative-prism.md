# Search UI copy: Indonesian → English

## Context

Fitur pencarian (commit `7e7a5ca`) dikirim dengan copy berbahasa Indonesia. Permintaan: ganti bahasa pencarian ke bahasa Inggris.

Backend-nya netral bahasa — `apps/backend/src/utils/search-text.ts` hanya meratakan teks dokumen ke kolom `searchText` lalu difilter `$containsi`; tidak ada stopword, stemmer, atau kamus Indonesia. Jadi perubahan ini murni copy UI, bukan logika pencarian. Hasilnya tetap mencari konten Strapi apa adanya (konten CMS tetap berbahasa Indonesia).

Tidak ada i18n di frontend — semua string hardcoded, jadi cukup edit string di tempat. Tidak ada string pencarian yang datang dari Strapi: judul & meta halaman `/search` hardcoded di route, dan ikon search di Navbar hardcoded (link nav lainnya dari `getHeader`).

## Scope

Hanya 10 string di 2 file. Tidak menambah i18n, tidak menyentuh backend, tidak mengubah konten CMS.

## Perubahan

### `apps/frontend/src/routes/search.tsx`

| Baris | Sekarang | Jadi |
|---|---|---|
| 44 | `title: "Pencarian"` | `"Search"` |
| 46 | `"Cari cerita, project dan halaman di bubuh.id dalam satu tempat."` | `"Search stories, projects and pages on bubuh.id in one place."` |
| 65 | `Pencarian` (h1) | `Search` |
| 85 | `placeholder="Cari cerita, project, atau halaman…"` | `"Search stories, projects, or pages…"` |
| 86 | `aria-label="Kata kunci pencarian"` | `"Search keyword"` |
| 93 | `Cari` (tombol submit) | `Search` |
| 99 | `{total} hasil untuk “{q}”` | `{total} {total === 1 ? "result" : "results"} for “{q}”` |
| 106 | `Tidak ada hasil untuk “{q}”. Coba kata kunci lain.` | `No results for “{q}”. Try another keyword.` |
| 131 | `<ResultGroup title="Halaman">` | `title="Pages"` |

Grup `"Stories"` dan `"Projects"` (baris 111, 121) sudah Inggris — biarkan.

Pluralisasi dibuat inline karena cuma satu tempat; tidak perlu helper.

### `apps/frontend/src/components/ui/Navbar.tsx`

Baris 127 dan 145: `aria-label="Cari"` → `aria-label="Search"` (dua occurrence, desktop + mobile).

## Verifikasi

1. `pnpm dev` di `apps/frontend` (backend Strapi harus jalan — ingat jangan `git checkout` saat `strapi develop` hidup).
2. Buka `/search`: cek h1, placeholder, tombol.
3. Cari kata yang ada (mis. judul story) → header hitungan berbunyi `N results for “…”`; cek kasus 1 hasil berbunyi `1 result`.
4. Cari kata ngawur → `No results for “…”. Try another keyword.`
5. Cek grup `Pages` muncul saat ada page yang cocok.
6. Inspect ikon search di Navbar (desktop & mobile) → `aria-label="Search"`.
7. View source `/search` → `<title>` dan meta description berbahasa Inggris, `noindex` masih ada.

Tidak ada test yang menyentuh string ini; `apps/backend/src/utils/search-text.test.ts` tidak terpengaruh.

## Catatan

Sisa situs (navigasi, konten CMS) tetap berbahasa Indonesia, jadi halaman pencarian akan jadi satu-satunya yang berbahasa Inggris. Itu memang yang diminta.
