<div align="center">

<img src="https://img.shields.io/badge/PesanLagi-QR%20Menu%20Digital-F97316?style=for-the-badge&labelColor=0A0705" alt="PesanLagi" />

**Bikin Menu Digital QR Code Warungmu Cuma Dalam 3 Menit**

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=flat-square" alt="shadcn/ui" />
</p>

<p>
  <a href="#-fitur">Fitur</a> •
  <a href="#-teknologi">Tech Stack</a> •
  <a href="#-mulai-cepat">Mulai Cepat</a> •
  <a href="#-struktur-proyek">Struktur</a> •
  <a href="#-lisensi">Lisensi</a>
</p>

<img src="https://img.shields.io/badge/Made_in_Indonesia-🇮🇩-red?style=flat-square" alt="Made in Indonesia" />

</div>

---

## 🎯 Tentang

**PesanLagi** adalah platform **QR Menu Digital** yang dirancang khusus untuk **UMKM kuliner Indonesia**. Warung, kafe, restoran kecil — semua bisa bikin menu digital profesional dalam hitungan menit, tanpa perlu skill coding.

### Kenapa PesanLagi?

- 🖨️ **Stop cetak ulang menu** setiap harga berubah
- 📱 **Pelanggan scan QR** → langsung lihat menu di HP mereka
- ⚡ **Setup 3 menit** — cukup isi nama, upload foto, atur harga
- 💰 **Gratis** untuk mulai

---

## ✨ Fitur

### 🛍️ Landing Page
- Hero section dengan live QR code preview
- Kustomisasi warna QR, template kartu, dan warna background secara real-time
- Animated counters, FAQ section, dan smooth scrolling
- Responsive design — tampil sempurna di HP dan desktop

### 🔐 Autentikasi
- Login & registrasi dengan email + password (Supabase Auth)
- Google OAuth sign-in
- Lupa password flow
- Session management dengan cookie-based SSR auth
- Rate limiting pada semua endpoint sensitif

### 📊 Dashboard
| Halaman | Deskripsi |
|---|---|
| **Overview** | Statistik menu, kategori, status toko, URL menu live, quick actions |
| **Kelola Menu** | CRUD menu dengan foto, harga, kategori, toggle ketersediaan, drag-and-drop reorder |
| **Kategori** | Tambah/hapus kategori menu (Makanan, Minuman, Snack, dll) |
| **QR Designer** | Generator QR code real dengan 4 preset template + AI theme generator + kustomisasi warna, export PNG & PDF A6 |
| **Pengaturan** | Edit profil warung, slug URL, upload logo, jam operasional, hari buka |

### 📱 Menu Publik (`/menu/:slug`)
- Halaman menu digital yang terbuka untuk publik
- Pencarian menu, filter kategori
- Tambah ke keranjang, checkout via WhatsApp
- Responsive dan mobile-first

### 🤖 AI QR Theme Generator
- Deskripsikan warungmu, AI pilih kombinasi warna & template yang cocok
- 4 template: Minimalist, Rustic, Dark Gold, Acrylic
- Output tervalidasi (hex colors + template allowlist)

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Bahasa** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + CSS Modules |
| **UI Components** | shadcn/ui (New York style) + Lucide Icons |
| **Auth & Database** | Supabase (Auth, PostgreSQL, Storage) |
| **QR Code** | `qrcode` (real QR library, bukan fake) |
| **State** | React hooks + URL hash routing |
| **Runtime** | Bun |
| **Security** | In-memory rate limiter, magic-byte upload validation, generic error responses |

---

## 🚀 Mulai Cepat

