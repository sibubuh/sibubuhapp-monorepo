# Perbaikan Inkonsistensi Height Image — Recent Projects (PortfolioSlider)

## Latar Belakang

Halaman homepage memiliki section **Recent Projects** yang dirender oleh komponen
`apps/frontend/src/components/ui/PortfolioSlider.tsx`. Section ini menampilkan
6 project terbaru dalam bentuk horizontal draggable carousel menggunakan
Framer Motion.

## Masalah

Terdapat inkonsistensi tinggi (height) gambar antar card project. Beberapa
gambar tampak lebih tinggi atau lebih rendah dari yang lain, membuat tampilan
tidak rapi.

## Root Cause

### 1. Card items tidak memiliki `flex-shrink: 0`

Di `PortfolioSlider.tsx` (line 67), setiap card project didefinisikan sebagai:

```tsx
className="min-w-[80vw] md:min-w-[450px] group"
```

Kelas `min-w-[80vw] md:min-w-[450px]` hanya menentukan **lebar minimum**,
tanpa `shrink-0` (yang setara dengan `flex-shrink: 0`). Dalam flex layout,
default `flex-shrink: 1` memungkinkan item menyusut jika container tidak
cukup lebar.

### 2. Tidak ada explicit width

Hanya ada `min-w` tanpa `w-*` atau `max-w-*`, sehingga lebar aktual setiap
card dapat bervariasi tergantung pada algoritma flex. Dengan lebar card yang
tidak seragam, container gambar yang menggunakan `aspect-[16/10]` akan
memiliki tinggi yang berbeda-beda — karena tinggi = lebar / (16/10).

### 3. Dampak visual

`object-cover` pada tag `<img>` memang memotong (crop) gambar untuk mengisi
container, tetapi jika container-nya sendiri memiliki ukuran berbeda antar
card, maka output visual tetap terlihat tidak konsisten.

## Perubahan yang Dilakukan

### File: `apps/frontend/src/components/ui/PortfolioSlider.tsx`

#### Line 67 — Card item (data projects)

**Sebelum:**
```tsx
className="min-w-[80vw] md:min-w-[450px] group"
```

**Sesudah:**
```tsx
className="min-w-[80vw] md:min-w-[450px] w-[80vw] md:w-[450px] shrink-0 group"
```

Penjelasan:
| Tambahan | Fungsi |
|---|---|
| `w-[80vw] md:w-[450px]` | Memberikan explicit width yang sama dengan min-width, memastikan semua card punya lebar identik |
| `shrink-0` | Mencegah flex item menyusut (`flex-shrink: 0`) |

#### Line 47 — Loading skeleton

**Sebelum:**
```tsx
className="min-w-[80vw] md:min-w-[450px]"
```

**Sesudah:**
```tsx
className="min-w-[80vw] md:min-w-[450px] w-[80vw] md:w-[450px] shrink-0"
```

Untuk konsistensi, skeleton placeholder juga diberi explicit width dan
`shrink-0` agar layout saat loading identik dengan layout akhir.

## Cara Kerja Perbaikan

1. **`w-[80vw] md:w-[450px]`** — Semua card memiliki lebar yang sama
   (80% viewport di mobile, 450px di desktop).

2. **`shrink-0`** — Tidak ada card yang menyusut, semua tetap pada
   ukuran lebarnya.

3. Hasilnya, container `aspect-[16/10]` menghitung tinggi yang identik
   untuk setiap card — gambar dengan `object-cover` tampil konsisten.
