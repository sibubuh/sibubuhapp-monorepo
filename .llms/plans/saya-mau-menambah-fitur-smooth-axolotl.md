# Fitur Pencarian Konten (stories, projects, pages)

## Context

Website bubuh.id belum punya pencarian sama sekali. Yang ada hanya filter `?label=`
di `/stories` (tanpa UI) dan filter kategori client-side di `ProjectGrid`.
Pengunjung tidak bisa menemukan konten lintas tipe.

Target: satu kotak pencarian di Navbar → halaman `/search?q=` yang mencari
**stories, projects, dan pages**, hasilnya dikelompokkan per tipe.

Hambatan teknis yang menentukan desain:

- `story` sudah punya `contentText` (plain text) → bisa langsung difilter `$containsi`. Nol pekerjaan backend.
- `page.sections` adalah **dynamic zone** dan `project.description` bertipe **blocks** (JSON).
  Keduanya **tidak bisa** difilter lewat REST `filters` Strapi.
- Karena itu: tambah kolom `searchText` (plain text) di `page` dan `project`,
  diisi otomatis oleh **document service middleware**, lalu difilter `$containsi`.

Keputusan user: isi page ikut dicari (menerima perubahan backend), UI = ikon
navbar → halaman `/search`, hasil dikelompokkan per tipe tanpa paginasi.

### Temuan yang mengubah pendekatan (sudah diverifikasi di source `@strapi/*` 5.25.0)

1. **`lifecycles.ts` TIDAK bisa dipakai.** Hook `beforeCreate`/`beforeUpdate` jalan di
   lapisan database — saat itu dynamic zone sudah diganti jadi referensi
   `{id, __component, __pivot}` (`@strapi/core/dist/services/document-service/components.js:55-71`),
   teksnya sudah hilang. Yang benar: `strapi.documents.use(...)` middleware, yang
   menerima `ctx.params.data` **sebelum** validasi dan masih berisi nilai penuh
   (`@strapi/core/dist/services/document-service/index.js:33-55`).
2. **`searchText` tidak boleh `"private": true`.** Validasi REST menolak filter pada
   atribut private dengan 400 (`@strapi/utils/dist/validate/validators.js:20-26, 72-74`).
   Konsekuensi: field ini ikut terkirim di response → lihat langkah 7 (batasi dengan `fields`).
3. `$containsi` dan `$or` tingkat atas **didukung** (`@strapi/utils/dist/operators.js:4-31`,
   `@strapi/database/dist/query/helpers/where.js:290-296`).
4. `populate: '*'` hanya **satu level** — komponen di dalam komponen tidak ikut.
   Bentuk dalam untuk dynamic zone: `{ sections: { on: { 'sections.x': { populate: {...} } } } }`.
5. Menambah atribut di `schema.json` **otomatis** membuat kolom Postgres, baik di
   `strapi develop` maupun `strapi start` (`db.schema.sync()` di `@strapi/core/dist/Strapi.js:361`).

---

## Backend (`apps/backend`)

### 1. Tambah field `searchText`

`src/api/page/content-types/page/schema.json` — `page` di-i18n, ikuti pola field lain:

```json
"searchText": {
  "type": "text",
  "pluginOptions": { "i18n": { "localized": true } }
}
```

`src/api/project/content-types/project/schema.json` (tidak di-i18n):

```json
"searchText": { "type": "text" }
```