### Prasyarat
- [Bun](https://bun.sh/) >= 1.0
- Akun [Supabase](https://supabase.com/) (project dengan Auth + PostgreSQL + Storage)

### Install & Jalankan

```bash
# Clone repo
git clone https://github.com/Risxyiee/PesanLagi.git
cd PesanLagi

# Install dependencies
bun install

# Buat file .env.local
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# NEXT_PUBLIC_APP_URL=https://pesanlagi.web.id

# Jalankan dev server
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

| Variable | Deskripsi | Wajib? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin queries) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL produksi (untuk QR code & OAuth redirect) | Opsional |

---

## 📁 Struktur Proyek

```
PesanLagi/
├── src/
│   ├── app/
│   │   ├── page.tsx              # SPA root (hash router: landing, login, dashboard)
│   │   ├── layout.tsx             # Root layout + Providers
│   │   ├── menu/[slug]/page.tsx   # Menu publik (public-facing)
│   │   ├── terms/page.tsx         # Syarat & Ketentuan
│   │   ├── privacy/page.tsx       # Kebijakan Privasi
│   │   ├── refund-policy/page.tsx # Kebijakan Pengembalian Dana
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── sign-in/       # Login endpoint
│   │       │   ├── sign-up/       # Registrasi + auto-create store
│   │       │   ├── sign-out/      # Logout (force-clear cookies)
│   │       │   ├── me/            # Current user session
│   │       │   ├── google/        # Google OAuth initiation
│   │       │   ├── callback/      # OAuth callback
│   │       │   └── forgot-password/
│   │       ├── dashboard/init/    # Single-request dashboard bootstrap
│   │       ├── menus/             # CRUD + search + reorder
│   │       ├── categories/        # CRUD
│   │       ├── store/             # GET/PUT toko + check-slug
│   │       ├── public/menu/[slug] # Public menu API (no auth)
│   │       ├── ai/generate-theme/ # AI QR theme generator
│   │       └── upload/            # Image upload (magic-byte validated)
│   ├── components/
│   │   ├── DashboardApp.tsx       # Dashboard SPA (all pages)
│   │   ├── LoginView.tsx          # Login/Register component
│   │   ├── providers.tsx          # AuthProvider wrapper
│   │   └── ui/                    # shadcn/ui components
│   ├── context/
│   │   └── auth-context.tsx       # Supabase auth state
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server Supabase client (cookies)
│   │   │   └── middleware.ts      # Middleware Supabase client
│   │   ├── auth-helper.ts         # authenticateRequest, withCookies, getStoreId
│   │   └── rate-limit.ts          # In-memory sliding window rate limiter
│   └── middleware.ts              # Next.js middleware (protect /dashboard)
├── public/
│   ├── logo.png
│   ├── pesanlagi-logo.png
│   └── robots.txt
└── supabase-schema.sql          # Database schema reference
```

---

## 🔒 Keamanan

| Fitur | Implementasi |
|---|---|
| **Auth** | Supabase Auth + cookie-based SSR session |
| **Rate Limiting** | Sliding window per-IP (sign-in, sign-up, forgot-password, AI, check-slug) |
| **Upload Validation** | MIME type check + magic-byte validation (JPEG, PNG, WEBP, GIF) |
| **IDOR Protection** | Semua query di-scope oleh `user_id` / `store_id` |
| **Error Sanitization** | Error Supabase tidak dibocorkan ke client — hanya pesan generik |
| **Input Sanitization** | PostgREST injection prevention pada search, allowlist pada PUT/PATCH |
| **QR Code** | Real `qrcode` library, error correction level H, quiet zone |

---

## 🔮 Roadmap

- [ ] Pesanan via WhatsApp terintegrasi penuh (bukan manual)
- [ ] Fitur ulasan & rating menu
- [ ] Analytics — berapa kali QR di-scan
- [ ] QR Code tanpa watermark (Pro)
- [ ] Multi-bahasa (Indonesia & English)
- [ ] PWA support — bisa diinstall di HP
- [ ] Notifikasi pesanan baru (real-time)

---

## 📜 Lisensi

© 2025 PesanLagi. Hak cipta dilindungi.

---

<div align="center">
  <p>
    <strong>Dibuat untuk UMKM kuliner Indonesia 🇮🇩</strong><br/>
    <em>Warung kecil, menu besar.</em>
  </p>
</div>
