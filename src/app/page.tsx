"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  ChevronLeft,
  MoreVertical,
  Zap,
  UserCheck,
  RotateCcw,
  QrCode,
  Sparkles,
  Package,
  Search,
  Clock,
  Wallet,
  TrendingUp,
  Check,
  XCircle,
  Bot,
  ShoppingBag,
  CheckCheck,
  Heart,
  ArrowLeftRight,
  Star,
  Send,
} from "lucide-react";

// Types
interface ChatMessage {
  from: "customer" | "ai" | "admin" | "system";
  time: string;
  text: string;
  meta?: string;
  kind?: "info" | "alert";
  product?: {
    name: string;
    price: string;
    stock: string;
  };
}

interface ScenarioEvent {
  at: number;
  type: "msg" | "typing" | "escalate";
  msg?: ChatMessage;
  on?: boolean;
}

interface Scenario {
  events: ScenarioEvent[];
}

// Constants
const SCENARIOS: Scenario[] = [
  {
    events: [
      { at: 500, type: "msg", msg: { from: "customer", time: "19.41", text: "Halo kak, stok hijab voal motif bunga biru masih ada?" } },
      { at: 1000, type: "typing", on: true },
      { at: 2500, type: "typing", on: false },
      { at: 2600, type: "msg", msg: { from: "ai", time: "19.41", meta: "PesanLagi AI · balas otomatis · 1,8 dtk", text: "Masih ada kak! Hijab Voal Premium — Motif Bunga Biru tersedia 12 pcs, Rp 89.000 sudah termasuk box eksklusif. Mau saya buatkan pesanannya sekarang?", product: { name: "Hijab Voal Premium", price: "Rp 89.000", stock: "Stok 12" } } },
      { at: 4600, type: "msg", msg: { from: "customer", time: "19.42", text: "Oke kak, order satu ya. Bayar via QRIS bisa?" } },
      { at: 5400, type: "typing", on: true },
      { at: 7700, type: "typing", on: false },
      { at: 7800, type: "msg", msg: { from: "ai", time: "19.42", meta: "PesanLagi AI · 1,4 dtk", text: "Bisa banget kak. Total Rp 96.000 termasuk ongkir Jabodetabek. Link pembayaran QRIS sudah saya kirim, konfirmasinya otomatis ya kak." } },
      { at: 8500, type: "msg", msg: { from: "system", kind: "info", time: "", text: "Invoice INV-2481 dibuat otomatis — menunggu pembayaran" } },
    ],
  },
  {
    events: [
      { at: 500, type: "msg", msg: { from: "customer", time: "20.03", text: "Kak, kirim ke Cimahi Bandung ongkirnya berapa? Besok sampai gak?" } },
      { at: 900, type: "typing", on: true },
      { at: 2600, type: "typing", on: false },
      { at: 2700, type: "msg", msg: { from: "ai", time: "20.03", meta: "PesanLagi AI · balas otomatis · 1,6 dtk", text: "Ke Cimahi kak: JNE Reguler Rp 18.000 (2–3 hari), SiCepat YES Rp 25.000 (besok sampai), JNE YES Rp 32.000 (besok sampai). Order sebelum jam 15.00 dikirim hari ini juga." } },
      { at: 4400, type: "msg", msg: { from: "customer", time: "20.04", text: "Gas yang besok sampai pakai SiCepat kak." } },
      { at: 5100, type: "typing", on: true },
      { at: 7200, type: "typing", on: false },
      { at: 7300, type: "msg", msg: { from: "ai", time: "20.04", meta: "PesanLagi AI · 1,2 dtk", text: "Siap kak! Paket SiCepat YES saya siapkan — total Rp 114.000 (produk Rp 89.000 + ongkir Rp 25.000). Link pembayaran sudah saya kirim ya." } },
    ],
  },
  {
    events: [
      { at: 500, type: "msg", msg: { from: "customer", time: "21.17", text: "Pesanan saya udah 5 hari belum sampai. Ini gimana kak? Kecewa." } },
      { at: 800, type: "typing", on: true },
      { at: 2400, type: "typing", on: false },
      { at: 2500, type: "msg", msg: { from: "ai", time: "21.17", meta: "PesanLagi AI · deteksi: komplain pengiriman", text: "Mohon maaf sekali kak atas keterlambatannya. Saya cek resi JX-8821… status: tertahan di hub Jakarta. Kasus ini saya teruskan ke admin kami untuk penanganan cepat, mohon ditunggu sebentar ya." } },
      { at: 3700, type: "escalate" },
      { at: 6300, type: "msg", msg: { from: "admin", time: "21.18", meta: "Dinda · Admin CS · merespons 45 dtk setelah eskalasi", text: "Halo kak, saya Dinda dari Toko Berkah. Mohon maaf banget atas keterlambatannya. Saya sudah eskalasi ke kurir, kirim ulang gratis + voucher Rp 20.000 untuk order berikutnya. Detail saya follow up di sini ya kak." } },
    ],
  },
];

const BRANDS = [
  "Kopi Nusantara", "Batik Laras", "ThriftHouse", "SnackKita",
  "Hijab Ayu", "Herbal Sehat", "Katering Bunda", "Gadget Second"
];

const INTENTS = [
  { q: "stok hijab bunga biru ada?", intent: "Cek Stok", conf: 98 },
  { q: "ongkir ke surabaya brp?", intent: "Cek Ongkir", conf: 97 },
  { q: "pesanan q udh d kirim blm?", intent: "Cek Resi", conf: 96 },
  { q: "bisa cod area bks gak?", intent: "Metode Bayar", conf: 94 },
  { q: "ambil 3 pcs dpt diskon?", intent: "Negosiasi", conf: 91 },
];

