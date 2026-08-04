"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Settings, UtensilsCrossed, QrCode, Receipt, LogOut,
  Plus, Search, Pencil, Trash2, X, Upload, Loader2, Check,
  Store, Globe, Phone, MapPin, Clock, Menu, Download,
  Palette, Hash, Link2, ChevronRight, ToggleLeft, ToggleRight,
} from "lucide-react";

type Page = "overview" | "settings" | "menus" | "designer" | "billing";
interface User { id: string; email: string; is_pro: boolean; }
interface Store {
  id: string; name: string; slug: string; logo_url: string | null;
  bg_color: string; qr_color: string; description: string; whatsapp: string;
  address: string; maps_url: string; hours: Record<string, string>;
}
interface Cat { id: string; name: string; }
interface MI {
  id: string; name: string; description: string | null; price: number;
  category_id: string | null; category_name: string | null;
  image_url: string | null; is_available: boolean;
}

const DAYS = [
  { k: "mon", l: "Senin" }, { k: "tue", l: "Selasa" },
  { k: "wed", l: "Rabu" }, { k: "thu", l: "Kamis" },
  { k: "fri", l: "Jumat" }, { k: "sat", l: "Sabtu" }, { k: "sun", l: "Minggu" },
];
const PRESETS = [
  { n: "Kopi Susu", bg: "#E8D0B3", qr: "#4E342E" },
  { n: "Sage Segar", bg: "#B2AC88", qr: "#1A1A1A" },
  { n: "Midnight Orange", bg: "#1A1A1A", qr: "#FF6D00" },
  { n: "Neon Cyber", bg: "#0F0F0F", qr: "#00F0FF" },
  { n: "Warm Pastel", bg: "#FFE4E6", qr: "#DB2777" },
  { n: "Minimalis Putih", bg: "#FFFFFF", qr: "#000000" },
];
const NAV: { p: Page; l: string; i: typeof LayoutDashboard }[] = [
  { p: "overview", l: "Ringkasan", i: LayoutDashboard },
  { p: "settings", l: "Profil Warung", i: Settings },
  { p: "menus", l: "Kelola Menu", i: UtensilsCrossed },
  { p: "designer", l: "QR Designer", i: QrCode },
  { p: "billing", l: "Tagihan", i: Receipt },
];
const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function Skel({ c = "" }: { c?: string }) { return <div className={"animate-pulse rounded-lg bg-gray-200 " + c} />; }

function DashSkel() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 p-5 space-y-4 hidden md:block">
        <Skel c="h-8 w-32" />{[1,2,3,4,5].map(i => <Skel key={i} c="h-10 w-full mt-2" />)}
      </div>
      <div className="flex-1 p-6 space-y-6">
        <Skel c="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skel key={i} c="h-28" />)}</div>
        <Skel c="h-60" />
      </div>
    </div>
  );
}

