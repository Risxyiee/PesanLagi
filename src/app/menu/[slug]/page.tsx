'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Search,
  X,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  SearchX,
  Utensils,
  UtensilsCrossed,
  MessageCircle,
  Maximize2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import styles from './page.module.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  whatsapp: string;
  address: string;
  bg_color: string;
  qr_color: string;
  hours?: {
    menu_theme?: string;
    menu_layout?: string;
    open_time?: string;
    close_time?: string;
    days?: number[];
    [key: string]: any;
  };
}

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  category_name: string;
  is_available: boolean;
}

interface MenuData {
  store: Store;
  categories: Category[];
  menus: MenuItem[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID').format(price);

type CartItem = { name: string; price: number; qty: number };

/* ------------------------------------------------------------------ */
/*  Theme Configuration                                                */
/* ------------------------------------------------------------------ */
const THEME_MAP: Record<string, Record<string, string>> = {
  amber: {
    '--t-50': '#fffbeb', '--t-100': '#fef3c7', '--t-200': '#fde68a', '--t-300': '#fcd34d',
    '--t-400': '#fbbf24', '--t-500': '#f59e0b', '--t-600': '#d97706', '--t-700': '#b45309',
    '--t-800': '#92400e',
    '--t-rgb': '245, 158, 11',
    '--t-bg': 'linear-gradient(180deg, #fffbeb 0%, #fff7ed 30%, #fffbeb 60%, #fff7ed 100%)',
    '--t-blob-a': 'rgba(251, 191, 36, 0.5) 0%, rgba(245, 158, 11, 0.2) 40%, transparent 70%',
    '--t-blob-b': 'rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.1) 50%, transparent 70%',
    '--t-blob-c': 'rgba(252, 211, 77, 0.3) 0%, transparent 70%',
    '--t-sticky-bg': 'rgba(255, 251, 235, 0.85)',
    '--t-icon-fallback': 'text-amber-300', '--t-img-fallback': 'from-orange-50 via-amber-50 to-rose-50',
  },
  green: {
    '--t-50': '#f0fdf4', '--t-100': '#dcfce7', '--t-200': '#bbf7d0', '--t-300': '#86efac',
    '--t-400': '#4ade80', '--t-500': '#22c55e', '--t-600': '#16a34a', '--t-700': '#15803d',
    '--t-800': '#166534',
    '--t-rgb': '34, 197, 94',
    '--t-bg': 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 30%, #f0fdf4 60%, #ecfdf5 100%)',
    '--t-blob-a': 'rgba(74, 222, 128, 0.5) 0%, rgba(34, 197, 94, 0.2) 40%, transparent 70%',
    '--t-blob-b': 'rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 50%, transparent 70%',
    '--t-blob-c': 'rgba(134, 239, 172, 0.3) 0%, transparent 70%',
    '--t-sticky-bg': 'rgba(240, 253, 244, 0.85)',
    '--t-icon-fallback': 'text-green-300', '--t-img-fallback': 'from-green-50 via-emerald-50 to-teal-50',
  },
  blue: {
    '--t-50': '#eff6ff', '--t-100': '#dbeafe', '--t-200': '#bfdbfe', '--t-300': '#93c5fd',
    '--t-400': '#60a5fa', '--t-500': '#3b82f6', '--t-600': '#2563eb', '--t-700': '#1d4ed8',
    '--t-800': '#1e40af',
    '--t-rgb': '59, 130, 246',
    '--t-bg': 'linear-gradient(180deg, #eff6ff 0%, #eef2ff 30%, #eff6ff 60%, #eef2ff 100%)',
    '--t-blob-a': 'rgba(96, 165, 250, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%',
    '--t-blob-b': 'rgba(37, 99, 235, 0.25) 0%, rgba(29, 78, 216, 0.1) 50%, transparent 70%',
    '--t-blob-c': 'rgba(147, 197, 253, 0.3) 0%, transparent 70%',
    '--t-sticky-bg': 'rgba(239, 246, 255, 0.85)',
    '--t-icon-fallback': 'text-blue-300', '--t-img-fallback': 'from-blue-50 via-indigo-50 to-violet-50',
  },
  red: {
    '--t-50': '#fef2f2', '--t-100': '#fee2e2', '--t-200': '#fecaca', '--t-300': '#fca5a5',
    '--t-400': '#f87171', '--t-500': '#ef4444', '--t-600': '#dc2626', '--t-700': '#b91c1c',
    '--t-800': '#991b1b',
    '--t-rgb': '239, 68, 68',
    '--t-bg': 'linear-gradient(180deg, #fef2f2 0%, #fff1f2 30%, #fef2f2 60%, #fff1f2 100%)',
    '--t-blob-a': 'rgba(248, 113, 113, 0.5) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 70%',
    '--t-blob-b': 'rgba(220, 38, 38, 0.25) 0%, rgba(185, 28, 28, 0.1) 50%, transparent 70%',
    '--t-blob-c': 'rgba(252, 165, 165, 0.3) 0%, transparent 70%',
    '--t-sticky-bg': 'rgba(254, 242, 242, 0.85)',
    '--t-icon-fallback': 'text-red-300', '--t-img-fallback': 'from-red-50 via-rose-50 to-pink-50',
  },
  dark: {
    '--t-50': '#f8fafc', '--t-100': '#f1f5f9', '--t-200': '#e2e8f0', '--t-300': '#cbd5e1',
    '--t-400': '#94a3b8', '--t-500': '#64748b', '--t-600': '#475569', '--t-700': '#334155',
    '--t-800': '#1e293b',
    '--t-rgb': '100, 116, 139',
    '--t-bg': 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 30%, #f8fafc 60%, #f1f5f9 100%)',
    '--t-blob-a': 'rgba(148, 163, 184, 0.4) 0%, rgba(100, 116, 139, 0.2) 40%, transparent 70%',
    '--t-blob-b': 'rgba(71, 85, 105, 0.25) 0%, rgba(51, 65, 85, 0.1) 50%, transparent 70%',
    '--t-blob-c': 'rgba(203, 213, 225, 0.3) 0%, transparent 70%',
    '--t-sticky-bg': 'rgba(248, 250, 252, 0.85)',
    '--t-icon-fallback': 'text-slate-400', '--t-img-fallback': 'from-slate-50 via-gray-50 to-zinc-50',
  },
};

/* ------------------------------------------------------------------ */
/*  Skeleton Loader                                                    */
/* ------------------------------------------------------------------ */
function SkeletonPage() {
  return (
    <div className={styles.root}>
      <div className={styles.mobileFrame}>
        <div className={styles.bgNoise} />
        <div className={styles.contentLayer}>
          {/* Header skeleton */}
          <header className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse shrink-0 rounded-full bg-amber-200" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded-lg bg-amber-200" />
                <div className="h-3 w-56 animate-pulse rounded bg-amber-100" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-green-200" />
            </div>
            <div className="flex items-center gap-3 mt-2.5">
              <div className="h-3 w-24 animate-pulse rounded bg-amber-100" />
              <div className="h-3 w-28 animate-pulse rounded bg-amber-100" />
              <div className="h-3 w-10 animate-pulse rounded bg-amber-100" />
            </div>
          </header>
          {/* Search skeleton */}
          <div className="px-4 py-2.5">
            <div className="h-11 animate-pulse rounded-xl bg-amber-100" />
          </div>
          {/* Category chips skeleton */}
          <div className="flex items-center gap-2 px-4 pb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 animate-pulse rounded-full bg-amber-200"
              />
            ))}
          </div>
          {/* Menu cards skeleton */}
          <main className="px-4 py-4 pb-24 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white/80 p-3 flex gap-3"
              >
                <div className="h-24 w-24 shrink-0 rounded-xl bg-amber-100" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="h-4 w-32 rounded-lg bg-amber-100" />
                  <div className="h-3 w-full rounded bg-amber-50" />
                  <div className="h-3 w-2/3 rounded bg-amber-50" />
                  <div className="h-5 w-20 rounded-lg bg-amber-200 mt-auto" />
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error State                                                        */
/* ------------------------------------------------------------------ */
function ErrorState({ message }: { message: string }) {
  return (
    <div className={styles.root}>
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ backgroundColor: '#fffbeb' }}
      >
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 shadow-sm">
            <AlertCircle className="text-red-400" size={38} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Oops!</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {message}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Pastikan link QR code yang Anda scan sudah benar.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Qty Stepper component                                              */
/* ------------------------------------------------------------------ */
function QtyStepper({
  qty,
  onMinus,
  onPlus,
  wide,
  fullWidth,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
  wide?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`${
        styles.qtyStepper
      } ${wide ? styles.qtyStepperWide : ''} ${fullWidth ? styles.qtyStepperFull : ''}`}
    >
      <button onClick={onMinus} aria-label="Kurangi">
        <Minus
          size={wide ? 20 : 16}
          strokeWidth={2.5}
        />
      </button>
      <span>{qty}</span>
      <button onClick={onPlus} aria-label="Tambah">
        <Plus
          size={wide ? 20 : 16}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FadeUp wrapper (IntersectionObserver)                              */
/* ------------------------------------------------------------------ */
function FadeUp({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 60);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`${styles.fadeUp} ${visible ? styles.fadeUpIn : ''}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */
export default function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart: Record<string, CartItem> keyed by menu id
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  // Modals
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll
  const [scrolled, setScrolled] = useState(false);

  // Checkout form
  const [custName, setCustName] = useState('');
  const [orderType, setOrderType] = useState<'dinein' | 'takeaway'>('dinein');
  const [tableNum, setTableNum] = useState('');
  const [notes, setNotes] = useState('');

  // Refs
  const stickyRef = useRef<HTMLDivElement>(null);

  /* -- resolve params -- */
  useEffect(() => {
    params.then(({ slug: s }) => setSlug(s));
  }, [params]);

  /* -- fetch data -- */
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/public/menu/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Store tidak ditemukan');
        return res.json();
      })
      .then((json: MenuData) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Terjadi kesalahan');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* -- page title -- */
  useEffect(() => {
    if (data?.store?.name)
      document.title = `${data.store.name} — Menu Digital | PesanLagi`;
  }, [data?.store?.name]);

  /* -- scroll listener for sticky shadow -- */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* -- toast helper -- */
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 1800);
  }, []);

  /* -- cart helpers -- */
  const addToCart = useCallback(
    (menu: MenuItem) => {
      setCart((prev) => {
        const existing = prev[menu.id];
        if (existing) {
          return { ...prev, [menu.id]: { ...existing, qty: existing.qty + 1 } };
        }
        return {
          ...prev,
          [menu.id]: { name: menu.name, price: menu.price, qty: 1 },
        };
      });
      showToast(`${menu.name} ditambahkan`);
    },
    [showToast],
  );

  const removeFromCart = useCallback((menuId: string) => {
    setCart((prev) => {
      const existing = prev[menuId];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const next = { ...prev };
        delete next[menuId];
        return next;
      }
      return {
        ...prev,
        [menuId]: { ...existing, qty: existing.qty - 1 },
      };
    });
  }, []);

  const getCartCount = useCallback(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return Object.values(cart).reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
  }, [cart]);

  /* -- filtered menus -- */
  const visibleMenus = (() => {
    if (!data) return [];
    let menus = data.menus;
    if (activeCategory) {
      menus = menus.filter((m) => m.category_id === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      menus = menus.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)),
      );
    }
    return menus;
  })();

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  /* -- checkout -- */
  const sendToWhatsApp = useCallback(() => {
    if (!data) return;
    const name = custName.trim() || 'Tanpa Nama';
    const table = tableNum.trim();

    if (orderType === 'dinein' && !table) {
      showToast('Mohon isi nomor meja dulu');
      return;
    }

    let message = `*PESANAN BARU - ${data.store.name.toUpperCase()}*\n\n`;
    message += `*Nama Pemesan:* ${name}\n`;
    message += `*Tipe:* ${orderType === 'dinein' ? 'Makan di Tempat' : 'Bawa Pulang'}\n`;
    if (orderType === 'dinein') message += `*Nomor Meja:* ${table}\n`;
    if (notes.trim()) message += `*Catatan:* ${notes.trim()}\n`;
    message += `\n*Detail Pesanan:*\n`;

    let i = 1;
    for (const id in cart) {
      const item = cart[id];
      const sub = item.price * item.qty;
      message += `${i}. ${item.name} x${item.qty} - Rp ${formatPrice(sub)}\n`;
      i++;
    }

    const total = getCartTotal();
    message += `\n*Total Pembayaran: Rp ${formatPrice(total)}*\n\n`;
    message += `_Pesanan dibuat via Menu Digital PesanLagi_`;

    const wa = data.store.whatsapp?.replace(/^\+/, '') || '';
    const waUrl = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    setCart({});
    setShowCheckout(false);
    showToast('Pesanan dikirim ke WhatsApp warung!');
  }, [data, custName, orderType, tableNum, notes, cart, getCartTotal, showToast]);

  /* -- early returns -- */
  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="Data tidak tersedia" />;

  const { store, categories, menus } = data;

  /* -- theme & layout computation -- */
  const themeId = store.hours?.menu_theme || 'amber';
  const layoutMode = store.hours?.menu_layout || 'grid';
  const themeVars = THEME_MAP[themeId] || THEME_MAP.amber;

  const tw = (key: string) => ({
    ring: { amber: 'ring-amber-300', green: 'ring-green-300', blue: 'ring-blue-300', red: 'ring-red-300', dark: 'ring-slate-400' },
    gradFrom: { amber: 'from-amber-400', green: 'from-green-400', blue: 'from-blue-400', red: 'from-red-400', dark: 'from-slate-600' },
    gradTo: { amber: 'to-amber-600', green: 'to-green-600', blue: 'to-blue-600', red: 'to-red-600', dark: 'to-slate-800' },
    descColor: { amber: 'text-amber-700/80', green: 'text-green-700/80', blue: 'text-blue-700/80', red: 'text-red-700/80', dark: 'text-slate-600/80' },
    priceColor: { amber: 'text-amber-600', green: 'text-green-600', blue: 'text-blue-600', red: 'text-red-600', dark: 'text-slate-700' },
    iconFallback: { amber: 'text-amber-300', green: 'text-green-300', blue: 'text-blue-300', red: 'text-red-300', dark: 'text-slate-400' },
    imgFallback: { amber: 'from-orange-50 via-amber-50 to-rose-50', green: 'from-green-50 via-emerald-50 to-teal-50', blue: 'from-blue-50 via-indigo-50 to-violet-50', red: 'from-red-50 via-rose-50 to-pink-50', dark: 'from-slate-50 via-gray-50 to-zinc-50' },
    countColor: { amber: 'text-amber-600', green: 'text-green-600', blue: 'text-blue-600', red: 'text-red-600', dark: 'text-slate-700' },
    footerBrand: { amber: 'text-amber-700', green: 'text-green-700', blue: 'text-blue-700', red: 'text-red-700', dark: 'text-slate-700' },
    footerSub: { amber: 'text-amber-600/40', green: 'text-green-600/40', blue: 'text-blue-600/40', red: 'text-red-600/40', dark: 'text-slate-500/40' },
    borderFt: { amber: 'border-amber-200/50', green: 'border-green-200/50', blue: 'border-blue-200/50', red: 'border-red-200/50', dark: 'border-slate-200/50' },
    starFill: { amber: 'fill-amber-400 text-amber-400', green: 'fill-green-400 text-green-400', blue: 'fill-blue-400 text-blue-400', red: 'fill-red-400 text-red-400', dark: 'fill-slate-400 text-slate-400' },
  }[key]?.[themeId] || '');

  /* -- category grouping for category layout -- */
  const menusByCategory = categories
    .map(cat => ({ ...cat, items: visibleMenus.filter(m => m.category_id === cat.id) }))
    .filter(group => group.items.length > 0);

  const themeRgb = themeVars['--t-rgb'] || '245, 158, 11';
  const themeShadowStyle = { boxShadow: `0 10px 15px -3px rgba(${themeRgb}, 0.3)` };

  /* -- render a single menu card (grid layout) -- */
  const renderMenuCard = (item: MenuItem, idx: number) => {
    const inCart = cart[item.id];
    const isUnavailable = !item.is_available;
    const hasImage = item.image_url && item.image_url.trim() !== '';

    return (
      <FadeUp key={item.id} index={idx}>
        <div
          className={`${styles.menuCard} rounded-2xl p-3 flex gap-3 ${isUnavailable ? 'opacity-90' : ''}`}
        >
          <div
            className="flex-1 min-w-0 flex gap-3 cursor-pointer"
            onClick={() =>
              !isUnavailable && setDetailItem(item)
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isUnavailable)
                setDetailItem(item);
            }}
          >
            <div className="relative shrink-0">
              {hasImage ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className={`w-24 h-24 rounded-xl object-cover ${isUnavailable ? styles.photoHabis : ''}`}
                  loading="lazy"
                />
              ) : (
                <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${tw('imgFallback')} flex items-center justify-center`}>
                  <Utensils
                    className={tw('iconFallback')}
                    size={28}
                    strokeWidth={1.2}
                  />
                </div>
              )}
              {isUnavailable && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-extrabold tracking-wide">
                    HABIS
                  </span>
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h3
                  className={`text-sm font-bold leading-tight ${isUnavailable ? 'text-slate-400' : 'text-slate-900'}`}
                >
                  {item.name}
                </h3>
                <p
                  className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${isUnavailable ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {item.description}
                </p>
              </div>
              {isUnavailable ? (
                <span className="text-base font-extrabold text-slate-400 line-through decoration-red-400 decoration-2">
                  Rp {formatPrice(item.price)}
                </span>
              ) : (
                <span className={`text-base font-extrabold ${tw('priceColor')}`}>
                  Rp {formatPrice(item.price)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-end shrink-0">
            {isUnavailable ? (
              <span className="text-[11px] font-bold text-slate-400 italic">
                Habis
              </span>
            ) : inCart ? (
              <QtyStepper
                qty={inCart.qty}
                onMinus={() => removeFromCart(item.id)}
                onPlus={() => addToCart(item)}
              />
            ) : (
              <button
                className={styles.addBtn}
                onClick={() => addToCart(item)}
                aria-label={`Tambah ${item.name}`}
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </FadeUp>
    );
  };

  /* -- render a compact list item (list layout) -- */
  const renderListItem = (item: MenuItem, idx: number) => {
    const inCart = cart[item.id];
    const isUnavailable = !item.is_available;

    return (
      <FadeUp key={item.id} index={idx}>
        <div
          className={`${styles.menuCard} rounded-xl px-3 py-2.5 flex items-center gap-3 ${isUnavailable ? 'opacity-90' : ''}`}
        >
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() =>
              !isUnavailable && setDetailItem(item)
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isUnavailable)
                setDetailItem(item);
            }}
          >
            <h3
              className={`text-sm font-bold leading-tight ${isUnavailable ? 'text-slate-400' : 'text-slate-900'}`}
            >
              {item.name}
            </h3>
            {item.description && (
              <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-1 ${isUnavailable ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.description}
              </p>
            )}
          </div>
          <span className={`text-sm font-extrabold shrink-0 ${isUnavailable ? 'text-slate-400 line-through' : tw('priceColor')}`}>
            Rp {formatPrice(item.price)}
          </span>
          <div className="shrink-0">
            {isUnavailable ? (
              <span className="text-[10px] font-bold text-slate-400 italic">
                Habis
              </span>
            ) : inCart ? (
              <QtyStepper
                qty={inCart.qty}
                onMinus={() => removeFromCart(item.id)}
                onPlus={() => addToCart(item)}
              />
            ) : (
              <button
                className={styles.addBtn}
                onClick={() => addToCart(item)}
                aria-label={`Tambah ${item.name}`}
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </FadeUp>
    );
  };

  return (
    <div className={styles.root} style={themeVars as React.CSSProperties}>
      <div className={styles.mobileFrame}>
        {/* Background Blobs */}
        <div className={`${styles.bgBlob} ${styles.blobA}`} />
        <div className={`${styles.bgBlob} ${styles.blobB}`} />
        <div className={`${styles.bgBlob} ${styles.blobC}`} />
        <div className={styles.bgNoise} />

        <div className={styles.contentLayer}>
          {/* ===================== STICKY HEADER ===================== */}
          <div
            ref={stickyRef}
            className={`${styles.stickyWrap} ${scrolled ? styles.stickyWrapScrolled : ''}`}
          >
            <header className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {store.logo_url && store.logo_url.trim() !== '' ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className={`w-12 h-12 rounded-full object-cover ring-2 ${tw('ring')} shadow-md`}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tw('gradFrom')} ${tw('gradTo')} ring-2 ${tw('ring')} shadow-md flex items-center justify-center text-white text-lg font-extrabold`}>
                      {store.name?.charAt(0)?.toUpperCase() || 'W'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                    {store.name}
                  </h1>
                  {store.description && (
                    <p className={`text-[11px] ${tw('descColor')} truncate font-medium`}>
                      {store.description}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 border border-green-200">
                  <span
                    className={`w-2 h-2 bg-green-500 rounded-full ${styles.bukaDot}`}
                  />
                  <span className="text-[11px] font-bold text-green-700">
                    Buka
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {store.hours?.open_time || '08.00'} - {store.hours?.close_time || '22.00'}
                </span>
                {store.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[140px]">
                      {store.address}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className={`w-3 h-3 ${tw('starFill')}`} /> 4.9
                </span>
              </div>
            </header>

            {/* Search */}
            <div className="px-4 py-2.5">
              <div
                className={`${styles.searchWrap} flex items-center gap-2 px-3.5 py-2.5 rounded-xl`}
              >
                <Search
                  className={`${styles.searchIcon} w-[18px] h-[18px] text-slate-400 transition-colors`}
                />
                <input
                  type="text"
                  placeholder="Cari es teh, bakso..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Chips */}
            {categories.length > 0 && (
              <div className={styles.catScroll}>
                <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`${styles.catChip} ${activeCategory === null ? styles.catChipActive : ''}`}
                  >
                    Semua
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setActiveCategory(
                          activeCategory === cat.id ? null : cat.id,
                        )
                      }
                      className={`${styles.catChip} ${activeCategory === cat.id ? styles.catChipActive : ''}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===================== MENU LIST ===================== */}
          <main className="px-4 py-4 pb-24">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Pilih Menu Favoritmu
              </h2>
              <span className={`text-[11px] ${tw('descColor')} font-semibold`}>
                {visibleMenus.length} menu tersedia
              </span>
            </div>

            <div className="space-y-3">
              {visibleMenus.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center mx-auto mb-3">
                    <SearchX
                      className="w-8 h-8"
                      style={{ color: 'var(--t-500, #f59e0b)' }}
                    />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Menu tidak ditemukan
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Coba kata kunci lain atau pilih kategori berbeda
                  </p>
                </div>
              ) : layoutMode === 'category' && activeCategory === null ? (
                /* Category-grouped layout */
                menusByCategory.map((group) => (
                  <div key={group.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-1 h-5 rounded-full bg-gradient-to-b ${tw('gradFrom')} ${tw('gradTo')}`}
                      />
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        {group.name}
                      </h3>
                      <span className={`text-[10px] ${tw('descColor')} font-semibold`}>
                        {group.items.length} item
                      </span>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((item, idx) =>
                        layoutMode === 'list'
                          ? renderListItem(item, idx)
                          : renderMenuCard(item, idx),
                      )}
                    </div>
                  </div>
                ))
              ) : layoutMode === 'list' ? (
                /* List (compact) layout */
                visibleMenus.map((item, idx) => renderListItem(item, idx))
              ) : (
                /* Default grid layout */
                visibleMenus.map((item, idx) => renderMenuCard(item, idx))
              )}
            </div>

            {/* Footer */}
            <footer className={`mt-8 pt-6 pb-4 border-t ${tw('borderFt')} text-center`}>
              <div className="flex items-center justify-center gap-1.5">
                <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${tw('gradFrom')} ${tw('gradTo')} flex items-center justify-center`}>
                  <Utensils
                    className="w-3 h-3 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Ditenagai oleh{' '}
                  <span className={`font-bold ${tw('footerBrand')}`}>PesanLagi</span>{' '}
                  • Bikin Menu QR Gratis
                </span>
              </div>
              <p className={`text-[10px] ${tw('footerSub')} mt-1`}>
                © 2025 PesanLagi.id
              </p>
            </footer>
          </main>
        </div>

        {/* ===================== FLOATING CART BAR ===================== */}
        <div
          className={`${styles.cartBar} ${cartCount > 0 ? styles.cartBarShow : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--t-500, #f59e0b)' }}
              >
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white ${tw('countColor')} text-[11px] font-extrabold flex items-center justify-center`}>
                {cartCount}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">
                {cartCount} item • Keranjang
              </p>
              <p className="text-sm font-extrabold text-white">
                Rp {formatPrice(cartTotal)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (cartCount === 0) {
                showToast('Keranjang masih kosong, yuk pilih menu dulu!');
                return;
              }
              setShowCheckout(true);
            }}
            className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${tw('gradFrom')} ${tw('gradTo')} text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform`}
          >
            Pesan Sekarang <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===================== DETAIL MODAL ===================== */}
      <div
        className={`${styles.modalBackdrop} ${detailItem ? styles.modalBackdropShow : ''}`}
        onClick={() => setDetailItem(null)}
      />
      <div
        className={`${styles.modalSheet} ${detailItem ? styles.modalSheetShow : ''}`}
      >
        {detailItem && (
          <>
            <div className="relative -mx-5 -mt-5 mb-4">
              {detailItem.image_url && detailItem.image_url.trim() !== '' ? (
                <img
                  src={detailItem.image_url}
                  alt={detailItem.name}
                  className="w-full h-72 object-cover cursor-pointer"
                  onClick={() => setLightboxSrc(detailItem.image_url)}
                />
              ) : (
                <div className={`w-full h-72 bg-gradient-to-br ${tw('imgFallback')} flex items-center justify-center`}>
                  <Utensils
                    className={tw('iconFallback')}
                    size={48}
                    strokeWidth={1.2}
                  />
                </div>
              )}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-white text-[10px] font-semibold flex items-center gap-1 pointer-events-none">
                <Maximize2 className="w-3 h-3" /> Tap untuk perbesar
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md text-slate-600"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-lg font-extrabold text-slate-900 flex-1">
                {detailItem.name}
              </h3>
              <p className={`text-base font-extrabold ${tw('priceColor')} whitespace-nowrap`}>
                Rp {formatPrice(detailItem.price)}
              </p>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {detailItem.description}
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100">
              {cart[detailItem.id] ? (
                <QtyStepper
                  qty={cart[detailItem.id].qty}
                  onMinus={() => removeFromCart(detailItem.id)}
                  onPlus={() => addToCart(detailItem)}
                  wide
                  fullWidth
                />
              ) : (
                <button
                  onClick={() => addToCart(detailItem)}
                  className={`w-full py-3 rounded-xl bg-gradient-to-r ${tw('gradFrom')} ${tw('gradTo')} text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform`}
                  style={themeShadowStyle}
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Tambah ke Keranjang
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ===================== CHECKOUT MODAL ===================== */}
      <div
        className={`${styles.modalBackdrop} ${showCheckout ? styles.modalBackdropShow : ''}`}
        onClick={() => setShowCheckout(false)}
      />
      <div
        className={`${styles.modalSheet} ${showCheckout ? styles.modalSheetShow : ''}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Detail Pesanan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapi data untuk konfirmasi via WhatsApp
            </p>
          </div>
          <button
            onClick={() => setShowCheckout(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Pemesan
            </label>
            <input
              type="text"
              placeholder="Masukkan nama Anda"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className={styles.checkoutInput}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipe Pesanan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType('dinein')}
                className={`${styles.optionBtn} ${orderType === 'dinein' ? styles.optionBtnActive : ''}`}
              >
                <UtensilsCrossed className="w-4 h-4" /> Makan di Tempat
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`${styles.optionBtn} ${orderType === 'takeaway' ? styles.optionBtnActive : ''}`}
              >
                <ShoppingBag className="w-4 h-4" /> Bawa Pulang
              </button>
            </div>
          </div>
          <div
            className={`${styles.fieldCollapse} ${orderType !== 'dinein' ? styles.fieldCollapseHidden : ''}`}
            style={{ marginTop: 0 }}
          >
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nomor Meja
            </label>
            <input
              type="number"
              placeholder="Contoh: 5"
              value={tableNum}
              onChange={(e) => setTableNum(e.target.value)}
              className={styles.checkoutInput}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pedasnya sedang saja"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.checkoutInput}
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold text-slate-700 mb-2">
            Rangkuman Pesanan
          </p>
          <div className="space-y-1.5 mb-3">
            {Object.entries(cart).map(([id, item]) => (
              <div
                key={id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-slate-600 truncate flex-1 pr-2">
                  {item.name}{' '}
                  <span className="text-slate-400">x{item.qty}</span>
                </span>
                <span className="font-semibold text-slate-900">
                  Rp {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              Total Pembayaran
            </span>
            <span className={`text-base font-extrabold ${tw('priceColor')}`}>
              Rp {formatPrice(cartTotal)}
            </span>
          </div>
        </div>

        <button
          onClick={sendToWhatsApp}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
          Kirim Pesanan via WhatsApp
        </button>
      </div>

      {/* ===================== LIGHTBOX ===================== */}
      <div
        className={`${styles.lightbox} ${lightboxSrc ? styles.lightboxShow : ''}`}
        onClick={() => setLightboxSrc(null)}
      >
        <button
          className={styles.lightboxClose}
          aria-label="Tutup"
          onClick={() => setLightboxSrc(null)}
        >
          <X className="w-6 h-6" />
        </button>
        {lightboxSrc && (
          <img
            src={lightboxSrc}
            alt="Foto Menu"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* ===================== TOAST ===================== */}
      <div
        className={`${styles.toast} ${toastMsg ? styles.toastShow : ''}`}
      >
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
