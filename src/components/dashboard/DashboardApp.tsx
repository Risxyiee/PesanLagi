"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Utensils,
  UtensilsCrossed,
  LayoutDashboard,
  QrCode,
  ShoppingBag,
  BarChart3,
  Star,
  Settings,
  Crown,
  Sparkles,
  TrendingUp,
  Link,
  Globe,
  Copy,
  Eye,
  Store,
  CalendarClock,
  Plus,
  Palette,
  Share2,
  Trash2,
  Search,
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Check,
  X,
  ImagePlus,
  Download,
  Image as ImageIcon,
  Printer,
  MessageCircle,
  Camera,
  Phone,
  Clock,
  Save,
  CheckCircle2,
  Banknote,
  Receipt,
  Award,
  ShieldCheck,
  LayoutGrid,
  List,
  Columns2,
  ArrowRight,
  Rocket,
} from "lucide-react";
import styles from "./DashboardApp.module.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  is_pro?: boolean;
  pro_ends_at?: string;
}

interface StoreData {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  is_open?: boolean;
  open_time?: string;
  close_time?: string;
  days?: number[];
  category?: string;
}

interface Category {
  id?: string;
  name: string;
  store_id?: string;
}

interface MenuItem {
  id?: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  image?: string;
  is_available?: boolean;
  sold_count?: number;
}

interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
  replied: boolean;
}

interface OrderItem {
  name: string;
  qty: number;
  price: string;
}

interface Order {
  id: string;
  customer: string;
  info: string;
  time: string;
  status: "new" | "process" | "done";
  items: OrderItem[];
  total: string;
}

interface ToastState {
  show: boolean;
  message: string;
}

type PageId = "dashboard" | "menu" | "qr" | "orders" | "reports" | "reviews" | "settings";

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: "Dashboard Warung",
  menu: "Menu Makanan",
  qr: "Kartu QR Code",
  orders: "Pesanan Masuk",
  reports: "Laporan Penjualan",
  reviews: "Ulasan Pelanggan",
  settings: "Pengaturan Profil",
};

const NAV_ITEMS: { id: PageId; icon: typeof LayoutDashboard; label: string; badge?: string; badgeColor?: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "menu", icon: UtensilsCrossed, label: "Menu Makanan", badge: "0", badgeColor: "bg-amber-100 text-amber-700" },
  { id: "qr", icon: QrCode, label: "Kartu QR Code" },
  { id: "orders", icon: ShoppingBag, label: "Pesanan Masuk", badge: "0", badgeColor: "bg-red-100 text-red-600" },
  { id: "reports", icon: BarChart3, label: "Laporan Penjualan" },
  { id: "reviews", icon: Star, label: "Ulasan Pelanggan" },
  { id: "settings", icon: Settings, label: "Pengaturan Profil" },
];

const BOTTOM_NAV_ITEMS: { id: PageId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "menu", icon: UtensilsCrossed, label: "Menu" },
  { id: "qr", icon: QrCode, label: "QR" },
  { id: "orders", icon: ShoppingBag, label: "Pesanan" },
  { id: "settings", icon: User, label: "Profil" },
];

const DAYS_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/* ------------------------------------------------------------------ */
/*  Sample / default data                                              */
/* ------------------------------------------------------------------ */

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Budi Santoso",
    avatar: "https://picsum.photos/seed/budi-santoso-avatar/80/80",
    rating: 5,
    text: "\"Nasi gorengnya enak banget, porsinya banyak dan harganya bersaing. Menu digitalnya juga memudahkan pesan tanpa antri. Pasti pesan lagi!\"",
    date: "2 hari lalu",
    reply: "Terima kasih kak Budi! Ditunggu kedatangannya lagi ya 🙏",
    replied: true,
  },
  {
    id: "r2",
    name: "Siti Aminah",
    avatar: "https://picsum.photos/seed/siti-aminah-avatar/80/80",
    rating: 4,
    text: "\"Harga bersaing, rasa oke. Tapi agak lama saat jam ramai. Semoga kedepannya lebih cepat. Overall recommended!\"",
    date: "3 hari lalu",
    replied: false,
  },
  {
    id: "r3",
    name: "Ahmad Fauzi",
    avatar: "https://picsum.photos/seed/ahmad-fauzi-avatar/80/80",
    rating: 5,
    text: "\"Ayam gepreknya juara! Level pedasnya pas, mozzarellanya lumer. QR code di meja juga praktis, scan langsung pesan. Top!\"",
    date: "5 hari lalu",
    replied: true,
  },
  {
    id: "r4",
    name: "Dewi Lestari",
    avatar: "https://picsum.photos/seed/dewi-lestari-avatar/80/80",
    rating: 3,
    text: "\"Tempatnya nyaman, menu digitalnya membantu. Tapi soto ayamnya kurang garam menurut saya. Semoga diperbaiki ya.\"",
    date: "1 minggu lalu",
    replied: false,
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "#ORD-0142",
    customer: "Budi Santoso",
    info: "Meja 3 • 0812-3456-7890",
    time: "2 menit lalu",
    status: "new",
    items: [
      { name: "2x Nasi Goreng Spesial", qty: 2, price: "Rp 36.000" },
      { name: "1x Es Teh Manis", qty: 1, price: "Rp 5.000" },
      { name: "1x Kerupuk Udang", qty: 1, price: "Rp 3.000" },
    ],
    total: "Rp 44.000",
  },
  {
    id: "#ORD-0141",
    customer: "Siti Aminah",
    info: "Takeaway • 0813-9876-5432",
    time: "5 menit lalu",
    status: "new",
    items: [
      { name: "3x Mie Ayam Bakso", qty: 3, price: "Rp 45.000" },
      { name: "2x Es Jeruk Peras", qty: 2, price: "Rp 14.000" },
    ],
    total: "Rp 59.000",
  },
  {
    id: "#ORD-0140",
    customer: "Ahmad Fauzi",
    info: "Meja 5 • 0856-1234-5678",
    time: "12 menit lalu",
    status: "process",
    items: [
      { name: "1x Ayam Geprek Mozzarella", qty: 1, price: "Rp 22.000" },
      { name: "2x Es Teh Manis", qty: 2, price: "Rp 10.000" },
      { name: "1x Pisang Goreng Keju", qty: 1, price: "Rp 12.000" },
    ],
    total: "Rp 44.000",
  },
  {
    id: "#ORD-0139",
    customer: "Dewi Lestari",
    info: "Meja 1 • 0821-5555-7777",
    time: "8 menit lalu",
    status: "new",
    items: [
      { name: "2x Soto Ayam Lamongan", qty: 2, price: "Rp 34.000" },
      { name: "1x Nasi Goreng Spesial", qty: 1, price: "Rp 18.000" },
      { name: "3x Es Teh Manis", qty: 3, price: "Rp 15.000" },
    ],
    total: "Rp 67.000",
  },
  {
    id: "#ORD-0138",
    customer: "Rudi Hartono",
    info: "Takeaway • 0811-2222-3333",
    time: "35 menit lalu",
    status: "done",
    items: [
      { name: "1x Mie Ayam Bakso", qty: 1, price: "Rp 15.000" },
      { name: "1x Es Jeruk Peras", qty: 1, price: "Rp 7.000" },
    ],
    total: "Rp 22.000",
  },
];