/*  StatCard helper                                                 */
/* ================================================================ */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    purple: "bg-purple-50 text-purple-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] || colors.orange}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
export default function DashboardApp() {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [menus, setMenus] = useState<MI[]>([]);
  const [pg, setPg] = useState<Page>("overview");
  const [gLoad, setGLoad] = useState(true);
  const [toast, setToast] = useState<{ m: string; id: number } | null>(null);
  const tRef = useRef<ReturnType<typeof setTimeout>>();
  const [mFilt, setMFilt] = useState("all");
  const [mQ, setMQ] = useState("");
  const [mmO, setMmO] = useState(false);
  const [em, setEm] = useState<MI | null>(null);
  const [mf, setMf] = useState({ nm: "", ds: "", pr: "", ci: "", img: "", av: true });
  const [mfL, setMfL] = useState(false);
  const mIR = useRef<HTMLInputElement>(null);
  const [dO, setDO] = useState(false);
  const [dM, setDM] = useState<MI | null>(null);
  const [dL, setDL] = useState(false);
  const [cO, setCO] = useState(false);
  const [nC, setNC] = useState("");
  const [cL, setCL] = useState(false);
  const [sf, setSf] = useState({ nm: "", sl: "", lg: "", ds: "", wa: "", ad: "", mp: "", hr: {} as Record<string, string>, bg: "#FFFFFF", qr: "#000000" });
  const [slT, setSlT] = useState(false);
  const [slE, setSlE] = useState(false);
  const [sfL, setSfL] = useState(false);
  const lgR = useRef<HTMLInputElement>(null);
  const [qB, setQB] = useState("#FFFFFF");
  const [qF, setQF] = useState("#000000");
  const [tN, setTN] = useState("1");
  const [iC, setIC] = useState(false);
  const [qSv, setQSv] = useState(false);
  const [qDl, setQDl] = useState(false);
  const qcR = useRef<HTMLDivElement>(null);
  const qrR = useRef<HTMLDivElement>(null);
  const [sO, setSO] = useState(false);

  const showToast = useCallback((m: string) => {
    if (tRef.current) clearTimeout(tRef.current);
    setToast({ m, id: Date.now() });
    tRef.current = setTimeout(() => setToast(null), 3000);
  }, []);
  const ldS = useCallback(async () => { try { const r = await fetch("/api/store"); if (!r.ok) return null; return await r.json(); } catch { return null; } }, []);
  const ldC = useCallback(async () => { try { const r = await fetch("/api/categories"); if (!r.ok) return []; return await r.json(); } catch { return []; } }, []);
  const ldM = useCallback(async () => { try { const r = await fetch("/api/menus"); if (!r.ok) return []; return await r.json(); } catch { return []; } }, []);

  const up = useCallback(async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("bucket", bucket);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (!r.ok) { const d = await r.json(); showToast(d.error || "Gagal mengunggah."); return null; }
      const d = await r.json(); return d.url;
    } catch { showToast("Gagal mengunggah."); return null; }
  }, [showToast]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me");
        if (!r.ok) { window.location.hash = "#login"; return; }
        const d = await r.json();
        if (!d.user) { window.location.hash = "#login"; return; }
        setUser(d.user);
        const [s, c, m] = await Promise.all([ldS(), ldC(), ldM()]);
        if (s) {
          setStore(s);
          const h: Record<string, string> = {};
          DAYS.forEach(dd => { h[dd.k + "_open"] = (s.hours as any)?.[dd.k + "_open"] || ""; h[dd.k + "_close"] = (s.hours as any)?.[dd.k + "_close"] || ""; });
          setSf({ nm: s.name || "", sl: s.slug || "", lg: s.logo_url || "", ds: s.description || "", wa: s.whatsapp || "", ad: s.address || "", mp: s.maps_url || "", hr: h, bg: s.bg_color || "#FFFFFF", qr: s.qr_color || "#000000" });
          setQB(s.bg_color || "#FFFFFF"); setQF(s.qr_color || "#000000");
        }
        setCats(c || []); setMenus(m || []);
      } catch { window.location.hash = "#login"; return; }
      setGLoad(false);
    })();
  }, [ldS, ldC, ldM]);

  useEffect(() => {
    if (pg !== "designer" || !store || !qrR.current) return;
    const el = qrR.current; el.innerHTML = "";
    const url = window.location.origin + "/menu/" + (store.slug || "warung");
    const QC = (window as any).QRCode;
    if (typeof QC !== "undefined") new QC(el, { text: url, width: 140, height: 140, colorDark: qF || "#000", colorLight: "#FFFFFF", correctLevel: QC.CorrectLevel.H });
  }, [pg, store, qF]);

  const go = (p: Page) => { setPg(p); setSO(false); };

  const addCat = async () => {
    if (!nC.trim()) return; setCL(true);
    try {
      const r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: nC.trim() }) });
      if (r.ok) { setCats(await ldC()); setNC(""); setCO(false); showToast("Kategori baru ditambahkan!"); }
      else { const d = await r.json(); showToast(d.error || "Gagal menambah kategori."); }
    } catch { showToast("Gagal menambah kategori."); }
    setCL(false);
  };
  const delCat = async (id: string) => {
    try {
      const r = await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (r.ok) { setCats(await ldC()); if (mFilt === id) setMFilt("all"); showToast("Kategori berhasil dihapus."); }
      else { const d = await r.json(); showToast(d.error || "Gagal menghapus kategori."); }
    } catch { showToast("Gagal menghapus kategori."); }
  };

  const openAdd = () => { setEm(null); setMf({ nm: "", ds: "", pr: "", ci: "", img: "", av: true }); setMmO(true); };
  const openEdit = (m: MI) => { setEm(m); setMf({ nm: m.name, ds: m.description || "", pr: String(m.price), ci: m.category_id || "", img: m.image_url || "", av: m.is_available }); setMmO(true); };
  const saveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mf.nm.trim()) { showToast("Nama menu wajib diisi."); return; }
    setMfL(true);
    try {
      const b: any = { name: mf.nm.trim(), description: mf.ds.trim() || null, price: Number(mf.pr.replace(/[^0-9]/g, "")) || 0, category_id: mf.ci || null, image_url: mf.img || null, is_available: mf.av };
      if (em) b.id = em.id;
      const r = await fetch("/api/menus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
      if (r.ok) { setMenus(await ldM()); setMmO(false); showToast(em ? "Menu berhasil diperbarui!" : "Menu baru berhasil ditambahkan!"); }
      else { const d = await r.json(); showToast(d.error || "Gagal menyimpan menu."); }
    } catch { showToast("Gagal menyimpan menu."); }
    setMfL(false);
  };
  const confirmDel = async () => {
    if (!dM) return; setDL(true);
    try {
      const r = await fetch("/api/menus", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: dM.id }) });
      if (r.ok) { setMenus(await ldM()); setDO(false); setDM(null); showToast("Menu berhasil dihapus."); }
      else { const d = await r.json(); showToast(d.error || "Gagal menghapus menu."); }
    } catch { showToast("Gagal menghapus menu."); }
    setDL(false);
  };

  const onLogoUp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const loc = URL.createObjectURL(f); setSf(p => ({ ...p, lg: loc }));
    const u = await up(f, "logos"); if (u) { setSf(p => ({ ...p, lg: u })); showToast("Logo berhasil diunggah!"); }
    e.target.value = "";
  };
  const onMImgUp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const loc = URL.createObjectURL(f); setMf(p => ({ ...p, img: loc }));
    const u = await up(f, "menu-images"); if (u) { setMf(p => ({ ...p, img: u })); showToast("Foto berhasil diunggah!"); }
    e.target.value = "";
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSfL(true);
    try {
      const slug = sf.sl.trim();
      if (slug) {
        const cr = await fetch("/api/store/check-slug?slug=" + encodeURIComponent(slug));
        if (cr.ok) { const cd = await cr.json(); if (cd.exists && cd.id !== store?.id) { setSlE(true); showToast("Slug sudah digunakan. Pilih slug lain."); setSfL(false); return; } }
      }
      setSlE(false);
      const b: any = { name: sf.nm, slug, logo_url: sf.lg || null, description: sf.ds, whatsapp: sf.wa, address: sf.ad, maps_url: sf.mp, hours: sf.hr, bg_color: sf.bg, qr_color: sf.qr };
      const r = await fetch("/api/store", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
      if (r.ok) { const s = await r.json(); setStore(s); setQB(s.bg_color || "#FFFFFF"); setQF(s.qr_color || "#000000"); showToast("Profil warung berhasil disimpan!"); }
      else { const d = await r.json(); showToast(d.error || "Gagal menyimpan."); }
    } catch { showToast("Gagal menyimpan."); }
    setSfL(false);
  };

  const applyPre = (p: { n: string; bg: string; qr: string }) => { setQB(p.bg); setQF(p.qr); setIC(false); };
  const saveDesign = async () => {
    if (user && !user.is_pro && iC) { showToast("Warna kustom hanya untuk pengguna Pro."); return; }
    setQSv(true);
    try { await fetch("/api/store", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bg_color: qB, qr_color: qF }) }); showToast("Desain kartu berhasil disimpan!"); } catch { showToast("Gagal menyimpan desain."); }
    setQSv(false);
  };
  const dlQR = async () => {
    if (user && !user.is_pro && iC) { showToast("Warna kustom hanya untuk pengguna Pro."); return; }
    setQDl(true); showToast("Membuat gambar QR...");
    const card = qcR.current; if (!card) { showToast("Gagal."); setQDl(false); return; }
    try {
      const h2c = (window as any).html2canvas;
      if (typeof h2c === "function") {
        const canvas = await h2c(card, { scale: 3, useCORS: true, backgroundColor: null });
        const a = document.createElement("a"); a.download = "qr-" + (store?.slug || "menu") + "-" + (tN || "1") + ".png"; a.href = canvas.toDataURL("image/png"); a.click(); showToast("QR berhasil diunduh!");
      } else {
        const cv = card.querySelector("canvas") as HTMLCanvasElement;
        if (cv) { const a = document.createElement("a"); a.download = "qr-" + (store?.slug || "menu") + ".png"; a.href = cv.toDataURL("image/png"); a.click(); showToast("QR berhasil diunduh!"); }
        else showToast("Gagal. Coba reload.");
      }
    } catch { showToast("Gagal membuat gambar QR."); }
    setQDl(false);
  };

  const logout = () => { fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {}); window.location.hash = "#login"; };

  const fMenus = menus.filter(m => {
    const cm = mFilt === "all" || m.category_id === mFilt;
    const sm = !mQ || m.name.toLowerCase().includes(mQ.toLowerCase()) || (m.description || "").toLowerCase().includes(mQ.toLowerCase());
    return cm && sm;
  });


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{fontFamily:"Plus Jakarta Sans,sans-serif"}}>
      {toast && (
        <div className="fixed top-4 right-4 z-[100]">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400 shrink-0" />{toast.m}
          </div>
        </div>
      )}
      {sO && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSO(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${sO ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center"><span className="text-white font-extrabold text-sm">P</span></div>
          <div><h1 className="font-bold text-gray-900 text-base leading-tight">PesanLagi</h1><p className="text-[11px] text-gray-400">Dashboard Penjual</p></div>
          <button className="ml-auto md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400" onClick={() => setSO(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(n => { const I = n.i; const a = pg === n.p; return (
            <button key={n.p} onClick={() => go(n.p)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${a ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>
              <I className="w-[18px] h-[18px]" />{n.l}
            </button>);
          })}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><span className="text-orange-600 font-bold text-xs">{user?.email?.charAt(0).toUpperCase() || "U"}</span></div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-700 truncate">{store?.name || user?.email?.split("@")[0]}</p><p className="text-[11px] text-gray-400 truncate">{user?.email}</p></div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"><LogOut className="w-[18px] h-[18px]" />Keluar</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSO(true)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center"><span className="text-white font-extrabold text-xs">P</span></div><span className="font-bold text-gray-900 text-sm">PesanLagi</span></div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
            {pg === "overview" && <PgOverview />}
            {pg === "settings" && <PgSettings />}
            {pg === "menus" && <PgMenus />}
            {pg === "designer" && <PgDesigner />}
            {pg === "billing" && <PgBilling />}
          </div>
        </div>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="flex items-center justify-around h-16">
            {NAV.map(n => { const I = n.i; const a = pg === n.p; return (
              <button key={n.p} onClick={() => go(n.p)} className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${a ? "text-orange-500" : "text-gray-400"}`}>
                <I className="w-5 h-5" /><span className="text-[10px] font-medium">{n.l}</span>
              </button>);
            })}
          </div>
        </nav>
      </main>

      {mmO && <ModalMenu />}
      {dO && <ModalDelete />}
      {cO && <ModalCat />}
    </div>
  );

  /* ================================================================ */
  /*  PAGE: Overview                                                   */
  /* ================================================================ */
  function PgOverview() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Selamat datang kembali, <span className="text-orange-500">{store?.name || user?.email?.split("@")[0]}</span></h2>
          <p className="text-gray-500 mt-1 text-sm">Kelola menu dan warung kamu dengan mudah.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<UtensilsCrossed className="w-5 h-5" />} label="Total Menu" value={String(menus.length)} color="orange" />
          <StatCard icon={<LayoutDashboard className="w-5 h-5" />} label="Kategori" value={String(cats.length)} color="blue" />
          <StatCard icon={<QrCode className="w-5 h-5" />} label="Paket" value={user?.is_pro ? "Pro" : "Gratis"} color="green" />
          <StatCard icon={<Store className="w-5 h-5" />} label="Slug" value={store?.slug || "-"} color="purple" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => go("menus")} className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-md transition-all text-left">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><Plus className="w-5 h-5 text-orange-500" /></div>
            <div><p className="text-sm font-semibold text-gray-800">Tambah Menu</p><p className="text-xs text-gray-400">Buat menu baru</p></div>
          </button>
          <button onClick={() => go("designer")} className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-md transition-all text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><QrCode className="w-5 h-5 text-blue-500" /></div>
            <div><p className="text-sm font-semibold text-gray-800">QR Designer</p><p className="text-xs text-gray-400">Buat kartu QR</p></div>
          </button>
          <button onClick={() => go("settings")} className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-md transition-all text-left">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><Settings className="w-5 h-5 text-green-500" /></div>
            <div><p className="text-sm font-semibold text-gray-800">Pengaturan</p><p className="text-xs text-gray-400">Edit profil warung</p></div>
          </button>
          {store?.slug && (
            <a href={`/menu/${store.slug}`} target="_blank" rel="noopener" className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Link2 className="w-5 h-5 text-purple-500" /></div>
              <div><p className="text-sm font-semibold text-gray-800">Lihat Menu</p><p className="text-xs text-gray-400">Preview publik</p></div>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
            </a>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Menu Terbaru</h3>
          {menus.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Belum ada menu. Tambahkan menu pertama!</p>
          ) : (
            <div className="space-y-3">
              {menus.slice(0, 3).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <img src={m.image_url || "https://placehold.co/80x80/f3f4f6/9ca3af?text=" + encodeURIComponent(m.name.charAt(0))} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt={m.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                    <p className="text-xs text-gray-400">{rp(m.price)}</p>
                  </div>
                  <span className={`text-xs font-bold ${i === 0 ? "text-orange-500" : "text-gray-300"}`}>#{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  PAGE: Settings                                                   */
  /* ================================================================ */
  function PgSettings() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Profil Warung</h2>
        <form onSubmit={saveSettings} className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img src={sf.lg || "https://placehold.co/80x80/f97316/fff?text=W"} className="w-20 h-20 rounded-2xl object-cover bg-orange-50" alt="Logo" />
              <button type="button" onClick={() => lgR.current?.click()} className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Upload className="w-5 h-5" />
              </button>
              <input ref={lgR} type="file" accept="image/*" onChange={onLogoUp} className="hidden" />
            </div>
            <div><p className="font-medium text-gray-800">Logo Toko</p><p className="text-xs text-gray-400">Klik gambar untuk mengganti</p></div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko *</label>
              <input value={sf.nm} onChange={e => { setSf(p => ({ ...p, nm: e.target.value })); if (!slT) setSf(p => ({ ...p, sl: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })); }} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="Warung Saya" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 whitespace-nowrap">/menu/</span>
                <input value={sf.sl} onChange={e => { setSlT(true); setSf(p => ({ ...p, sl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })); setSlE(false); }} className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${slE ? "border-red-400" : "border-gray-300 focus:border-orange-500"}`} />
              </div>
              {slE && <p className="text-xs text-red-500 mt-1">Slug sudah digunakan.</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <textarea value={sf.ds} onChange={e => setSf(p => ({ ...p, ds: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none" placeholder="Deskripsi singkat warung kamu..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <input value={sf.wa} onChange={e => setSf(p => ({ ...p, wa: e.target.value }))} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="6281234567890" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input value={sf.ad} onChange={e => setSf(p => ({ ...p, ad: e.target.value }))} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="Jl. Contoh No. 123" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Google Maps</label>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <input value={sf.mp} onChange={e => setSf(p => ({ ...p, mp: e.target.value }))} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="https://maps.google.com/..." />
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Jam Operasional</h4>
            <div className="space-y-2">
              {DAYS.map(d => (
                <div key={d.k} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20 shrink-0">{d.l}</span>
                  <input type="time" value={sf.hr[d.k + "_open"] || ""} onChange={e => setSf(p => ({ ...p, hr: { ...p.hr, [d.k + "_open"]: e.target.value } }))} className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                  <span className="text-gray-400 text-sm">-</span>
                  <input type="time" value={sf.hr[d.k + "_close"] || ""} onChange={e => setSf(p => ({ ...p, hr: { ...p.hr, [d.k + "_close"]: e.target.value } }))} className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={sfL} className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {sfL && <Loader2 className="w-4 h-4 animate-spin" />}
              {sfL ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ================================================================ */
  /*  PAGE: Menus                                                      */
  /* ================================================================ */
  function PgMenus() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Kelola Menu</h2>
          <button onClick={openAdd} className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />Tambah Menu
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={mQ} onChange={e => setMQ(e.target.value)} placeholder="Cari menu..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white" />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <button onClick={() => setMFilt("all")} className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all ${mFilt === "all" ? "bg-orange-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>Semua</button>
          {cats.map(c => (
            <div key={c.id} className="flex items-center gap-1 shrink-0">
              <button onClick={() => setMFilt(c.id)} className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${mFilt === c.id ? "bg-orange-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>{c.name}</button>
              <button onClick={() => delCat(c.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Hapus kategori"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => setCO(true)} className="shrink-0 px-4 py-2 text-sm font-medium rounded-full border-2 border-dashed border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-all">+ Kategori</button>
        </div>

        {/* Grid */}
        {fMenus.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h4 className="font-bold text-gray-400 mb-1">Menu tidak ditemukan</h4>
            <p className="text-sm text-gray-300">Coba kata kunci lain atau tambah menu baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fMenus.map(m => {
              const imgUrl = m.image_url || "https://placehold.co/400x300/f3f4f6/9ca3af?text=" + encodeURIComponent(m.name.charAt(0));
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={imgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.name} />
                    {!m.is_available && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="bg-white/90 px-3 py-1 rounded-lg text-xs font-bold text-gray-800">HABIS</span></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 text-sm leading-tight">{m.name}</h4>
                      <span className="text-xs font-bold text-orange-500 whitespace-nowrap">{rp(m.price)}</span>
                    </div>
                    {m.category_name && <p className="text-xs text-orange-400 mb-1">{m.category_name}</p>}
                    {m.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{m.description}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="flex-1 py-2 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1"><Pencil className="w-3 h-3" />Edit</button>
                      <button onClick={() => { setDM(m); setDO(true); }} className="flex-1 py-2 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Hapus</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAB mobile */}
        <button onClick={openAdd} className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center z-20 transition-all active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  }

  /* ================================================================ */
  /*  PAGE: Designer                                                  */
  /* ================================================================ */
  function PgDesigner() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">QR Designer</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Preview */}
          <div className="flex items-start justify-center">
            <div ref={qcR} className="w-72 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl" style={{ backgroundColor: qB }}>
              {sf.lg && <img src={sf.lg} className="w-14 h-14 rounded-xl object-cover" alt="logo" />}
              <h4 className="font-bold text-lg" style={{ color: qF }}>{store?.name || "Warung Saya"}</h4>
              <div ref={qrR} />
              {tN.trim() && <p className="font-semibold text-sm" style={{ color: qF }}>Meja {tN}</p>}
              <p className="text-xs opacity-60" style={{ color: qF }}>Scan untuk lihat menu</p>
              {user && !user.is_pro && iC && <p className="text-[10px] opacity-40 mt-2" style={{ color: qF }}>PesanLagi Free</p>}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Presets Warna</h4>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map(p => (
                  <button key={p.n} onClick={() => applyPre(p)} className={`p-3 rounded-xl border-2 transition-all text-left ${qB === p.bg && qF === p.qr ? "border-orange-500" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="flex gap-1 mb-1.5"><div className="w-5 h-5 rounded-full" style={{ backgroundColor: p.bg, border: "1px solid #e5e7eb" }} /><div className="w-5 h-5 rounded-full" style={{ backgroundColor: p.qr }} /></div>
                    <p className="text-[11px] text-gray-600 font-medium">{p.n}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna Background</label>
                <input type="color" value={qB} onChange={e => { setQB(e.target.value); setIC(true); }} className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Warna QR</label>
                <input type="color" value={qF} onChange={e => { setQF(e.target.value); setIC(true); }} className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Meja</label>
              <input value={tN} onChange={e => setTN(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="1" />
            </div>

            {user && !user.is_pro && iC && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">Warna kustom hanya tersedia untuk paket <span className="font-bold">Pro</span>.</div>
            )}

            <div className="flex gap-3">
              <button onClick={saveDesign} disabled={qSv} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {qSv && <Loader2 className="w-4 h-4 animate-spin" />}
                {qSv ? "Menyimpan..." : "Simpan Desain"}
              </button>
              <button onClick={dlQR} disabled={qDl} className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {qDl && <Loader2 className="w-4 h-4 animate-spin" />}
                <Download className="w-4 h-4" />{qDl ? "Mengunduh..." : "Unduh PNG"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  PAGE: Billing                                                   */
  /* ================================================================ */
  function PgBilling() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Tagihan</h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${user?.is_pro ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
            {user?.is_pro ? "Paket Pro" : "Paket Gratis"}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{user?.is_pro ? "Terima kasih!……" : "Segera Hadir"}</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">{user?.is_pro ? "Kamu sedang menggunakan PesanLagi versi Pro. Nikmati semua fitur premium!" : "Fitur upgrade paket dan pembayaran akan segera tersedia. Nantikan informasi terbaru dari kami!"}</p>
          {!user?.is_pro && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl text-gray-400 font-medium text-sm">
              <Clock className="w-4 h-4" />Segera Hadir
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  MODAL: Menu Add/Edit                                            */
  /* ================================================================ */
  function ModalMenu() {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setMmO(false)} />
        <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">{em ? "Edit Menu" : "Tambah Menu Baru"}</h3>
            <button onClick={() => setMmO(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={saveMenu} className="p-5 space-y-4">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => mIR.current?.click()}>
                <img src={mf.img || "https://placehold.co/200x200/f3f4f6/9ca3af?text=Foto"} className="w-32 h-32 rounded-2xl object-cover bg-gray-100" alt="Menu" />
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Upload className="w-6 h-6" /></div>
                <input ref={mIR} type="file" accept="image/*" onChange={onMImgUp} className="hidden" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu *</label>
              <input value={mf.nm} onChange={e => setMf(p => ({ ...p, nm: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="Nasi Goreng Spesial" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea value={mf.ds} onChange={e => setMf(p => ({ ...p, ds: e.target.value }))} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none" placeholder="Deskripsi singkat..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input value={mf.pr} onChange={e => setMf(p => ({ ...p, pr: e.target.value.replace(/[^0-9]/g, "") }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" placeholder="25000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={mf.ci} onChange={e => setMf(p => ({ ...p, ci: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white">
                  <option value="">Tanpa Kategori</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Tersedia</span>
              <button type="button" onClick={() => setMf(p => ({ ...p, av: !p.av }))} className="text-orange-500">
                {mf.av ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setMmO(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
              <button type="submit" disabled={mfL} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {mfL && <Loader2 className="w-4 h-4 animate-spin" />}
                {mfL ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  MODAL: Delete Confirmation                                      */
  /* ================================================================ */
  function ModalDelete() {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setDO(false)} />
        <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-500" /></div>
          <h3 className="font-semibold text-gray-800 mb-2">Hapus Menu?</h3>
          <p className="text-sm text-gray-400 mb-5">Menu <strong>{dM?.name}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex gap-3">
            <button onClick={() => setDO(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={confirmDel} disabled={dL} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {dL && <Loader2 className="w-4 h-4 animate-spin" />}
              {dL ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  MODAL: Add Category                                             */
  /* ================================================================ */
  function ModalCat() {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={() => setCO(false)} />
        <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Tambah Kategori</h3>
            <button onClick={() => setCO(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
          </div>
          <input value={nC} onChange={e => setNC(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 mb-4" placeholder="Nama kategori" autoFocus />
          <div className="flex gap-3">
            <button onClick={() => setCO(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={addCat} disabled={cL} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {cL && <Loader2 className="w-4 h-4 animate-spin" />}
              {cL ? "Menambahkan..." : "Tambah"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