const CATALOG = [
  { name: "Hijab Voal Premium", price: "Rp 89.000", stock: "Stok 12", searchName: "hijab voal premium rp 89.000" },
  { name: "Gamis Ceruty Premium", price: "Rp 185.000", stock: "Stok 7", searchName: "gamis ceruty premium rp 185.000" },
  { name: "Rok Plisket Jeans", price: "Rp 95.000", stock: "Stok 21", searchName: "rok plisket jeans rp 95.000" },
  { name: "Kerudung Instant Rayon", price: "Rp 65.000", stock: "Stok 30", searchName: "kerudung instant rayon rp 65.000" },
];

const QR_STATES = [
  { t: "Menunggu scan Telegram…", ok: false },
  { t: "Memindai kode…", ok: false },
  { t: "Terhubung sebagai Toko Berkah ✓", ok: true },
];

const WORK_DAYS = 26;
const AUTOMATION = 0.85;
const HOURLY = 3500000 / 173;
const OUT_HOURS_PCT = 0.12;
const LOST_RATE = 0.15;
const AOV = 150000;
const PRO_PRICE = 149000;

// Helper functions
const rp = (n: number) => "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(Math.round(n));
const num = (n: number, d = 0) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: d }).format(n);

// Subcomponents
function TypingIndicator() {
  return (
    <div className="flex gap-1.5">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400"></span>
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: ".15s" }}></span>
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: ".3s" }}></span>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.from === "system") {
    const alert = message.kind === "alert";
    return (
      <div className={`msg fade-swap mx-auto flex w-fit max-w-[90%] items-center gap-1.5 rounded-full px-3 py-1.5 text-center text-[11px] font-medium shadow-sm ${alert ? "bg-amber-100 text-amber-800" : "bg-white text-slate-500"}`}>
        {alert ? <ArrowLeftRight className="size-3 shrink-0" /> : <Zap className="size-3 shrink-0 text-orange-600" />}
        {message.text}
      </div>
    );
  }

  const out = message.from !== "customer";
  const meta = out && message.meta ? (
    <p className={`msg fade-swap mb-1 flex items-center justify-end gap-1 text-[10px] font-semibold ${message.from === "admin" ? "text-amber-700" : "text-orange-700"}`}>
      {message.from === "admin" ? <UserCheck className="size-3" /> : <Bot className="size-3" />}
      {message.meta}
    </p>
  ) : "";

  const product = message.product ? (
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-orange-200 bg-white/80 px-2.5 py-1.5">
      <ShoppingBag className="size-4 shrink-0 text-orange-700" />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-slate-800">{message.product.name}</p>
        <p className="text-[10px] text-slate-500">{message.product.price} · {message.product.stock}</p>
      </div>
    </div>
  ) : "";

  return (
    <>
      {meta}
      <div className={`msg fade-swap max-w-[85%] px-3.5 py-2 text-[13px] leading-relaxed shadow-sm ${out ? "ml-auto rounded-2xl rounded-tr-md bg-[#D9FDD3] text-slate-800" : "rounded-2xl rounded-tl-md bg-white text-slate-800"}`}>
        {message.text}
        {product}
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
          {message.time}
          {out && <CheckCheck className="size-3.5 text-[#53BDEB]" />}
        </div>
      </div>
    </>
  );
}