const TOP_SELLING = [
  { name: "Es Teh Manis", count: 220, pct: 100 },
  { name: "Nasi Goreng", count: 142, pct: 65 },
  { name: "Mie Ayam Bakso", count: 98, pct: 45 },
  { name: "Ayam Geprek", count: 76, pct: 35 },
  { name: "Soto Ayam", count: 65, pct: 30 },
];

const RECENT_TRANSACTIONS = [
  { id: "#ORD-0138", customer: "Rudi Hartono", time: "35 min lalu", amount: "+Rp 22K", color: "green" },
  { id: "#ORD-0140", customer: "Ahmad Fauzi", time: "12 min lalu", amount: "+Rp 44K", color: "amber" },
  { id: "#ORD-0142", customer: "Budi Santoso", time: "2 min lalu", amount: "+Rp 44K", color: "amber" },
  { id: "#ORD-0137", customer: "Maya Sari", time: "1 jam lalu", amount: "+Rp 33K", color: "green" },
  { id: "#ORD-0136", customer: "Doni Pratama", time: "2 jam lalu", amount: "+Rp 56K", color: "green" },
];

/* ------------------------------------------------------------------ */
/*  QR SVG Generation                                                  */
/* ------------------------------------------------------------------ */
function generateQRSVG(): string {
  const size = 25;
  let rects = "";
  const add = (x: number, y: number, w: number, h: number, fill: string) => {
    rects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  };
  [[0,0],[18,0],[0,18]].forEach(([fx,fy]) => {
    add(fx, fy, 7, 7, "#0F172A");
    add(fx+1, fy+1, 5, 5, "white");
    add(fx+2, fy+2, 3, 3, "#0F172A");
  });
  add(16, 16, 5, 5, "#0F172A");
  add(17, 17, 3, 3, "white");
  add(18, 18, 1, 1, "#0F172A");
  for (let i = 8; i < 17; i++) {
    if (i % 2 === 0) {
      add(i, 6, 1, 1, "#0F172A");
      add(6, i, 1, 1, "#0F172A");
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder = (x<8&&y<8)||(x>16&&y<8)||(x<8&&y>16);
      const inAlign = (x>=16&&x<=20&&y>=16&&y<=20);
      const inCenter = (x>=10&&x<=14&&y>=10&&y<=14);
      const inTiming = (y===6||x===6);
      if (inFinder||inAlign||inCenter||inTiming) continue;
      const hash = (x*7+y*13+x*y*3) % 7;
      if (hash < 3) add(x, y, 1, 1, "#0F172A");
    }
  }
  return rects;
}

