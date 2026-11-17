# Pemulihan data `stories` yang terhapus + pembersihan baris yatim

## Context

Data 219 story di database hilang — tabel `stories` sekarang **0 baris**. Yang hilang hanya data di database; **tidak ada pekerjaan kode yang hilang** dan **tidak ada file yang hilang**.

### Penyebab: Strapi men-drop tabelnya saat pindah branch

`git reflog` merekam urutan ini:

```
3b53a06 HEAD@{4}: commit: feat(home): source My Story section from Strapi stories
8bf9364 HEAD@{3}: checkout: moving from chore-schemablogging to main
8bf9364 HEAD@{2}: reset: moving to HEAD
2e457d0 HEAD@{1}: pull origin main: Fast-forward
3b53a06 HEAD@{0}: checkout: moving from main to chore-schemablogging
```

Saat berada di `main`, folder `apps/backend/src/api/story/` tidak ada — content type `story` belum di-merge ke sana. Strapi `develop` (prosesnya masih berjalan, PID 45115, dimulai 19:02) menyinkronkan skema database dengan source tree setiap kali restart. Begitu content type-nya lenyap dari source, **Strapi men-drop tabel `stories` dan `stories_cmps`**. Kembali ke branch `chore-schemablogging` membuat Strapi membangun ulang tabelnya — kosong.

Bukti yang memastikan ini **drop table**, bukan sekadar `DELETE`:

```
sequencename          | last_value
----------------------+-----------
stories_id_seq        |            ← NULL: sequence belum pernah dipakai sama sekali
stories_cmps_id_seq   |            ← NULL
files_id_seq          |      1301
components_shared_seos_id_seq | 2636
```

Kalau barisnya dihapus, sequence akan tetap di angka ~438. `NULL` berarti tabelnya baru dibuat ulang dari nol.

### Kerusakan sampingan: 808 baris yatim

Tabel `stories` di-drop, tapi tabel milik plugin dan komponen tidak ikut dibersihkan — Strapi tidak menjalankan cascade delete pada operasi skema ini:

| Tabel | Jumlah | Status |
|---|---|---|
| `stories` | 0 | kosong, perlu diisi ulang |
| `stories_cmps` | 0 | kosong |
| `files` | 1250 | **utuh** — 1.187 gambar hasil import masih ada |
| `files_related_mph` (`related_type='api::story.story'`) | **372** | **yatim** — menunjuk ke story id yang sudah tidak ada |
| `components_shared_seos` | 446, **436 yatim** | tidak direferensikan `*_cmps` mana pun |

**372 baris `files_related_mph` itu berbahaya, bukan sekadar sampah.** Sequence `stories_id_seq` sudah reset ke awal, jadi import ulang akan menghasilkan story dengan id 1–438 lagi — id yang sama persis dengan yang ditunjuk baris-baris yatim tersebut. Hasilnya thumbnail akan menempel ke story yang salah. **Baris ini harus dihapus sebelum import ulang, bukan sesudah.**

### Yang masih aman

- `apps/backend/database/seeds/stories.json` — **219 story**, utuh
- `apps/backend/database/seeds/media/` — **1.194 file**, utuh
- `apps/backend/public/uploads/` — 4.107 file, utuh
- `files` di database — 1.250 baris, jadi import ulang akan **memakai ulang** media yang sudah ter-upload (`uploadMedia()` mencari berdasarkan `name` lebih dulu), bukan meng-upload 137 MB lagi
- Importer bersifat idempoten dan sudah terbukti: re-run menghasilkan `0 created / 219 updated`

Artinya pemulihan hanya butuh beberapa menit, bukan mengulang scraping.

---

## Langkah

### 1. Hentikan Strapi dev dulu

Proses `strapi develop` (PID 45115) harus mati sebelum apa pun dijalankan. Importer mem-boot instance Strapi-nya sendiri, dan dua instance menulis ke database yang sama adalah resep masalah.

```bash
# dari terminal tempat `pnpm --filter=backend run dev` berjalan: Ctrl-C
```

### 2. Hapus baris yatim

Jalankan **sebelum** import. Satu transaksi supaya tidak setengah jalan:

