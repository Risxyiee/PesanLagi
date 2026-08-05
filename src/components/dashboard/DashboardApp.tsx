"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
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
  Camera,
  Phone,
  Clock,
  Save,
  CheckCircle2,
  ShieldCheck,
  LayoutGrid,
  List,
  Columns2,
  ArrowRight,
  Rocket,
  Wand2,
  Lock,
  Loader2,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./DashboardApp.module.css";

/* ------------------------------------------------------------------ */
/*  Image compression helper                                            */
/* ------------------------------------------------------------------ */

function compressImage(file: File, maxSize = 800, quality = 0.75): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip compression for small files or GIFs
    if (file.size < 500_000 || file.type === 'image/gif') {
      resolve(file);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      // Scale down if larger than maxSize
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round((h / w) * maxSize); w = maxSize; }
        else { w = Math.round((w / h) * maxSize); h = maxSize; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  is_pro?: boolean;
  pro_expiry_date?: string;
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
  image_url?: string;
  image?: string; // fallback for compatibility
  is_available?: boolean;
  sold_count?: number;
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
/*  QR Grid Generation (for SVG preview + Canvas export)                */
/* ------------------------------------------------------------------ */
function generateQRGrid(): number[][] {
  const size = 25;
  const grid: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
  const fill = (fx: number, fy: number) => {
    for (let y = fy; y < fy + 7; y++)
      for (let x = fx; x < fx + 7; x++)
        if (x === fx || x === fx + 6 || y === fy || y === fy + 6 || (x >= fx + 2 && x <= fx + 4 && y >= fy + 2 && y <= fy + 4))
          grid[y][x] = 1;
  };
  fill(0, 0); fill(18, 0); fill(0, 18);
  for (let i = 0; i <= 4; i++) { grid[16 + i][16 + i] = 1; grid[20 - i][16 + i] = 1; }
  for (let i = 8; i < 17; i++) { if (i % 2 === 0) { grid[i][6] = 1; grid[6][i] = 1; } }
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const inFinder = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
      const inAlign = x >= 16 && x <= 20 && y >= 16 && y <= 20;
      const inCenter = x >= 10 && x <= 14 && y >= 10 && y <= 14;
      const inTiming = y === 6 || x === 6;
      if (inFinder || inAlign || inCenter || inTiming) continue;
      if ((x * 7 + y * 13 + x * y * 3) % 7 < 3) grid[y][x] = 1;
    }
  return grid;
}
const QR_GRID = generateQRGrid();

function generateQRSVG(fgColor: string = "#0F172A"): string {
  let rects = "";
  for (let y = 0; y < 25; y++)
    for (let x = 0; x < 25; x++)
      if (QR_GRID[y][x]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fgColor}"/>`;
  return rects;
}

