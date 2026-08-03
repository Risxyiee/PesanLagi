'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Phone,
  UtensilsCrossed,
  MessageCircle,
  Search,
  ChevronRight,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

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

const WARM_BG = '#FFF9F5';

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white shadow-sm">
      <div className="aspect-[4/3] rounded-t-2xl bg-stone-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded-lg bg-stone-200" />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-stone-100" />
          <div className="h-3 w-2/3 rounded bg-stone-100" />
        </div>
        <div className="h-5 w-1/4 rounded-lg bg-orange-100" />
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: WARM_BG,
        ['--menu-bg' as string]: WARM_BG,
      }}
    >
      <div className="mx-auto max-w-2xl">
        {/* Header skeleton */}
        <header className="px-5 pb-6 pt-10 sm:px-6 sm:pt-12">
          <div className="flex items-start gap-4">
            <div className="h-[72px] w-[72px] animate-pulse rounded-2xl bg-stone-300 shadow-sm" />
            <div className="min-w-0 flex-1 space-y-3 pt-1">
              <div className="h-7 w-56 animate-pulse rounded-lg bg-stone-300" />
              <div className="h-4 w-72 animate-pulse rounded bg-stone-200" />
              <div className="flex gap-2">
                <div className="h-7 w-36 animate-pulse rounded-full bg-stone-200" />
                <div className="h-7 w-32 animate-pulse rounded-full bg-stone-200" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="h-5 w-28 animate-pulse rounded bg-stone-200" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-stone-200" />
          </div>
        </header>

        {/* Category skeleton */}
        <div
          className="sticky top-0 z-20 px-5 pb-4 pt-3 sm:px-6"
          style={{
            backgroundColor: `${WARM_BG}DD`,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="scrollbar-hide -mx-5 flex gap-2.5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 animate-pulse rounded-full bg-stone-200"
              />
            ))}
          </div>
        </div>

        {/* Grid skeleton */}
        <main className="px-5 pb-28 pt-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated menu card                                                 */
