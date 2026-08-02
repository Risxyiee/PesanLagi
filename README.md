<div align="center">

<img src="https://img.shields.io/badge/PesanLagi-QR%20Menu%20Digital-F97316?style=for-the-badge&labelColor=0A0705" alt="PesanLagi" />

**Bikin Menu Digital QR Code Warungmu Cuma Dalam 3 Menit**

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/InsForge-Backend-FF6D00?style=flat-square" alt="InsForge" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
</p>

<p>
  <a href="#-fitur">Fitur</a> •
  <a href="#-teknologi">Tech Stack</a> •
  <a href="#-mulai-cepat">Mulai Cepat</a> •
  <a href="#-struktur-proyek">Struktur</a> •
  <a href="#-screenshots">Screenshots</a> •
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
- Login & registrasi dengan email + password
- Google OAuth sign-in
- Protected routes dan session management via InsForge Auth

### 📊 Dashboard
| Fitur | Deskripsi |
|---|---|
| **Overview** | Statistik total menu, kategori, dan quick actions |
| **Kelola Menu** | CRUD menu dengan foto, harga, kategori, dan drag-and-drop reorder |
| **Kategori** | Tambah/hapus kategori menu (Makanan, Minuman, Snack, dll) |
| **QR Designer** | Generator QR code dengan 6 preset template + kustomisasi warna |
| **Pengaturan** | Edit profil warung, slug URL, upload logo |

### 🎨 QR Code Designer
- 6 preset template (Kopi Susu, Sage Segar, Midnight Orange, Neon Cyber, Warm Pastel, Minimalist Black)
- Kustomisasi warna background dan QR code
- Nomor meja otomatis di kartu QR
- Download PDF high-res (Pro)

---

## 🛠️ Teknologi

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Bahasa** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + Google Fonts (Plus Jakarta Sans, Inter) |
| **UI Components** | shadcn/ui (New York style) |
| **Backend/Auth** | InsForge SDK (Auth, Database, Storage) |
| **Database** | Prisma ORM + SQLite |
| **Runtime** | Bun |
| **Hosting** | InsForge Deployments |

---

## 🚀 Mulai Cepat

### Prasyarat
- [Bun](https://bun.sh/) >= 1.0
- [InsForge CLI](https://insforge.site) (untuk deploy)

### Install & Jalankan

```bash
# Clone repo
https://github.com/Risxyiee/PesanLagi.git
cd PesanLagi

# Install dependencies
bun install

# Setup database
bun run db:push

# Jalankan dev server
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build Production

```bash
bun run build
bun run start
```

### Deploy ke InsForge

```bash
insforge deployments deploy .
```

---

## 📁 Struktur Proyek

```
PesanLagi/
├── src/
│   ├── app/
│   │   ├── page.tsx          # SPA router + semua view logic (landing, login, dashboard)
│   │   ├── layout.tsx         # Root layout + CDN (Tailwind, Google Fonts, QRCode.js)
│   │   ├── styles.ts          # Landing page CSS
│   │   ├── body-html.json     # Landing page HTML
│   │   ├── login/
│   │   │   ├── login-styles.ts
│   │   │   └── login-html.json
│   │   ├── dashboard/
│   │   │   ├── dashboard-styles.ts
│   │   │   └── dashboard-html.json
│   │   └── api/auth/
│   │       ├── sign-in/route.ts
│   │       ├── sign-up/route.ts
│   │       ├── sign-out/route.ts
│   │       ├── me/route.ts
│   │       ├── google/route.ts
│   │       └── callback/route.ts
│   ├── context/
│   │   └── auth-context.tsx   # Auth context provider
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── insforge.ts        # InsForge client (browser)
│   │   ├── insforge-server.ts # InsForge client (server)
│   │   └── utils.ts           # Utility functions
│   └── components/
│       └── ui/                # shadcn/ui components
├── prisma/
│   └── schema.prisma          # Database schema
└── public/
    ├── logo.svg
    └── robots.txt
```

---

## 📸 Screenshots

### Landing Page
<div align="center">
  <img src="https://img.shields.io/badge/📸_Soon-Coming_Soon-F97316?style=for-the-badge" alt="Coming Soon" />
</div>

### Login & Register
<div align="center">
  <img src="https://img.shields.io/badge/📸_Soon-Coming_Soon-F97316?style=for-the-badge" alt="Coming Soon" />
</div>

### Dashboard
<div align="center">
  <img src="https://img.shields.io/badge/📸_Soon-Coming_Soon-F97316?style=for-the-badge" alt="Coming Soon" />
</div>

---

## 🔮 Roadmap

- [ ] Koneksi database real (InsForge DB) menggantikan mock data
- [ ] RLS policies (Row Level Security) per-user
- [ ] Upload foto menu ke InsForge Storage
- [ ] Email verification flow
- [ ] QR Code download tanpa watermark (Pro)
- [ ] Live preview menu publik (`/menu/:slug`)
- [ ] Multi-bahasa (Indonesia & English)
- [ ] PWA support — bisa diinstall di HP
- [ ] Analytics — berapa kali QR di-scan

---

## 🤝 Kontribusi

Kontribusi terbuka! Silakan fork repo ini, buat branch fitur baru, dan kirim pull request.

```bash
# Fork & clone
https://github.com/Risxyiee/PesanLagi.git

# Buat branch baru
git checkout -b fitur/fitur-baru

# Commit & push
git commit -m 'tambah fitur baru'
git push origin fitur/fitur-baru

# Buat Pull Request
```

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
