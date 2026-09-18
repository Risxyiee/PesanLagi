"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Bot,
  Settings,
  Smartphone,
  CreditCard,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  MessageCircle,
  Activity,
  AlertTriangle,
  Check,
  XCircle,
  Send,
  Save,
  RefreshCw,
  ExternalLink,
  QrCode,
} from "lucide-react";

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock_qty: number;
  status: "ok" | "error" | "skip";
  reason?: string;
  image?: string | null;
}

interface ChatMessage {
  id: string;
  from: "customer" | "ai" | "admin";
  text: string;
  time: string;
  product?: {
    name: string;
    price: string;
    stock: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "ai" | "admin" | "escalated";
  messages: ChatMessage[];
}

interface BotConfig {
  greeting: string;
  tone: "santai" | "formal";
  autoOutside: boolean;
  autoStart: string;
  autoEnd: string;
  keywords: string[];
}

interface StoreConfig {
  store_name: string;
  operating_hours: string;
  address: string;
  shipping_policies: string;
  payment_info: string;
}

// Mock data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Hijab Voal Premium",
    price: 89000,
    description: "Motif bunga biru, termasuk box eksklusif",
    stock_qty: 12,
    status: "ok",
  },
  {
    id: "2",
    name: "Gamis Ceruty",
    price: 185000,
    description: "Jumbo sampai XL",
    stock_qty: 3,
    status: "ok",
  },
  {
    id: "3",
    name: "Rok Plisket Jeans",
    price: 95000,
    description: "Plisket jeans tebal",
    stock_qty: 0,
    status: "ok",
  },
  {
    id: "4",
    name: "Blouse Katun Jepang",
    price: 125000,
    description: "All size fit L",
    stock_qty: 8,
    status: "ok",
  },
  {
    id: "5",
    name: "Setelan Rok Celana",
    price: 150000,
    description: "Include atasan dan rok",
    stock_qty: 5,
    status: "ok",
  },
];

const initialConversations: Conversation[] = [
  {
    id: "1",
    name: "Rina",
    phone: "6281234567890",
    lastMessage: "Baik kak, saya transfer ya",
    time: "10:30",
    unread: 1,
    status: "admin",
    messages: [
      {
        id: "1",
        from: "customer",
        text: "Halo kak, stok hijab voal motif bunga biru masih ada?",
        time: "10:25",
      },
      {
        id: "2",
        from: "ai",
        text: "Masih ada kak! Hijab Voal Premium — Motif Bunga Biru tersedia 12 pcs, Rp 89.000 sudah termasuk box eksklusif. Mau saya buatkan pesanannya sekarang?",
        time: "10:25",
      },
      {
        id: "3",
        from: "customer",
        text: "Baik kak, saya transfer ya",
        time: "10:30",
      },
    ],
  },
  {
    id: "2",
    name: "Dewi",
    phone: "6282345678901",
    lastMessage: "Baik kak, ditunggu infonya ya",
    time: "09:45",
    unread: 0,
    status: "ai",
    messages: [
      {
        id: "1",
        from: "customer",
        text: "Kak, ongkir ke Jakarta berapa?",
        time: "09:42",
      },
      {
        id: "2",
        from: "ai",
        text: "Untuk pengiriman ke Jakarta, ongkir mulai dari Rp 9.000 via J&T. Bisa juga pakai GoSend untuk pengiriman hari ini. Mau yang mana kak?",
        time: "09:42",
      },
      {
        id: "3",
        from: "customer",
        text: "Baik kak, ditunggu infonya ya",
        time: "09:45",
      },
    ],
  },
  {
    id: "3",
    name: "Siti",
    phone: "6283456789012",
    lastMessage: "Barangnya belum sampai padahal sudah 3 hari",
    time: "08:20",
    unread: 2,
    status: "escalated",
    messages: [
      {
        id: "1",
        from: "customer",
        text: "Barangnya belum sampai padahal sudah 3 hari",
        time: "08:18",
      },
      {
        id: "2",
        from: "ai",
        text: "Mohon maaf atas ketidaknyamanannya kak. Saya akan cek status pengiriman Anda segera.",
        time: "08:18",
      },
      {
        id: "3",
        from: "customer",
        text: "Cek sekarang dong!",
        time: "08:20",
      },
    ],
  },
];

