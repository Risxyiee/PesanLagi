"use client";

import { useEffect } from "react";
import bodyHtml from "./body-html.json";
import { styles } from "./styles";
import loginBodyHtml from "./login/login-html.json";
import { loginStyles } from "./login/login-styles";
import dashboardBodyHtml from "./dashboard/dashboard-html.json";
import { dashboardStyles } from "./dashboard/dashboard-styles";

export default function Home() {
  // NO state = NO re-renders = NO blank page
  // React only renders landing page for SSR/hydration
  // Everything else is vanilla JS in useEffect

  useEffect(() => { initApp(); }, []);

  return (
    <>
      <style id="view-styles" dangerouslySetInnerHTML={{ __html: styles }} />
      <div id="app-root">
        <div id="view-landing" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>
    </>
  );
}

// ============================================
// ALL LOGIC RUNS ONCE IN useEffect (client only)
// ============================================
function initApp() {
  if ((window as any)._appInited) return;
  (window as any)._appInited = true;

  const appRoot = document.getElementById('app-root');
  if (!appRoot) return;

  // Inject hidden login & dashboard views into DOM
  const loginDiv = document.createElement('div');
  loginDiv.id = 'view-login';
  loginDiv.style.display = 'none';
  loginDiv.innerHTML = loginBodyHtml;
  appRoot.appendChild(loginDiv);

  const dashDiv = document.createElement('div');
  dashDiv.id = 'view-dashboard';
  dashDiv.style.display = 'none';
  dashDiv.innerHTML = dashboardBodyHtml;
  appRoot.appendChild(dashDiv);

  // ============================================
  // VIEW SWITCHING (pure DOM, no React)
  // ============================================
  let currentView = 'landing';
  const landingInited = { v: false };
  const loginInited = { v: false };
  const dashInited = { v: false };

  function switchView(name: string) {
    if (name === currentView) return;
    currentView = name;
    ['landing', 'login', 'dashboard'].forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = v === name ? '' : 'none';
    });
    const styleEl = document.getElementById('view-styles');
    if (styleEl) {
      if (name === 'login') styleEl.textContent = loginStyles;
      else if (name === 'dashboard') styleEl.textContent = dashboardStyles;
      else styleEl.textContent = styles;
    }
    if (name === 'landing') initLanding();
    else if (name === 'login') initLogin();
    else if (name === 'dashboard') initDashboard();
  }

  function goTo(hash: string) { window.location.hash = hash; }

  // Hash routing
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'dashboard') switchView('dashboard');
    else if (hash === 'login' || hash === 'register') switchView('login');
    else switchView('landing');
  }

  window.addEventListener('hashchange', handleHash);
  // Check initial hash - landing is rendered by SSR, but user might have navigated directly to #login or #dashboard
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
  // LOGIN PAGE LOGIC
  // ============================================
  function initLogin() {
    if (loginInited.v) return;
    loginInited.v = true;

    function showToastL(msg: string) { const t = document.getElementById('toast'); const m = document.getElementById('toast-message'); if (t && m) { (m as HTMLElement).textContent = msg; (t as HTMLElement).style.opacity = '1'; setTimeout(() => { (t as HTMLElement).style.opacity = '0'; }, 3000); } }
    function togglePwd(id: string, btn: HTMLElement) { const inp = document.getElementById(id) as HTMLInputElement; const ico = btn.querySelector('.eye-icon') as SVGElement; if (inp.type === 'password') { inp.type = 'text'; ico.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'; } else { inp.type = 'password'; ico.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'; } }
    function setLoad(bId: string, on: boolean, txt: string) { const b = document.getElementById(bId); if (!b) return; const ts = b.querySelector('.btn-text') as HTMLElement; if (on) { b.disabled = true; b.dataset.orig = ts.textContent || ''; b.classList.add('opacity-90', 'cursor-not-allowed'); b.classList.remove('hover:-translate-y-0.5'); ts.innerHTML = `<svg class="animate-spin inline-block w-5 h-5 mr-2 -mt-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${txt}`; } else { b.disabled = false; b.classList.remove('opacity-90', 'cursor-not-allowed'); b.classList.add('hover:-translate-y-0.5'); ts.textContent = b.dataset.orig || ''; } }
    function showErr(vid: string, msg: string) { const ed = document.getElementById(vid + '-error'); const em = document.getElementById(vid + '-error-text'); const v = document.getElementById(vid + '-view'); if (!ed || !em || !v) return; em.textContent = msg; ed.classList.remove('hidden'); v.classList.add('shake'); setTimeout(() => v.classList.remove('shake'), 300); setTimeout(() => ed.classList.add('hidden'), 4000); }
    function swView(v: string) { document.querySelectorAll('.view').forEach(el => el.classList.add('hidden')); const t = document.getElementById(v + '-view'); if (t) { t.classList.remove('hidden'); (t as HTMLElement).style.animation = 'none'; void (t as HTMLElement).offsetHeight; (t as HTMLElement).style.animation = ''; } }
    function showOk(title: string, msg: string) { swView('success'); const t = document.getElementById('success-title'); const m = document.getElementById('success-msg'); const b = document.getElementById('success-bar'); if (t) t.textContent = title; if (m) m.textContent = msg; if (b) { b.style.width = '0%'; setTimeout(() => { b.style.width = '100%'; }, 100); } }
    function chkPwd() { const pwd = (document.getElementById('register-password') as HTMLInputElement)?.value || ''; const bars = [document.getElementById('strength-1'), document.getElementById('strength-2'), document.getElementById('strength-3'), document.getElementById('strength-4')]; const txt = document.getElementById('strength-text'); let s = 0; if (pwd.length >= 6) s++; if (pwd.length >= 10) s++; if (/[A-Z]/.test(pwd)) s++; if (/[0-9]/.test(pwd)) s++; bars.forEach(b => { if (b) b.style.backgroundColor = '#E2E8F0'; }); if (!txt) return; if (!pwd.length) { txt.textContent = 'Gunakan minimal 6 karakter'; txt.className = 'text-xs text-slate-400 mt-1.5'; } else if (s <= 1) { if (bars[0]) bars[0].style.backgroundColor = '#EF4444'; txt.textContent = 'Lemah'; txt.className = 'text-xs text-red-500 mt-1.5'; } else if (s <= 2) { if (bars[0]) bars[0].style.backgroundColor = '#F59E0B'; if (bars[1]) bars[1].style.backgroundColor = '#F59E0B'; txt.textContent = 'Cukup'; txt.className = 'text-xs text-yellow-500 mt-1.5'; } else if (s === 3) { if (bars[0]) bars[0].style.backgroundColor = '#10B981'; if (bars[1]) bars[1].style.backgroundColor = '#10B981'; if (bars[2]) bars[2].style.backgroundColor = '#10B981'; txt.textContent = 'Kuat'; txt.className = 'text-xs text-green-500 mt-1.5'; } else { bars.forEach(b => { if (b) b.style.backgroundColor = '#10B981'; }); txt.textContent = 'Sangat Kuat'; txt.className = 'text-xs text-green-500 mt-1.5'; } }
    (window as any).showToast = showToastL; (window as any).togglePassword = togglePwd; (window as any).switchView = swView; (window as any).checkPasswordStrength = chkPwd; (window as any).googleAuth = () => { window.location.href = '/api/auth/google'; };

    const hash = window.location.hash.replace('#', ''); if (hash === 'register') swView('register'); else swView('login');

    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault(); const em = (document.getElementById('login-email') as HTMLInputElement)?.value; const pw = (document.getElementById('login-password') as HTMLInputElement)?.value;
      if (!em || !pw) { showErr('login', 'Email dan password tidak boleh kosong.'); return; }
      setLoad('login-btn', true, 'Memproses...'); try { const res = await fetch('/api/auth/sign-in', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, password: pw }) }); const data = await res.json(); if (!res.ok) showErr('login', data.error || 'Login gagal'); else { showOk('Login Berhasil!', 'Mengarahkan ke dashboard...'); setTimeout(() => goTo('#dashboard'), 2000); } } catch { showErr('login', 'Terjadi kesalahan jaringan.'); } setLoad('login-btn', false);
    });
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault(); const em = (document.getElementById('register-email') as HTMLInputElement)?.value; const pw = (document.getElementById('register-password') as HTMLInputElement)?.value; const cn = (document.getElementById('register-confirm') as HTMLInputElement)?.value; const tm = (document.getElementById('register-terms') as HTMLInputElement)?.checked;
      if (!em || !pw || !cn) { showErr('register', 'Semua field wajib diisi.'); return; } if (pw.length < 6) { showErr('register', 'Password minimal harus 6 karakter.'); return; } if (pw !== cn) { showErr('register', 'Password dan konfirmasi tidak cocok.'); return; } if (!tm) { showErr('register', 'Anda harus menyetujui Syarat & Ketentuan.'); return; }
      setLoad('register-btn', true, 'Mendaftarkan Warungmu...'); try { const res = await fetch('/api/auth/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, password: pw }) }); const data = await res.json(); if (!res.ok) showErr('register', data.error || 'Daftar gagal'); else if (data.requireEmailVerification) showOk('Cek Email Kamu!', 'Kode verifikasi dikirim ke email kamu.'); else { showOk('Pendaftaran Berhasil!', 'Mengarahkan ke dashboard...'); setTimeout(() => goTo('#dashboard'), 2000); } } catch { showErr('register', 'Terjadi kesalahan jaringan.'); } setLoad('register-btn', false);
    });
    window.addEventListener('hashchange', () => { const h = window.location.hash.replace('#', ''); if (h === 'register') swView('register'); else if (h === 'login') swView('login'); });
  }

  // ============================================
  // DASHBOARD LOGIC
  // ============================================
  function initDashboard() {
    if (dashInited.v) return;
    dashInited.v = true;

    window.InsForgeDB = {
      users: { id: 'usr_123', email: 'pakbowo@warung.com', is_pro: false },
      stores: { id: 'store_1', user_id: 'usr_123', name: 'Warung Pak Bowo', slug: 'warung-pak-bowo', logo_url: 'https://picsum.photos/seed/warunglogo/200/200.jpg' },
      categories: ['Makanan', 'Minuman', 'Snack'],
      menus: [
        { id: 'm1', name: 'Nasi Goreng Spesial', desc: 'Nasi goreng dengan telur, ayam, dan kerupuk', price: 18000, category: 'Makanan', image_url: 'https://picsum.photos/seed/nasigoreng/400/400.jpg', is_available: true },
        { id: 'm2', name: 'Mie Goreng Jawa', desc: 'Mie goreng dengan sayuran dan telur', price: 15000, category: 'Makanan', image_url: 'https://picsum.photos/seed/miegoreng/400/400.jpg', is_available: true },
        { id: 'm3', name: 'Es Teh Manis', desc: 'Teh manis dingin segar', price: 5000, category: 'Minuman', image_url: 'https://picsum.photos/seed/esteh/400/400.jpg', is_available: true },
        { id: 'm4', name: 'Kopi Susu Gula Aren', desc: 'Kopi susu dengan gula aren asli', price: 12000, category: 'Minuman', image_url: 'https://picsum.photos/seed/kopisusu/400/400.jpg', is_available: false },
      ],
      saveStore: (d: any) => { window.InsForgeDB.stores = { ...window.InsForgeDB.stores, ...d }; return true; },
      saveMenu: (m: any) => { if (m.id) { const i = window.InsForgeDB.menus.findIndex((x: any) => x.id === m.id); if (i > -1) window.InsForgeDB.menus[i] = m; } else { m.id = 'm' + Date.now(); window.InsForgeDB.menus.push(m); } },
      deleteMenu: (id: string) => { window.InsForgeDB.menus = window.InsForgeDB.menus.filter((m: any) => m.id !== id); }
    };

    let curFilter = 'all', isCustom = false, menuDel: string | null = null, dragId: string | null = null;

    function nav(page: string) {
      document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
      const t = document.getElementById('page-' + page); if (t) { t.classList.remove('hidden'); (t as HTMLElement).style.animation = 'none'; void (t as HTMLElement).offsetHeight; (t as HTMLElement).style.animation = ''; }
      document.querySelectorAll('.nav-link, .mob-nav').forEach(l => { if ((l as HTMLElement).dataset.page === page) { l.classList.add('active', 'bg-orange-500/10', 'text-orange-500'); l.classList.remove('text-slate-400', 'hover:bg-white/5', 'hover:text-white'); } else { l.classList.remove('active', 'bg-orange-500/10', 'text-orange-500'); l.classList.add('text-slate-400'); if (l.classList.contains('nav-link')) l.classList.add('hover:bg-white/5', 'hover:text-white'); } });
      if (page === 'overview') { const e = document.getElementById('stat-total-menus'); if (e) e.textContent = String(window.InsForgeDB.menus.length); }
      if (page === 'menus') { renCats(); renMenus(); }
      if (page === 'designer') initQR();
    }
    function autoSlug() { const n = (document.getElementById('store-name') as HTMLInputElement)?.value; const s = document.getElementById('store-slug') as HTMLInputElement; if (!s.dataset.touched) s.value = n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    function fmtSlug(i: HTMLInputElement) { i.dataset.touched = 'true'; i.value = i.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
    function logoUp(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => { const p = document.getElementById('logo-preview') as HTMLImageElement; if (p) p.src = (ev.target as FileReader).result as string; toast('Logo diupload ke InsForge Storage...'); }; r.readAsDataURL(f); } }
    async function saveSet() { const b = document.getElementById('settings-submit-btn'); sLoad(b, true, 'Menyimpan...'); await new Promise(r => setTimeout(r, 1000)); window.InsForgeDB.saveStore({ name: (document.getElementById('store-name') as HTMLInputElement)?.value, slug: (document.getElementById('store-slug') as HTMLInputElement)?.value, logo_url: (document.getElementById('logo-preview') as HTMLImageElement)?.src }); sLoad(b, false); toast('Profil warung berhasil disimpan!'); }
    function renCats() { const c = document.getElementById('category-pills'); if (!c) return; let h = `<button class="cat-pill ${curFilter === 'all' ? 'active bg-orange-500 text-white' : 'bg-white text-slate-600'} px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors" data-cat="all" onclick="setCategory('all')">Semua</button>`; window.InsForgeDB.categories.forEach((cat: string) => { h += `<button class="cat-pill ${curFilter === cat ? 'active bg-orange-500 text-white' : 'bg-white text-slate-600'} px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors" data-cat="${cat}" onclick="setCategory('${cat}')">${cat}</button>`; }); h += `<button onclick="document.getElementById('cat-modal').classList.remove('hidden')" class="px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap border-2 border-dashed border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-colors">+ Kategori</button>`; c.innerHTML = h; const s = document.getElementById('menu-cat') as HTMLSelectElement; if (s) s.innerHTML = window.InsForgeDB.categories.map((c: string) => `<option>${c}</option>`).join(''); }
    function setCat(cat: string) { curFilter = cat; renCats(); renMenus(); }
    function addCat() { const nc = (document.getElementById('new-cat-name') as HTMLInputElement)?.value.trim(); if (nc && !window.InsForgeDB.categories.includes(nc)) { window.InsForgeDB.categories.push(nc); renCats(); toast('Kategori baru ditambahkan!'); } (document.getElementById('new-cat-name') as HTMLInputElement).value = ''; cM('cat-modal'); }
    function renMenus() { const g = document.getElementById('menu-grid'); if (!g) return; const sq = ((document.getElementById('search-menu') as HTMLInputElement)?.value || '').toLowerCase(); const ms = window.InsForgeDB.menus.filter((m: any) => (curFilter === 'all' || m.category === curFilter) && (m.name.toLowerCase().includes(sq) || m.desc.toLowerCase().includes(sq))); const te = document.getElementById('total-menus'); if (te) te.textContent = String(window.InsForgeDB.menus.length); if (!ms.length) { g.innerHTML = '<div class="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200"><svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><h4 class="font-display font-bold text-slate-700 mb-1">Menu tidak ditemukan</h4><p class="text-sm text-slate-400">Coba kata kunci lain atau tambah menu baru.</p></div>'; return; } g.innerHTML = ms.map((m: any) => `<div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group cursor-move" draggable="true" ondragstart="dragStart(event, '${m.id}')" ondragover="dragOver(event)" ondrop="drop(event, '${m.id}')"><div class="relative h-40 overflow-hidden"><img src="${m.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${m.name}">${!m.is_available ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">HABIS</div>' : ''}<div class="absolute top-2 right-2 bg-white/80 backdrop-blur p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 9l-3 3m0 0l3 3m-3-3h18m0 0l-3-3m3 3l-3 3"/></svg></div></div><div class="p-4"><div class="flex items-start justify-between gap-2 mb-1"><h4 class="font-display font-bold text-slate-800 text-sm leading-tight">${m.name}</h4><span class="text-xs font-bold text-orange-600 whitespace-nowrap">Rp ${m.price.toLocaleString('id-ID')}</span></div><p class="text-xs text-slate-500 mb-3 line-clamp-2">${m.desc}</p><div class="flex gap-2"><button onclick="editMenu('${m.id}')" class="flex-1 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg">Edit</button><button onclick="deleteMenu('${m.id}')" class="flex-1 py-1.5 text-xs font-medium text-red-500 border border-red-100 hover:bg-red-50 rounded-lg">Hapus</button></div></div></div>`).join(''); }
    function dStart(e: DragEvent, id: string) { dragId = id; (e.target as HTMLElement).classList.add('dragging'); }
    function dOver(e: DragEvent) { e.preventDefault(); (e.currentTarget as HTMLElement).classList.add('drag-over'); }
    function dDrop(e: DragEvent, tid: string) { e.preventDefault(); (e.currentTarget as HTMLElement).classList.remove('drag-over'); if (dragId && dragId !== tid) { const di = window.InsForgeDB.menus.findIndex((m: any) => m.id === dragId); const ti = window.InsForgeDB.menus.findIndex((m: any) => m.id === tid); const [it] = window.InsForgeDB.menus.splice(di, 1); window.InsForgeDB.menus.splice(ti, 0, it); renMenus(); toast('Urutan menu berhasil diubah!'); } }
    function openMM() { const t = document.getElementById('modal-title'); const f = document.getElementById('menu-form') as HTMLFormElement; const img = document.getElementById('menu-img-preview') as HTMLImageElement; const av = document.getElementById('menu-available') as HTMLInputElement; const mid = document.getElementById('menu-id') as HTMLInputElement; if (t) t.innerText = 'Tambah Menu Baru'; if (f) f.reset(); if (mid) mid.value = ''; if (img) img.src = 'https://picsum.photos/seed/foodplaceholder/200/200.jpg'; if (av) av.checked = true; renCats(); document.getElementById('menu-modal')?.classList.remove('hidden'); }
    function editMenu(id: string) { const m = window.InsForgeDB.menus.find((x: any) => x.id === id); if (!m) return; const t = document.getElementById('modal-title'); const mid = document.getElementById('menu-id') as HTMLInputElement; if (t) t.innerText = 'Edit Menu'; if (mid) mid.value = m.id; const els: Record<string, string> = { 'menu-name': m.name, 'menu-desc': m.desc, 'menu-price': String(m.price) }; Object.entries(els).forEach(([k, v]) => { const el = document.getElementById(k) as HTMLInputElement; if (el) el.value = v; }); const cat = document.getElementById('menu-cat') as HTMLSelectElement; if (cat) cat.value = m.category; const img = document.getElementById('menu-img-preview') as HTMLImageElement; if (img) img.src = m.image_url; const av = document.getElementById('menu-available') as HTMLInputElement; if (av) av.checked = m.is_available; document.getElementById('menu-modal')?.classList.remove('hidden'); }
    function delMenu(id: string) { menuDel = id; document.getElementById('delete-modal')?.classList.remove('hidden'); }
    document.getElementById('confirm-delete-btn')?.addEventListener('click', () => { if (menuDel) { window.InsForgeDB.deleteMenu(menuDel); renMenus(); toast('Menu berhasil dihapus.'); menuDel = null; } cM('delete-modal'); });
    function menuImgUp(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => { const p = document.getElementById('menu-img-preview') as HTMLImageElement; if (p) p.src = (ev.target as FileReader).result as string; toast('Foto diupload ke InsForge Storage...'); }; r.readAsDataURL(f); } }
    function saveMenu(e: Event) { e.preventDefault(); const id = (document.getElementById('menu-id') as HTMLInputElement)?.value; const md: any = { id: id || null, name: (document.getElementById('menu-name') as HTMLInputElement)?.value, desc: (document.getElementById('menu-desc') as HTMLInputElement)?.value, price: parseInt((document.getElementById('menu-price') as HTMLInputElement)?.value || '0'), category: (document.getElementById('menu-cat') as HTMLSelectElement)?.value, image_url: (document.getElementById('menu-img-preview') as HTMLImageElement)?.src, is_available: (document.getElementById('menu-available') as HTMLInputElement)?.checked }; window.InsForgeDB.saveMenu(md); cM('menu-modal'); renMenus(); toast(id ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!'); }
    function closeMM() { document.getElementById('menu-modal')?.classList.add('hidden'); }
    function initQR() { genQR(); updCard(); }
    function genQR() { const qc = document.getElementById('qrcode'); if (!qc) return; qc.innerHTML = ''; const url = `https://pesanlagi.web.id/menu/${window.InsForgeDB.stores.slug}`; if (typeof (window as any).QRCode !== 'undefined') new (window as any).QRCode(qc, { text: url, width: 120, height: 120, colorDark: (document.getElementById('qr-color') as HTMLInputElement)?.value || '#000', colorLight: '#fff', correctLevel: (window as any).QRCode.CorrectLevel.H }); }
    function applyPre(pn: string) { let bg = '', qr = ''; if (pn === 'kopi-susu') { bg = '#E8D0B3'; qr = '#4E342E'; isCustom = false; } else if (pn === 'sage-segar') { bg = '#B2AC88'; qr = '#1A1A1A'; isCustom = false; } else if (pn === 'midnight-orange') { bg = '#1A1A1A'; qr = '#FF6D00'; isCustom = false; } else if (pn === 'neon-cyber') { bg = '#0F0F0F'; qr = '#00F0FF'; isCustom = true; } else if (pn === 'warm-pastel') { bg = '#FFE4E6'; qr = '#DB2777'; isCustom = true; } else if (pn === 'minimalist-black') { bg = '#FFF'; qr = '#000'; isCustom = true; } const bI = document.getElementById('bg-color') as HTMLInputElement; const qI = document.getElementById('qr-color') as HTMLInputElement; if (bI) bI.value = bg; if (qI) qI.value = qr; updCard(); chkFree(); }
    function setBg(c: string) { isCustom = true; (document.getElementById('bg-color') as HTMLInputElement).value = c; updCard(); chkFree(); }
    function setQr(c: string) { isCustom = true; (document.getElementById('qr-color') as HTMLInputElement).value = c; updCard(); chkFree(); }
    function applyCC() { isCustom = true; updCard(); chkFree(); }
    function updCard() { const bg = (document.getElementById('bg-color') as HTMLInputElement)?.value; const qr = (document.getElementById('qr-color') as HTMLInputElement)?.value; const tn = (document.getElementById('table-number') as HTMLInputElement)?.value || ''; const card = document.getElementById('qr-card'); if (card && bg) card.style.backgroundColor = bg; if (card) card.querySelectorAll('h4, p').forEach(t => { (t as HTMLElement).style.color = qr || '#000'; }); const tne = document.getElementById('qr-table-number'); if (tne) { if (tn.trim()) { tne.textContent = tn; tne.classList.remove('hidden'); (tne as HTMLElement).style.color = qr || '#000'; (tne as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'; } else tne.classList.add('hidden'); } genQR(); }
    function chkFree() { const w = document.getElementById('watermark'); const pb = document.getElementById('pro-badge-custom'); if (!window.InsForgeDB.users.is_pro && isCustom) { w?.classList.remove('hidden'); pb?.classList.remove('hidden'); } else { w?.classList.add('hidden'); if (!isCustom) pb?.classList.add('hidden'); } }
    function saveDes() { if (!window.InsForgeDB.users.is_pro && isCustom) document.getElementById('upgrade-modal')?.classList.remove('hidden'); else { window.InsForgeDB.saveStore({ bg_color: (document.getElementById('bg-color') as HTMLInputElement)?.value, qr_color: (document.getElementById('qr-color') as HTMLInputElement)?.value }); toast('Desain kartu berhasil disimpan!'); } }
    function handleDl() { if (!window.InsForgeDB.users.is_pro && isCustom) document.getElementById('upgrade-modal')?.classList.remove('hidden'); else toast('Mengunduh PDF High-Res tanpa watermark...'); }
    function sLoad(b: HTMLElement | null, on: boolean, t?: string) { if (!b) return; if (on) { b.disabled = true; b.dataset.orig = b.innerHTML; b.innerHTML = `<svg class="animate-spin inline-block w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${t || 'Loading...'}`; } else { b.disabled = false; b.innerHTML = b.dataset.orig || ''; } }
    function toast(msg: string) { const t = document.getElementById('toast'); const m = document.getElementById('toast-message'); if (t && m) { (m as HTMLElement).textContent = msg; (t as HTMLElement).style.opacity = '1'; setTimeout(() => { (t as HTMLElement).style.opacity = '0'; }, 3000); } }
    function cM(id: string) { document.getElementById(id)?.classList.add('hidden'); }
    function logout() { toast('Berhasil logout. Mengarahkan...'); setTimeout(() => goTo('#landing'), 1500); }

    window.navigateTo = nav; window.autoGenerateSlug = autoSlug; window.formatSlug = fmtSlug; window.handleLogoUpload = logoUp; window.saveSettings = saveSet; window.renderCategories = renCats; window.setCategory = setCat; window.addCategory = addCat; window.renderMenus = renMenus; window.dragStart = dStart; window.dragOver = dOver; window.drop = dDrop; window.openMenuModal = openMM; window.editMenu = editMenu; window.deleteMenu = delMenu; window.handleMenuImageUpload = menuImgUp; window.saveMenu = saveMenu; window.closeMenuModal = closeMM; window.initQRDesigner = initQR; window.generateQRCode = genQR; window.applyPreset = applyPre; window.setBgColor = setBg; window.setQrColor = setQr; window.applyCustomColor = applyCC; window.updateCardUI = updCard; window.checkFreemiumLogic = chkFree; window.handleSaveDesign = saveDes; window.handleDownload = handleDl; window.setLoading = sLoad; window.showToast = toast; window.closeModal = cM; window.handleLogout = logout;

    document.getElementById('store-name')?.addEventListener('input', autoSlug); document.getElementById('store-slug')?.addEventListener('input', (e) => fmtSlug(e.target as HTMLInputElement)); document.getElementById('logo-upload')?.addEventListener('change', logoUp); document.getElementById('settings-form')?.addEventListener('submit', (e) => { e.preventDefault(); saveSet(); }); document.getElementById('add-cat-btn')?.addEventListener('click', addCat); document.getElementById('menu-form')?.addEventListener('submit', saveMenu); document.getElementById('menu-img-upload')?.addEventListener('change', menuImgUp); document.getElementById('save-design-btn')?.addEventListener('click', saveDes); document.getElementById('download-btn')?.addEventListener('click', handleDl); document.getElementById('table-number')?.addEventListener('input', updCard); document.getElementById('bg-color')?.addEventListener('input', () => { isCustom = true; updCard(); chkFree(); }); document.getElementById('qr-color')?.addEventListener('input', () => { isCustom = true; updCard(); chkFree(); }); document.getElementById('logout-btn')?.addEventListener('click', logout); document.getElementById('mob-logout-btn')?.addEventListener('click', logout); document.getElementById('add-menu-fab')?.addEventListener('click', openMM); document.getElementById('search-menu')?.addEventListener('input', renMenus);
    nav('overview');
  }
}