/* ------------------------------------------------------------------ */
/*  Skeleton helpers                                                   */
/* ------------------------------------------------------------------ */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function DashboardApp() {
  /* ---------- state ---------- */
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: "" });
  const [chartAnimated, setChartAnimated] = useState(false);
  const [barAnimated, setBarAnimated] = useState(false);

  // Data from API
  const [user, setUser] = useState<UserData | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderTab, setOrderTab] = useState("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [activeCategoryChip, setActiveCategoryChip] = useState("all");

  // Orders are local / mock
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);

  // Settings form
  const [settingsName, setSettingsName] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsOpenTime, setSettingsOpenTime] = useState("08:00");
  const [settingsCloseTime, setSettingsCloseTime] = useState("22:00");
  const [settingsDays, setSettingsDays] = useState<boolean[]>([true,true,true,true,true,true,false]);

  // Modal form
  const [modalName, setModalName] = useState("");
  const [modalCategory, setModalCategory] = useState("Makanan");
  const [modalPrice, setModalPrice] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAvailable, setModalAvailable] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const orderTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- auth check ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("not auth");
        const userData = await res.json();
        setUser(userData);
      } catch {
        window.location.hash = "#login";
      }
    })();
  }, []);

  /* ---------- fetch data ---------- */
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [storeRes, menusRes, catsRes] = await Promise.all([
          fetch("/api/store").then((r) => r.json()).catch(() => null),
          fetch("/api/menus").then((r) => r.json()).catch(() => []),
          fetch("/api/categories").then((r) => r.json()).catch(() => []),
        ]);
        if (storeRes) {
          setStore(storeRes);
          setStoreOpen(storeRes.is_open ?? true);
          setSettingsName(storeRes.name ?? "");
          setSettingsDesc(storeRes.description ?? "");
          setSettingsPhone(storeRes.phone ?? "");
          setSettingsEmail(storeRes.email ?? "");
          setSettingsAddress(storeRes.address ?? "");
          if (storeRes.open_time) setSettingsOpenTime(storeRes.open_time);
          if (storeRes.close_time) setSettingsCloseTime(storeRes.close_time);
        }
        if (Array.isArray(menusRes)) setMenus(menusRes);
        if (Array.isArray(catsRes)) setCategories(catsRes);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /* ---------- toast ---------- */
  const showToast = useCallback((msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
  }, []);

  /* ---------- navigation ---------- */
  const navigate = useCallback((page: PageId) => {
    setActivePage(page);
    setSidebarMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ---------- chart animation ---------- */
  useEffect(() => {
    if (activePage === "reports") {
      setChartAnimated(false);
      setBarAnimated(false);
      const t = setTimeout(() => {
        setChartAnimated(true);
        setTimeout(() => setBarAnimated(true), 200);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [activePage]);

  /* ---------- order tab indicator ---------- */
  useEffect(() => {
    const btn = orderTabRefs.current[orderTab === "all" ? 0 : orderTab === "new" ? 1 : orderTab === "process" ? 2 : 3];
    if (btn) {
      setTabIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [orderTab]);

  /* ---------- handlers ---------- */
  const handleLogout = useCallback(() => {
    fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
    window.location.hash = "#login";
  }, []);

  const handleToggleStore = useCallback(async () => {
    const next = !storeOpen;
    setStoreOpen(next);
    try {
      await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_open: next }),
      });
    } catch {}
    showToast(next ? "Toko dibuka" : "Toko ditutup");
  }, [storeOpen, showToast]);

  const handleToggleStock = useCallback(async (menuId?: string, idx?: number) => {
    // optimistic
    setMenus((prev) =>
      prev.map((m) =>
        (m.id === menuId) || (idx !== undefined && prev[idx] === m)
          ? { ...m, is_available: !m.is_available }
          : m
      )
    );
    if (menuId) {
      try {
        await fetch("/api/menus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: menuId, is_available: false }),
        });
      } catch {}
    }
  }, []);

  const handleDeleteMenu = useCallback(async (menuId?: string) => {
    if (!menuId) return;
    try {
      await fetch("/api/menus", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: menuId }),
      });
      setMenus((prev) => prev.filter((m) => m.id !== menuId));
      showToast("Menu berhasil dihapus");
    } catch {
      showToast("Gagal menghapus menu");
    }
  }, [showToast]);

  const handleSaveSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settingsName,
          description: settingsDesc,
          phone: settingsPhone,
          email: settingsEmail,
          address: settingsAddress,
          open_time: settingsOpenTime,
          close_time: settingsCloseTime,
          days: settingsDays.map((d, i) => (d ? i + 1 : 0)).filter(Boolean),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStore(updated);
        showToast("Perubahan berhasil disimpan!");
      }
    } catch {
      showToast("Gagal menyimpan perubahan");
    }
  }, [settingsName, settingsDesc, settingsPhone, settingsEmail, settingsAddress, settingsOpenTime, settingsCloseTime, settingsDays, showToast]);

  const handleUploadImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "menus");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setModalImage(data.url ?? data.publicUrl ?? URL.createObjectURL(file));
      }
    } catch {
      showToast("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  }, [showToast]);

  const handleSaveMenu = useCallback(async () => {
    try {
      const body: Record<string, unknown> = {
        name: modalName,
        category: modalCategory,
        price: Number(modalPrice) || 0,
        description: modalDesc,
        is_available: modalAvailable,
      };
      if (modalImage) body.image = modalImage;
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newMenu = await res.json();
        setMenus((prev) => [...prev, newMenu]);
        setModalOpen(false);
        setModalName("");
        setModalPrice("");
        setModalDesc("");
        setModalImage(null);
        showToast("Menu baru berhasil ditambahkan!");
      }
    } catch {
      showToast("Gagal menambah menu");
    }
  }, [modalName, modalCategory, modalPrice, modalDesc, modalAvailable, modalImage, showToast]);

  const handleOrderAction = useCallback((orderId: string, newStatus: "process" | "done") => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus === "done" ? ("done" as const) : ("process" as const) }
          : o
      )
    );
    showToast(newStatus === "Diproses" ? "Pesanan diterima, sedang diproses" : "Pesanan selesai! 🎉");
  }, [showToast]);

  /* ---------- derived ---------- */
  const storeName = store?.name ?? user?.name ?? "Warung Makan Barokah";
  const storeSlug = store?.slug ?? "warung-barokah";
  const storeLogo = store?.logo ?? "https://picsum.photos/seed/warung-barokah-logo/80/80";
  const isPro = user?.is_pro ?? false;
  const menuCount = menus.length;
  const newOrderCount = orders.filter((o) => o.status === "new").length;

  const categoryChips = [
    { id: "all", label: `Semua (${menuCount})` },
    ...categories.map((c) => ({
      id: c.name,
      label: `${c.name} (${menus.filter((m) => m.category === c.name).length})`,
    })),
  ];

  const filteredMenus = menus.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchCat = activeCategoryChip === "all" || m.category === activeCategoryChip;
    return matchSearch && matchCat;
  });

  const filteredOrders = orders.filter((o) => orderTab === "all" || o.status === orderTab);

  const displayMenus = filteredMenus.length > 0 ? filteredMenus : [
    { name: "Nasi Goreng Spesial", price: 18000, category: "Makanan", image: "https://picsum.photos/seed/nasi-goreng-spesial-kampung/400/300", is_available: true, sold_count: 142 },
    { name: "Mie Ayam Bakso Telur", price: 15000, category: "Makanan", image: "https://picsum.photos/seed/mie-ayam-bakso-telur/400/300", is_available: true, sold_count: 98 },
    { name: "Ayam Geprek Mozzarella", price: 22000, category: "Makanan", image: "https://picsum.photos/seed/ayam-geprek-mozzarella/400/300", is_available: false, sold_count: 76 },
    { name: "Es Teh Manis Hangat", price: 5000, category: "Minuman", image: "https://picsum.photos/seed/es-teh-manis-hangat/400/300", is_available: true, sold_count: 220 },
    { name: "Es Jeruk Peras Segar", price: 7000, category: "Minuman", image: "https://picsum.photos/seed/es-jeruk-peras-segar/400/300", is_available: true, sold_count: 85 },
    { name: "Soto Ayam Lamongan", price: 17000, category: "Makanan", image: "https://picsum.photos/seed/soto-ayam-lamongan-asli/400/300", is_available: true, sold_count: 65 },
    { name: "Kerupuk Udang Renyah", price: 3000, category: "Snack", image: "https://picsum.photos/seed/kerupuk-udang-renyah/400/300", is_available: true, sold_count: 180 },
    { name: "Pisang Goreng Keju", price: 12000, category: "Snack", image: "https://picsum.photos/seed/pisang-goreng-keju-coklat/400/300", is_available: false, sold_count: 54 },
  ];

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", WebkitFontSmoothing: "antialiased" }} className="min-h-screen overflow-x-hidden">
      {/* Background decorations */}
      <div className={styles.gridBg} />
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />

      {/* Sidebar backdrop (mobile) */}
      {sidebarMobileOpen && (
        <div
          className={`${styles.sidebarBackdrop} ${styles.sidebarBackdropShow}`}
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside
        className={`${
          styles.sidebar
        } ${
          sidebarMobileOpen ? styles.sidebarMobileOpen : ""
        } ${
          sidebarCollapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        {/* Header */}
        <div className={`${styles.sidebarHeader} px-5 pt-6 pb-4 flex items-center gap-2.5`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Utensils className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <span className={`${styles.sidebarHeaderText} text-xl font-extrabold tracking-tight text-slate-900 flex-1`}>
            Pesan<span className="text-amber-500">Lagi</span>
          </span>
          <button
            className={`${styles.collapseIcon} w-7 h-7 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors`}
            onClick={() => setSidebarCollapsed(true)}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          <button
            className={`${styles.collapseBtnExp} w-7 h-7 rounded-lg hover:bg-slate-200/60 items-center justify-center text-slate-500 transition-colors`}
            onClick={() => setSidebarCollapsed(false)}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Profile card */}
        <div className={`${styles.profileCard} mx-4 mb-4 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100`}>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={storeLogo} className="w-11 h-11 rounded-xl object-cover ring-2 ring-white" alt={storeName} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{storeName}</p>
              {isPro && (
                <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Member Pro Active
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto sidebarScroll" style={{ scrollbarWidth: "thin" }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const badgeCount = item.id === "menu" ? String(menuCount) : item.id === "orders" ? String(newOrderCount) : item.badge;
            return (
              <div
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                onClick={() => navigate(item.id)}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className={styles.sidebarLabel}>{item.label}</span>
                {badgeCount && Number(badgeCount) > 0 && (
                  <span className={`${styles.navBadge} ml-auto text-[10px] font-bold ${item.badgeColor ?? "bg-amber-100 text-amber-700"} px-1.5 py-0.5 rounded-md`}>
                    {badgeCount}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Pro banner */}
        {isPro && (
          <div className={`${styles.proBanner} m-3 p-3.5 rounded-2xl bg-slate-900 text-white relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/30 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">PRO ACTIVE</span>
              </div>
              <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                Berakhir dalam 28 hari. Perpanjang untuk fitur premium.
              </p>
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                Perpanjang Pro
              </button>
            </div>
          </div>
        )}

        {/* Logout at bottom */}
        <div className="px-3 pb-3">
          <div
            className={`${styles.navItem} text-red-500 hover:bg-red-50`}
            onClick={handleLogout}
          >
            <X className="w-[18px] h-[18px] shrink-0" />
            <span className={styles.sidebarLabel}>Keluar</span>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN ==================== */}
      <main
        className={`${
          styles.mainContent
        } ${
          sidebarCollapsed ? styles.mainContentCollapsed : ""
        } min-h-screen px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8 relative z-10`}
      >
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <button
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"
              onClick={() => setSidebarMobileOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30">
                <Utensils className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Pesan<span className="text-amber-500">Lagi</span>
              </span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm relative">
            <Bell className="w-[18px] h-[18px] text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between mb-7">
          <div>
            <h2 className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h2>
            <h1 className="text-2xl font-extrabold text-slate-900">{PAGE_TITLES[activePage]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:border-amber-300 transition-colors">
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline text-slate-400">Cari menu, pesanan...</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-amber-300 transition-colors relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </div>

        {/* ============ DASHBOARD PAGE ============ */}
        {activePage === "dashboard" && (
          <section>
            {/* Hero banner */}
            <div className="relative mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 p-6 sm:p-8 shadow-xl shadow-amber-500/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl translate-y-1/2" />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  {isPro && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-100" />
                      <span className="text-xs font-bold text-white tracking-wide">Member Pro Active</span>
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Selamat Datang, {storeName} <span className={styles.waveEmoji}>👋</span>
                  </h1>
                  <p className="mt-1.5 text-sm text-amber-50/90">
                    Toko Anda sedang aktif. Kelola menu dan raih lebih banyak pelanggan hari ini.
                  </p>
                </div>
                <button
                  onClick={() => navigate("reports")}
                  className={`${styles.ctaBtn} shrink-0 px-5 py-3 rounded-xl bg-white text-amber-700 font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:shadow-2xl`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>Lihat Statistik</span>
                </button>
              </div>
            </div>

            {/* URL Card */}
            <div className="mb-6 bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-lg shadow-slate-200/50 relative overflow-hidden card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Link className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">URL Menu Digital Anda</h3>
                    <p className="text-[11px] text-slate-500">Bagikan link ini ke pelanggan atau cetak QR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className={`${styles.urlPill} text-sm text-slate-700 font-medium truncate flex-1`}>
                    pesanlagi.web.id/menu/{storeSlug}
                  </span>
                  <span className="hidden sm:inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> AKTIF
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`pesanlagi.web.id/menu/${storeSlug}`).catch(() => {});
                      showToast("Link berhasil disalin ke clipboard!");
                    }}
                    className={`${styles.ctaBtn} flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Salin Link WA</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                    <Eye className="w-4 h-4" />
                    <span>Lihat Menu Live</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 stagger">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><UtensilsCrossed className="w-5 h-5 text-amber-600" /></div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                  {menuCount}<span className="text-base text-slate-400 font-bold ml-1">Menu</span>
                </p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Total Menu Makanan</p>
                <p className="text-[10px] text-green-600 font-semibold mt-1">+3 menu minggu ini</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><Store className="w-5 h-5 text-green-600" /></div>
                  <div
                    className={`${styles.toggle} ${storeOpen ? styles.toggleOn : ""}`}
                    onClick={handleToggleStore}
                  />
                </div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">{storeOpen ? "Toko Buka" : "Toko Tutup"}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Status Toko</p>
                <p className={`text-[10px] font-semibold mt-1 ${storeOpen ? "text-green-600" : "text-red-500"}`}>
                  {storeOpen ? `Buka sejak ${settingsOpenTime} WIB` : "Tutup sementara"}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><QrCode className="w-5 h-5 text-purple-600" /></div>
                  <span className="px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">READY</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">Siap Cetak A6</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Status QR Code</p>
                <p className="text-[10px] text-purple-600 font-semibold mt-1">Unduh 1x klik</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><CalendarClock className="w-5 h-5 text-orange-600" /></div>
                  <Crown className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">28<span className="text-base text-slate-400 font-bold ml-1">Hari</span></p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Masa Aktif Pro</p>
                <p className="text-[10px] text-orange-600 font-semibold mt-1">Berakhir 11 Feb 2025</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">Aksi Cepat</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={`${styles.quickTile} bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm`} onClick={() => { navigate("menu"); setTimeout(() => setModalOpen(true), 300); }}>
                  <div className={`${styles.tileIcon} w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30`}>
                    <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">Tambah Menu Makanan</p>
                  <p className="text-[11px] text-slate-500 mt-1">Unggah foto & harga</p>
                </div>
                <div className={`${styles.quickTile} bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm`} onClick={() => navigate("qr")}>
                  <div className={`${styles.tileIcon} w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30`}>
                    <Palette className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">Desain Kartu QR</p>
                  <p className="text-[11px] text-slate-500 mt-1">Template siap cetak</p>
                </div>
                <div className={`${styles.quickTile} bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm`} onClick={() => navigate("settings")}>
                  <div className={`${styles.tileIcon} w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-3 shadow-lg shadow-slate-500/30`}>
                    <Settings className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">Pengaturan Profil</p>
                  <p className="text-[11px] text-slate-500 mt-1">Edit info warung</p>
                </div>
                <div className={`${styles.quickTile} bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm`} onClick={() => showToast("Link menu dibagikan ke WhatsApp!")}>
                  <div className={`${styles.tileIcon} w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-3 shadow-lg shadow-green-500/30`}>
                    <Share2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">Bagikan WhatsApp</p>
                  <p className="text-[11px] text-slate-500 mt-1">Sebar ke pelanggan</p>
                </div>
              </div>
            </div>

            {/* Menu preview table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden">
              <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Menu Makanan Anda</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Kelola ketersediaan menu secara real-time</p>
                </div>
                <button onClick={() => navigate("menu")} className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {displayMenus.slice(0, 4).map((m, i) => (
                  <div key={m.id ?? i} className={`${styles.menuRow} flex items-center gap-3 sm:gap-4 p-4 sm:p-5`}>
                    <img src={m.image} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover" alt={m.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-amber-600">Rp {m.price.toLocaleString("id-ID")}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500">Terjual {m.sold_count ?? 0}x</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`hidden sm:inline text-xs font-semibold ${m.is_available !== false ? "text-green-600" : "text-red-500"}`}>
                        {m.is_available !== false ? "Tersedia" : "Habis"}
                      </span>
                      <div
                        className={`${styles.toggle} ${m.is_available !== false ? styles.toggleAmber : ""}`}
                        onClick={() => handleToggleStock(m.id, i)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => navigate("menu")}
                  className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center justify-center gap-2 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
                >
                  Lihat Semua {menuCount} Menu <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ============ MENU PAGE ============ */}
        {activePage === "menu" && (
          <section>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Menu Makanan</h2>
                <p className="text-sm text-slate-500 mt-0.5">Kelola {menuCount} menu digital warung Anda</p>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className={`${styles.ctaBtn} px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" /> Tambah Menu
              </button>
            </div>
            <div className="mb-4 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari nama menu..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {categoryChips.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.chip} ${activeCategoryChip === c.id ? styles.chipActive : ""}`}
                  onClick={() => setActiveCategoryChip(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 stagger">
              {displayMenus.map((m, i) => {
                const catColor = m.category === "Minuman" ? "text-blue-700" : m.category === "Snack" ? "text-purple-700" : "text-amber-700";
                const avail = m.is_available !== false;
                return (
                  <div key={m.id ?? i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm card-hover">
                    <div className="relative">
                      <img src={m.image} className="w-full h-32 sm:h-40 object-cover" alt={m.name} />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700">
                        <span className={catColor}>{m.category ?? "Makanan"}</span>
                      </span>
                      <button
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteMenu(m.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {!avail && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-bold" style={{ right: 40 }}>Habis</span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-sm font-bold text-slate-900 truncate">{m.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Terjual {m.sold_count ?? 0}x</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-extrabold text-amber-600">Rp {m.price.toLocaleString("id-ID")}</span>
                        <div
                          className={`${styles.toggle} ${avail ? styles.toggleAmber : ""}`}
                          onClick={() => handleToggleStock(m.id, i)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ QR PAGE ============ */}
        {activePage === "qr" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">Kartu QR Code</h2>
              <p className="text-sm text-slate-500 mt-0.5">Desain dan cetak kartu QR menu digital Anda</p>
            </div>
            <div className="grid lg:grid-cols-5 gap-5">
              {/* Preview */}
              <div className="lg:col-span-3 flex items-center justify-center">
                <div className={`${styles.qrCardPreview} w-full max-w-sm p-6 sm:p-8 relative`}>
                  <div className="absolute inset-0 border-4 border-amber-200/50 rounded-3xl m-2" />
                  <div className="relative text-center">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Utensils className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-lg font-extrabold text-slate-900">Pesan<span className="text-amber-500">Lagi</span></span>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">{storeName}</h3>
                    <p className="text-xs text-slate-500 mb-4">Scan QR untuk lihat menu & pesan langsung</p>
                    <div className="relative inline-block p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm mb-4">
                      <svg viewBox="0 0 25 25" className="w-40 h-40" shapeRendering="crispEdges" dangerouslySetInnerHTML={{ __html: generateQRSVG() }} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                          <Utensils className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`${styles.urlPill} text-xs text-slate-600 font-medium`}>pesanlagi.web.id/menu/{storeSlug}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Resmi PesanLagi</span>
                      <span>•</span>
                      <span>A6 Siap Cetak</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Customization */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Pilih Template</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { name: "Gold Elegan", from: "from-amber-400", to: "to-amber-600", active: true },
                      { name: "Dark Premium", from: "from-slate-700", to: "to-slate-900", active: false },
                      { name: "Fresh Green", from: "from-green-400", to: "to-green-600", active: false },
                      { name: "Ocean Blue", from: "from-blue-400", to: "to-blue-600", active: false },
                    ].map((t) => (
                      <button
                        key={t.name}
                        className={`p-3 border-2 ${t.active ? "border-amber-500 bg-amber-50/50" : "border-slate-200 hover:border-amber-300"} rounded-xl text-left transition-all`}
                      >
                        <div className={`w-full h-12 bg-gradient-to-br ${t.from} ${t.to} rounded-lg mb-1.5`} />
                        <p className="text-[11px] font-bold text-slate-900">{t.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Ukuran Cetak</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-500 bg-amber-50/50 cursor-pointer">
                      <input type="radio" name="size" defaultChecked className="text-amber-500" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">A6 (105×148mm)</p>
                        <p className="text-[11px] text-slate-500">Ukuran standar meja</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">RECOMMENDED</span>
                    </label>
                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300">
                      <input type="radio" name="size" className="text-amber-500" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">A4 (210×297mm)</p>
                        <p className="text-[11px] text-slate-500">Poster dinding</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300">
                      <input type="radio" name="size" className="text-amber-500" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">Stiker (5×5cm)</p>
                        <p className="text-[11px] text-slate-500">Tempel di meja</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Unduh & Cetak</h4>
                  <div className="space-y-2">
                    <button onClick={() => showToast("QR Code PDF berhasil diunduh!")} className={`${styles.ctaBtn} w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2`}>
                      <Download className="w-4 h-4" /> Unduh PDF Cetak A6
                    </button>
                    <button onClick={() => showToast("QR Code PNG berhasil diunduh!")} className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:border-amber-300 transition-colors">
                      <ImageIcon className="w-4 h-4" /> Unduh PNG HD
                    </button>
                    <button onClick={() => showToast("Mengarahkan ke percetakan mitra...")} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                      <Printer className="w-4 h-4" /> Cetak ke Percetakan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============ ORDERS PAGE ============ */}
        {activePage === "orders" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">Pesanan Masuk</h2>
              <p className="text-sm text-slate-500 mt-0.5">Kelola pesanan pelanggan secara real-time</p>
            </div>
            <div className={`${styles.orderTabs} mb-5`}>
              <div
                className={styles.orderTabIndicator}
                style={{ left: tabIndicator.left, width: tabIndicator.width }}
              />
              {["all", "new", "process", "done"].map((s, idx) => (
                <button
                  key={s}
                  ref={(el) => { orderTabRefs.current[idx] = el; }}
                  className={`${styles.orderTab} ${orderTab === s ? styles.orderTabActive : ""}`}
                  onClick={() => setOrderTab(s)}
                >
                  {s === "all" ? `Semua (${orders.length})` : s === "new" ? `Baru (${orders.filter(o=>o.status==="new").length})` : s === "process" ? `Diproses (${orders.filter(o=>o.status==="process").length})` : `Selesai (${orders.filter(o=>o.status==="done").length})`}
                </button>
              ))}
            </div>
            <div className="space-y-3 stagger">
              {filteredOrders.map((order) => {
                const isNew = order.status === "new";
                const isProcess = order.status === "process";
                const isDone = order.status === "done";
                return (
                  <div
                    key={order.id}
                    className={`bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover ${isDone ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 ${isNew ? "bg-amber-500" : isProcess ? "bg-blue-500" : "bg-green-500"} rounded-full ${isNew ? styles.pulseDot : ""}`} />
                        <span className={`text-xs font-bold ${isNew ? "text-amber-600" : isProcess ? "text-blue-600" : "text-green-600"}`}>
                          {isNew ? "PESANAN BARU" : isProcess ? "SEDANG DIPROSES" : "SELESAI"}
                        </span>
                        <span className="text-[11px] text-slate-400">• {order.time}</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">{order.id}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                      <div className={`w-10 h-10 rounded-xl ${isNew ? "bg-amber-100" : isProcess ? "bg-blue-100" : "bg-green-100"} flex items-center justify-center`}>
                        <User className={`w-5 h-5 ${isNew ? "text-amber-600" : isProcess ? "text-blue-600" : "text-green-600"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{order.customer}</p>
                        <p className="text-[11px] text-slate-500">{order.info}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{item.name}</span>
                          <span className="font-semibold text-slate-900">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[11px] text-slate-500">Total Pembayaran</p>
                        <p className={`text-lg font-extrabold ${isDone ? "text-green-600" : "text-amber-600"}`}>{order.total}</p>
                      </div>
                      {isDone ? (
                        <span className="px-3 py-2 rounded-lg bg-green-50 text-green-600 text-xs font-bold">✓ Selesai</span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setOrders((prev) => prev.filter((o) => o.id !== order.id));
                              showToast(`Pesanan ${order.id} ditolak`);
                            }}
                            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                          >
                            {isProcess ? "Batal" : "Tolak"}
                          </button>
                          <button
                            onClick={() => handleOrderAction(order.id, isProcess ? "done" : "process")}
                            className={`${styles.ctaBtn} px-4 py-2 rounded-lg ${isProcess ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-amber-500 to-amber-600"} text-white text-xs font-bold shadow-md ${isProcess ? "shadow-green-500/30" : "shadow-amber-500/30"}`}
                          >
                            {isProcess ? "Tandai Selesai" : "Terima"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ REPORTS PAGE ============ */}
        {activePage === "reports" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">Laporan Penjualan</h2>
              <p className="text-sm text-slate-500 mt-0.5">Analisis performa warung Anda 7 hari terakhir</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 stagger">
              {[
                { icon: Banknote, color: "amber", label: "Pendapatan Hari Ini", value: "Rp 847K", badge: "+12.5%", badgeColor: "green" },
                { icon: Receipt, color: "blue", label: "Total Transaksi", value: "47", badge: "+8.2%", badgeColor: "green" },
                { icon: TrendingUp, color: "purple", label: "Rata-rata Order", value: "Rp 18K", badge: "+5.1%", badgeColor: "green" },
                { icon: Award, color: "orange", label: "Menu Terlaris", value: "Es Teh Manis", badge: "BEST", badgeColor: "amber" },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-${c.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${c.color}-600`} />
                      </div>
                      <span className={`text-[10px] font-bold ${c.badgeColor === "green" ? "text-green-600 bg-green-50" : "text-amber-700 bg-amber-50"} px-2 py-0.5 rounded-md`}>
                        {c.badge}
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{c.value}</p>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">{c.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Chart */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pendapatan 7 Hari Terakhir</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Total: Rp 3.847.000</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold">7D</button>
                  <button className="px-2.5 py-1 rounded-lg text-slate-500 text-[11px] font-semibold hover:bg-slate-50">30D</button>
                  <button className="px-2.5 py-1 rounded-lg text-slate-500 text-[11px] font-semibold hover:bg-slate-50">90D</button>
                </div>
              </div>
              <svg viewBox="0 0 700 250" className="w-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <line x1="40" y1="50" x2="680" y2="50" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 4" />
                <line x1="40" y1="100" x2="680" y2="100" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 4" />
                <line x1="40" y1="150" x2="680" y2="150" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 4" />
                <line x1="40" y1="200" x2="680" y2="200" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 4" />
                <text x="30" y="55" fontSize="10" fill="#94A3B8" textAnchor="end">1JT</text>
                <text x="30" y="105" fontSize="10" fill="#94A3B8" textAnchor="end">750K</text>
                <text x="30" y="155" fontSize="10" fill="#94A3B8" textAnchor="end">500K</text>
                <text x="30" y="205" fontSize="10" fill="#94A3B8" textAnchor="end">250K</text>
                <path
                  d="M 80,170 C 120,155 150,140 190,145 C 230,150 260,110 300,100 C 340,90 370,120 410,85 C 450,55 480,70 520,40 C 560,25 590,55 630,45 L 630,220 L 80,220 Z"
                  fill="url(#chartGrad)"
                  style={{ opacity: chartAnimated ? 1 : 0, transition: "opacity 1s ease 0.5s" }}
                />
                <path
                  className={`${styles.chartLine} ${chartAnimated ? styles.chartLineAnimate : ""}`}
                  d="M 80,170 C 120,155 150,140 190,145 C 230,150 260,110 300,100 C 340,90 370,120 410,85 C 450,55 480,70 520,40 C 560,25 590,55 630,45"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {[
                  [80,170], [190,145], [300,100], [410,85], [520,40], [630,45],
                ].map(([cx, cy], idx) => (
                  <circle
                    key={idx}
                    className={`${styles.chartDot} ${chartAnimated ? styles.chartDotAnimate : ""}`}
                    cx={cx}
                    cy={cy}
                    r={idx === 4 ? 6 : 5}
                    fill={idx === 4 ? "#F59E0B" : "white"}
                    stroke="#F59E0B"
                    strokeWidth={3}
                  />
                ))}
                {["Sen","Sel","Rab","Kam","Sab","Min"].map((label, idx) => (
                  <text
                    key={label}
                    x={[80,190,300,410,520,630][idx]}
                    y="240"
                    fontSize="11"
                    fill={idx === 4 ? "#F59E0B" : "#94A3B8"}
                    textAnchor="middle"
                    fontWeight={idx === 4 ? "bold" : "normal"}
                  >
                    {label}
                  </text>
                ))}
              </svg>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Top selling */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Menu Terlaris</h3>
                <div className="space-y-3">
                  {TOP_SELLING.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                      <span className="text-sm font-medium text-slate-700 w-28 truncate">{item.name}</span>
                      <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                        <div
                          className={`${styles.barFill} h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-end pr-2`}
                          style={{ width: barAnimated ? `${item.pct}%` : "0%" }}
                        >
                          <span className="text-[10px] font-bold text-white">{item.count}x</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recent transactions */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Transaksi Terbaru</h3>
                <div className="space-y-3">
                  {RECENT_TRANSACTIONS.map((tx, idx) => {
                    const iconMap: Record<string, typeof Check> = { green: Check, amber: Bell, blue: Clock };
                    const colorMap: Record<string, string> = { green: "green", amber: "amber", blue: "blue" };
                    const TxIcon = iconMap[tx.color] ?? Check;
                    const c = colorMap[tx.color] ?? "green";
                    const isLast = idx === RECENT_TRANSACTIONS.length - 1;
                    return (
                      <div key={tx.id} className={`flex items-center gap-3 ${!isLast ? "pb-3 border-b border-slate-100" : ""}`}>
                        <div className={`w-8 h-8 rounded-lg bg-${c}-100 flex items-center justify-center`}>
                          <TxIcon className={`w-4 h-4 text-${c}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{tx.id}</p>
                          <p className="text-[11px] text-slate-500">{tx.customer} • {tx.time}</p>
                        </div>
                        <span className={`text-sm font-bold text-${c}-600`}>{tx.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============ REVIEWS PAGE ============ */}
        {activePage === "reviews" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">Ulasan Pelanggan</h2>
              <p className="text-sm text-slate-500 mt-0.5">Lihat dan balas ulasan dari pelanggan setia</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 sm:p-6 mb-5 shadow-lg shadow-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-white leading-none">4.8</p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-50 mt-1">dari 156 ulasan</p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {[["5",78,122],["4",15,23],["3",5,8],["2",1.5,2],["1",0.5,1]].map(([star, pct, count]) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[11px] text-white font-semibold w-8">{star}★</span>
                      <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-white/80 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3 stagger">
              {DEFAULT_REVIEWS.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                  <div className="flex items-start gap-3">
                    <img src={rev.avatar} className="w-10 h-10 rounded-full object-cover" alt={rev.name} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{rev.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                              />
                            ))}
                            <span className="text-[11px] text-slate-400 ml-1.5">{rev.date}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${rev.replied ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                          {rev.replied ? "Sudah Dibalas" : "Belum Dibalas"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">{rev.text}</p>
                  {rev.reply && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                      <p className="text-[11px] font-bold text-slate-500 mb-1">Balasan dari Warung</p>
                      <p className="text-sm text-slate-600">{rev.reply}</p>
                    </div>
                  )}
                  {!rev.replied && (
                    <button
                      onClick={() => showToast("Form balasan dibuka")}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Balas Ulasan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============ SETTINGS PAGE ============ */}
        {activePage === "settings" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">Pengaturan Profil</h2>
              <p className="text-sm text-slate-500 mt-0.5">Kelola informasi warung dan preferensi tampilan</p>
            </div>
            <div className="space-y-4 stagger">
              {/* Store info */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><Store className="w-4 h-4 text-amber-600" /></div>
                  <h3 className="text-sm font-bold text-slate-900">Informasi Warung</h3>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img src={storeLogo} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-100" alt="Store logo" />
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Logo Warung</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">JPG/PNG, maks 1MB</p>
                    <button className="text-xs font-semibold text-amber-600 mt-1">Ganti Logo</button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Warung</label>
                    <input type="text" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} className={styles.settingsInput} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
                    <select value={store?.category ?? ""} className={styles.settingsInput}>
                      <option>Makanan Indonesia</option>
                      <option>Makanan Cepat Saji</option>
                      <option>Minuman</option>
                      <option>Snack</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Warung</label>
                    <textarea rows={2} value={settingsDesc} onChange={(e) => setSettingsDesc(e.target.value)} className={`${styles.settingsInput} resize-none`} />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Phone className="w-4 h-4 text-blue-600" /></div>
                  <h3 className="text-sm font-bold text-slate-900">Kontak & Lokasi</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor WhatsApp</label>
                    <input type="text" value={settingsPhone} onChange={(e) => setSettingsPhone(e.target.value)} className={styles.settingsInput} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} className={styles.settingsInput} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Lengkap</label>
                    <textarea rows={2} value={settingsAddress} onChange={(e) => setSettingsAddress(e.target.value)} className={`${styles.settingsInput} resize-none`} />
                  </div>
                </div>
              </div>

              {/* Operating hours */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><Clock className="w-4 h-4 text-green-600" /></div>
                  <h3 className="text-sm font-bold text-slate-900">Jam Operasional</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jam Buka</label>
                    <input type="time" value={settingsOpenTime} onChange={(e) => setSettingsOpenTime(e.target.value)} className={styles.settingsInput} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jam Tutup</label>
                    <input type="time" value={settingsCloseTime} onChange={(e) => setSettingsCloseTime(e.target.value)} className={styles.settingsInput} />
                  </div>
                </div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Hari Operasional</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_LABELS.map((day, idx) => (
                    <label
                      key={day}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer ${settingsDays[idx] ? "bg-amber-50 border border-amber-300" : "bg-slate-50 border border-slate-200"}`}
                    >
                      <input
                        type="checkbox"
                        checked={settingsDays[idx]}
                        onChange={(e) => {
                          const next = [...settingsDays];
                          next[idx] = e.target.checked;
                          setSettingsDays(next);
                        }}
                        className="text-amber-500"
                      />
                      <span className={`text-xs font-semibold ${settingsDays[idx] ? "text-amber-700" : "text-slate-500"}`}>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><Palette className="w-4 h-4 text-purple-600" /></div>
                  <h3 className="text-sm font-bold text-slate-900">Tampilan Menu Digital</h3>
                </div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Warna Tema</label>
                <div className="flex gap-2.5 mb-4">
                  {["from-amber-400 to-amber-600","from-green-400 to-green-600","from-blue-400 to-blue-600","from-red-400 to-red-600","from-slate-700 to-slate-900"].map((g, i) => (
                    <button
                      key={g}
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} ${i === 0 ? "ring-2 ring-amber-500 ring-offset-2" : ""}`}
                    />
                  ))}
                </div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Template Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-2 border-2 border-amber-500 rounded-xl bg-amber-50/50">
                    <div className="w-full h-12 bg-amber-100 rounded-lg flex items-center justify-center"><LayoutGrid className="w-5 h-5 text-amber-600" /></div>
                    <p className="text-[10px] font-bold text-slate-900 mt-1">Grid</p>
                  </button>
                  <button className="p-2 border-2 border-slate-200 rounded-xl hover:border-amber-300">
                    <div className="w-full h-12 bg-slate-100 rounded-lg flex items-center justify-center"><List className="w-5 h-5 text-slate-500" /></div>
                    <p className="text-[10px] font-bold text-slate-900 mt-1">List</p>
                  </button>
                  <button className="p-2 border-2 border-slate-200 rounded-xl hover:border-amber-300">
                    <div className="w-full h-12 bg-slate-100 rounded-lg flex items-center justify-center"><Columns2 className="w-5 h-5 text-slate-500" /></div>
                    <p className="text-[10px] font-bold text-slate-900 mt-1">Kategori</p>
                  </button>
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveSettings}
                  className={`${styles.ctaBtn} flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2`}
                >
                  <Save className="w-4 h-4" /> Simpan Perubahan
                </button>
                <button className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-colors">
                  Batal
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ==================== BOTTOM NAV ==================== */}
      <nav className={styles.bottomNav}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <div
              key={item.id}
              className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ""}`}
              onClick={() => navigate(item.id)}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* ==================== MODAL ==================== */}
      {modalOpen && (
        <>
          <div
            className={`${styles.modalBackdrop} ${styles.modalBackdropShow}`}
            onClick={() => setModalOpen(false)}
          />
          <div className={`${styles.modalCard} ${styles.modalCardShow}`}>
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Tambah Menu Baru</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Isi detail menu makanan Anda</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {/* Dropzone */}
                <div
                  className={styles.dropzone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file);
                    }}
                  />
                  {modalImage ? (
                    <div className="relative">
                      <img src={modalImage} className="w-full h-32 object-cover rounded-xl" alt="Menu image preview" />
                      <button
                        className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center"
                        onClick={(e) => { e.stopPropagation(); setModalImage(null); }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
                        <ImagePlus className="w-6 h-6 text-amber-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{uploading ? "Mengunggah..." : "Klik atau drag foto menu ke sini"}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">JPG/PNG, maks 2MB</p>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Menu</label>
                  <input type="text" placeholder="Contoh: Nasi Goreng Spesial" value={modalName} onChange={(e) => setModalName(e.target.value)} className={styles.settingsInput} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
                    <select value={modalCategory} onChange={(e) => setModalCategory(e.target.value)} className={styles.settingsInput}>
                      <option>Makanan</option>
                      <option>Minuman</option>
                      <option>Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Harga (Rp)</label>
                    <input type="number" placeholder="18000" value={modalPrice} onChange={(e) => setModalPrice(e.target.value)} className={styles.settingsInput} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Menu</label>
                  <textarea rows={2} placeholder="Deskripsi singkat menu..." value={modalDesc} onChange={(e) => setModalDesc(e.target.value)} className={`${styles.settingsInput} resize-none`} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Status Ketersediaan</p>
                    <p className="text-[11px] text-slate-500">Matikan jika menu sedang habis</p>
                  </div>
                  <div
                    className={`${styles.toggle} ${modalAvailable ? styles.toggleAmber : ""}`}
                    onClick={() => setModalAvailable(!modalAvailable)}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveMenu}
                  className={`${styles.ctaBtn} flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2`}
                >
                  <Check className="w-4 h-4" /> Simpan Menu
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================== TOAST ==================== */}
      <div className={`${styles.toast} ${toast.show ? styles.toastShow : ""}`}>
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}