```sql
BEGIN;

-- Relasi thumbnail yang menunjuk ke story id yang sudah tidak ada.
-- Wajib dihapus: sequence sudah reset, jadi id ini akan dipakai ulang.
DELETE FROM files_related_mph WHERE related_type = 'api::story.story';

-- Komponen SEO yang tidak lagi direferensikan *_cmps mana pun,
-- berikut relasi metaImage-nya.
CREATE TEMP TABLE orphan_seo AS
SELECT s.id
FROM components_shared_seos s
WHERE NOT EXISTS (
  SELECT 1 FROM pages_cmps     c WHERE c.component_type = 'shared.seo' AND c.cmp_id = s.id
  UNION ALL SELECT 1 FROM posts_cmps    c WHERE c.component_type = 'shared.seo' AND c.cmp_id = s.id
  UNION ALL SELECT 1 FROM projects_cmps c WHERE c.component_type = 'shared.seo' AND c.cmp_id = s.id
  UNION ALL SELECT 1 FROM stories_cmps  c WHERE c.component_type = 'shared.seo' AND c.cmp_id = s.id
  UNION ALL SELECT 1 FROM clients_cmps  c WHERE c.component_type = 'shared.seo' AND c.cmp_id = s.id
);

DELETE FROM files_related_mph
WHERE related_type = 'shared.seo'
  AND related_id IN (SELECT id FROM orphan_seo);

DELETE FROM components_shared_seos
WHERE id IN (SELECT id FROM orphan_seo);

COMMIT;
```

Dijalankan lewat:
```bash
docker exec -i tanstack_pgsql psql -U postgres -d tanstack < /tmp/clean-story-orphans.sql
```

**Verifikasi sebelum COMMIT** bahwa `orphan_seo` berisi 436 baris, bukan 446. Kalau 446, berarti query referensi salah dan SEO milik `page`/`project` ikut terhapus — batalkan dengan `ROLLBACK`.

### 3. Pastikan `dist/` masih sesuai schema

Importer boot dari `apps/backend/dist`. Pindah branch bolak-balik bisa membuatnya basi:

```bash
pnpm --filter=backend run build
```

### 4. Import ulang

```bash
pnpm --filter=backend run import:stories
```

Harapan: `created: 219`, `updated: 0`, `failed: 0`, `media linked: 1187`, `seo skipped: 1`. Jumlah `files` harus **tetap 1250** — kalau naik, berarti dedupe media gagal dan ada upload ganda.

### 5. Verifikasi

```sql
SELECT count(*) FILTER (WHERE published_at IS NOT NULL) AS published,
       count(DISTINCT slug) AS slugs,
       count(*) FILTER (WHERE content ~ 'blogger\.googleusercontent|bp\.blogspot\.com') AS leftover_cdn
FROM stories;

SELECT count(*) FROM files_related_mph WHERE related_type = 'api::story.story';  -- harus 372 lagi
SELECT count(*) FROM components_shared_seos;                                      -- harus 446 lagi
SELECT count(*) FROM files;                                                       -- harus tetap 1250
```

Lalu dengan Strapi dan frontend jalan:

- `/stories` → 200, "219 cerita", "Halaman 1 dari 19"
- `/stories/mengapa-domain-id-itu-penting-untuk-personal-branding-promo-domain-qwords` → 200
- `/2025/12/mengapa-domain-id-...html` → 301
- Homepage → 6 kartu story di section "My Story"
- Buka satu story dan pastikan thumbnail-nya **cocok dengan judulnya** — ini uji paling penting untuk membuktikan relasi yatim benar-benar bersih

---

## Mencegah terulang

Masalahnya struktural: **selama content type `story` hanya ada di branch `chore-schemablogging`, setiap `git checkout main` dengan Strapi dev berjalan akan menghapus tabelnya lagi.**

Urutan prioritas:

1. **Merge branch ini ke `main`.** Ini satu-satunya solusi sebenarnya — begitu `story` ada di `main`, pindah branch tidak lagi destruktif.
2. **Sampai itu terjadi: matikan Strapi sebelum pindah branch.** Tidak ada konfigurasi Strapi 5 yang bisa mematikan sinkronisasi skema destruktif ini.
3. Tambahkan catatan di `AGENTS.md` agar aturannya tertulis, bukan hanya diingat.

Jaring pengamannya sudah ada dan sudah terbukti hari ini: `stories.json` + `database/seeds/media/` membuat pemulihan cukup satu perintah, tanpa perlu scraping ulang 219 halaman.

---

## File yang disentuh

Hanya satu, dan sifatnya opsional:

- `AGENTS.md` — catatan "matikan Strapi dev sebelum pindah branch selama `story` belum ada di `main`"

Sisanya adalah operasi database dan menjalankan script yang sudah ada. **Tidak ada kode aplikasi yang perlu diubah** — tidak ada yang rusak di sana.
