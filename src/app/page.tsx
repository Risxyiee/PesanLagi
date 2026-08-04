"use client";

import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import bodyHtml from "./body-html.json";
import { styles } from "./styles";
import LoginView from "@/components/LoginView";
import DashboardApp from "@/components/dashboard/DashboardApp";

export default function Home() {
  useEffect(() => { initApp(); }, []);
  return <div id="app-root" style={{ minHeight: '100vh', background: '#0A0705' }} suppressHydrationWarning />;
}

function initApp() {
  if ((window as any)._appInited) return;
  (window as any)._appInited = true;

  const appRoot = document.getElementById('app-root');
  if (!appRoot) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'view-styles';
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const landingDiv = document.createElement('div');
  landingDiv.id = 'view-landing';
  landingDiv.innerHTML = bodyHtml;
  appRoot.appendChild(landingDiv);

  const loginDiv = document.createElement('div');
  loginDiv.id = 'view-login';
  loginDiv.style.display = 'none';
  loginDiv.style.minHeight = '100vh';
  loginDiv.style.background = '#F8FAFC';
  appRoot.appendChild(loginDiv);

  const dashDiv = document.createElement('div');
  dashDiv.id = 'view-dashboard';
  dashDiv.style.display = 'none';
  dashDiv.style.minHeight = '100vh';
  appRoot.appendChild(dashDiv);

  let currentView = 'landing';
  const landingInited = { v: false };

  function switchView(name: string) {
    if (name === currentView) return;
    currentView = name;
    ['landing', 'login', 'dashboard'].forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = v === name ? '' : 'none';
    });
    // Styles are handled by Tailwind CSS directly in React components
    if (name === 'landing') initLanding();
    else if (name === 'login') initLoginReact();
    else if (name === 'dashboard') initDashboardReact();

    // Mount React LoginView when switching to login
    if (name === 'login') {
      const loginContainer = document.getElementById('view-login');
      if (loginContainer) {
        let root = (loginContainer as any)._reactRoot as Root | undefined;
        if (!root) {
          root = createRoot(loginContainer);
          (loginContainer as any)._reactRoot = root;
        }
        const hash = window.location.hash.replace('#', '');
        const errorParam = new URLSearchParams(window.location.search).get('error') || undefined;
        root.render(<LoginView onNavigate={goTo} initialTab={hash === 'register' ? 'register' : 'login'} errorParam={errorParam} />);
      }
    }

    // Mount React DashboardApp when switching to dashboard
    if (name === 'dashboard') {
      const dashContainer = document.getElementById('view-dashboard');
      if (dashContainer) {
        let root = (dashContainer as any)._reactRoot as Root | undefined;
        if (!root) {
          root = createRoot(dashContainer);
          (dashContainer as any)._reactRoot = root;
        }
        root.render(<DashboardApp />);
      }
    }
  }

  function goTo(hash: string) { window.location.hash = hash; }

  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'dashboard') switchView('dashboard');
    else if (hash === 'login' || hash === 'register') switchView('login');
    else switchView('landing');
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth') === 'success') {
    window.history.replaceState({}, '', window.location.pathname);
    initLanding();
    switchView('dashboard');
    return;
  }

  window.addEventListener('hashchange', handleHash);
  const initHash = window.location.hash.replace('#', '');
  if (initHash === 'dashboard') { initLanding(); switchView('dashboard'); }
  else if (initHash === 'login' || initHash === 'register') { initLanding(); switchView('login'); }
  else { initLanding(); }

  // ============================================
  // LANDING PAGE LOGIC
  // ============================================
  function initLanding() {
    if (landingInited.v) return;
    landingInited.v = true;

    function showToastL(msg: string) {
      if (msg.includes('login') || msg.includes('Login') || msg.includes('Masuk')) { goTo('#login'); return; }
      if (msg.includes('gratis') || msg.includes('Gratis') || msg.includes('daftar') || msg.includes('Daftar') || msg.includes('disiapkan') || msg.includes('dibuat')) { goTo('#login'); return; }
      const toast = document.getElementById('toast'); const m = document.getElementById('toast-message');
      if (toast && m) { (m as HTMLElement).textContent = msg; toast.classList.add('show'); clearTimeout((window as any)._tt); (window as any)._tt = setTimeout(() => toast.classList.remove('show'), 3000); }
    }
    function openModal(id: string) { const m = document.getElementById(id); if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; } }
    function closeModalL(id: string) { const m = document.getElementById(id); if (m) { m.classList.remove('active'); document.body.style.overflow = ''; } }
    function toggleFaq(btn: HTMLElement) {
      const item = btn.closest('.faq-item'); if (!item) return; const ans = item.querySelector('.faq-answer') as HTMLElement; if (!ans) return;
      const isActive = item.classList.contains('active');
      item.closest('.modal-box')?.querySelectorAll('.faq-item').forEach((o: Element) => { if (o !== item) { o.classList.remove('active'); const a = o.querySelector('.faq-answer') as HTMLElement; if (a) a.style.maxHeight = '0'; } });
      if (isActive) { item.classList.remove('active'); ans.style.maxHeight = '0'; } else { item.classList.add('active'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    }

    (window as any).showToast = showToastL; (window as any).openModal = openModal; (window as any).closeModal = closeModalL; (window as any).toggleFaq = toggleFaq;

    const mBtn = document.getElementById('mobile-menu-btn'); const mM = document.getElementById('mobile-menu');
    mBtn?.addEventListener('click', () => mM?.classList.toggle('open'));
    mM?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mM?.classList.remove('open')));

    const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); e.target.querySelectorAll('.counter').forEach((c: Element) => animCounter(c as HTMLElement)); } }); }, { threshold: 0.1 });
    document.querySelectorAll('#view-landing .reveal').forEach(el => obs.observe(el));

    function animCounter(el: HTMLElement) {
      if (el.dataset.animated) return; el.dataset.animated = 'true';
      const target = parseFloat(el.dataset.target || '0'); const dec = el.dataset.decimal === '1'; const dur = 2000; const st = performance.now();
      function step(now: number) { const p = Math.min((now - st) / dur, 1); const v = target * (1 - Math.pow(1 - p, 3)); el.textContent = dec ? (v / 10).toFixed(1) : String(Math.floor(v)); if (p < 1) requestAnimationFrame(step); else el.textContent = dec ? (target / 10).toFixed(1) : String(target); }
      requestAnimationFrame(step);
    }

    function genQR(size = 21) {
      const p: number[][] = []; for (let i = 0; i < size; i++) p[i] = new Array(size).fill(0);
      const af = (r: number, c: number) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) p[r + i][c + j] = 1; } };
      af(0, 0); af(0, size - 7); af(size - 7, 0);
      for (let i = 8; i < size - 8; i++) { p[6][i] = i % 2 === 0 ? 1 : 0; p[i][6] = i % 2 === 0 ? 1 : 0; }
      let s = 12345; const rn = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) { if ((i < 8 && j < 8) || (i < 8 && j >= size - 8) || (i >= size - 8 && j < 8)) continue; if (i === 6 || j === 6) continue; if (rn() > 0.5) p[i][j] = 1; }
      return p;
    }
    function renderQR(c: HTMLElement | null, color: string, tpl: string) {
      if (!c) return; const pat = genQR(); const sz = pat.length; c.innerHTML = ''; c.style.display = 'grid'; c.style.gridTemplateColumns = `repeat(${sz}, 1fr)`; c.style.gridTemplateRows = `repeat(${sz}, 1fr)`; c.style.gap = '0';
      let br = '0'; if (tpl === 'rounded') br = '30%'; if (tpl === 'dot') br = '50%';
      const f = document.createDocumentFragment();
      for (let i = 0; i < sz; i++) for (let j = 0; j < sz; j++) { const d = document.createElement('div'); d.className = 'qr-cell'; if (pat[i][j] === 1) { d.style.background = color; d.style.borderRadius = br; } f.appendChild(d); }
      c.appendChild(f);
    }
    let qrC = '#F97316', qrT = 'square', qrB = '#FFF7ED', qrD = false, rN = 'Warung Bu Tini';
    function updPrev() {
      renderQR(document.getElementById('preview-qr'), qrC, qrT);
      const card = document.getElementById('preview-card'); if (card) card.style.background = qrB;
      const nm = document.getElementById('preview-name');
      if (nm && card) { const sub = card.querySelectorAll('.text-neutral-400, .text-neutral-500'); if (qrD) { nm.style.color = '#FFF7ED'; sub.forEach(el => { if (el.tagName !== 'BUTTON') { el.classList.remove('text-neutral-400', 'text-neutral-500'); el.classList.add('text-orange-100/50'); } }); } else { nm.style.color = '#1C1410'; sub.forEach(el => { if (el.tagName !== 'BUTTON') { el.classList.add('text-neutral-400', 'text-neutral-500'); el.classList.remove('text-orange-100/50'); } }); } nm.textContent = rN || 'Warung Bu Tini'; }
    }
    renderQR(document.getElementById('hero-qr'), '#0C0A09', 'square'); updPrev();
    document.querySelectorAll('#color-picker .color-swatch').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#color-picker .color-swatch').forEach(x => x.classList.remove('active')); b.classList.add('active'); qrC = (b as HTMLElement).dataset.color || '#F97316'; updPrev(); }));
    document.querySelectorAll('#template-picker .template-option').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#template-picker .template-option').forEach(x => x.classList.remove('active')); b.classList.add('active'); qrT = (b as HTMLElement).dataset.template || 'square'; updPrev(); }));
    document.querySelectorAll('#bg-picker .color-swatch').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('#bg-picker .color-swatch').forEach(x => x.classList.remove('active')); b.classList.add('active'); qrB = (b as HTMLElement).dataset.bg || '#FFF7ED'; qrD = (b as HTMLElement).dataset.dark === 'true'; updPrev(); }));
    (document.getElementById('restaurant-name') as HTMLInputElement)?.addEventListener('input', (e) => { rN = (e.target as HTMLInputElement).value; updPrev(); });
    document.querySelectorAll('#view-landing a[href^="#"]').forEach(a => a.addEventListener('click', function (e: Event) { const href = (a as HTMLAnchorElement).getAttribute('href'); if (href && href !== '#') { const t = document.querySelector(href); if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' }); } } }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => { m.classList.remove('active'); document.body.style.overflow = ''; }); });
  }

  // ============================================
  // LOGIN — handled by React LoginView component
  // ============================================
  function initLoginReact() { /* React LoginView is mounted in switchView() */ }

  // ============================================
  // DASHBOARD — handled by React DashboardApp component
  // ============================================
  function initDashboardReact() { /* React DashboardApp is mounted in switchView() */ }
}