const initialBotConfig: BotConfig = {
  greeting: "Ada yang bisa saya bantu untuk pesanan kakak hari ini?",
  tone: "santai",
  autoOutside: true,
  autoStart: "21:00",
  autoEnd: "08:00",
  keywords: ["stok", "ongkir", "resi", "komplain", "cancel", "refund"],
};

const initialStoreConfig: StoreConfig = {
  store_name: "Toko Berkah",
  operating_hours: "Senin - Sabtu, 09:00 - 17:00",
  address: "Jl. Merdeka No. 123, Jakarta Pusat",
  shipping_policies: "J&T, JNE, GoSend, Shopee Express",
  payment_info: "BCA, BRI, E-Wallet (OVO, GoPay, Dana)",
};

// Helper functions
const rupiah = (num: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2);

export default function DashboardPage() {
  // State
  const [currentPage, setCurrentPage] = useState<string>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [chatFilter, setChatFilter] = useState<"all" | "admin" | "ai">("all");
  const [chatSearch, setChatSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Bot config state
  const [botConfig, setBotConfig] = useState<BotConfig>(initialBotConfig);
  const [keywordInput, setKeywordInput] = useState("");

  // Store config state
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(initialStoreConfig);

  // WhatsApp state
  const [waConnected, setWaConnected] = useState(false);
  const [waStatus, setWaStatus] = useState<"connected" | "disconnected">("disconnected");

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesFilter = chatFilter === "all" || conv.status === chatFilter;
    const matchesSearch =
      conv.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      conv.phone.includes(chatSearch);
    return matchesFilter && matchesSearch;
  });

  // Current selected conversation
  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  // Show toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Navigation items
  const navItems = [
    { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { id: "inbox", label: "Riwayat Chat", icon: MessageSquare },
    { id: "products", label: "Katalog Produk", icon: Package },
    { id: "bot", label: "Bot AI", icon: Bot },
    { id: "settings", label: "Pengaturan Toko", icon: Settings },
    { id: "whatsapp", label: "Koneksi WhatsApp", icon: Smartphone },
    { id: "billing", label: "Kuota & Plan", icon: CreditCard },
  ];

  // Calculate stats
  const stats = {
    todayChats: conversations.length,
    aiReplied: conversations.filter((c) => c.status === "ai").length,
    escalated: conversations.filter((c) => c.status === "escalated").length,
    products: products.length,
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3]">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-sm font-medium ${
            toast.type === "success" ? "bg-[\#f97316] text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
        <button
          className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <p className="shrink-0 text-sm font-extrabold tracking-tight text-[#1C1917]">
          {navItems.find((item) => item.id === currentPage)?.label || "Dashboard"}
        </p>

        <div className="relative mx-auto hidden w-full max-w-sm md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 pl-9 text-sm outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]/20"
            placeholder="Cari produk atau kontak… (/)"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hover:border-[#f97316] sm:flex">
            <span className={`size-2 rounded-full ${waConnected ? "bg-orange-500" : "bg-red-500"}`} />
            {waStatus === "connected" ? "TERHUBUNG" : "PUTUS"}
          </button>
          <button className="relative grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">
            <Bell className="size-4.5" />
          </button>
          <div className="grid size-9 place-items-center rounded-full bg-[\#ea580c] text-xs font-bold text-white">
            TB
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-60 flex-col overflow-y-auto bg-[#1C1917] text-white lg:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-white/10 px-5">
          <span className="text-lg font-extrabold tracking-tight">
            PesanLagi<span className="text-[\#fb923c]">.</span>
          </span>
        </div>
        <nav className="flex-1 space-y-0.5 p-4">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Utama
          </p>
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-[\#f97316]/16 text-[\#fdba74]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
          <p className="mb-2 mt-4 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Konfigurasi
          </p>
          {navItems.slice(3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-[\#f97316]/16 text-[\#fdba74]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 rounded-lg border border-[\#fb923c]/25 bg-[\#fb923c]/10 px-3 py-2 text-[9.5px] font-semibold uppercase tracking-widest text-[\#fdba74]">
            AI AKTIF · MODE DEMO
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Toko</p>
          <p className="mt-1 text-[13px] font-semibold text-slate-200">{storeConfig.store_name}</p>
          <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-[\#fb923c]">
            PLAN: STARTER
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-[#1C1917]/60 lg:hidden ${
          mobileMenuOpen ? "block" : "hidden"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        className={`fixed bottom-0 left-0 top-14 z-50 w-64 overflow-y-auto bg-[#1C1917] lg:hidden ${
          mobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <nav className="flex-1 space-y-0.5 p-4">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Utama
          </p>
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-[\#f97316]/16 text-[\#fdba74]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
          <p className="mb-2 mt-4 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Konfigurasi
          </p>
          {navItems.slice(3).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-[\#f97316]/16 text-[\#fdba74]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="min-h-screen pt-14 lg:pl-60">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-7">
          {/* Overview Page */}
          {currentPage === "overview" && (
            <div className="space-y-5">
              {/* Header */}
              <div className="relative overflow-hidden rounded-2xl bg-[#1C1917] px-6 py-6 text-white sm:px-8">
                <div className="absolute -right-24 -top-24 size-72 rounded-full border border-white/5" />
                <div className="relative">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    § Ringkasan · {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </p>
                  <h1 className="mt-1.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                    Selamat datang kembali, Kak Toko! 👋
                  </h1>
                  <div className="mt-5 flex gap-2.5">
                    <button
                      onClick={() => setCurrentPage("products")}
                      className="rounded-full bg-[\#f97316] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[\#ea580c]"
                    >
                      ＋ Produk
                    </button>
                    <button className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-[\#fb923c] hover:text-[\#fdba74]">
                      ⬆ Import
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Stats */}
              <div className="grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">Chat Hari Ini</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#1C1917]">{stats.todayChats}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">AI Balas</p>
                  <p className="mt-1 text-2xl font-extrabold text-[\#ea580c]">{stats.aiReplied}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Perlu Admin</p>
                  <p className="mt-1 text-2xl font-extrabold text-red-500">{stats.escalated}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Produk</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#1C1917]">{stats.products}</p>
                </div>
              </div>

              {/* Recent Chats */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[15px] font-extrabold text-[#1C1917]">Percakapan Terbaru</h2>
                  <button
                    onClick={() => setCurrentPage("inbox")}
                    className="text-[10.5px] font-semibold uppercase tracking-widest text-[\#ea580c] hover:underline"
                  >
                    Lihat semua →
                  </button>
                </div>
                <div className="space-y-3">
                  {conversations.slice(0, 3).map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[\#D1FAE5] text-sm font-bold text-[\#ea580c]">
                          {conv.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1C1917]">{conv.name}</p>
                          <p className="text-xs text-slate-500">{conv.lastMessage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{conv.time}</span>
                        {conv.unread > 0 && (
                          <span className="rounded-full bg-[\#f97316] px-2 py-0.5 text-[10px] font-bold text-white">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inbox Page */}
          {currentPage === "inbox" && (
            <div className="grid gap-5 lg:grid-cols-12">
              {/* Conversations List */}
              <div className="card flex flex-col overflow-hidden lg:col-span-4 rounded-2xl border border-slate-200 bg-white" style={{ height: "620px" }}>
                <div className="border-b border-slate-100 px-3 pt-3">
                  <input
                    className="mb-2.5 h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[\#fb923c]"
                    placeholder="Cari nama / nomor…"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                  />
                  <div className="flex gap-1.5 pb-2.5">
                    <button
                      onClick={() => setChatFilter("all")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        chatFilter === "all"
                          ? "bg-[\#f97316] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      SEMUA
                    </button>
                    <button
                      onClick={() => setChatFilter("admin")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        chatFilter === "admin"
                          ? "bg-[\#f97316] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      BUTUH ADMIN
                    </button>
                    <button
                      onClick={() => setChatFilter("ai")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        chatFilter === "ai"
                          ? "bg-[\#f97316] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      AI
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left transition-colors hover:bg-slate-50 ${
                        selectedConversation === conv.id ? "bg-[\#ECFDF5]" : ""
                      }`}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[\#D1FAE5] text-sm font-bold text-[\#ea580c]">
                        {conv.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold text-[#1C1917]">{conv.name}</p>
                          <span className="text-[10px] text-slate-400">{conv.time}</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-[\#f97316] px-2 py-0.5 text-[10px] font-bold text-white">
                          {conv.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="card flex-col overflow-hidden lg:col-span-8 lg:flex rounded-2xl border border-slate-200 bg-white" style={{ height: "620px" }}>
                {!currentConversation ? (
                  <div className="grid flex-1 place-items-center p-8 text-center">
                    <div>
                      <MessageSquare className="mx-auto size-12 text-slate-300" />
                      <p className="mt-3 text-sm font-bold text-[#1C1917]">Pilih percakapan</p>
                      <p className="mx-auto mt-1 max-w-[230px] text-[13px] text-slate-400">
                        Coba: buka <strong>Rina</strong> → Ambil Alih → klik balasan cepat → kirim.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedConversation(null)} className="lg:hidden">
                          <ChevronLeft className="size-5 text-slate-600" />
                        </button>
                        <div className="flex size-10 items-center justify-center rounded-full bg-[\#D1FAE5] text-sm font-bold text-[\#ea580c]">
                          {currentConversation.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1C1917]">{currentConversation.name}</p>
                          <p className="text-xs text-slate-500">{currentConversation.phone}</p>
                        </div>
                      </div>
                      {currentConversation.status === "ai" && (
                        <button
                          onClick={() => {
                            setConversations((prev) =>
                              prev.map((c) =>
                                c.id === currentConversation.id ? { ...c, status: "admin" as const } : c
                              )
                            );
                            showToast("Chat diambil alih ke admin");
                          }}
                          className="rounded-full border border-[\#fb923c] bg-[\#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[\#ea580c] hover:bg-[\#D1FAE5]"
                        >
                          Ambil Alih
                        </button>
                      )}
                    </div>

                    {/* Chat Body */}
                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4 bg-[#ECE5DD]">
                      {currentConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.from === "customer" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                              msg.from === "customer"
                                ? "rounded-tl-md bg-white text-[#1C1917]"
                                : msg.from === "ai"
                                  ? "rounded-tr-md bg-[#D9FDD3] text-[#1C1917]"
                                  : "rounded-tr-md bg-[\#D1FAE5] text-[#1C1917]"
                            }`}
                          >
                            <p>{msg.text}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-slate-100 p-3">
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[\#fb923c]"
                          placeholder="Tulis balasan…"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newMessage.trim()) {
                              setConversations((prev) =>
                                prev.map((c) =>
                                  c.id === currentConversation.id
                                    ? {
                                        ...c,
                                        messages: [
                                          ...c.messages,
                                          {
                                            id: uid(),
                                            from: "admin",
                                            text: newMessage.trim(),
                                            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                                          },
                                        ],
                                        lastMessage: newMessage.trim(),
                                        status: "admin",
                                      }
                                    : c
                                )
                              );
                              setNewMessage("");
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newMessage.trim()) {
                              setConversations((prev) =>
                                prev.map((c) =>
                                  c.id === currentConversation.id
                                    ? {
                                        ...c,
                                        messages: [
                                          ...c.messages,
                                          {
                                            id: uid(),
                                            from: "admin",
                                            text: newMessage.trim(),
                                            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                                          },
                                        ],
                                        lastMessage: newMessage.trim(),
                                        status: "admin",
                                      }
                                    : c
                                )
                              );
                              setNewMessage("");
                            }
                          }}
                          className="grid size-10 shrink-0 place-items-center rounded-full bg-[\#f97316] text-white transition-colors hover:bg-[\#ea580c]"
                        >
                          <Send className="size-4" fill="currentColor" />
                        </button>
                      </div>
                      {/* Quick Replies */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {["Baik kak", "Mohon maaf", "Ditunggu ya", "Saya cek dulu"].map((reply) => (
                          <button
                            key={reply}
                            onClick={() => {
                              setConversations((prev) =>
                                prev.map((c) =>
                                  c.id === currentConversation.id
                                    ? {
                                        ...c,
                                        messages: [
                                          ...c.messages,
                                          {
                                            id: uid(),
                                            from: "admin",
                                            text: reply,
                                            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                                          },
                                        ],
                                        lastMessage: reply,
                                        status: "admin",
                                      }
                                    : c
                                )
                              );
                            }}
                            className="rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:border-[\#fb923c] hover:text-[\#ea580c]"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Products Page */}
          {currentPage === "products" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">§ Katalog</p>
                  <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#1C1917]">Katalog Produk</h1>
                  <p className="mt-1.5 text-[10.5px] font-mono uppercase tracking-widest text-slate-400">
                    {products.length} produk dalam katalog
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  className="h-9 max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[\#fb923c]"
                  placeholder="Cari produk…"
                />
                <div className="ml-auto flex flex-wrap gap-2.5">
                  <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:border-[\#fb923c] hover:text-[\#ea580c]">
                    ⬆ Import CSV
                  </button>
                  <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:border-[\#fb923c] hover:text-[\#ea580c]">
                    ⬇ Export
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: "", price: 0, description: "", stock_qty: 10 });
                      setProductModalOpen(true);
                    }}
                    className="rounded-full bg-[\#f97316] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[\#ea580c]"
                  >
                    + Tambah Produk
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">Produk</th>
                      <th className="px-5 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-500">Harga</th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">Stok</th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                      <th className="px-5 py-3 text-right text-[9px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#1C1917]">{product.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{product.description}</p>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-[#1C1917]">{rupiah(product.price)}</td>
                        <td className="px-5 py-4 font-mono text-[#1C1917]">{product.stock_qty}</td>
                        <td className="px-5 py-4">
                          {product.stock_qty === 0 ? (
                            <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-600">
                              Habis
                            </span>
                          ) : product.stock_qty <= 3 ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-600">
                              Menipis
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold text-orange-600">
                              Tersedia
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setProductForm(product);
                                setProductModalOpen(true);
                              }}
                              className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => {
                                setProducts((prev) => prev.filter((p) => p.id !== product.id));
                                showToast("Produk dihapus");
                              }}
                              className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bot AI Page */}
          {currentPage === "bot" && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">§ Bot AI</p>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#1C1917]">Konfigurasi Bot AI</h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Atur perilaku bot AI untuk menangani chat otomatis
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {/* Greeting & Tone */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-[15px] font-extrabold text-[#1C1917]">Sapaan & Gaya Bahasa</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1C1917]">Pesan Sapaan</label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                        rows={3}
                        value={botConfig.greeting}
                        onChange={(e) => setBotConfig((prev) => ({ ...prev, greeting: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1C1917]">Gaya Bahasa</label>
                      <div className="inline-flex rounded-lg border border-[#1C1917] overflow-hidden">
                        <button
                          onClick={() => setBotConfig((prev) => ({ ...prev, tone: "santai" }))}
                          className={`px-4 py-2 text-xs font-semibold ${
                            botConfig.tone === "santai"
                              ? "bg-[#1C1917] text-white"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          Santai
                        </button>
                        <button
                          onClick={() => setBotConfig((prev) => ({ ...prev, tone: "formal" }))}
                          className={`px-4 py-2 text-xs font-semibold ${
                            botConfig.tone === "formal"
                              ? "bg-[#1C1917] text-white"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          Formal
                        </button>
                      </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Preview:</p>
                      <p className="mt-1 text-sm">
                        {botConfig.tone === "santai" ? (
                          <>Halo kak! 👋 {botConfig.greeting}</>
                        ) : (
                          <>Selamat datang di {storeConfig.store_name}. {botConfig.greeting}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Auto-schedule */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-[15px] font-extrabold text-[#1C1917]">Jadwal Otomatis</h2>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1C1917]">Mode Otomatis Luar Jam Kerja</p>
                        <p className="text-xs text-slate-500">AI aktif di luar jam operasional toko</p>
                      </div>
                      <button
                        onClick={() => setBotConfig((prev) => ({ ...prev, autoOutside: !prev.autoOutside }))}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          botConfig.autoOutside ? "bg-[\#f97316]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                            botConfig.autoOutside ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#1C1917]">Mulai AI</label>
                        <input
                          type="time"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                          value={botConfig.autoStart}
                          onChange={(e) => setBotConfig((prev) => ({ ...prev, autoStart: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#1C1917]">Akhir AI</label>
                        <input
                          type="time"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                          value={botConfig.autoEnd}
                          onChange={(e) => setBotConfig((prev) => ({ ...prev, autoEnd: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div
                      className={`rounded-lg p-3 text-xs font-medium ${
                        botConfig.autoOutside
                          ? "bg-[\#ECFDF5] text-[\#ea580c]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {botConfig.autoOutside
                        ? `AI AKTIF di luar jam ${botConfig.autoStart} - ${botConfig.autoEnd}`
                        : "Jadwal otomatis mati — semua chat dipegang AI"}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <h2 className="text-[15px] font-extrabold text-[#1C1917]">Kata Kunci Eskalasi</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Chat yang mengandung kata kunci ini akan otomatis di-escalasi ke admin
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    {botConfig.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-full bg-[\#ECFDF5] px-3 py-1 text-[11.5px] font-semibold text-[\#ea580c] border border-orange-200"
                      >
                        {kw}
                        <button
                          onClick={() => {
                            setBotConfig((prev) => ({
                              ...prev,
                              keywords: prev.keywords.filter((k) => k !== kw),
                            }));
                          }}
                          className="font-bold text-[\#ea580c]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      className="flex-1 min-w-[120px] border-none bg-transparent text-sm outline-none"
                      placeholder="Tambah keyword…"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === ",") && keywordInput.trim()) {
                          e.preventDefault();
                          if (!botConfig.keywords.includes(keywordInput.trim().toLowerCase())) {
                            setBotConfig((prev) => ({
                              ...prev,
                              keywords: [...prev.keywords, keywordInput.trim().toLowerCase()],
                            }));
                          }
                          setKeywordInput("");
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => showToast("Konfigurasi bot tersimpan")}
                  className="rounded-full bg-[\#f97316] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[\#ea580c]"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </div>
          )}

          {/* Settings Page */}
          {currentPage === "settings" && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">§ Pengaturan</p>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#1C1917]">Pengaturan Toko</h1>
                <p className="mt-1.5 text-sm text-slate-500">Informasi toko yang akan digunakan oleh AI</p>
              </div>

              <div className="max-w-2xl space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-[15px] font-extrabold text-[#1C1917]">Informasi Dasar</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1C1917]">Nama Toko</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                        value={storeConfig.store_name}
                        onChange={(e) => setStoreConfig((prev) => ({ ...prev, store_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1C1917]">Jam Operasional</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                        value={storeConfig.operating_hours}
                        onChange={(e) =>
                          setStoreConfig((prev) => ({ ...prev, operating_hours: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-[15px] font-extrabold text-[#1C1917]">Detail Pengiriman & Pembayaran</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1C1917]">Alamat Toko</label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                        rows={2}
                        value={storeConfig.address}
                        onChange={(e) => setStoreConfig((prev) => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1C1917]">Kebijakan Pengiriman</label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                        rows={2}
                        value={storeConfig.shipping_policies}
                        onChange={(e) =>
                          setStoreConfig((prev) => ({ ...prev, shipping_policies: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#1C1917]">Metode Pembayaran</label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                        rows={2}
                        value={storeConfig.payment_info}
                        onChange={(e) =>
                          setStoreConfig((prev) => ({ ...prev, payment_info: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="text-[15px] font-extrabold text-[#1C1917]">Preview Jawaban AI</h2>
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <p className="text-sm">
                      Halo kak! {storeConfig.store_name} buka setiap {storeConfig.operating_hours}.{" "}
                      {storeConfig.shipping_policies && (
                        <>
                          Pengiriman kami: {storeConfig.shipping_policies}.{" "}
                        </>
                      )}
                      {storeConfig.payment_info && <>Pembayaran bisa via {storeConfig.payment_info}. </>}
                      {storeConfig.address && <>Alamat toko: {storeConfig.address}.</>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => showToast("Pengaturan toko tersimpan")}
                  className="rounded-full bg-[\#f97316] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[\#ea580c]"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp Connection Page */}
          {currentPage === "whatsapp" && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">§ Koneksi</p>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#1C1917]">Koneksi WhatsApp</h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Hubungkan nomor WhatsApp bisnis Anda untuk automasi chat
                </p>
              </div>

              <div className="max-w-2xl space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-[15px] font-extrabold text-[#1C1917]">Status Koneksi</h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {waConnected ? "WhatsApp terhubung dan aktif" : "WhatsApp belum terhubung"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        waConnected
                          ? "bg-orange-100 text-orange-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      <span className={`size-2 rounded-full ${waConnected ? "bg-orange-600" : "bg-red-600"}`} />
                      {waConnected ? "TERHUBUNG" : "PUTUS"}
                    </span>
                  </div>
                </div>

                {!waConnected ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <Smartphone className="mx-auto size-12 text-slate-400" />
                    <h3 className="mt-4 text-sm font-bold text-[#1C1917]">Hubungkan WhatsApp</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Scan QR code di bawah dengan WhatsApp Business di HP Anda
                    </p>
                    <div className="mt-6 mx-auto flex size-48 items-center justify-center rounded-lg border border-slate-300 bg-white">
                      <QrCode className="size-24 text-slate-300" />
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                      QR code akan kadaluarsa dalam 2 menit. Refresh untuk mendapatkan QR baru.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-[15px] font-extrabold text-[#1C1917]">Nomor Terhubung</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1C1917]">+62 812-3456-7890</p>
                          <p className="text-xs text-slate-500">WhatsApp Business</p>
                        </div>
                        <button
                          onClick={() => {
                            setWaConnected(false);
                            showToast("Koneksi WhatsApp diputus");
                          }}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Putuskan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-[15px] font-extrabold text-[#1C1917]">Panduan Koneksi</h3>
                  <ol className="mt-4 space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[\#D1FAE5] text-xs font-bold text-[\#ea580c]">
                        1
                      </span>
                      <p>Buka WhatsApp Business di HP Anda</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[\#D1FAE5] text-xs font-bold text-[\#ea580c]">
                        2
                      </span>
                      <p>Pergi ke Menu → Perangkat Tertaut</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[\#D1FAE5] text-xs font-bold text-[\#ea580c]">
                        3
                      </span>
                      <p>Tap "Tautkan Perangkat" dan scan QR code di atas</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[\#D1FAE5] text-xs font-bold text-[\#ea580c]">
                        4
                      </span>
                      <p>Tunggu sampai status berubah menjadi "TERHUBUNG"</p>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Billing Page */}
          {currentPage === "billing" && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">§ Billing</p>
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#1C1917]">Kuota & Plan</h1>
                <p className="mt-1.5 text-sm text-slate-500">Kelola paket dan pantau penggunaan kuota</p>
              </div>

              <div className="max-w-2xl space-y-5">
                {/* Current Plan */}
                <div className="rounded-2xl border-2 border-orange-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex rounded-full bg-[\#D1FAE5] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[\#ea580c]">
                        Current Plan
                      </span>
                      <h3 className="mt-3 text-xl font-extrabold text-[#1C1917]">Starter</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Rp 0/bulan · Gratis selamanya
                      </p>
                    </div>
                    <button className="rounded-full border border-[\#fb923c] bg-[\#ECFDF5] px-4 py-2 text-xs font-semibold text-[\#ea580c] hover:bg-[\#D1FAE5]">
                      Upgrade
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Chat AI bulan ini</span>
                        <span className="font-semibold text-[#1C1917]">47 / 100</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-[\#f97316]" style={{ width: "47%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Produk di katalog</span>
                        <span className="font-semibold text-[#1C1917]">{products.length} / 10</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[\#f97316]"
                          style={{ width: `${(products.length / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Available Plans */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-[15px] font-extrabold text-[#1C1917]">Upgrade Paket</h3>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#1C1917]">Pro UMKM</p>
                          <p className="text-xs text-slate-500">Rp 149.000/bulan</p>
                        </div>
                        <button className="rounded-full bg-[\#f97316] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[\#ea580c]">
                          Pilih
                        </button>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                          <Check className="size-3.5 text-[\#ea580c]" />
                          Chat AI tanpa batas
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-3.5 text-[\#ea580c]" />
                          Katalog produk tak terbatas
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-3.5 text-[\#ea580c]" />
                          Support prioritas
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#1C1917]">Agency</p>
                          <p className="text-xs text-slate-500">Custom pricing</p>
                        </div>
                        <button className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-[#1C1917] hover:border-[\#fb923c] hover:text-[\#ea580c]">
                          Hubungi Sales
                        </button>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                          <Check className="size-3.5 text-[\#ea580c]" />
                          Multi-nomor & multi-klien
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-3.5 text-[\#ea580c]" />
                          White-label dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-3.5 text-[\#ea580c]" />
                          Account manager khusus
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-[15px] font-extrabold text-[#1C1917]">Riwayat Tagihan</h3>
                  <p className="mt-4 text-center text-xs text-slate-500">
                    Belum ada riwayat tagihan
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#1C1917]">
                {editingProduct ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button
                onClick={() => setProductModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1C1917]">Nama Produk</label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                  value={productForm.name || ""}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1C1917]">Harga</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                  value={productForm.price || 0}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1C1917]">Deskripsi</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                  rows={2}
                  value={productForm.description || ""}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1C1917]">Stok</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[\#fb923c]"
                  value={productForm.stock_qty || 0}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, stock_qty: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setProductModalOpen(false)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#1C1917] hover:border-[\#fb923c] hover:text-[\#ea580c]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (editingProduct) {
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === editingProduct.id
                          ? { ...p, ...(productForm as Product), status: "ok" }
                          : p
                      )
                    );
                    showToast("Produk diperbarui");
                  } else {
                    const { id: _id, ...productData } = productForm as Product;
                    setProducts((prev) => [
                      ...prev,
                      {
                        id: uid(),
                        ...productData,
                        status: "ok",
                      },
                    ]);
                    showToast("Produk ditambahkan");
                  }
                  setProductModalOpen(false);
                }}
                className="rounded-full bg-[\#f97316] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[\#ea580c]"
              >
                {editingProduct ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}