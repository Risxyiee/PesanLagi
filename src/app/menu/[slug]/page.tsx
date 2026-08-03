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

const FALLBACK_BG = '#FFF7ED';

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-2 shadow-sm">
      <div className="aspect-[4/3] rounded-xl bg-neutral-200" />
      <div className="mt-3 space-y-2 px-1 pb-1">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-3 w-full rounded bg-neutral-100" />
        <div className="h-3 w-1/2 rounded bg-neutral-100" />
        <div className="mt-2 h-5 w-1/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div style={{ backgroundColor: FALLBACK_BG }} className="min-h-screen">
      {/* Header skeleton */}
      <div className="px-5 pb-6 pt-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-neutral-300" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-300" />
            <div className="h-4 w-64 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      </div>
      {/* Category skeleton */}
      <div className="sticky top-0 z-20 bg-[var(--menu-bg,#FFF7ED)]/80 px-5 pb-3 pt-2 backdrop-blur-md">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-neutral-300"
            />
          ))}
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 px-5 pb-24 pt-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
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
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
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
          : 'translate-y-6 opacity-0'
      }`}
      style={{ transitionDelay: `${(index % 6) * 80}ms` }}
    >
      <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.03] transition-shadow duration-200 hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {hasImage ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
              <UtensilsCrossed
                className="text-orange-300/60"
                size={40}
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="text-[15px] font-semibold leading-snug text-neutral-800">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-neutral-400">
              {item.description}
            </p>
          )}
          <p className="mt-2.5 text-[15px] font-bold text-orange-600">
            Rp {formatPrice(item.price)}
          </p>
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
        <UtensilsCrossed className="text-orange-300" size={32} strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium text-neutral-500">
        {categoryName
          ? `Belum ada menu di kategori "${categoryName}"`
          : 'Belum ada menu tersedia'}
      </p>
      <p className="mt-1 text-sm text-neutral-400">
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="text-red-400" size={36} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold text-neutral-800">Oops!</h1>
        <p className="mt-2 text-sm text-neutral-500">{message}</p>
        <p className="mt-1 text-sm text-neutral-400">
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
  const bgColor = store.bg_color || FALLBACK_BG;
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
      <div className="mx-auto flex min-h-screen max-w-lg flex-col">
        {/* STORE HEADER */}
        <header className="px-5 pb-5 pt-8 sm:pt-10">
          <div className="flex items-start gap-4">
            {/* Logo */}
            {store.logo_url && store.logo_url.trim() !== '' ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-bold text-white shadow-sm">
                {store.name?.charAt(0)?.toUpperCase() || 'W'}
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-extrabold leading-tight text-neutral-900 sm:text-2xl">
                {store.name}
              </h1>
              {store.description && (
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  {store.description}
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-3">
                {store.address && (
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <MapPin size={13} className="shrink-0" />
                    <span className="line-clamp-1">{store.address}</span>
                  </span>
                )}
                {store.whatsapp && (
                  <a
                    href={`tel:+${store.whatsapp.replace(/^\+/, '')}`}
                    className="flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-orange-500"
                  >
                    <Phone size={13} className="shrink-0" />
                    <span>{store.whatsapp}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Menu count & search toggle */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-400">
              <span className="text-neutral-700">{menus.length}</span> menu
              tersedia
            </p>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-neutral-500 shadow-sm ring-1 ring-black/[0.04] transition-colors hover:bg-white hover:text-orange-500"
              aria-label="Cari menu"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="mt-3">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/[0.04]">
                <Search size={16} className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari menu favorit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-300"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-medium text-orange-500"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* CATEGORY FILTER (sticky) */}
        {categories.length > 0 && (
          <div
            className="sticky top-0 z-20 px-5 pb-3 pt-2"
            style={{
              backgroundColor: `${bgColor}CC`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div
              ref={categoryScrollRef}
              className="scrollbar-hide -mx-5 flex gap-2 overflow-x-auto px-5"
            >
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === null
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'bg-white text-neutral-600 shadow-sm ring-1 ring-black/[0.04] hover:bg-neutral-50'
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
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'bg-white text-neutral-600 shadow-sm ring-1 ring-black/[0.04] hover:bg-neutral-50'
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

        {/* MENU GRID */}
        <main className="flex-1 px-5 pb-28 pt-4">
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

        {/* FOOTER */}
        <footer className="pb-6 pt-4 text-center">
          <p className="text-[11px] font-medium tracking-wide text-neutral-300">
            Powered by{' '}
            <span className="font-bold text-neutral-400">PesanLagi</span>
          </p>
        </footer>

        {/* FLOATING WHATSAPP BUTTON */}
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-4 bottom-5 z-30 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-3.5 text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/40 active:scale-[0.97]"
          >
            <MessageCircle size={20} className="shrink-0" fill="white" />
            <span className="text-sm font-semibold leading-tight">
              Pesan via
              <br />
              WhatsApp
            </span>
            <ChevronRight
              size={16}
              className="ml-0.5 shrink-0 opacity-70"
            />
          </a>
        )}
      </div>
    </div>
  );
}