function QRCode() {
  const [qrContent, setQrContent] = useState<string>("");

  useEffect(() => {
    // Generate fake QR code
    const N = 25, C = 8;
    let s = 7;
    const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
    let rects = "";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (inFinder(x, y)) continue;
        if (rnd() < 0.42) rects += `<rect x="${x * C}" y="${y * C}" width="${C}" height="${C}" fill="#0B1220"/>`;
      }
    }
    const finder = (fx: number, fy: number) => {
      rects += `<rect x="${fx * C}" y="${fy * C}" width="${7 * C}" height="${7 * C}" fill="#0B1220"/>
        <rect x="${(fx + 1) * C}" y="${(fy + 1) * C}" width="${5 * C}" height="${5 * C}" fill="#fff"/>
        <rect x="${(fx + 2) * C}" y="${(fy + 2) * C}" width="${3 * C}" height="${3 * C}" fill="#0B1220"/>`;
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQrContent(rects);
  }, []);

  return <svg id="qrSvg" viewBox="0 0 200 200" className="h-40 w-40" aria-hidden="true" dangerouslySetInnerHTML={{ __html: qrContent }} />;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50"
      >
        <span className="text-base font-semibold text-[#0B1220]">{question}</span>
        <ChevronLeft
          className={`size-5 shrink-0 text-orange-500 transition-transform duration-200 ${isOpen ? "rotate-[-90deg]" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="px-6 pb-4 text-sm leading-relaxed text-slate-600">{answer}</p>
      </div>
    </div>
  );
}

// Main component
export default function Home() {
  // Navbar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Telegram Simulator
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [statusMode, setStatusMode] = useState<"ai" | "admin">("ai");
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const initialPlayedRef = useRef(false);

  // QR Code
  const [qrStateIndex, setQrStateIndex] = useState(0);

  // Intent cycler
  const [intentIndex, setIntentIndex] = useState(0);
  const [intentKey, setIntentKey] = useState(0);

  // Catalog
  const [catalogSearch, setCatalogSearch] = useState("");
  const filteredCatalog = CATALOG.filter(item =>
    item.searchName.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  // Hybrid toggle
  const [hybridMode, setHybridMode] = useState<"auto" | "manual">("auto");

  // ROI Calculator
  const [roiChats, setRoiChats] = useState(80);
  const [roiMins, setRoiMins] = useState(6);

  // Reveal on scroll
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const revealObserver = useRef<IntersectionObserver | null>(null);

  // Scroll to section
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  // Calculate ROI
  const calculateROI = useCallback(() => {
    const monthly = roiChats * WORK_DAYS;
    const hours = (monthly * roiMins * AUTOMATION) / 60;
    const money = hours * HOURLY;
    const revenue = monthly * OUT_HOURS_PCT * LOST_RATE * AOV;
    const total = money + revenue;
    const roi = total / PRO_PRICE;
    const admins = hours / 173;

    return {
      total: rp(total),
      roi: `≈ ${num(Math.round(roi))}× lipat harga Pro`,
      hours: `${num(hours, 1)} jam`,
      money: `Rp ${num(money / 1000000, 2)} jt`,
      revenue: `Rp ${num(revenue / 1000000, 2)} jt`,
      summary: `Dengan ${num(roiChats)} chat/hari, PesanLagi menghemat ±${num(hours, 1)} jam kerja per bulan (setara ${num(admins, 1)} admin full-time) — dan ini belum termasuk order yang tidak lagi bocor di luar jam operasional.`,
    };
  }, [roiChats, roiMins]);

  const roiResults = calculateROI();

  // Play scenario
  const playScenario = useCallback((idx: number) => {
    setCurrentScenario(idx);
    setMessages([]);
    setIsTyping(false);
    setStatusMode("ai");

    const scenario = SCENARIOS[idx];
    scenario.events.forEach((event) => {
      setTimeout(() => {
        if (event.type === "typing") {
          setIsTyping(event.on ?? false);
        } else if (event.type === "escalate") {
          setStatusMode("admin");
          setMessages(prev => [...prev, {
            from: "system",
            kind: "alert",
            time: "",
            text: "Eskalasi: Dinda (Admin CS) menerima notifikasi"
          }]);
        } else if (event.msg) {
          setMessages(prev => [...prev, event.msg!]);
        }
      }, event.at);
    });
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // QR state cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setQrStateIndex(prev => (prev + 1) % QR_STATES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Intent cycler
  useEffect(() => {
    const interval = setInterval(() => {
      setIntentIndex(prev => (prev + 1) % INTENTS.length);
      setIntentKey(prev => prev + 1);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    revealObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.current?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealRefs.current.forEach((ref) => {
      if (ref) revealObserver.current?.observe(ref);
    });

    return () => {
      revealObserver.current?.disconnect();
    };
  }, []);

  // Play initial scenario
  useEffect(() => {
    if (!initialPlayedRef.current) {
      initialPlayedRef.current = true;
       
      setTimeout(() => playScenario(0), 0);
    }
  }, [playScenario]);

  // Add ref helper
  const addRevealRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    revealRefs.current[index] = el;
  }, []);

  return (
    <>
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        ::selection { background: #10b981; color: #fff; }

        .dot-grid-light { background-image: radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px); background-size: 22px 22px; }

        @keyframes typing-bounce { 0%,60%,100% { transform: translateY(0); opacity:.35; } 30% { transform: translateY(-3px); opacity:1; } }
        .typing-dot { animation: typing-bounce 1.2s infinite; }

        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 30s linear infinite; }
        .marquee:hover .marquee-track { animation-play-state: paused; }

        @keyframes fade-up { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        .fade-swap { animation: fade-up .45s ease both; }

        .reveal { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s ease; }
        .reveal.revealed { opacity: 1; transform: none; }

        .scan-line { position:absolute; left:6%; right:6%; height:3px; border-radius:9999px; background:#10b981; box-shadow:0 0 12px rgba(16,185,129,.8); animation: scanY 2.2s ease-in-out infinite alternate; }
        @keyframes scanY { from { top:8%; } to { top:88%; } }
        .scan-connected { border-color:#10b981 !important; box-shadow:0 0 0 4px rgba(16,185,129,.15); }
        .scan-connected .scan-line { display:none; }

        input[type="range"] { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:9999px; background:#1e293b; outline:none; cursor:pointer; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%; background:#10b981; border:3px solid #064e3b; transition:transform .15s ease; }
        input[type="range"]::-webkit-slider-thumb:hover { transform:scale(1.15); }
        input[type="range"]::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#10b981; border:3px solid #064e3b; cursor:pointer; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
        }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[80rem] items-center justify-between px-5 sm:px-8">
          <a href="#" className="flex items-center gap-2.5" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src="/pesanlagi-logo.png" alt="PesanLagi Logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-lg font-extrabold tracking-tight text-[#0B1220]">Pesan<span className="text-orange-600">Lagi</span></span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollToSection("fitur")} className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0B1220]">Fitur</button>
            <button onClick={() => scrollToSection("perbandingan")} className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0B1220]">Perbandingan</button>
            <button onClick={() => scrollToSection("kalkulator")} className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0B1220]">Kalkulator ROI</button>
            <button onClick={() => scrollToSection("harga")} className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0B1220]">Harga</button>
            <button onClick={() => scrollToSection("faq")} className="text-sm font-medium text-slate-600 transition-colors hover:text-[#0B1220]">FAQ</button>
            <button onClick={() => scrollToSection("harga")} className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600">Coba Gratis</button>
          </nav>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 md:hidden"
            aria-label="Buka menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 md:hidden">
            <button onClick={() => { scrollToSection("fitur"); setMobileMenuOpen(false); }} className="mobile-link block w-full rounded-lg px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Fitur</button>
            <button onClick={() => { scrollToSection("perbandingan"); setMobileMenuOpen(false); }} className="mobile-link block w-full rounded-lg px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Perbandingan</button>
            <button onClick={() => { scrollToSection("kalkulator"); setMobileMenuOpen(false); }} className="mobile-link block w-full rounded-lg px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Kalkulator ROI</button>
            <button onClick={() => { scrollToSection("harga"); setMobileMenuOpen(false); }} className="mobile-link block w-full rounded-lg px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">Harga</button>
            <button onClick={() => { scrollToSection("faq"); setMobileMenuOpen(false); }} className="mobile-link block w-full rounded-lg px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">FAQ</button>
            <button onClick={() => { scrollToSection("harga"); setMobileMenuOpen(false); }} className="mobile-link mt-2 block w-full rounded-full bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white">Coba Gratis</button>
          </nav>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#1A1A1A] text-white">
          <div className="dot-grid-light absolute inset-0" aria-hidden="true"></div>
          <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full border border-white/5" aria-hidden="true"></div>
          <div className="absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full border border-white/5" aria-hidden="true"></div>

          <div className="relative mx-auto grid max-w-[80rem] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400"></span>
                </span>
                Auto-Responder AI untuk UMKM Indonesia
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.35rem]">
                Otomatiskan balas chat Telegram toko Anda
                <span className="text-orange-400">24/7</span> —
                <span className="relative inline-block">tanpa admin ekstra
                  <svg className="absolute -bottom-2 left-0 h-2.5 w-full text-orange-500" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 7 Q 50 2 100 6 T 197 4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                PesanLagi baca katalog produk Anda, lalu jawab tanya stok, ongkir, dan status order
                dalam hitungan detik. Chat tengah malam, saat flash sale, atau saat libur — semua tetap dilayani.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="https://t.me/Risxyie?text=Halo%2C%20saya%20mau%20coba%20demo%20PesanLagi" target="_blank" rel="noopener"
                   className="group inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600">
                  Coba Demo Gratis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
                <button onClick={() => scrollToSection("perbandingan")} className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-7 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white">
                  Lihat Perbandingan
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-600 text-[11px] font-bold text-white ring-2 ring-[#0B1220]">AS</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-600 text-[11px] font-bold text-white ring-2 ring-[#0B1220]">RD</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-700 text-[11px] font-bold text-white ring-2 ring-[#0B1220]">IB</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-200 ring-2 ring-[#0B1220]">1,2rb</span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-orange-400 text-orange-400" />)}
                    <span className="ml-1 text-xs font-bold text-white">4,9/5</span>
                    <span className="ml-1 text-[10px] font-medium text-orange-300 opacity-70">(Demo)</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">Dipakai 1.200+ toko & brand lokal</p>
                  <p className="mt-1 text-[10px] text-slate-500 italic">*Data demo untuk ilustrasi</p>
                </div>
              </div>
            </div>

            {/* Simulator */}
            <div className="relative">
              <div className="mx-auto w-full max-w-sm">
                <div className="relative rounded-[2.5rem] bg-slate-900 p-2.5 shadow-2xl shadow-black/40 ring-1 ring-white/10">
                  <div className="absolute -top-3 right-6 z-10 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
                    </span>
                    Simulasi Langsung
                  </div>

                  <div className="overflow-hidden rounded-[2rem] bg-[#ECE5DD]">
                    {/* WA header */}
                    <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
                      <ChevronLeft className="size-5 shrink-0 opacity-80" />
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-600 text-[11px] font-bold">RB</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">Bu Ratih — Toko Berkah</p>
                        <p className="flex items-center gap-1 text-[11px] text-orange-200">
                          {statusMode === "admin" ? (
                            <>
                              <UserCheck className="size-3" />
                              Admin mengambil alih chat
                            </>
                          ) : (
                            <>
                              <Zap className="size-3" />
                              AI aktif · balas rata-rata 1,8 dtk
                            </>
                          )}
                        </p>
                      </div>
                      <MoreVertical className="size-5 shrink-0 opacity-80" />
                    </div>

                    {/* Chat body */}
                    <div ref={chatBodyRef} className="h-[400px] space-y-2.5 overflow-y-auto px-3.5 py-4">
                      <div className="mx-auto w-fit rounded-lg bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">Hari Ini</div>

                      {isTyping && (
                        <div className="w-fit rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">
                          <TypingIndicator />
                        </div>
                      )}

                      {messages.map((msg, idx) => (
                        <ChatBubble key={idx} message={msg} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scenario controls */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {SCENARIOS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => playScenario(idx)}
                      className={`scenario-btn rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        currentScenario === idx
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-white/15 bg-white/5 text-slate-300 hover:border-orange-400/50 hover:text-white"
                      }`}
                    >
                      {idx === 0 ? "Tanya Stok" : idx === 1 ? "Tanya Ongkir" : "Komplain (Hybrid)"}
                    </button>
                  ))}
                  <button
                    onClick={() => playScenario(currentScenario)}
                    title="Putar ulang"
                    aria-label="Putar ulang"
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition-colors hover:border-orange-400/50 hover:text-white"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
                <p className="mt-3 text-center text-[11px] text-slate-500">Pratinjau interaktif — bukan video. Coba ganti skenario di atas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Marquee */}
        <section className="border-b border-slate-100 bg-white py-8">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">Dipercaya 1.200+ toko online Indonesia</p>
          <div className="marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="marquee-track flex w-max items-center gap-12 pr-12">
              {[...BRANDS, ...BRANDS].map((brand, idx) => (
                <span key={idx} className="flex items-center gap-12 whitespace-nowrap text-lg font-bold text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
                  {brand}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] text-slate-400 italic">*Nama toko demo untuk ilustrasi</p>
        </section>

        {/* Pain vs Solution */}
        <section id="perbandingan" className="scroll-mt-24 bg-slate-50 py-20 lg:py-28">
          <div ref={addRevealRef(0)} className="reveal mx-auto max-w-[80rem] px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Perbandingan</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B1220] sm:text-4xl">CS Manual vs PesanLagi AI</h2>
              <p className="mt-4 text-slate-600">Kelola chat sendiri itu mahal — bukan cuma uang, tapi juga order yang hilang diam-diam.</p>
            </div>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-[24%] p-4 font-semibold text-slate-400">Aspek</th>
                    <th className="w-[38%] p-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">
                        <XCircle className="size-4 text-red-400" /> CS Manual
                      </span>
                    </th>
                    <th className="w-[38%] p-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-700">
                        <Bot className="size-4" /> PesanLagi AI
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-4 font-semibold text-[#0B1220]">Kecepatan balas</td>
                    <td className="p-4 text-slate-500"><span className="flex items-start gap-2"><X className="mt-0.5 size-4 shrink-0 text-red-400" />5–30 menit, tergantung antrian</span></td>
                    <td className="bg-orange-50/50 p-4 font-medium text-orange-950"><span className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />&lt; 10 detik, otomatis</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#0B1220]">Jam operasional</td>
                    <td className="p-4 text-slate-500"><span className="flex items-start gap-2"><X className="mt-0.5 size-4 shrink-0 text-red-400" />8 jam/hari, 6 hari/minggu</span></td>
                    <td className="bg-orange-50/50 p-4 font-medium text-orange-950"><span className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />24/7, termasuk libur nasional</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#0B1220]">Biaya per bulan</td>
                    <td className="p-4 text-slate-500"><span className="flex items-start gap-2"><X className="mt-0.5 size-4 shrink-0 text-red-400" />Rp 3,5–4 jt+ per admin</span></td>
                    <td className="bg-orange-50/50 p-4 font-medium text-orange-950"><span className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Mulai Rp 149 rb</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#0B1220]">Konsistensi jawaban</td>
                    <td className="p-4 text-slate-500"><span className="flex items-start gap-2"><X className="mt-0.5 size-4 shrink-0 text-red-400" />Beda admin, beda jawaban</span></td>
                    <td className="bg-orange-50/50 p-4 font-medium text-orange-950"><span className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />100% sesuai katalog & SOP toko</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#0B1220]">Saat flash sale</td>
                    <td className="p-4 text-slate-500"><span className="flex items-start gap-2"><X className="mt-0.5 size-4 shrink-0 text-red-400" />Chat menumpuk, order bocor</span></td>
                    <td className="bg-orange-50/50 p-4 font-medium text-orange-950"><span className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Nol antrian, semua chat terlayani</span></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-[#0B1220]">Komplain sensitif</td>
                    <td className="p-4 text-slate-500"><span className="flex items-start gap-2"><X className="mt-0.5 size-4 shrink-0 text-red-400" />Emosi admin ikut memanas</span></td>
                    <td className="bg-orange-50/50 p-4 font-medium text-orange-950"><span className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />AI eskalasi ke manusia + ringkasan kasus</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-center">
              <button onClick={() => scrollToSection("kalkulator")} className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700">
                Hitung penghematan untuk toko Anda <ArrowRight className="size-4" />
              </button>
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="fitur" className="scroll-mt-24 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
            <div ref={addRevealRef(1)} className="reveal mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Fitur Inti</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B1220] sm:text-4xl">Semua yang toko Anda butuhkan untuk balas chat otomatis</h2>
              <p className="mt-4 text-slate-600">Dari scan QR pertama sampai serah-terima chat ke admin manusia — satu dashboard.</p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-12">
              {/* Scan QR */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md lg:col-span-7 lg:p-8">
                <div className="grid items-center gap-8 sm:grid-cols-2">
                  <div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><QrCode className="size-5" /></span>
                    <h3 className="mt-4 text-xl font-extrabold text-[#0B1220]">Scan QR Telegram dalam 1 Menit</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">Tanpa API resmi, tanpa antrian verifikasi. Cukup scan QR seperti login Telegram — langsung jalan.</p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Satu nomor bisnis, ganti perangkat bebas</li>
                      <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Sesi terenkripsi, kredensial tidak disimpan plain-text</li>
                      <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Rata-rata setup pengguna: 58 detik</li>
                    </ul>
                  </div>
                  <div>
                    <div id="qrFrame" className={`relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition-all ${QR_STATES[qrStateIndex].ok ? 'scan-connected' : ''}`}>
                      <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-sm">
                        <QRCode />
                      </div>
                      <div className="scan-line" aria-hidden="true"></div>
                      {QR_STATES[qrStateIndex].ok && (
                        <span className="absolute -bottom-3 -right-3 grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-white shadow-lg">
                          <Check className="size-5" />
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-center text-xs font-semibold text-slate-500">{QR_STATES[qrStateIndex].t}</p>
                  </div>
                </div>
              </div>

              {/* Gemini AI */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md lg:col-span-5 lg:p-8">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><Sparkles className="size-5" /></span>
                <h3 className="mt-4 text-xl font-extrabold text-[#0B1220]">Gemini AI Smart Engine</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">AI paham bahasa gaul & singkatan khas Indonesia, kenali niat pembeli, dan jawab kontekstual.</p>
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4" key={intentKey}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pesan masuk</p>
                  <p className="mt-1 text-sm font-semibold text-[#0B1220]">"{INTENTS[intentIndex].q}"</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                      <Sparkles className="size-3" />Niat: {INTENTS[intentIndex].intent}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">akurasi {INTENTS[intentIndex].conf}%</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-400">Contoh deteksi niat secara langsung — berganti otomatis.</p>
              </div>

              {/* Katalog */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md lg:col-span-5 lg:p-8">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><Package className="size-5" /></span>
                <h3 className="mt-4 text-xl font-extrabold text-[#0B1220]">Katalog Produk = Otak AI</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">AI menjawab berdasarkan stok & harga asli. Coba ketik untuk saring — persis seperti AI mencari produk:</p>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari produk… (coba: gamis)"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-[#0B1220] placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  {filteredCatalog.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <span className="text-sm font-semibold text-[#0B1220]">{item.name}</span>
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        {item.price} <span className="rounded-full bg-orange-100 px-2 py-0.5 font-bold text-orange-700">{item.stock}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] font-semibold text-orange-600">{filteredCatalog.length} produk siap dijawab AI</p>
              </div>

              {/* Hybrid */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md lg:col-span-7 lg:p-8">
                <div className="grid items-center gap-8 sm:grid-cols-2">
                  <div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600"><UserCheck className="size-5" /></span>
                    <h3 className="mt-4 text-xl font-extrabold text-[#0B1220]">Hybrid: Manual ↔ Auto Takeover</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">AI pegang 85% chat. Begitu ada komplain atau negosiasi rumit, chat otomatis dialihkan ke admin — dengan ringkasan kasus lengkap. Coba geser sakelarnya:</p>
                  </div>
                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={hybridMode === "manual"}
                        onChange={(e) => setHybridMode(e.target.checked ? "manual" : "auto")}
                        className="peer sr-only"
                      />
                      <span className={`relative h-6 w-11 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:shadow peer-checked:bg-amber-500 peer-checked:after:translate-x-5 ${hybridMode === "auto" ? "bg-orange-500" : "bg-slate-300"}`}></span>
                      <span className="text-sm font-bold text-[#0B1220]">
                        {hybridMode === "auto" ? "AUTO — AI yang membalas" : "MANUAL — Admin yang membalas"}
                      </span>
                    </label>
                    <div className="mt-4">
                      {hybridMode === "auto" ? (
                        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                          <Bot className="mt-0.5 size-5 shrink-0 text-orange-600" />
                          <div>
                            <p className="text-sm font-bold text-orange-800">Mode AUTO aktif</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-orange-700">AI menjawab semua chat secara instan. Komplain & kata kunci sensitif otomatis dieskalasi ke admin beserta ringkasan kasus.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <UserCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
                          <div>
                            <p className="text-sm font-bold text-amber-800">Mode MANUAL aktif</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-amber-700">Admin memegang kendali penuh. AI tetap membantu: menyusun draf balasan & meringkas riwayat chat.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section id="kalkulator" className="relative scroll-mt-24 overflow-hidden bg-[#1A1A1A] py-20 text-white lg:py-28">
          <div className="dot-grid-light absolute inset-0" aria-hidden="true"></div>
          <div ref={addRevealRef(2)} className="reveal relative mx-auto max-w-[80rem] px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Kalkulator ROI</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Berapa Banyak yang Bisa Anda Hemat?</h2>
              <p className="mt-4 text-slate-300">Geser sesuai kondisi toko Anda — hitungannya jalan langsung.</p>
            </div>

            <div className="mt-14 grid items-start gap-6 lg:grid-cols-2">
              {/* Controls */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="roiChats" className="text-sm font-semibold text-slate-200">Volume chat Telegram per hari</label>
                    <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm font-bold text-orange-300">{num(roiChats)} chat</span>
                  </div>
                  <input
                    id="roiChats"
                    type="range"
                    min="20"
                    max="500"
                    step="5"
                    value={roiChats}
                    onChange={(e) => setRoiChats(Number(e.target.value))}
                    className="mt-4"
                    style={{ background: `linear-gradient(to right, #10b981 ${((roiChats - 20) / (500 - 20)) * 100}%, #1e293b ${((roiChats - 20) / (500 - 20)) * 100}%)` }}
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-500"><span>20</span><span>500</span></div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <label htmlFor="roiMins" className="text-sm font-semibold text-slate-200">Rata-rata lama balas manual per chat</label>
                    <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm font-bold text-orange-300">{num(roiMins)} menit</span>
                  </div>
                  <input
                    id="roiMins"
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    value={roiMins}
                    onChange={(e) => setRoiMins(Number(e.target.value))}
                    className="mt-4"
                    style={{ background: `linear-gradient(to right, #10b981 ${((roiMins - 2) / (10 - 2)) * 100}%, #1e293b ${((roiMins - 2) / (10 - 2)) * 100}%)` }}
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-500"><span>2 mnt</span><span>10 mnt</span></div>
                </div>

                <p className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-slate-400">
                  Asumsi: 26 hari operasional/bulan · AI menangani 85% chat · biaya admin Rp 3,5 jt/bln (≈Rp 20 rb/jam)
                  · 12% chat datang di luar jam kerja, 15% di antaranya hilang tanpa balasan cepat · rata-rata nilai order Rp 150 rb.
                </p>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-6 sm:p-8">
                  <p className="text-sm font-semibold text-orange-300">Total nilai per bulan</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-orange-400 sm:text-5xl">{roiResults.total}</p>
                  <span className="mt-3 inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">{roiResults.roi}</span>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{roiResults.summary}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <Clock className="size-5 text-orange-400" />
                    <p className="mt-3 text-2xl font-extrabold text-white">{roiResults.hours}</p>
                    <p className="mt-1 text-xs text-slate-400">Jam kerja hemat / bulan</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <Wallet className="size-5 text-orange-400" />
                    <p className="mt-3 text-2xl font-extrabold text-white">{roiResults.money}</p>
                    <p className="mt-1 text-xs text-slate-400">Hemat biaya admin / bulan</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <TrendingUp className="size-5 text-orange-400" />
                    <p className="mt-3 text-2xl font-extrabold text-white">{roiResults.revenue}</p>
                    <p className="mt-1 text-xs text-slate-400">Order tertolong / bulan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="harga" className="scroll-mt-24 bg-slate-50 py-20 lg:py-28">
          <div ref={addRevealRef(3)} className="reveal mx-auto max-w-[80rem] px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Harga</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B1220] sm:text-4xl">Murahannya Satu Admin, Kerjanya Tiga Orang</h2>
              <p className="mt-4 text-slate-600">Mulai gratis. Upgrade hanya kalau AI-nya terbukti nutup order.</p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
              {/* Starter */}
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-transform hover:-translate-y-1">
                <h3 className="text-lg font-extrabold text-[#0B1220]">Starter / Trial</h3>
                <p className="mt-1 text-sm text-slate-500">Coba dulu, buktikan dulu.</p>
                <p className="mt-6"><span className="text-4xl font-extrabold tracking-tight text-[#0B1220]">Rp 0</span></p>
                <p className="mt-1 text-xs text-slate-400">Gratis selamanya · tanpa kartu kredit</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />1 nomor Telegram</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />100 chat AI / bulan</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Katalog hingga 10 produk</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Template balasan siap pakai</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Dukungan komunitas</li>
                </ul>
                <a href="https://t.me/Risxyie?text=Halo%2C%20saya%20mau%20daftar%20Paket%20Starter%20PesanLagi" target="_blank" rel="noopener"
                   className="mt-7 rounded-full border border-slate-300 py-3 text-center text-sm font-bold text-[#0B1220] transition-colors hover:border-orange-500 hover:text-orange-600">Mulai Gratis</a>
              </div>

              {/* Pro */}
              <div className="relative flex flex-col rounded-2xl border-2 border-orange-500 bg-white p-7 shadow-xl shadow-orange-500/10 md:-translate-y-2">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Paling Laris</span>
                <h3 className="text-lg font-extrabold text-[#0B1220]">Pro UMKM</h3>
                <p className="mt-1 text-sm text-slate-500">Untuk toko yang serius scale-up.</p>
                <p className="mt-6"><span className="text-4xl font-extrabold tracking-tight text-[#0B1220]">Rp 149.000</span><span className="text-sm font-medium text-slate-400"> /bulan</span></p>
                <p className="mt-1 text-xs text-orange-600 font-semibold">Lebih murah dari 1 jasa kirim gratis-ongkir</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Semua fitur Starter</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Chat AI <strong className="text-[#0B1220]">tanpa batas</strong></li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Katalog produk tak terbatas</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Hybrid takeover manual ↔ AI</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Notifikasi eskalasi langsung ke WA admin</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Laporan performa mingguan</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Support prioritas 1-on-1</li>
                </ul>
                <a href="https://t.me/Risxyie?text=Halo%2C%20saya%20mau%20coba%20Pro%20UMKM%20PesanLagi" target="_blank" rel="noopener"
                   className="mt-7 rounded-full bg-orange-500 py-3 text-center text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-colors hover:bg-orange-600">Coba 14 Hari Gratis</a>
                <p className="mt-3 text-center text-[11px] text-slate-400">Batalkan kapan saja</p>
              </div>

              {/* Agency */}
              <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-transform hover:-translate-y-1">
                <h3 className="text-lg font-extrabold text-[#0B1220]">Agency</h3>
                <p className="mt-1 text-sm text-slate-500">Untuk agensi & reseller yang kelola banyak klien.</p>
                <p className="mt-6"><span className="text-4xl font-extrabold tracking-tight text-[#0B1220]">Kustom</span></p>
                <p className="mt-1 text-xs text-slate-400">Sesuai jumlah nomor & volume</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Semua fitur Pro</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Multi-nomor & multi-klien</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />White-label dashboard</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />API & webhook integrasi</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />AI training khusus per brand</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-orange-600" />Account manager khusus</li>
                </ul>
                <a href="https://t.me/Risxyie?text=Halo%2C%20saya%20mau%20tanya%20paket%20Agency%20PesanLagi" target="_blank" rel="noopener"
                   className="mt-7 rounded-full border border-slate-300 py-3 text-center text-sm font-bold text-[#0B1220] transition-colors hover:border-orange-500 hover:text-orange-600">Hubungi Sales</a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section - Coming Soon */}
        <section className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Testimoni</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B1220] sm:text-4xl">Apa kata pengguna PesanLagi?</h2>
              <p className="mt-4 text-slate-600">Kami sedang mengumpulkan testimonial dari pengguna awal PesanLagi.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <MessageCircle className="size-6 text-slate-400" />
                  </div>
                  <p className="text-slate-400 italic">"Testimoni pengguna akan ditampilkan di sini..."</p>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-300">Nama Toko</p>
                      <p className="text-xs text-slate-400">Kategori Bisnis</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <a href="https://t.me/Risxyie?text=Halo%2C%20saya%20ingin%20memberikan%20testimonial%20PesanLagi" target="_blank" rel="noopener"
                 className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-600">
                Jadilah yang pertama memberikan testimonial!
                <ArrowRight className="size-4" />
              </a>
              <p className="mt-3 text-xs text-slate-400">Bagikan pengalaman Anda dan bantu UMKM lainnya</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-24 bg-slate-50 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">FAQ</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B1220] sm:text-4xl">Pertanyaan yang Sering Diajukan</h2>
              <p className="mt-4 text-slate-600">Jawaban untuk pertanyaan umum seputar PesanLagi</p>
            </div>

            <div className="mt-12 space-y-4">
              {[
                {
                  q: "Apakah PesanLagi aman digunakan?",
                  a: "Ya, PesanLagi menggunakan enkripsi untuk melindungi data Anda. Kredensial Telegram tidak disimpan dalam bentuk plain-text. Kami mengikuti praktik keamanan standar industri untuk melindungi privasi pengguna."
                },
                {
                  q: "Bagaimana cara setup PesanLagi?",
                  a: "Setup sangat mudah! Cukup daftar akun, scan QR code Telegram Anda, dan upload katalog produk. Rata-rata waktu setup hanya 58 detik. AI akan otomatis belajar dari katalog Anda untuk memberikan jawaban yang akurat."
                },
                {
                  q: "Berapa lama waktu yang dibutuhkan untuk melihat hasil?",
                  a: "Hasil bisa langsung terlihat setelah setup. AI akan mulai menjawab chat dalam hitungan detik. Untuk melihat dampak pada penjualan, biasanya butuh 1-2 minggu untuk mengumpulkan data yang cukup."
                },
                {
                  q: "Bisakah saya mengambil alih chat manual?",
                  a: "Tentu! PesanLagi memiliki fitur Hybrid Mode di mana Anda bisa mengambil alih chat kapan saja. AI akan mendeteksi komplain atau kasus kompleks dan otomatis eskalasi ke admin beserta ringkasan kasus."
                },
                {
                  q: "Apakah data saya aman?",
                  a: "Data Anda disimpan di server yang aman dengan enkripsi. Kami tidak menjual data Anda ke pihak ketiga. Anda memiliki kontrol penuh atas data Anda dan bisa menghapusnya kapan saja."
                },
                {
                  q: "Berapa biaya langganan PesanLagi?",
                  a: "PesanLagi memiliki beberapa paket: Starter (gratis), Pro UMKM (Rp 149.000/bulan), dan Agency (custom pricing). Semua paket mendukung integrasi Telegram dengan fitur lengkap."
                },
                {
                  q: "Apakah bisa dicoba gratis?",
                  a: "Ya! Paket Starter gratis dengan batasan 100 chat AI/bulan dan katalog hingga 10 produk. Anda bisa upgrade kapan saja tanpa batasan waktu. Coba demo kami untuk melihat cara kerjanya."
                },
                {
                  q: "Bagaimana jika AI menjawab salah?",
                  a: "AI PesanLagi dilatih khusus untuk domain bisnis online dan terus belajar dari katalog Anda. Jika terjadi kesalahan, Anda bisa langsung mengambil alih chat dan mengedit jawaban AI. Feedback Anda membantu AI menjadi lebih akurat."
                }
              ].map((faq, idx) => (
                <FAQItem key={idx} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Band */}
        <section className="relative overflow-hidden bg-orange-500 py-16 lg:py-20">
          <div className="dot-grid-light absolute inset-0 opacity-60" aria-hidden="true"></div>
          <div ref={addRevealRef(4)} className="reveal relative mx-auto max-w-3xl px-5 text-center sm:px-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Chat tengah malam tak harus jadi pesanan yang hilang.</h2>
            <p className="mt-4 text-orange-50">Pasang PesanLagi hari ini — setup 1 menit, langsung jalan malam ini juga.</p>
            <a href="https://t.me/Risxyie?text=Halo%2C%20saya%20mau%20coba%20demo%20PesanLagi" target="_blank" rel="noopener"
               className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-orange-700 shadow-lg transition-transform hover:scale-[1.03]">
              Coba Demo Gratis <ArrowRight className="size-4" />
            </a>
            <p className="mt-4 text-xs font-medium text-orange-100">Tanpa kartu kredit · Batalkan kapan saja</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] py-14 text-slate-400">
        <div className="mx-auto max-w-[80rem] px-5 sm:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500">
                  <MessageCircle className="size-5 text-white" style={{ fill: "currentColor" }} />
                </span>
                <span className="text-lg font-extrabold tracking-tight text-white">Pesan<span className="text-orange-400">Lagi</span></span>
              </a>
              <p className="mt-4 text-sm leading-relaxed">Auto-responder AI Telegram untuk UMKM Indonesia. Balas cepat, jualan lebih.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Produk</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><button onClick={() => scrollToSection("fitur")} className="transition-colors hover:text-orange-400">Fitur</button></li>
                <li><button onClick={() => scrollToSection("harga")} className="transition-colors hover:text-orange-400">Harga</button></li>
                <li><button onClick={() => scrollToSection("kalkulator")} className="transition-colors hover:text-orange-400">Kalkulator ROI</button></li>
                <li><button onClick={() => scrollToSection("faq")} className="transition-colors hover:text-orange-400">FAQ</button></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Perusahaan</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="transition-colors hover:text-orange-400">Tentang Kami</a></li>
                <li><a href="#" className="transition-colors hover:text-orange-400">Blog</a></li>
                <li><a href="#" className="transition-colors hover:text-orange-400">Kontak</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Legal</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="transition-colors hover:text-orange-400">Kebijakan Privasi</a></li>
                <li><a href="#" className="transition-colors hover:text-orange-400">Syarat & Ketentuan</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs sm:flex-row">
            <p>© {new Date().getFullYear()} PesanLagi. Seluruh hak cipta dilindungi.</p>
            <p className="flex items-center gap-1.5">Dibuat untuk UMKM Indonesia <Heart className="size-3.5 fill-orange-500 text-orange-500" /></p>
          </div>
        </div>
      </footer>
    </>
  );
}