> Field ini diisi otomatis; biarkan saja terlihat di admin (menandainya `private`
> akan membuat filter REST gagal 400 — lihat temuan #2).

### 2. `src/utils/search-text.ts` (baru)

Dua fungsi murni, tanpa dependensi:

- `flattenText(value: unknown): string` — jalan rekursif ke array/objek, kumpulkan
  semua `string`. Yang perlu ditangani:
  - **skip key struktural**: `__component`, `__pivot`, `id`, `documentId`, `type`,
    `format`, `level`, `url`, `href`, `hash`, `ext`, `mime`, `provider`,
    `previewUrl`, `formats`, `locale` (`type` wajib di-skip, kalau tidak node
    blocks ikut menyumbang kata `paragraph`/`text`).
  - **strip HTML** untuk `raw-html` / richtext: `.replace(/<[^>]*>/g, " ")`.
  - rapikan whitespace, potong di ~200.000 karakter sebagai pagar pengaman.
- `buildComponentPopulate(uid: string)` — bangun objek populate dalam dari
  `strapi.contentTypes[uid].attributes` + `strapi.components`, **hanya** menelusuri
  atribut bertipe `component` dan `dynamiczone` (abaikan media/relasi supaya
  payload backfill tetap kecil). Dynamic zone memakai bentuk `on` (temuan #4).

### 3. `src/utils/search-text.test.ts` (baru)

`node --test` (Node 22.23 sudah type-stripping, nol dependensi baru). Minimal:
dynamic zone berisi `sections.raw-html` (HTML), `sections.quote`, dan satu
`blocks` → pastikan hasilnya memuat teks aslinya dan **tidak** memuat
`paragraph` / `sections.quote` / tag HTML. Tambah script di `package.json`:
`"test": "node --test src/utils/*.test.ts"`.

### 4. `src/index.ts` — middleware + backfill

`register({ strapi })`:

```ts
const TARGETS = ["api::page.page", "api::project.project"];

strapi.documents.use(async (ctx, next) => {
  if (!TARGETS.includes(ctx.uid) || !["create", "update"].includes(ctx.action))
    return next();

  const data = ctx.params?.data;
  if (!data) return next();

  // Update bisa parsial: ambil dokumen lama sebagai dasar lalu timpa dengan data baru.
  const base =
    ctx.action === "update"
      ? await strapi.documents(ctx.uid).findOne({
          documentId: ctx.params.documentId,
          locale: ctx.params.locale,
          populate: buildComponentPopulate(ctx.uid),
        })
      : null;

  data.searchText = flattenText({ ...base, ...data });
  return next();
});
```

`bootstrap({ strapi })` — isi entri lama yang `searchText`-nya masih null,
idempoten dan praktis gratis setelah jalan sekali:

- Untuk tiap uid dan tiap `status` (`"draft"` lalu `"published"`):
  `strapi.documents(uid).findMany({ status, populate: buildComponentPopulate(uid), filters: { searchText: { $null: true } } })`.
- Tulis balik lewat `strapi.db.query(uid).update({ where: { documentId, locale, publishedAt: status === "draft" ? null : { $notNull: true } }, data: { searchText } })`
  — menulis baris langsung supaya tidak ikut mengubah state draft/publish.
- `strapi.log.info` jumlah baris yang diisi.

> Alasan backfill di `bootstrap`, bukan script terpisah: bisa `import` util TS
> apa adanya, tidak perlu entry `package.json` baru, dan tidak perlu buka-simpan
> puluhan entri satu per satu di admin.

---

## Frontend (`apps/frontend`)

### 5. `services/api.ts` — `searchContent()`

Panggil `fetchWithAuth` langsung (pola `getStories`, baris 292), **jangan** lewat
`getDataWithLocalization`: fungsi itu memakai `QueryString.stringify(..., { encode: false })`
yang tidak aman untuk teks ketikan user.

```ts
export async function searchContent({ q, limit = 10 }: { q: string; limit?: number }) {
  const [stories, projects, pages] = await Promise.all([...]);
}
```

- **stories** — `/api/stories`, `filters: { $or: [{ title: { $containsi: q } }, { excerpt: { $containsi: q } }, { contentText: { $containsi: q } }] }`,
  `fields: ["title","slug","excerpt","publishedDate","labels"]`, `populate: ["thumbnail"]`,
  `sort: ["publishedDate:desc"]`, `pagination: { pageSize: limit, page: 1, withCount: true }`.
- **projects** — `/api/projects`, `$or` atas `title`, `category`, `searchText`;
  `fields: ["title","slug","category","years"]`, `populate: ["cover","cover.image"]`.
  Map hasilnya lewat `transformCover` (sudah ada, baris 831) supaya bentuknya cocok
  dengan `ProjectCard` (`project.cover.image.url`).
- **pages** — `/api/pages`, `$or` atas `title` dan `searchText`,
  `fields: ["title","slug"]`, `locale: DEFAULT_LANGUAGE_CODE` (hindari duplikat lokal).

Kembalikan `{ stories, projects, pages, total }` beserta `total` per tipe dari
`meta.pagination.total`.

### 6. `src/routes/search.tsx` (baru)

Ikuti persis pola `src/routes/stories/index.tsx`:

```ts
validateSearch: (search) => {
  const q = typeof search.q === "string" ? search.q.trim().slice(0, 100) : "";
  return q ? { q } : {};
},
loaderDeps: ({ search }) => ({ q: search.q }),
loader: async ({ deps }) =>
  deps.q ? { ...(await searchContent({ q: deps.q })), q: deps.q }
         : { stories: [], projects: [], pages: [], q: "" },
head: () => buildSeoHead({ path: "/search", title: "Pencarian", noIndex: true }),
```

`noIndex: true` sudah didukung `buildSeoHead` (`src/components/seo/head.ts`) —
halaman hasil pencarian tidak boleh diindeks.

Komponen: judul + `<form>` berisi input (nilai awal `q`, `autoFocus`), submit →
`useNavigate()` ke `{ to: "/search", search: { q } }`. Lalu tiga blok hasil:

- **Stories** → `StoryCard` (`src/components/stories/StoryCard.tsx`)
- **Projects** → `ProjectCard` (`src/components/projects/ProjectCard.tsx`)
- **Pages** → daftar `<Link to="/$slug">` sederhana (tidak ada komponen kartu page)

Kalau `q` kosong: tampilkan hanya input. Kalau semua nol: "Tidak ada hasil untuk ...".
Pakai kelas Tailwind yang sama dengan `/stories` (`bg-background px-6 pb-24 pt-24`,
`mx-auto max-w-7xl`, grid `sm:grid-cols-2 lg:grid-cols-3`).

### 7. `services/api.ts` — jangan kirim `searchText` ke halaman biasa

`searchText` tidak bisa `private` (temuan #2), jadi tanpa ini `getPage` akan
mengirim ulang seluruh teks halaman di setiap request.

- Tambahkan dukungan `fields?: string[]` di `getDataWithLocalization` (baris 415) —
  cukup sisipkan `fields` ke objek query yang sudah dibangun.
- `getPage`: `fields: ["title","slug","createdAt","updatedAt","publishedAt","locale"]`.
- `getProjects` / `getProject`: `fields: ["title","slug","description","category","years","createdAt","updatedAt"]`.

### 8. `src/components/ui/Navbar.tsx` — ikon pencarian

- Desktop: tombol ikon `Search` dari `lucide-react` (sudah jadi dependency, dipakai
  `StoryCard`) di blok CTA (sekitar baris 123), sebelum `<ThemeToggle />`,
  `<Link to="/search">` dengan `aria-label="Cari"`.
- Mobile: satu baris "Cari" di panel menu (sekitar baris 171), `onClick` menutup menu.

---

## Verifikasi

1. **PENTING** — hentikan `strapi develop` sebelum `git checkout` ke/dari branch ini.
   Perubahan `schema.json` membuat kolom baru; Strapi yang masih jalan saat pindah
   branch pernah menghapus tabel content type yang cuma ada di satu branch.
2. `pnpm --filter=backend run test` → util flatten lolos.
3. `pnpm --filter=backend run dev` → cek log boot: kolom `search_text` dibuat dan
   backfill melaporkan jumlah entri. Restart kedua harus melaporkan 0 (idempoten).
4. Di admin Strapi: edit satu page (ubah teks di salah satu section), simpan,
   publish. Cek `searchText`-nya ikut berubah dan memuat teks section tersebut.
5. Cek langsung lewat REST, pastikan 200 bukan 400:
   `curl -H "Authorization: Bearer $TOKEN" "$STRAPI/api/pages?filters[searchText][\$containsi]=kata&fields[0]=title"`
6. `pnpm --filter=frontend run typecheck`, lalu `pnpm run dev:frontend`:
   - `/search?q=` kosong → hanya input, tidak ada error.
   - cari kata yang **hanya** ada di body sebuah page → page itu muncul.
   - cari kata yang hanya ada di isi sebuah story → story muncul (lewat `contentText`).
   - cari kata dengan karakter khusus (`&`, `%`, spasi, huruf besar-kecil campur) →
     tidak ada error query, dan pencocokan tetap case-insensitive.
   - ikon Navbar (desktop + mobile) membuka `/search`.
   - view-source `/search` → ada `<meta name="robots" content="noindex, nofollow">`.
   - view-source halaman CMS biasa (`/<slug>`) → **tidak** ada `searchText` di payload.

## Yang sengaja tidak dikerjakan

- Paginasi hasil pencarian (dibatasi 10 per tipe), highlight kata, autocomplete/live
  search, riwayat pencarian, dan `posts` (content type yang tidak dipakai frontend).
- `project.description` (blocks) tetap tidak difilter langsung — teksnya sudah
  tercakup lewat `searchText`.