/* ------------------------------------------------------------------ */
/*  Canvas helpers for QR export                                       */
/* ------------------------------------------------------------------ */
function canvasRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function canvasDrawQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const cell = size / 25;
  ctx.fillStyle = color;
  for (let row = 0; row < 25; row++)
    for (let col = 0; col < 25; col++)
      if (QR_GRID[row][col]) ctx.fillRect(x + col * cell, y + row * cell, cell + 0.5, cell + 0.5);
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function drawFallbackLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  try {
    const logo = await loadImg('/pesanlagi-logo.png');
    ctx.save();
    canvasRoundRect(ctx, cx - r, cy - r, r * 2, r * 2, 12); ctx.clip();
    ctx.drawImage(logo, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } catch {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, "#FB923C"); g.addColorStop(0.5, "#F97316"); g.addColorStop(1, "#EA580C");
    ctx.fillStyle = g;
    canvasRoundRect(ctx, cx - r, cy - r, r * 2, r * 2, 12); ctx.fill();
  }
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

  // Orders — start empty (no mock data)
  const [orders, setOrders] = useState<Order[]>([]);

  // Category management
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  // QR Designer states
  const [qrActiveTab, setQrActiveTab] = useState("ai");
  const [qrShowUpgrade, setQrShowUpgrade] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrFgColor, setQrFgColor] = useState("#0F172A");
  const [qrTextColor, setQrTextColor] = useState("#0F172A");
  const [qrAccentColor, setQrAccentColor] = useState("#F59E0B");
  const [qrActiveTemplate, setQrActiveTemplate] = useState("pesanlagi");
  const [qrCustomBgImage, setQrCustomBgImage] = useState<string | null>(null);
  const qrExportRef = useRef<HTMLDivElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Settings form
  const [settingsName, setSettingsName] = useState("");
  const [settingsSlug, setSettingsSlug] = useState("");
  const [settingsCategory, setSettingsCategory] = useState("");
  const [settingsDesc, setSettingsDesc] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsOpenTime, setSettingsOpenTime] = useState("08:00");
  const [settingsCloseTime, setSettingsCloseTime] = useState("22:00");
  const [settingsDays, setSettingsDays] = useState<boolean[]>([true,true,true,true,true,true,false]);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Digital menu appearance
  const [menuTheme, setMenuTheme] = useState("amber");
  const [menuLayout, setMenuLayout] = useState("grid");

  // Modal form
  const [modalName, setModalName] = useState("");
  const [modalCategory, setModalCategory] = useState("");
  const [modalPrice, setModalPrice] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalAvailable, setModalAvailable] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const orderTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- auth check + fetch data (parallel) ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [meRes, storeRes, menusRes, catsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/store").then((r) => r.json()).catch(() => null),
          fetch("/api/menus").then((r) => r.json()).catch(() => []),
          fetch("/api/categories").then((r) => r.json()).catch(() => []),
        ]);
        if (!meRes.ok) throw new Error("not auth");
        const userData = await meRes.json();
        setUser(userData);
        if (storeRes) {
          setStore(storeRes);
          setStoreOpen(storeRes.is_open ?? true);
          setSettingsName(storeRes.name ?? "");
          setSettingsDesc(storeRes.description ?? "");
          setSettingsPhone(storeRes.phone ?? "");
          setSettingsEmail(storeRes.email ?? "");
          setSettingsAddress(storeRes.address ?? "");
          setSettingsSlug(storeRes.slug ?? "");
          setSettingsCategory(storeRes.category ?? "Makanan Indonesia");
          if (storeRes.hours && typeof storeRes.hours === "object") {
            const h = storeRes.hours as Record<string, any>;
            if (h.open_time) setSettingsOpenTime(h.open_time);
            if (h.close_time) setSettingsCloseTime(h.close_time);
            if (Array.isArray(h.days)) {
              const days = [false, false, false, false, false, false, false];
              h.days.forEach((d: number) => {
                if (typeof d === "number" && d >= 1 && d <= 7) days[d - 1] = true;
              });
              setSettingsDays(days);
            }
            if (h.menu_theme) setMenuTheme(h.menu_theme);
            if (h.menu_layout) setMenuLayout(h.menu_layout);
          }
        }
        if (Array.isArray(menusRes)) setMenus(menusRes);
        if (Array.isArray(catsRes)) setCategories(catsRes);
      } catch {
        window.location.hash = "#login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      showToast("Berhasil keluar");
    } catch {
      showToast("Gagal keluar, coba lagi");
      return;
    }
    window.location.hash = "#login";
  }, [showToast]);

  const handleToggleStore = useCallback(async () => {
    const next = !storeOpen;
    setTogglingStore(true);
    setStoreOpen(next);
    try {
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_open: next }),
      });
      if (res.ok) {
        showToast(next ? "Toko dibuka" : "Toko ditutup");
      } else {
        setStoreOpen(!next);
        showToast("Gagal mengubah status toko");
      }
    } catch {
      setStoreOpen(!next);
      showToast("Gagal mengubah status toko");
    } finally {
      setTogglingStore(false);
    }
  }, [storeOpen, showToast]);

  const handleToggleStock = useCallback(async (menuId?: string) => {
    if (!menuId) return;
    const menuItem = menus.find((m) => m.id === menuId);
    if (!menuItem) return;
    const nextAvailable = !menuItem.is_available;
    setMenus((prev) =>
      prev.map((m) =>
        m.id === menuId ? { ...m, is_available: nextAvailable } : m
      )
    );
    try {
      await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: menuId, is_available: nextAvailable }),
      });
      showToast(nextAvailable ? "Menu tersedia" : "Menu ditandai habis");
    } catch {
      showToast("Gagal mengubah status menu");
    }
  }, [menus, showToast]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [togglingStore, setTogglingStore] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [addingCat, setAddingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [exportingQr, setExportingQr] = useState(false);

  const handleDeleteMenu = useCallback(async (menuId?: string) => {
    if (!menuId) return;
    setDeletingId(menuId);
    try {
      const res = await fetch("/api/menus", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: menuId }),
      });
      if (res.ok) {
        setMenus((prev) => prev.filter((m) => m.id !== menuId));
        showToast("Menu berhasil dihapus");
      } else {
        showToast("Gagal menghapus menu");
      }
    } catch {
      showToast("Gagal menghapus menu");
    } finally {
      setDeletingId(null);
    }
  }, [showToast]);

  const handleSaveSettings = useCallback(async () => {
    setSavingSettings(true);
    try {
      const hoursData = {
        open_time: settingsOpenTime,
        close_time: settingsCloseTime,
        days: settingsDays.map((d, i) => (d ? i + 1 : 0)).filter(Boolean),
        menu_theme: menuTheme,
        menu_layout: menuLayout,
      };
      const res = await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settingsName,
          slug: settingsSlug,
          description: settingsDesc,
          address: settingsAddress,
          phone: settingsPhone,
          email: settingsEmail,
          hours: hoursData,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStore(updated);
        showToast("Perubahan berhasil disimpan!");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Gagal menyimpan perubahan");
      }
    } catch {
      showToast("Gagal menyimpan perubahan");
    } finally {
      setSavingSettings(false);
    }
  }, [settingsName, settingsSlug, settingsDesc, settingsAddress, settingsPhone, settingsEmail, settingsOpenTime, settingsCloseTime, settingsDays, menuTheme, menuLayout, showToast]);

  const handleCancelSettings = useCallback(() => {
    if (store) {
      setSettingsName(store.name ?? "");
      setSettingsDesc(store.description ?? "");
      setSettingsAddress(store.address ?? "");
      setSettingsSlug(store.slug ?? "");
      if (store.hours && typeof store.hours === "object") {
        const h = store.hours as Record<string, any>;
        if (h.open_time) setSettingsOpenTime(h.open_time);
        else setSettingsOpenTime("08:00");
        if (h.close_time) setSettingsCloseTime(h.close_time);
        else setSettingsCloseTime("22:00");
        if (Array.isArray(h.days)) {
          const days = [false, false, false, false, false, false, false];
          h.days.forEach((d: number) => {
            if (typeof d === "number" && d >= 1 && d <= 7) days[d - 1] = true;
          });
          setSettingsDays(days);
        }
        setMenuTheme(h.menu_theme || "amber");
        setMenuLayout(h.menu_layout || "grid");
      } else {
        setSettingsOpenTime("08:00");
        setSettingsCloseTime("22:00");
        setSettingsDays([true,true,true,true,true,true,false]);
        setMenuTheme("amber");
        setMenuLayout("grid");
      }
    }
    showToast("Perubahan dibatalkan");
  }, [store, showToast]);

  const handleUploadImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file, 1024, 0.8);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("bucket", "menus");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setModalImage(data.url ?? data.publicUrl ?? URL.createObjectURL(file));
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.error || "Gagal mengunggah gambar");
      }
    } catch {
      showToast("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  }, [showToast]);

  const handleUploadLogo = useCallback(async (file: File) => {
    setUploadingLogo(true);
    try {
      const compressed = await compressImage(file, 800, 0.8);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("bucket", "logos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        const url = data.url ?? data.publicUrl;
        if (url) {
          setStore((prev) => (prev ? { ...prev, logo_url: url } : prev));
          const storeRes = await fetch("/api/store", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logo_url: url }),
          });
          if (storeRes.ok) {
            showToast("Logo berhasil diperbarui!");
          } else {
            const err = await storeRes.json().catch(() => null);
            showToast(err?.error || "Logo diupload tapi gagal disimpan");
          }
        }
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.error || "Gagal mengunggah logo");
      }
    } catch {
      showToast("Gagal mengunggah logo");
    } finally {
      setUploadingLogo(false);
    }
  }, [showToast]);

  const handleSaveMenu = useCallback(async () => {
    setSavingMenu(true);
    try {
      const body: Record<string, unknown> = {
        name: modalName,
        category_id: modalCategory || null,
        price: Number(modalPrice) || 0,
        description: modalDesc,
        is_available: modalAvailable,
      };
      if (modalImage) body.image_url = modalImage;
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
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Gagal menambah menu");
      }
    } catch {
      showToast("Gagal menambah menu");
    } finally {
      setSavingMenu(false);
    }
  }, [modalName, modalCategory, modalPrice, modalDesc, modalAvailable, modalImage, showToast]);

  const handleOrderAction = useCallback((orderId: string, newStatus: "process" | "done") => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus }
          : o
      )
    );
    showToast(newStatus === "process" ? "Pesanan diterima, sedang diproses" : "Pesanan selesai!");
  }, [showToast]);

  const handleAddCategory = useCallback(async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories((prev) => [...prev, cat]);
        setNewCatName("");
        setShowAddCat(false);
        showToast("Kategori berhasil ditambahkan!");
      } else {
        showToast("Gagal menambah kategori");
      }
    } catch {
      showToast("Gagal menambah kategori");
    } finally {
      setAddingCat(false);
    }
  }, [newCatName, showToast]);

  const handleDeleteCategory = useCallback(async (catId?: string) => {
    if (!catId) return;
    setDeletingCatId(catId);
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: catId }),
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        if (activeCategoryChip !== "all") {
          const remaining = categories.filter((c) => c.id !== catId);
          if (!remaining.some((c) => c.name === activeCategoryChip)) {
            setActiveCategoryChip("all");
          }
        }
        showToast("Kategori berhasil dihapus");
      } else {
        showToast("Gagal menghapus kategori");
      }
    } catch {
      showToast("Gagal menghapus kategori");
    } finally {
      setDeletingCatId(null);
    }
  }, [categories, activeCategoryChip, showToast]);

  /* ---------- QR Designer handlers ---------- */
  const QR_PRESETS = [
    { name: "Kopi Susu", bg: "#F5F1EB", qr: "#4B3621", text: "#4B3621", acc: "#C8825A" },
    { name: "Sage Segar", bg: "#F0FDF4", qr: "#166534", text: "#166534", acc: "#22C55E" },
    { name: "Midnight Slate", bg: "#0F172A", qr: "#F1F5F9", text: "#F1F5F9", acc: "#64748B" },
    { name: "Terracotta", bg: "#FFF7ED", qr: "#9A3412", text: "#9A3412", acc: "#EA580C" },
  ];

  const handleQrTabClick = useCallback((tab: string) => {
    if (!(user?.is_pro) && (tab === "ai" || tab === "custom")) {
      setQrShowUpgrade(true);
      return;
    }
    setQrActiveTab(tab);
  }, [user]);

  const handleAiGenerate = useCallback(async () => {
    if (!(user?.is_pro)) { setQrShowUpgrade(true); return; }
    if (!aiPrompt.trim()) { showToast("Tulis deskripsi warungmu dulu!"); return; }
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal generate desain");
      }
      const data = await res.json();
      setQrBgColor(data.bgColor);
      setQrFgColor(data.qrColor);
      setQrTextColor(data.textColor);
      setQrAccentColor(data.accentColor);
      setQrActiveTemplate(data.template);
      setQrActiveTab("templates");
      showToast(data.reason || "Desain AI berhasil digenerate!");
    } catch (err: any) {
      showToast(err.message || "Gagal generate desain");
    } finally {
      setIsAiGenerating(false);
    }
  }, [user, aiPrompt, showToast]);

  const handleQrApplyPreset = useCallback((preset: typeof QR_PRESETS[0]) => {
    setQrBgColor(preset.bg);
    setQrFgColor(preset.qr);
    setQrTextColor(preset.text);
    setQrAccentColor(preset.acc);
    setQrActiveTemplate("minimalist");
    setQrActiveTab("templates");
  }, []);

  const handleQrImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrCustomBgImage(event.target?.result as string);
        setQrActiveTemplate("custom");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const getQrTemplateClass = () => {
    switch (qrActiveTemplate) {
      case "pesanlagi": return "rounded-3xl shadow-2xl";
      case "rustic": return "rounded-3xl shadow-lg border border-amber-100";
      case "dark_gold": return "rounded-3xl shadow-2xl";
      case "acrylic": return "rounded-3xl shadow-2xl border-t-8 border-b-8 border-slate-100 overflow-hidden";
      case "custom": return "rounded-3xl shadow-lg";
      default: return "rounded-3xl shadow-lg border border-slate-200";
    }
  };

  const getQrTemplateStyle = (): React.CSSProperties => {
    switch (qrActiveTemplate) {
      case "pesanlagi":
        return {
          backgroundColor: "#14100B",
          backgroundImage: "linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.08) 50%, transparent 100%)",
        };
      case "rustic":
        return {
          backgroundColor: qrBgColor,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.05) 0px, rgba(139, 90, 43, 0.05) 2px, transparent 2px, transparent 10px), repeating-linear-gradient(-45deg, rgba(139, 90, 43, 0.05) 0px, rgba(139, 90, 43, 0.05) 2px, transparent 2px, transparent 10px)`,
        };
      case "custom":
        return qrCustomBgImage ? {
          backgroundImage: `url(${qrCustomBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : { backgroundColor: qrBgColor };
      default:
        return { backgroundColor: qrBgColor };
    }
  };

  const handleSlugChange = useCallback((val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    setSettingsSlug(slug);
    setSlugAvailable(null);
    if (slugTimer.current) clearTimeout(slugTimer.current);
    if (slug.length >= 3) {
      slugTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/store/check-slug?slug=${encodeURIComponent(slug)}`);
          if (res.ok) {
            const data = await res.json();
            setSlugAvailable(data.available ?? true);
          }
        } catch {}
      }, 500);
    }
  }, []);

  /* ---------- derived ---------- */
  const isDarkQr = qrActiveTemplate === "pesanlagi" || qrActiveTemplate === "dark_gold";
  const qrDisplayText = isDarkQr ? "#FFFFFF" : qrTextColor;
  const qrDisplayAccent = qrActiveTemplate === "pesanlagi" ? "#F97316" : qrAccentColor;
  const storeName = store?.name ?? user?.name ?? "Warung Saya";
  const storeSlug = (store?.slug ?? settingsSlug) || "warung-saya";
  const storeLogo = store?.logo_url ?? "";
  const isPro = user?.is_pro ?? false;
  const menuCount = menus.length;
  const catCount = categories.length;
  const newOrderCount = orders.filter((o) => o.status === "new").length;

  // Pro days remaining
  const proDaysLeft = (() => {
    if (!user?.pro_expiry_date) return null;
    const end = new Date(user.pro_expiry_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const handleQrExport = useCallback(async (format: "PNG" | "PDF") => {
    if (!qrExportRef.current) return;
    setExportingQr(true);
    showToast("Menyiapkan file download...");
    try {
      const isDark = qrActiveTemplate === "pesanlagi" || qrActiveTemplate === "dark_gold";
      const textCol = isDark ? "#FFFFFF" : qrTextColor;
      const accentCol = qrActiveTemplate === "pesanlagi" ? "#F97316" : qrAccentColor;

      const W = 630; const H = 720;
      const cvs = document.createElement("canvas");
      cvs.width = W * 2; cvs.height = H * 2;
      const ctx = cvs.getContext("2d")!;
      ctx.scale(2, 2);
      const pad = 30;

      if (qrActiveTemplate === "pesanlagi") {
        ctx.fillStyle = "#14100B"; ctx.fillRect(0, 0, W, H);
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, "rgba(249,115,22,0.18)"); g.addColorStop(0.5, "rgba(234,88,12,0.08)"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      } else if (qrActiveTemplate === "dark_gold") {
        ctx.fillStyle = "#0F172A"; ctx.fillRect(0, 0, W, H);
      } else if (qrActiveTemplate === "rustic") {
        ctx.fillStyle = qrBgColor || "#FDFBF7"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(139,90,43,0.06)"; ctx.lineWidth = 1;
        for (let i = -H; i < W + H; i += 6) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + H, 0); ctx.lineTo(i, H); ctx.stroke(); }
      } else if (qrActiveTemplate === "custom") {
        ctx.fillStyle = qrBgColor || "#FFFFFF"; ctx.fillRect(0, 0, W, H);
        if (qrCustomBgImage) { try { const bgImg = await loadImg(qrCustomBgImage); ctx.drawImage(bgImg, 0, 0, W, H); } catch {} }
      } else {
        ctx.fillStyle = qrBgColor || "#FFFFFF"; ctx.fillRect(0, 0, W, H);
      }

      if (qrActiveTemplate === "acrylic") {
        ctx.fillStyle = "#F1F5F9"; ctx.fillRect(0, 0, W, 18); ctx.fillRect(0, H - 18, W, 18);
      }
      if (isDark) {
        ctx.strokeStyle = accentCol; ctx.lineWidth = 3;
        canvasRoundRect(ctx, pad / 2, pad / 2, W - pad, H - pad, 14);
        ctx.stroke();
      }

      const cx = W / 2;
      let cy = pad + 16;

      const logoS = 60; const logoX = cx - logoS / 2;
      if (storeLogo) {
        try {
          const lImg = await loadImg(storeLogo);
          ctx.save(); canvasRoundRect(ctx, logoX, cy, logoS, logoS, 14); ctx.clip();
          ctx.drawImage(lImg, logoX, cy, logoS, logoS);
          ctx.restore();
          ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
          ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
          canvasRoundRect(ctx, logoX, cy, logoS, logoS, 14); ctx.stroke();
          ctx.shadowColor = "transparent";
        } catch { drawFallbackLogo(ctx, cx, cy + logoS / 2, logoS / 2); }
      } else { drawFallbackLogo(ctx, cx, cy + logoS / 2, logoS / 2); }
      cy += logoS + 12;

      ctx.fillStyle = textCol;
      ctx.font = "bold 22px system-ui,-apple-system,sans-serif"; ctx.textAlign = "center";
      ctx.fillText(storeName, cx, cy); cy += 16;

      ctx.fillStyle = textCol + "AA";
      ctx.font = "13px system-ui,sans-serif";
      ctx.fillText("Scan untuk lihat menu & pesan", cx, cy); cy += 18;

      const qrPx = 340; const qrPad = 14;
      const qrW = qrPx + qrPad * 2;
      const qrX = cx - qrW / 2;
      ctx.fillStyle = "#FFFFFF";
      canvasRoundRect(ctx, qrX, cy, qrW, qrW, 10); ctx.fill();
      if (isDark) {
        ctx.strokeStyle = accentCol; ctx.lineWidth = 3;
        canvasRoundRect(ctx, qrX, cy, qrW, qrW, 10); ctx.stroke();
      } else {
        ctx.shadowColor = "rgba(0,0,0,0.06)"; ctx.shadowBlur = 6;
        canvasRoundRect(ctx, qrX, cy, qrW, qrW, 10); ctx.fill();
        ctx.shadowColor = "transparent";
      }
      canvasDrawQR(ctx, qrX + qrPad, cy + qrPad, qrPx, qrFgColor);
      cy += qrW + 16;

      ctx.fillStyle = textCol + "88";
      ctx.font = "12px system-ui,sans-serif";
      ctx.fillText(`pesanlagi.web.id/menu/${storeSlug}`, cx, cy); cy += 18;

      ctx.fillStyle = accentCol;
      ctx.font = "bold 12px system-ui,sans-serif";
      ctx.fillText("Powered by PesanLagi", cx, cy);

      if (!isPro) {
        ctx.fillStyle = textCol + "44";
        ctx.font = "10px system-ui,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Dibuat dengan PesanLagi.com", cx, H - 14);
      }

      if (format === "PNG") {
        const a = document.createElement("a");
        a.download = "qr-pesanlagi.png"; a.href = cvs.toDataURL("image/png"); a.click();
      } else {
        const pdf = new jsPDF("p", "mm", "a6");
        const pw = pdf.internal.pageSize.getWidth();
        const ph = (cvs.height * pw) / cvs.width;
        pdf.addImage(cvs.toDataURL("image/png"), "PNG", 0, 0, pw, ph);
        pdf.save("qr-pesanlagi.pdf");
      }
      showToast(`Berhasil di-download sebagai ${format}!`);
    } catch (err) {
      console.error("QR export error:", err);
      showToast("Gagal mengunduh file. Coba lagi.");
    } finally {
      setExportingQr(false);
    }
  }, [storeName, storeSlug, storeLogo, isPro, qrFgColor, qrBgColor, qrAccentColor, qrTextColor, qrActiveTemplate, qrCustomBgImage, showToast]);

  const categoryChips = [
    { id: "all", label: `Semua (${menuCount})`, catId: undefined as string | undefined },
    ...categories.map((c) => ({
      id: c.name,
      label: `${c.name} (${menus.filter((m) => m.category_name === c.name).length})`,
      catId: c.id,
    })),
  ];

  const filteredMenus = menus.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchCat = activeCategoryChip === "all" || m.category_name === activeCategoryChip;
    return matchSearch && matchCat;
  });

  const filteredOrders = orders.filter((o) => orderTab === "all" || o.status === orderTab);

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
          <img src="/pesanlagi-logo.png" alt="PesanLagi" className="w-9 h-9 rounded-xl object-contain shrink-0" />
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
              {storeLogo ? (
                <img src={storeLogo} className="w-11 h-11 rounded-xl object-cover ring-2 ring-white" alt={storeName} />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center ring-2 ring-white">
                  <span className="text-white font-bold text-lg">{storeName.charAt(0).toUpperCase()}</span>
                </div>
              )}
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
                {proDaysLeft !== null
                  ? `Berakhir dalam ${proDaysLeft} hari. Perpanjang untuk fitur premium.`
                  : "Member Pro aktif."}
              </p>
              <button
                onClick={() => showToast("Halaman pembayaran segera hadir")}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
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
              <img src="/pesanlagi-logo.png" alt="PesanLagi" className="w-8 h-8 rounded-lg object-contain" />
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Pesan<span className="text-amber-500">Lagi</span>
              </span>
            </div>
          </div>
          <button onClick={() => showToast("Tidak ada notifikasi baru")} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm relative">
            <Bell className="w-[18px] h-[18px] text-slate-600" />
            {newOrderCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />}
          </button>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between mb-7">
          <div>
            <h2 className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h2>
            <h1 className="text-2xl font-extrabold text-slate-900">{PAGE_TITLES[activePage]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("menu")} className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:border-amber-300 transition-colors">
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline text-slate-400">Cari menu, pesanan...</span>
            </button>
            <button onClick={() => showToast("Tidak ada notifikasi baru")} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-amber-300 transition-colors relative">
              <Bell className="w-[18px] h-[18px]" />
              {newOrderCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />}
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
                    Selamat Datang, {storeName}
                  </h1>
                  <p className="mt-1.5 text-sm text-amber-50/90">
                    {storeOpen
                      ? "Toko Anda sedang aktif. Kelola menu dan raih lebih banyak pelanggan hari ini."
                      : "Toko Anda sedang tutup. Buka toko untuk mulai menerima pesanan."}
                  </p>
                </div>
                <button
                  onClick={() => navigate("menu")}
                  className={`${styles.ctaBtn} shrink-0 px-5 py-3 rounded-xl bg-white text-amber-700 font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:shadow-2xl`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>Kelola Menu</span>
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
                    <span>Salin Link</span>
                  </button>
                  <button
                    onClick={() => window.open(`/menu/${storeSlug}`, "_blank")}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-amber-300 hover:bg-amber-50/50 transition-all"
                  >
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
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                  {menuCount}<span className="text-base text-slate-400 font-bold ml-1">Menu</span>
                </p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Total Menu Makanan</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><Store className="w-5 h-5 text-green-600" /></div>
                  <div
                    className={`${styles.toggle} ${storeOpen ? styles.toggleOn : ""} ${togglingStore ? "opacity-50 pointer-events-none" : ""}`}
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
                <p className="text-[10px] text-purple-600 font-semibold mt-1">{catCount} Kategori</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><CalendarClock className="w-5 h-5 text-orange-600" /></div>
                  {isPro ? <Crown className="w-4 h-4 text-amber-500" /> : <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">FREE</span>}
                </div>
                {isPro ? (
                  <>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">{proDaysLeft ?? 0}<span className="text-base text-slate-400 font-bold ml-1">Hari</span></p>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">Masa Aktif Pro</p>
                    <p className="text-[10px] text-orange-600 font-semibold mt-1">{user?.pro_expiry_date ? new Date(user.pro_expiry_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}</p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-extrabold text-slate-900 leading-tight">Paket Free</p>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">Tingkatkan ke Pro</p>
                    <p className="text-[10px] text-orange-600 font-semibold mt-1">Untuk fitur lengkap</p>
                  </>
                )}
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
                <div className={`${styles.quickTile} bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm`} onClick={() => {
                  navigator.clipboard?.writeText(`pesanlagi.web.id/menu/${storeSlug}`).catch(() => {});
                  showToast("Link menu dibagikan ke WhatsApp!");
                }}>
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
                <button onClick={() => { navigate("menu"); setTimeout(() => setModalOpen(true), 300); }} className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>
              {filteredMenus.length > 0 ? (
                <>
                  <div className="divide-y divide-slate-100">
                    {filteredMenus.slice(0, 4).map((m, i) => (
                      <div key={m.id ?? i} className={`${styles.menuRow} flex items-center gap-3 sm:gap-4 p-4 sm:p-5`}>
                        {m.image_url ? (
                          <img src={m.image_url} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover" alt={m.name} />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <UtensilsCrossed className="w-6 h-6 text-amber-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{m.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-bold text-amber-600">Rp {m.price.toLocaleString("id-ID")}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[11px] text-slate-500">{m.category_name ?? "Makanan"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`hidden sm:inline text-xs font-semibold ${m.is_available !== false ? "text-green-600" : "text-red-500"}`}>
                            {m.is_available !== false ? "Tersedia" : "Habis"}
                          </span>
                          <div
                            className={`${styles.toggle} ${m.is_available !== false ? styles.toggleAmber : ""}`}
                            onClick={() => handleToggleStock(m.id)}
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
                </>
              ) : (
                <div className="p-12 text-center">
                  <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Belum Ada Menu</h3>
                  <p className="text-xs text-slate-500 mb-4">Tambahkan menu makanan pertama Anda</p>
                  <button
                    onClick={() => { navigate("menu"); setTimeout(() => setModalOpen(true), 300); }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Tambah Menu
                  </button>
                </div>
              )}
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
                  className={`${styles.chip} ${activeCategoryChip === c.id ? styles.chipActive : ""} group relative`}
                  onClick={() => setActiveCategoryChip(c.id)}
                >
                  {c.label}
                  {c.catId && (
                    <span
                      className="ml-1 text-red-300 hover:text-red-600 transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.catId); }}
                    >
                      {deletingCatId === c.catId ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" /> : <Trash2 className="w-3 h-3 inline-block" />}
                    </span>
                  )}
                </button>
              ))}
              {showAddCat ? (
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="text"
                    placeholder="Nama kategori..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") { setShowAddCat(false); setNewCatName(""); } }}
                    className="px-2 py-1 border border-amber-300 rounded-lg text-xs outline-none w-32"
                    autoFocus
                  />
                  <button onClick={handleAddCategory} disabled={addingCat} className="px-2 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50">
                    {addingCat ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3" />}
                  </button>
                  <button onClick={() => { setShowAddCat(false); setNewCatName(""); }} className="px-2 py-1 bg-slate-200 rounded-lg text-xs hover:bg-slate-300 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCat(true)}
                  className={`${styles.chip} flex items-center gap-1 text-amber-600 shrink-0`}
                >
                  <Plus className="w-3 h-3" /> Tambah
                </button>
              )}
            </div>
            {filteredMenus.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 stagger">
                {filteredMenus.map((m, i) => {
                  const catColor = m.category_name === "Minuman" ? "text-blue-700" : m.category_name === "Snack" ? "text-purple-700" : "text-amber-700";
                  const avail = m.is_available !== false;
                  return (
                    <div key={m.id ?? i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm card-hover">
                      <div className="relative">
                        {m.image_url ? (
                          <img src={m.image_url} className="w-full h-32 sm:h-40 object-cover" alt={m.name} />
                        ) : (
                          <div className="w-full h-32 sm:h-40 bg-amber-50 flex items-center justify-center">
                            <UtensilsCrossed className="w-10 h-10 text-amber-300" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700">
                          <span className={catColor}>{m.category_name ?? "Makanan"}</span>
                        </span>
                        <button
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors disabled:opacity-50"
                          onClick={() => handleDeleteMenu(m.id)}
                          disabled={deletingId === m.id}
                        >
                          {deletingId === m.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {!avail && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-bold" style={{ right: 40 }}>Habis</span>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-sm font-bold text-slate-900 truncate">{m.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{m.description || "Tanpa deskripsi"}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-extrabold text-amber-600">Rp {m.price.toLocaleString("id-ID")}</span>
                          <div
                            className={`${styles.toggle} ${avail ? styles.toggleAmber : ""}`}
                            onClick={() => handleToggleStock(m.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center">
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">Belum Ada Menu</h3>
                <p className="text-xs text-slate-500 mb-4">Tambahkan menu makanan pertama Anda</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Tambah Menu
                </button>
              </div>
            )}
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
              {/* Left: Live Preview */}
              <div className="lg:col-span-2">
                <div className="sticky top-8">
                  <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Live Preview</h3>
                  <div
                    ref={qrExportRef}
                    style={getQrTemplateStyle()}
                    className={`relative w-full aspect-[105/148] flex flex-col items-center justify-center p-6 sm:p-8 ${getQrTemplateClass()}`}
                  >
                    {/* Watermark for Free — horizontal at bottom */}
                    {!isPro && (
                      <div className="absolute bottom-2.5 left-0 right-0 flex justify-center pointer-events-none z-10">
                        <span className="text-[10px] font-semibold tracking-wide" style={{ color: qrDisplayText + "55" }}>
                          Dibuat dengan PesanLagi.com
                        </span>
                      </div>
                    )}

                    <div className="w-14 h-14 rounded-2xl bg-white p-0.5 shadow-md mb-3 z-0">
                      {storeLogo ? (
                        <img src={storeLogo} crossOrigin="anonymous" className="w-full h-full rounded-2xl object-cover" alt="Logo" />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 flex items-center justify-center p-2">
                          <img src="/pesanlagi-logo.png" alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                    <h3 style={{ color: qrDisplayText }} className="text-lg font-extrabold mb-0.5 text-center z-0">
                      {storeName}
                    </h3>
                    <p style={{ color: qrDisplayText + "AA" }} className="text-[11px] mb-4 z-0">Scan untuk lihat menu & pesan</p>
                    <div className={`p-2.5 bg-white shadow-sm z-0 ${qrActiveTemplate === "dark_gold" || qrActiveTemplate === "pesanlagi" ? "border-[3px] rounded-xl" : "rounded-xl"}`} style={qrActiveTemplate === "dark_gold" || qrActiveTemplate === "pesanlagi" ? { borderColor: qrDisplayAccent } : {}}>
                      <svg viewBox="0 0 25 25" className="w-36 h-36" shapeRendering="crispEdges" dangerouslySetInnerHTML={{ __html: generateQRSVG(qrFgColor) }} />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-3 mb-1 z-0">
                      <Globe className="w-3 h-3" style={{ color: qrDisplayText + "88" }} />
                      <span className="text-[11px] font-medium" style={{ color: qrDisplayText }}>pesanlagi.web.id/menu/{storeSlug}</span>
                    </div>
                    <div style={{ color: qrDisplayAccent }} className="text-[11px] font-bold z-0 flex items-center gap-1">
                      <Sparkles size={11} /> Powered by PesanLagi
                    </div>
                  </div>
                  {/* Export Buttons */}
                  <div className="mt-5 space-y-2">
                    <button onClick={() => handleQrExport("PDF")} disabled={exportingQr} className={`${styles.ctaBtn} w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50`}>
                      {exportingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Unduh PDF (A6)
                    </button>
                    <button onClick={() => handleQrExport("PNG")} disabled={exportingQr} className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:border-amber-300 transition-colors disabled:opacity-50">
                      {exportingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Unduh PNG HD
                    </button>
                  </div>
                </div>
              </div>
              {/* Right: Controls */}
              <div className="lg:col-span-3">
                {/* Tabs */}
                <div className="flex space-x-1 bg-white border border-slate-100 p-1 rounded-xl mb-5 shadow-sm">
                  {[{ id: "ai", icon: Sparkles, label: "AI Theme" }, { id: "presets", icon: Palette, label: "Presets" }, { id: "custom", icon: Palette, label: "Custom" }, { id: "templates", icon: ImageIcon, label: "Templates" }].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleQrTabClick(tab.id)}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        qrActiveTab === tab.id ? "bg-amber-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <tab.icon size={14} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {!isPro && (tab.id === "ai" || tab.id === "custom") && <Lock size={10} className="text-amber-300" />}
                    </button>
                  ))}
                </div>
                {/* Tab Content */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm min-h-[380px] relative">
                  {/* AI Theme Tab */}
                  {qrActiveTab === "ai" && (
                    <div className="relative">
                      {!isPro && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                            <Lock className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">Khusus Pengguna Pro</p>
                          <button onClick={() => setQrShowUpgrade(true)} className="mt-2 text-xs font-bold text-amber-600">Upgrade Sekarang</button>
                        </div>
                      )}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl"></div>
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">AI QR Theme Generator</h3>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">Deskripsikan konsep warungmu, AI akan otomatis memilih warna & template terbaik.</p>
                          <textarea
                            className="w-full p-3 rounded-xl border border-amber-200 bg-white/80 focus:ring-2 focus:ring-amber-400 outline-none text-sm text-slate-700 resize-none"
                            rows={3}
                            placeholder="Contoh: Kafe matcha kekinian nuansa kayu estetik"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                          />
                          <button
                            onClick={handleAiGenerate}
                            disabled={isAiGenerating}
                            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform disabled:opacity-50"
                          >
                            {isAiGenerating ? (
                              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Generasi Desain...</span></>
                            ) : (
                              <><Wand2 className="w-4 h-4" /><span>Generasi Desain & Warna via AI</span></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Presets Tab */}
                  {qrActiveTab === "presets" && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-3">Pilih Preset Warna Standar</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {QR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => handleQrApplyPreset(preset)}
                            className="p-4 border border-slate-200 rounded-xl hover:border-amber-400 transition-all text-left"
                          >
                            <div className="flex gap-1 mb-3">
                              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.bg, border: "1px solid #E2E8F0" }}></div>
                              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.qr }}></div>
                              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.acc }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Custom Color Tab */}
                  {qrActiveTab === "custom" && (
                    <div className="relative">
                      {!isPro && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                            <Lock className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">Khusus Pengguna Pro</p>
                          <button onClick={() => setQrShowUpgrade(true)} className="mt-2 text-xs font-bold text-amber-600">Upgrade Sekarang</button>
                        </div>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 mb-4">Custom Color Pickers</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Warna Background Card</label>
                          <input type="color" value={qrBgColor} onChange={(e) => setQrBgColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Warna Modul QR</label>
                          <input type="color" value={qrFgColor} onChange={(e) => setQrFgColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Warna Teks / Judul</label>
                          <input type="color" value={qrTextColor} onChange={(e) => setQrTextColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700">Warna Aksen</label>
                          <input type="color" value={qrAccentColor} onChange={(e) => setQrAccentColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Templates Tab */}
                  {qrActiveTab === "templates" && (
                    <div className="relative">
                      <input type="file" accept="image/*" ref={qrFileInputRef} onChange={handleQrImageUpload} className="hidden" />
                      <h3 className="text-sm font-bold text-slate-900 mb-1">Background & Frame Templates</h3>
                      <p className="text-xs text-slate-400 mb-4">Pilih tampilan kartu QR Anda</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setQrActiveTemplate("pesanlagi")} className={`p-4 border rounded-xl text-left transition-all ${qrActiveTemplate === "pesanlagi" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="w-full h-12 bg-[#14100B] rounded mb-2" style={{ backgroundImage: "linear-gradient(135deg, rgba(249,115,22,0.3) 0%, transparent 100%)" }}></div>
                          <span className="text-xs font-bold text-slate-900">PesanLagi</span>
                          <span className="text-[9px] text-amber-500 font-bold ml-1">Default</span>
                        </button>
                        <button onClick={() => setQrActiveTemplate("minimalist")} className={`p-4 border rounded-xl text-left transition-all ${qrActiveTemplate === "minimalist" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="w-full h-12 bg-white border border-slate-200 rounded mb-2"></div>
                          <span className="text-xs font-bold text-slate-900">Modern Minimalist</span>
                        </button>
                        <button onClick={() => setQrActiveTemplate("rustic")} className={`p-4 border rounded-xl text-left transition-all ${qrActiveTemplate === "rustic" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="w-full h-12 bg-[#FDFBF7] rounded mb-2" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.1) 0px, rgba(139, 90, 43, 0.1) 2px, transparent 2px, transparent 6px)" }}></div>
                          <span className="text-xs font-bold text-slate-900">Rustic Wood Grain</span>
                        </button>
                        <button onClick={() => setQrActiveTemplate("dark_gold")} className={`p-4 border rounded-xl text-left transition-all ${qrActiveTemplate === "dark_gold" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="w-full h-12 bg-slate-900 rounded mb-2 border-2 border-amber-500"></div>
                          <span className="text-xs font-bold text-slate-900">Dark Gold Elegance</span>
                        </button>
                        <button onClick={() => setQrActiveTemplate("acrylic")} className={`p-4 border rounded-xl text-left transition-all ${qrActiveTemplate === "acrylic" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                          <div className="w-full h-12 bg-white rounded mb-2 border-t-4 border-b-4 border-slate-100"></div>
                          <span className="text-xs font-bold text-slate-900">Acrylic Table Stand</span>
                        </button>
                        {/* Upload Custom — PRO only */}
                        <button
                          onClick={() => {
                            if (!isPro) { setQrShowUpgrade(true); return; }
                            qrFileInputRef.current?.click();
                          }}
                          className={`p-4 border rounded-xl text-left transition-all relative ${qrActiveTemplate === "custom" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          <div className="w-full h-12 bg-slate-100 rounded mb-2 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">Upload Custom</span>
                          {!isPro && (
                            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Lock size={8} /> PRO
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
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
            {orders.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">Belum Ada Pesanan Masuk</h3>
                <p className="text-xs text-slate-500">Pesanan pelanggan akan muncul di sini secara real-time</p>
              </div>
            )}
          </section>
        )}

        {/* ============ REPORTS PAGE ============ */}
        {activePage === "reports" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">Laporan Penjualan</h2>
              <p className="text-sm text-slate-500 mt-0.5">Analisis performa warung Anda</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 stagger">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><UtensilsCrossed className="w-5 h-5 text-amber-600" /></div>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{menuCount}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Total Menu</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><LayoutGrid className="w-5 h-5 text-green-600" /></div>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{catCount}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Total Kategori</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-blue-600" /></div>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{orders.length}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Total Pesanan</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{orders.filter(o => o.status === "done").length}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Pesanan Selesai</p>
              </div>
            </div>

            {/* Chart placeholder */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm mb-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pendapatan</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Data akan muncul setelah ada transaksi</p>
                </div>
              </div>
              <div className="h-48 flex items-center justify-center text-center">
                <div>
                  <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Belum ada data penjualan</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Top selling placeholder */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Menu Terlaris</h3>
                {menus.length > 0 ? (
                  <div className="space-y-3">
                    {menus
                      .sort((a, b) => (b.sold_count ?? 0) - (a.sold_count ?? 0))
                      .slice(0, 5)
                      .map((item, idx) => {
                        const maxSold = Math.max(...menus.map(m => m.sold_count ?? 0), 1);
                        const pct = ((item.sold_count ?? 0) / maxSold) * 100;
                        return (
                          <div key={item.id ?? idx} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                            <span className="text-sm font-medium text-slate-700 w-28 truncate">{item.name}</span>
                            <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                              <div
                                className={`${styles.barFill} h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg flex items-center justify-end pr-2`}
                                style={{ width: barAnimated ? `${pct}%` : "0%" }}
                              >
                                <span className="text-[10px] font-bold text-white">{item.sold_count ?? 0}x</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-xs text-slate-400">Belum ada data</p>
                  </div>
                )}
              </div>
              {/* Recent transactions placeholder */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Transaksi Terbaru</h3>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order, idx) => {
                      const isLast = idx === Math.min(orders.length, 5) - 1;
                      return (
                        <div key={order.id} className={`flex items-center gap-3 ${!isLast ? "pb-3 border-b border-slate-100" : ""}`}>
                          <div className={`w-8 h-8 rounded-lg ${order.status === "done" ? "bg-green-100" : "bg-amber-100"} flex items-center justify-center`}>
                            {order.status === "done" ? <Check className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{order.id}</p>
                            <p className="text-[11px] text-slate-500">{order.customer} • {order.time}</p>
                          </div>
                          <span className={`text-sm font-bold ${order.status === "done" ? "text-green-600" : "text-amber-600"}`}>{order.total}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-xs text-slate-400">Belum ada transaksi</p>
                  </div>
                )}
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
            <div className="bg-white border border-slate-100 rounded-2xl p-12 shadow-sm text-center">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">Belum Ada Ulasan</h3>
              <p className="text-xs text-slate-500">Ulasan dari pelanggan akan muncul di sini setelah mereka memberikan penilaian</p>
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
                    {storeLogo ? (
                      <img src={storeLogo} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-100" alt="Store logo" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center ring-2 ring-amber-100">
                        <span className="text-white font-bold text-2xl">{storeName.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <button
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 ${uploadingLogo ? "opacity-50" : ""}`}
                      onClick={() => { if (!uploadingLogo) logoInputRef.current?.click(); }}
                    >
                      {uploadingLogo ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3 h-3" />}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLogo(file);
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Logo Warung</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">JPG/PNG, otomatis dikompres (maks 5MB)</p>
                    <button onClick={() => { if (!uploadingLogo) logoInputRef.current?.click(); }} disabled={uploadingLogo} className="text-xs font-semibold text-amber-600 mt-1 hover:underline disabled:opacity-50">
                      {uploadingLogo ? "Mengunggah..." : "Ganti Logo"}
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Warung</label>
                    <input type="text" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} className={styles.settingsInput} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori</label>
                    <select value={settingsCategory} onChange={(e) => setSettingsCategory(e.target.value)} className={styles.settingsInput}>
                      <option>Makanan Indonesia</option>
                      <option>Makanan Cepat Saji</option>
                      <option>Minuman</option>
                      <option>Snack</option>
                      <option>Bakso & Soto</option>
                      <option>Nasi & Mie</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Warung</label>
                    <textarea rows={2} value={settingsDesc} onChange={(e) => setSettingsDesc(e.target.value)} className={`${styles.settingsInput} resize-none`} />
                  </div>
                </div>
              </div>

              {/* Slug */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center"><Globe className="w-4 h-4 text-violet-600" /></div>
                  <h3 className="text-sm font-bold text-slate-900">URL Toko</h3>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Slug Toko</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 shrink-0">pesanlagi.web.id/menu/</span>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={settingsSlug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={styles.settingsInput}
                        placeholder="nama-toko-anda"
                      />
                      {slugAvailable === true && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-green-600">Tersedia</span>
                      )}
                      {slugAvailable === false && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-red-500">Sudah dipakai</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">URL: pesanlagi.web.id/menu/<span className="font-semibold text-slate-600">{settingsSlug || "..."}</span></p>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><Palette className="w-4 h-4 text-purple-600" /></div>
                    <h3 className="text-sm font-bold text-slate-900">Tampilan Menu Digital</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (settingsSlug) window.open(`/menu/${settingsSlug}`, "_blank");
                      else showToast("Slug toko belum diatur");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Warna Tema</label>
                <div className="flex gap-2.5 mb-4">
                  {([
                    { id: "amber", gradient: "from-amber-400 to-amber-600", ring: "ring-amber-500", bg: "bg-amber-100", text: "text-amber-600" },
                    { id: "green", gradient: "from-green-400 to-green-600", ring: "ring-green-500", bg: "bg-green-100", text: "text-green-600" },
                    { id: "blue", gradient: "from-blue-400 to-blue-600", ring: "ring-blue-500", bg: "bg-blue-100", text: "text-blue-600" },
                    { id: "red", gradient: "from-red-400 to-red-600", ring: "ring-red-500", bg: "bg-red-100", text: "text-red-600" },
                    { id: "dark", gradient: "from-slate-700 to-slate-900", ring: "ring-slate-500", bg: "bg-slate-200", text: "text-slate-600" },
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setMenuTheme(t.id)}
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} ${menuTheme === t.id ? `ring-2 ${t.ring} ring-offset-2` : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"} transition-all`}
                    />
                  ))}
                </div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Template Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setMenuLayout("grid")} className={`p-2 border-2 ${menuLayout === "grid" ? "border-amber-500 bg-amber-50/50" : "border-slate-200 hover:border-amber-300"} rounded-xl transition-colors`}>
                    <div className={`w-full h-12 rounded-lg flex items-center justify-center ${menuLayout === "grid" ? "bg-amber-100" : "bg-slate-100"}`}><LayoutGrid className={`w-5 h-5 ${menuLayout === "grid" ? "text-amber-600" : "text-slate-500"}`} /></div>
                    <p className="text-[10px] font-bold text-slate-900 mt-1">Grid</p>
                  </button>
                  <button onClick={() => setMenuLayout("list")} className={`p-2 border-2 ${menuLayout === "list" ? "border-green-500 bg-green-50/50" : "border-slate-200 hover:border-green-300"} rounded-xl transition-colors`}>
                    <div className={`w-full h-12 rounded-lg flex items-center justify-center ${menuLayout === "list" ? "bg-green-100" : "bg-slate-100"}`}><List className={`w-5 h-5 ${menuLayout === "list" ? "text-green-600" : "text-slate-500"}`} /></div>
                    <p className="text-[10px] font-bold text-slate-900 mt-1">List</p>
                  </button>
                  <button onClick={() => setMenuLayout("category")} className={`p-2 border-2 ${menuLayout === "category" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"} rounded-xl transition-colors`}>
                    <div className={`w-full h-12 rounded-lg flex items-center justify-center ${menuLayout === "category" ? "bg-blue-100" : "bg-slate-100"}`}><Columns2 className={`w-5 h-5 ${menuLayout === "category" ? "text-blue-600" : "text-slate-500"}`} /></div>
                    <p className="text-[10px] font-bold text-slate-900 mt-1">Kategori</p>
                  </button>
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className={`${styles.ctaBtn} flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {savingSettings ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  onClick={handleCancelSettings}
                  className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-colors"
                >
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
                      <p className="text-[11px] text-slate-400 mt-0.5">JPG/PNG, otomatis dikompres (maks 5MB)</p>
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
                      {categories.length > 0
                        ? categories.map((c) => <option key={c.id ?? c.name} value={c.id}>{c.name}</option>)
                        : <><option value="">Tanpa Kategori</option></>
                      }
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
                  disabled={savingMenu}
                  className={`${styles.ctaBtn} flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  {savingMenu ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {savingMenu ? "Menyimpan..." : "Simpan Menu"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================== QR UPGRADE MODAL ==================== */}
      {qrShowUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl border border-amber-200">
            <button onClick={() => setQrShowUpgrade(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Lock className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Upgrade ke Pro</h3>
            <p className="text-slate-500 mt-2 text-sm">Fitur AI QR Designer dan Custom Background hanya tersedia untuk pengguna Pro.</p>
            <button onClick={() => setQrShowUpgrade(false)} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform">
              Upgrade Sekarang
            </button>
          </div>
        </div>
      )}

      {/* ==================== TOAST ==================== */}
      <div className={`${styles.toast} ${toast.show ? styles.toastShow : ""}`}>
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