/* ------------------------------------------------------------------ */
function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hasImage = item.image_url && item.image_url.trim() !== '';

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${(index % 6) * 80}ms` }}
    >
      <div className="group overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(249,115,22,0.10)]">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          {hasImage ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
              <UtensilsCrossed
                className="text-orange-200"
                size={44}
                strokeWidth={1.2}
              />
            </div>
          )}
          {/* Subtle bottom gradient overlay on image */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/[0.04] to-transparent" />
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-stone-800">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-stone-400">
              {item.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-base font-bold tracking-tight text-orange-500">
              Rp {formatPrice(item.price)}
            </p>
            {item.category_name && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-500">
                {item.category_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */
function EmptyState({ categoryName }: { categoryName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-50">
        <UtensilsCrossed
          className="text-orange-400"
          size={34}
          strokeWidth={1.3}
        />
      </div>
      <p className="text-base font-semibold text-stone-600">
        {categoryName
          ? `Belum ada menu di kategori "${categoryName}"`
          : 'Belum ada menu tersedia'}
      </p>
      <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-stone-400">
        Menu akan muncul di sini setelah ditambahkan oleh restoran
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error state                                                        */
/* ------------------------------------------------------------------ */
function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: WARM_BG }}
    >
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 shadow-sm">
          <AlertCircle className="text-red-400" size={38} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-extrabold text-stone-800">
          Oops!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          {message}
        </p>
        <p className="mt-1 text-sm text-stone-400">
          Pastikan link QR code yang Anda scan sudah benar.
        </p>
      </div>
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLButtonElement>(null);

  // Unwrap params promise
  useEffect(() => {
    params.then(({ slug: s }) => setSlug(s));
  }, [params]);

  // Fetch data
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

  // Dynamic page title
  useEffect(() => {
    if (data?.store?.name) {
      document.title = `${data.store.name} — Menu Digital | PesanLagi`;
    }
  }, [data?.store?.name]);

  // Scroll active pill into view
  useEffect(() => {
    if (activePillRef.current && categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const pill = activePillRef.current;
      const scrollLeft =
        pill.offsetLeft -
        container.offsetWidth / 2 +
        pill.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  // Filtered menus
  const filteredMenus = useCallback(() => {
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
          (m.description && m.description.toLowerCase().includes(q))
      );
    }
    return menus;
  }, [data, activeCategory, searchQuery]);

  const visibleMenus = filteredMenus();

  // ---- Loading ----
  if (loading) return <SkeletonPage />;

  // ---- Error ----
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="Data tidak tersedia" />;

  const { store, categories, menus } = data;
  const bgColor = store.bg_color || WARM_BG;
  const hasWhatsapp = store.whatsapp && store.whatsapp.trim() !== '';
  const whatsappLink = hasWhatsapp
    ? `https://wa.me/${store.whatsapp.replace(/^\+/, '')}?text=${encodeURIComponent(
        `Halo, saya ingin memesan dari ${store.name}`
      )}`
    : null;

  const activeCategoryName = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.name
    : undefined;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: bgColor,
        ['--menu-bg' as string]: bgColor,
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        {/* ===================== STORE HEADER ===================== */}
        <header className="px-5 pb-4 pt-10 sm:px-6 sm:pt-12">
          <div className="flex items-start gap-4">
            {/* Logo */}
            {store.logo_url && store.logo_url.trim() !== '' ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-[72px] w-[72px] shrink-0 rounded-2xl border-2 border-white/80 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border-2 border-white/80 bg-gradient-to-br from-orange-400 to-orange-600 text-[28px] font-extrabold text-white shadow-md">
                {store.name?.charAt(0)?.toUpperCase() || 'W'}
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-900">
                {store.name}
              </h1>
              {store.description && (
                <p className="mt-1 text-sm leading-relaxed text-stone-500">
                  {store.description}
                </p>
              )}
              {/* Info badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {store.address && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[12px] font-medium text-stone-500 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                    <MapPin size={12} className="shrink-0 text-orange-400" />
                    <span className="line-clamp-1 max-w-[180px]">{store.address}</span>
                  </span>
                )}
                {store.whatsapp && (
                  <a
                    href={`tel:+${store.whatsapp.replace(/^\+/, '')}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[12px] font-medium text-stone-500 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-colors hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Phone size={12} className="shrink-0 text-orange-400" />
                    <span>{store.whatsapp}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Menu count & search toggle */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-orange-400" />
              <p className="text-sm font-medium text-stone-500">
                <span className="font-bold text-stone-700">{menus.length}</span>{' '}
                menu tersedia
              </p>
            </div>
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) setSearchQuery('');
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                showSearch
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white text-stone-500 shadow-sm hover:text-orange-500'
              }`}
              aria-label="Cari menu"
            >
              {showSearch ? <X size={18} /> : <Search size={18} />}
            </button>
          </div>

          {/* Search bar */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showSearch
                ? 'mt-4 max-h-16 opacity-100'
                : 'mt-0 max-h-0 opacity-0'
            }`}
          >
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-stone-100">
              <Search size={17} className="shrink-0 text-stone-300" />
              <input
                type="text"
                placeholder="Cari menu favorit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-stone-700 outline-none placeholder:font-normal placeholder:text-stone-300"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="shrink-0 text-xs font-semibold text-orange-500 transition-colors hover:text-orange-600"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ===================== CATEGORY FILTER (sticky) ===================== */}
        {categories.length > 0 && (
          <div
            className="sticky top-0 z-20 px-5 pb-3.5 pt-3 sm:px-6"
            style={{
              backgroundColor: `${bgColor}DD`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <div
              ref={categoryScrollRef}
              className="scrollbar-hide -mx-5 flex gap-2.5 overflow-x-auto px-5 sm:-mx-6 sm:px-6"
            >
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                  activeCategory === null
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-white text-stone-500 shadow-sm ring-1 ring-stone-100 hover:bg-stone-50 hover:text-stone-700'
                }`}
                ref={activeCategory === null ? activePillRef : undefined}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === cat.id ? null : cat.id
                    )
                  }
                  className={`shrink-0 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-white text-stone-500 shadow-sm ring-1 ring-stone-100 hover:bg-stone-50 hover:text-stone-700'
                  }`}
                  ref={
                    activeCategory === cat.id ? activePillRef : undefined
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===================== MENU GRID ===================== */}
        <main className="flex-1 px-5 pb-28 pt-4 sm:px-6">
          {visibleMenus.length === 0 ? (
            <EmptyState categoryName={activeCategoryName} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleMenus.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </main>

        {/* ===================== FOOTER ===================== */}
        <footer className="pb-8 pt-4 text-center">
          <p className="text-[11px] font-semibold tracking-widest text-stone-300 uppercase">
            Powered by{' '}
            <span className="font-extrabold text-stone-400 tracking-wide">
              PesanLagi
            </span>
          </p>
        </footer>

        {/* ===================== FLOATING WHATSAPP BUTTON ===================== */}
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-4 bottom-5 z-30 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3.5 text-white shadow-xl shadow-green-500/25 transition-all duration-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-2xl hover:shadow-green-500/30 active:scale-[0.97]"
          >
            <MessageCircle size={20} className="shrink-0" fill="white" />
            <span className="text-[13px] font-bold leading-tight">
              Pesan via
              <br />
              WhatsApp
            </span>
            <ChevronRight
              size={16}
              className="ml-0.5 shrink-0 opacity-60"
            />
          </a>
        )}
      </div>
    </div>
  );
}