"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import bodyHtml from "./body-html.json";
import { styles } from "./styles";
import loginBodyHtml from "./login/login-html.json";
import { loginStyles } from "./login/login-styles";
import dashboardBodyHtml from "./dashboard/dashboard-html.json";
import { dashboardStyles } from "./dashboard/dashboard-styles";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [isClient, setIsClient] = useState(false);
  const landingInitRef = useRef(false);
  const loginInitRef = useRef(false);
  const dashboardInitRef = useRef(false);
  const { user, signUp, signIn, signInWithGoogle } = useAuth();

  // Hash routing
  useEffect(() => {
    setIsClient(true);

    function handleHash() {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'dashboard') {
        setView('dashboard');
      } else if (hash === 'login' || hash === 'register') {
        setView('login');
      } else if (hash === 'landing' || hash === '' || hash === 'fitur' || hash === 'harga' || hash === 'demo') {
        setView('landing');
      }
    }

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Global navigation helper
  const goTo = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  // ==========================================
  // LANDING PAGE INIT
  // ==========================================
  const initLanding = useCallback(() => {
    if (landingInitRef.current) return;
    landingInitRef.current = true;

    function showToast(message: string) {
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-message');
      if (toast && msg) {
        (msg as HTMLElement).textContent = message;
        toast.classList.add('show');
        clearTimeout((window as any)._toastTimer);
        (window as any)._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
      }
    }

    function openModal(id: string) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeModal(id: string) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    function toggleFaq(btn: HTMLElement) {
      const item = (btn as HTMLElement).closest('.faq-item');
      if (!item) return;
      const answer = item.querySelector('.faq-answer') as HTMLElement;
      if (!answer) return;
      const isActive = item.classList.contains('active');
      const allItems = item.closest('.modal-box')?.querySelectorAll('.faq-item') || [];
      allItems.forEach((otherItem: Element) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer') as HTMLElement;
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    }

    // Override showToast to also handle navigation for CTA buttons
    (window as any).showToast = (message: string) => {
      if (message.includes('login') || message.includes('Login') || message.includes('Masuk')) {
        goTo('#login');
        return;
      }
      if (message.includes('gratis') || message.includes('Gratis') || message.includes('daftar') || message.includes('Daftar') || message.includes('disiapkan') || message.includes('dibuat')) {
        goTo('#login');
        return;
      }
      // Normal toast
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-message');
      if (toast && msg) {
        (msg as HTMLElement).textContent = message;
        toast.classList.add('show');
        clearTimeout((window as any)._toastTimer);
        (window as any)._toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
      }
    };
    (window as any).openModal = openModal;
    (window as any).closeModal = closeModal;
    (window as any).toggleFaq = toggleFaq;

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn?.addEventListener('click', () => mobileMenu?.classList.toggle('open'));
    mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu?.classList.remove('open')));

    // Reveal on scroll
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          entry.target.querySelectorAll('.counter').forEach((c: Element) => animateCounter(c as HTMLElement));
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));

    function animateCounter(el: HTMLElement) {
      if (el.dataset.animated) return;
      el.dataset.animated = 'true';
      const target = parseFloat(el.dataset.target || '0');
      const isDecimal = el.dataset.decimal === '1';
      const duration = 2000;
      const start = performance.now();
      function step(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        if (isDecimal) el.textContent = (value / 10).toFixed(1);
        else el.textContent = String(Math.floor(value));
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? (target / 10).toFixed(1) : String(target);
      }
      requestAnimationFrame(step);
    }

    // QR Code generation
    function generateQRPattern(size = 21) {
      const pattern: number[][] = [];
      for (let i = 0; i < size; i++) pattern[i] = new Array(size).fill(0);
      const addFinder = (sr: number, sc: number) => {
        for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) pattern[sr + i][sc + j] = 1;
        }
      };
      addFinder(0, 0); addFinder(0, size - 7); addFinder(size - 7, 0);
      for (let i = 8; i < size - 8; i++) { pattern[6][i] = i % 2 === 0 ? 1 : 0; pattern[i][6] = i % 2 === 0 ? 1 : 0; }
      let seed = 12345;
      const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        if ((i < 8 && j < 8) || (i < 8 && j >= size - 8) || (i >= size - 8 && j < 8)) continue;
        if (i === 6 || j === 6) continue;
        if (rand() > 0.5) pattern[i][j] = 1;
      }
      return pattern;
    }

    function renderQR(container: HTMLElement | null, color: string, template: string) {
      if (!container) return;
      const pattern = generateQRPattern();
      const size = pattern.length;
      container.innerHTML = '';
      container.style.display = 'grid';
      container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      container.style.gridTemplateRows = `repeat(${size}, 1fr)`;
      container.style.gap = '0';
      let borderRadius = '0';
      if (template === 'rounded') borderRadius = '30%';
      if (template === 'dot') borderRadius = '50%';
      const frag = document.createDocumentFragment();
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        const cell = document.createElement('div');
        cell.className = 'qr-cell';
        if (pattern[i][j] === 1) { cell.style.background = color; cell.style.borderRadius = borderRadius; }
        frag.appendChild(cell);
      }
      container.appendChild(frag);
    }

    let qrColor = '#F97316';
    let qrTemplate = 'square';
    let qrBg = '#FFF7ED';
    let qrBgDark = false;
    let restaurantName = 'Warung Bu Tini';

    function updatePreview() {
      renderQR(document.getElementById('preview-qr'), qrColor, qrTemplate);
      const card = document.getElementById('preview-card');
      if (card) card.style.background = qrBg;
      const name = document.getElementById('preview-name');
      if (name && card) {
        const subtitle = card.querySelectorAll('.text-neutral-400, .text-neutral-500');
        if (qrBgDark) {
          name.style.color = '#FFF7ED';
          subtitle.forEach(el => { if (el.tagName !== 'BUTTON') { el.classList.remove('text-neutral-400', 'text-neutral-500'); el.classList.add('text-orange-100/50'); } });
        } else {
          name.style.color = '#1C1410';
          subtitle.forEach(el => { if (el.tagName !== 'BUTTON') { el.classList.add('text-neutral-400', 'text-neutral-500'); el.classList.remove('text-orange-100/50'); } });
        }
        name.textContent = restaurantName || 'Warung Bu Tini';
      }
    }

    renderQR(document.getElementById('hero-qr'), '#0C0A09', 'square');
    updatePreview();

    document.querySelectorAll('#color-picker .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#color-picker .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qrColor = (btn as HTMLElement).dataset.color || '#F97316';
        updatePreview();
      });
    });
    document.querySelectorAll('#template-picker .template-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#template-picker .template-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qrTemplate = (btn as HTMLElement).dataset.template || 'square';
        updatePreview();
      });
    });
    document.querySelectorAll('#bg-picker .color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#bg-picker .color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qrBg = (btn as HTMLElement).dataset.bg || '#FFF7ED';
        qrBgDark = (btn as HTMLElement).dataset.dark === 'true';
        updatePreview();
      });
    });
    const restaurantInput = document.getElementById('restaurant-name');
    restaurantInput?.addEventListener('input', (e) => { restaurantName = (e.target as HTMLInputElement).value; updatePreview(); });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e: Event) {
        const href = (anchor as HTMLAnchorElement).getAttribute('href');
        if (href && href !== '#') {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => { m.classList.remove('active'); document.body.style.overflow = ''; });
      }
    });
  }, [goTo]);

  // ==========================================
  // LOGIN PAGE INIT
  // ==========================================
  const initLogin = useCallback(() => {
    if (loginInitRef.current) return;
    loginInitRef.current = true;

    function showToast(message: string) {
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-message');
      if (toast && msg) {
        (msg as HTMLElement).textContent = message;
        (toast as HTMLElement).style.opacity = '1';
        setTimeout(() => { (toast as HTMLElement).style.opacity = '0'; }, 3000);
      }
    }

    function togglePassword(id: string, btn: HTMLElement) {
      const input = document.getElementById(id) as HTMLInputElement;
      const icon = btn.querySelector('.eye-icon') as SVGElement;
      if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
      } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
      }
    }

    function setLoading(btnId: string, isLoading: boolean, loadingText: string) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      const textSpan = btn.querySelector('.btn-text') as HTMLElement;
      if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = textSpan.textContent || '';
        btn.classList.add('opacity-90', 'cursor-not-allowed');
        btn.classList.remove('hover:-translate-y-0.5');
        textSpan.innerHTML = `<svg class="animate-spin inline-block w-5 h-5 mr-2 -mt-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${loadingText}`;
      } else {
        btn.disabled = false;
        btn.classList.remove('opacity-90', 'cursor-not-allowed');
        btn.classList.add('hover:-translate-y-0.5');
        textSpan.textContent = btn.dataset.originalText || '';
      }
    }

    function showError(viewId: string, message: string) {
      const errDiv = document.getElementById(viewId + '-error');
      const errMsg = document.getElementById(viewId + '-error-text');
      const view = document.getElementById(viewId + '-view');
      if (!errDiv || !errMsg || !view) return;
      errMsg.textContent = message;
      errDiv.classList.remove('hidden');
      view.classList.add('shake');
      setTimeout(() => view.classList.remove('shake'), 300);
      setTimeout(() => errDiv.classList.add('hidden'), 4000);
    }

    function switchView(view: string) {
      document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
      const target = document.getElementById(view + '-view');
      if (target) {
        target.classList.remove('hidden');
        (target as HTMLElement).style.animation = 'none';
        void (target as HTMLElement).offsetHeight;
        (target as HTMLElement).style.animation = '';
      }
    }

    function showSuccess(title: string, message: string) {
      switchView('success');
      const titleEl = document.getElementById('success-title');
      const msgEl = document.getElementById('success-msg');
      const bar = document.getElementById('success-bar');
      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;
      if (bar) { bar.style.width = '0%'; setTimeout(() => { bar.style.width = '100%'; }, 100); }
    }

    function checkPasswordStrength() {
      const pwd = (document.getElementById('register-password') as HTMLInputElement)?.value || '';
      const bars = [document.getElementById('strength-1'), document.getElementById('strength-2'), document.getElementById('strength-3'), document.getElementById('strength-4')];
      const text = document.getElementById('strength-text');
      let strength = 0;
      if (pwd.length >= 6) strength++;
      if (pwd.length >= 10) strength++;
      if (/[A-Z]/.test(pwd)) strength++;
      if (/[0-9]/.test(pwd)) strength++;
      bars.forEach(bar => { if (bar) bar.style.backgroundColor = '#E2E8F0'; });
      if (!text) return;
      if (pwd.length === 0) { text.textContent = 'Gunakan minimal 6 karakter'; text.className = 'text-xs text-slate-400 mt-1.5'; }
      else if (strength <= 1) { if (bars[0]) bars[0].style.backgroundColor = '#EF4444'; text.textContent = 'Lemah'; text.className = 'text-xs text-red-500 mt-1.5'; }
      else if (strength <= 2) { if (bars[0]) bars[0].style.backgroundColor = '#F59E0B'; if (bars[1]) bars[1].style.backgroundColor = '#F59E0B'; text.textContent = 'Cukup'; text.className = 'text-xs text-yellow-500 mt-1.5'; }
      else if (strength === 3) { if (bars[0]) bars[0].style.backgroundColor = '#10B981'; if (bars[1]) bars[1].style.backgroundColor = '#10B981'; if (bars[2]) bars[2].style.backgroundColor = '#10B981'; text.textContent = 'Kuat'; text.className = 'text-xs text-green-500 mt-1.5'; }
      else { bars.forEach(b => { if (b) b.style.backgroundColor = '#10B981'; }); text.textContent = 'Sangat Kuat'; text.className = 'text-xs text-green-500 mt-1.5'; }
    }

    function googleAuth() { signInWithGoogle(); }

    (window as any).showToast = showToast;
    (window as any).togglePassword = togglePassword;
    (window as any).switchView = switchView;
    (window as any).checkPasswordStrength = checkPasswordStrength;
    (window as any).googleAuth = googleAuth;

    // Handle hash for login/register switch
    const hash = window.location.hash.replace('#', '');
    if (hash === 'register') switchView('register');
    else switchView('login');

    // Login Form
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement)?.value;
      const password = (document.getElementById('login-password') as HTMLInputElement)?.value;
      if (!email || !password) { showError('login', 'Email dan password tidak boleh kosong.'); return; }
      setLoading('login-btn', true, 'Memproses...');
      const result = await signIn(email, password);
      setLoading('login-btn', false);
      if (result.error) { showError('login', result.error); }
      else { showSuccess('Login Berhasil!', 'Mengarahkan ke dashboard...'); setTimeout(() => goTo('#dashboard'), 2000); }
    });

    // Register Form
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('register-email') as HTMLInputElement)?.value;
      const password = (document.getElementById('register-password') as HTMLInputElement)?.value;
      const confirm = (document.getElementById('register-confirm') as HTMLInputElement)?.value;
      const terms = (document.getElementById('register-terms') as HTMLInputElement)?.checked;
      if (!email || !password || !confirm) { showError('register', 'Semua field wajib diisi.'); return; }
      if (password.length < 6) { showError('register', 'Password minimal harus 6 karakter.'); return; }
      if (password !== confirm) { showError('register', 'Password dan konfirmasi password tidak cocok.'); return; }
      if (!terms) { showError('register', 'Anda harus menyetujui Syarat & Ketentuan.'); return; }
      setLoading('register-btn', true, 'Mendaftarkan Warungmu...');
      const result = await signUp(email, password);
      setLoading('register-btn', false);
      if (result.error) { showError('register', result.error); }
      else if (result.requireEmailVerification) { showSuccess('Cek Email Kamu!', 'Kode verifikasi telah dikirim ke email kamu.'); }
      else { showSuccess('Pendaftaran Berhasil!', 'Mengarahkan ke dashboard...'); setTimeout(() => goTo('#dashboard'), 2000); }
    });

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h === 'register') switchView('register');
      else if (h === 'login') switchView('login');
    });
  }, [signUp, signIn, signInWithGoogle, goTo]);

  // ==========================================
  // DASHBOARD INIT
  // ==========================================
  const initDashboard = useCallback(() => {
    if (dashboardInitRef.current) return;
    dashboardInitRef.current = true;

    // Mock DB
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
      saveStore: (data: any) => { window.InsForgeDB.stores = {...window.InsForgeDB.stores, ...data}; return true; },
      saveMenu: (menu: any) => {
        if (menu.id) { const idx = window.InsForgeDB.menus.findIndex((m: any) => m.id === menu.id); if(idx > -1) window.InsForgeDB.menus[idx] = menu; }
        else { menu.id = 'm' + Date.now(); window.InsForgeDB.menus.push(menu); }
      },
      deleteMenu: (id: string) => { window.InsForgeDB.menus = window.InsForgeDB.menus.filter((m: any) => m.id !== id); }
    };

    let currentMenuFilter = 'all';
    let isCustomColor = false;
    let menuToDelete: string | null = null;
    let draggedId: string | null = null;

    function navigateTo(page: string) {
      document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
      const target = document.getElementById('page-' + page);
      if (target) { target.classList.remove('hidden'); (target as HTMLElement).style.animation = 'none'; void (target as HTMLElement).offsetHeight; (target as HTMLElement).style.animation = ''; }
      document.querySelectorAll('.nav-link, .mob-nav').forEach(link => {
        if ((link as HTMLElement).dataset.page === page) { link.classList.add('active', 'bg-orange-500/10', 'text-orange-500'); link.classList.remove('text-slate-400', 'hover:bg-white/5', 'hover:text-white'); }
        else { link.classList.remove('active', 'bg-orange-500/10', 'text-orange-500'); link.classList.add('text-slate-400'); if (link.classList.contains('nav-link')) link.classList.add('hover:bg-white/5', 'hover:text-white'); }
      });
      if (page === 'overview') { const el = document.getElementById('stat-total-menus'); if (el) el.textContent = String(window.InsForgeDB.menus.length); }
      if (page === 'menus') { renderCategories(); renderMenus(); }
      if (page === 'designer') initQRDesigner();
    }

    function autoGenerateSlug() {
      const name = (document.getElementById('store-name') as HTMLInputElement)?.value;
      const slugInput = document.getElementById('store-slug') as HTMLInputElement;
      if (!slugInput.dataset.touched) slugInput.value = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    function formatSlug(input: HTMLInputElement) { input.dataset.touched = 'true'; input.value = input.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
    function handleLogoUpload(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) { const reader = new FileReader(); reader.onload = (ev) => { const p = document.getElementById('logo-preview') as HTMLImageElement; if(p) p.src = (ev.target as FileReader).result as string; showToast('Logo diupload ke InsForge Storage...'); }; reader.readAsDataURL(file); }
    }
    async function saveSettings() {
      const btn = document.getElementById('settings-submit-btn');
      setLoadingGlobal(btn, true, 'Menyimpan...');
      await new Promise(r => setTimeout(r, 1000));
      window.InsForgeDB.saveStore({ name: (document.getElementById('store-name') as HTMLInputElement)?.value, slug: (document.getElementById('store-slug') as HTMLInputElement)?.value, logo_url: (document.getElementById('logo-preview') as HTMLImageElement)?.src });
      setLoadingGlobal(btn, false);
      showToast('Profil warung berhasil disimpan!');
    }

    function renderCategories() {
      const container = document.getElementById('category-pills');
      if (!container) return;
      let html = `<button class="cat-pill ${currentMenuFilter === 'all' ? 'active bg-orange-500 text-white' : 'bg-white text-slate-600'} px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors" data-cat="all" onclick="setCategory('all')">Semua</button>`;
      window.InsForgeDB.categories.forEach((cat: string) => { html += `<button class="cat-pill ${currentMenuFilter === cat ? 'active bg-orange-500 text-white' : 'bg-white text-slate-600'} px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors" data-cat="${cat}" onclick="setCategory('${cat}')">${cat}</button>`; });
      html += `<button onclick="document.getElementById('cat-modal').classList.remove('hidden')" class="px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap border-2 border-dashed border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-colors">+ Kategori</button>`;
      container.innerHTML = html;
      const select = document.getElementById('menu-cat') as HTMLSelectElement;
      if (select) select.innerHTML = window.InsForgeDB.categories.map((c: string) => `<option>${c}</option>`).join('');
    }
    function setCategory(cat: string) { currentMenuFilter = cat; renderCategories(); renderMenus(); }
    function addCategory() {
      const nc = (document.getElementById('new-cat-name') as HTMLInputElement)?.value.trim();
      if (nc && !window.InsForgeDB.categories.includes(nc)) { window.InsForgeDB.categories.push(nc); renderCategories(); showToast('Kategori baru ditambahkan!'); }
      (document.getElementById('new-cat-name') as HTMLInputElement).value = '';
      closeModalGlobal('cat-modal');
    }
    function renderMenus() {
      const grid = document.getElementById('menu-grid'); if (!grid) return;
      const sq = ((document.getElementById('search-menu') as HTMLInputElement)?.value || '').toLowerCase();
      const menus = window.InsForgeDB.menus.filter((m: any) => (currentMenuFilter === 'all' || m.category === currentMenuFilter) && (m.name.toLowerCase().includes(sq) || m.desc.toLowerCase().includes(sq)));
      const te = document.getElementById('total-menus'); if (te) te.textContent = String(window.InsForgeDB.menus.length);
      if (menus.length === 0) { grid.innerHTML = '<div class="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200"><svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><h4 class="font-display font-bold text-slate-700 mb-1">Menu tidak ditemukan</h4><p class="text-sm text-slate-400">Coba kata kunci lain atau tambah menu baru.</p></div>'; return; }
      grid.innerHTML = menus.map((m: any) => `<div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group cursor-move" draggable="true" ondragstart="dragStart(event, '${m.id}')" ondragover="dragOver(event)" ondrop="drop(event, '${m.id}')"><div class="relative h-40 overflow-hidden"><img src="${m.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${m.name}">${!m.is_available ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">HABIS</div>' : ''}<div class="absolute top-2 right-2 bg-white/80 backdrop-blur p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 9l-3 3m0 0l3 3m-3-3h18m0 0l-3-3m3 3l-3 3"/></svg></div></div><div class="p-4"><div class="flex items-start justify-between gap-2 mb-1"><h4 class="font-display font-bold text-slate-800 text-sm leading-tight">${m.name}</h4><span class="text-xs font-bold text-orange-600 whitespace-nowrap">Rp ${m.price.toLocaleString('id-ID')}</span></div><p class="text-xs text-slate-500 mb-3 line-clamp-2">${m.desc}</p><div class="flex gap-2"><button onclick="editMenu('${m.id}')" class="flex-1 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg">Edit</button><button onclick="deleteMenu('${m.id}')" class="flex-1 py-1.5 text-xs font-medium text-red-500 border border-red-100 hover:bg-red-50 rounded-lg">Hapus</button></div></div></div>`).join('');
    }
    function dragStart(e: DragEvent, id: string) { draggedId = id; (e.target as HTMLElement).classList.add('dragging'); }
    function dragOver(e: DragEvent) { e.preventDefault(); (e.currentTarget as HTMLElement).classList.add('drag-over'); }
    function drop(e: DragEvent, targetId: string) {
      e.preventDefault(); (e.currentTarget as HTMLElement).classList.remove('drag-over');
      if (draggedId && draggedId !== targetId) { const di = window.InsForgeDB.menus.findIndex((m: any) => m.id === draggedId); const ti = window.InsForgeDB.menus.findIndex((m: any) => m.id === targetId); const [item] = window.InsForgeDB.menus.splice(di, 1); window.InsForgeDB.menus.splice(ti, 0, item); renderMenus(); showToast('Urutan menu berhasil diubah!'); }
    }
    function openMenuModal() {
      const t = document.getElementById('modal-title'); const f = document.getElementById('menu-form') as HTMLFormElement; const img = document.getElementById('menu-img-preview') as HTMLImageElement; const av = document.getElementById('menu-available') as HTMLInputElement; const mid = document.getElementById('menu-id') as HTMLInputElement;
      if (t) t.innerText = 'Tambah Menu Baru'; if (f) f.reset(); if (mid) mid.value = ''; if (img) img.src = 'https://picsum.photos/seed/foodplaceholder/200/200.jpg'; if (av) av.checked = true;
      renderCategories(); document.getElementById('menu-modal')?.classList.remove('hidden');
    }
    function editMenu(id: string) {
      const m = window.InsForgeDB.menus.find((x: any) => x.id === id); if (!m) return;
      const t = document.getElementById('modal-title'); const mid = document.getElementById('menu-id') as HTMLInputElement;
      if (t) t.innerText = 'Edit Menu'; if (mid) mid.value = m.id;
      const els: Record<string, string> = { 'menu-name': m.name, 'menu-desc': m.desc, 'menu-price': String(m.price) };
      Object.entries(els).forEach(([k, v]) => { const el = document.getElementById(k) as HTMLInputElement; if (el) el.value = v; });
      const cat = document.getElementById('menu-cat') as HTMLSelectElement; if (cat) cat.value = m.category;
      const img = document.getElementById('menu-img-preview') as HTMLImageElement; if (img) img.src = m.image_url;
      const av = document.getElementById('menu-available') as HTMLInputElement; if (av) av.checked = m.is_available;
      document.getElementById('menu-modal')?.classList.remove('hidden');
    }
    function deleteMenu(id: string) { menuToDelete = id; document.getElementById('delete-modal')?.classList.remove('hidden'); }
    document.getElementById('confirm-delete-btn')?.addEventListener('click', () => { if (menuToDelete) { window.InsForgeDB.deleteMenu(menuToDelete); renderMenus(); showToast('Menu berhasil dihapus.'); menuToDelete = null; } closeModalGlobal('delete-modal'); });
    function handleMenuImageUpload(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) { const reader = new FileReader(); reader.onload = (ev) => { const p = document.getElementById('menu-img-preview') as HTMLImageElement; if (p) p.src = (ev.target as FileReader).result as string; showToast('Foto diupload ke InsForge Storage...'); }; reader.readAsDataURL(file); }
    }
    function saveMenu(e: Event) {
      e.preventDefault();
      const id = (document.getElementById('menu-id') as HTMLInputElement)?.value;
      const menuData: any = { id: id || null, name: (document.getElementById('menu-name') as HTMLInputElement)?.value, desc: (document.getElementById('menu-desc') as HTMLInputElement)?.value, price: parseInt((document.getElementById('menu-price') as HTMLInputElement)?.value || '0'), category: (document.getElementById('menu-cat') as HTMLSelectElement)?.value, image_url: (document.getElementById('menu-img-preview') as HTMLImageElement)?.src, is_available: (document.getElementById('menu-available') as HTMLInputElement)?.checked };
      window.InsForgeDB.saveMenu(menuData); closeMenuModalGlobal(); renderMenus(); showToast(id ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!');
    }
    function closeMenuModalGlobal() { document.getElementById('menu-modal')?.classList.add('hidden'); }

    function initQRDesigner() { generateQRCode(); updateCardUI(); }
    function generateQRCode() {
      const qrContainer = document.getElementById('qrcode'); if (!qrContainer) return; qrContainer.innerHTML = '';
      const slug = window.InsForgeDB.stores.slug; const url = `https://pesanlagi.web.id/menu/${slug}`;
      if (typeof (window as any).QRCode !== 'undefined') { new (window as any).QRCode(qrContainer, { text: url, width: 120, height: 120, colorDark: (document.getElementById('qr-color') as HTMLInputElement)?.value || '#000000', colorLight: '#ffffff', correctLevel: (window as any).QRCode.CorrectLevel.H }); }
    }
    function applyPreset(pn: string) {
      let bg = '', qr = ''; if (pn === 'kopi-susu') { bg = '#E8D0B3'; qr = '#4E342E'; isCustomColor = false; } else if (pn === 'sage-segar') { bg = '#B2AC88'; qr = '#1A1A1A'; isCustomColor = false; } else if (pn === 'midnight-orange') { bg = '#1A1A1A'; qr = '#FF6D00'; isCustomColor = false; } else if (pn === 'neon-cyber') { bg = '#0F0F0F'; qr = '#00F0FF'; isCustomColor = true; } else if (pn === 'warm-pastel') { bg = '#FFE4E6'; qr = '#DB2777'; isCustomColor = true; } else if (pn === 'minimalist-black') { bg = '#FFFFFF'; qr = '#000000'; isCustomColor = true; }
      const bgI = document.getElementById('bg-color') as HTMLInputElement; const qrI = document.getElementById('qr-color') as HTMLInputElement; if (bgI) bgI.value = bg; if (qrI) qrI.value = qr;
      updateCardUI(); checkFreemiumLogic();
    }
    function setBgColor(c: string) { isCustomColor = true; (document.getElementById('bg-color') as HTMLInputElement).value = c; updateCardUI(); checkFreemiumLogic(); }
    function setQrColor(c: string) { isCustomColor = true; (document.getElementById('qr-color') as HTMLInputElement).value = c; updateCardUI(); checkFreemiumLogic(); }
    function applyCustomColor() { isCustomColor = true; updateCardUI(); checkFreemiumLogic(); }
    function updateCardUI() {
      const bg = (document.getElementById('bg-color') as HTMLInputElement)?.value; const qr = (document.getElementById('qr-color') as HTMLInputElement)?.value; const tn = (document.getElementById('table-number') as HTMLInputElement)?.value || '';
      const card = document.getElementById('qr-card'); if (card && bg) card.style.backgroundColor = bg;
      if (card) card.querySelectorAll('h4, p').forEach(t => { (t as HTMLElement).style.color = qr || '#000'; });
      const tne = document.getElementById('qr-table-number'); if (tne) { if (tn.trim()) { tne.textContent = tn; tne.classList.remove('hidden'); (tne as HTMLElement).style.color = qr || '#000'; (tne as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)'; } else tne.classList.add('hidden'); }
      generateQRCode();
    }
    function checkFreemiumLogic() {
      const isPro = window.InsForgeDB.users.is_pro; const w = document.getElementById('watermark'); const pb = document.getElementById('pro-badge-custom');
      if (!isPro && isCustomColor) { w?.classList.remove('hidden'); pb?.classList.remove('hidden'); } else { w?.classList.add('hidden'); if (!isCustomColor) pb?.classList.add('hidden'); }
    }
    function handleSaveDesign() {
      const isPro = window.InsForgeDB.users.is_pro; const bg = (document.getElementById('bg-color') as HTMLInputElement)?.value; const qr = (document.getElementById('qr-color') as HTMLInputElement)?.value;
      if (!isPro && isCustomColor) document.getElementById('upgrade-modal')?.classList.remove('hidden');
      else { window.InsForgeDB.saveStore({ bg_color: bg, qr_color: qr }); showToast('Desain kartu berhasil disimpan!'); }
    }
    function handleDownload() {
      if (!window.InsForgeDB.users.is_pro && isCustomColor) document.getElementById('upgrade-modal')?.classList.remove('hidden');
      else showToast('Mengunduh PDF High-Res tanpa watermark...');
    }

    function setLoadingGlobal(btn: HTMLElement | null, isLoading: boolean, text?: string) {
      if (!btn) return;
      if (isLoading) { btn.disabled = true; btn.dataset.originalText = btn.innerHTML; btn.innerHTML = `<svg class="animate-spin inline-block w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${text || 'Loading...'}`; }
      else { btn.disabled = false; btn.innerHTML = btn.dataset.originalText || ''; }
    }
    function showToast(message: string) {
      const toast = document.getElementById('toast'); const msg = document.getElementById('toast-message');
      if (toast && msg) { (msg as HTMLElement).textContent = message; (toast as HTMLElement).style.opacity = '1'; setTimeout(() => { (toast as HTMLElement).style.opacity = '0'; }, 3000); }
    }
    function closeModalGlobal(id: string) { document.getElementById(id)?.classList.add('hidden'); }
    function handleLogout() { showToast('Berhasil logout. Mengarahkan...'); setTimeout(() => goTo('#landing'), 1500); }

    // Bind to window
    window.navigateTo = navigateTo; window.autoGenerateSlug = autoGenerateSlug; window.formatSlug = formatSlug;
    window.handleLogoUpload = handleLogoUpload; window.saveSettings = saveSettings;
    window.renderCategories = renderCategories; window.setCategory = setCategory; window.addCategory = addCategory;
    window.renderMenus = renderMenus; window.dragStart = dragStart; window.dragOver = dragOver; window.drop = drop;
    window.openMenuModal = openMenuModal; window.editMenu = editMenu; window.deleteMenu = deleteMenu;
    window.handleMenuImageUpload = handleMenuImageUpload; window.saveMenu = saveMenu; window.closeMenuModal = closeMenuModalGlobal;
    window.initQRDesigner = initQRDesigner; window.generateQRCode = generateQRCode;
    window.applyPreset = applyPreset; window.setBgColor = setBgColor; window.setQrColor = setQrColor;
    window.applyCustomColor = applyCustomColor; window.updateCardUI = updateCardUI; window.checkFreemiumLogic = checkFreemiumLogic;
    window.handleSaveDesign = handleSaveDesign; window.handleDownload = handleDownload;
    window.setLoading = setLoadingGlobal; window.showToast = showToast; window.closeModal = closeModalGlobal; window.handleLogout = handleLogout;

    // Event listeners
    document.getElementById('store-name')?.addEventListener('input', autoGenerateSlug);
    document.getElementById('store-slug')?.addEventListener('input', (e) => formatSlug(e.target as HTMLInputElement));
    document.getElementById('logo-upload')?.addEventListener('change', handleLogoUpload);
    document.getElementById('settings-form')?.addEventListener('submit', (e) => { e.preventDefault(); saveSettings(); });
    document.getElementById('add-cat-btn')?.addEventListener('click', addCategory);
    document.getElementById('menu-form')?.addEventListener('submit', saveMenu);
    document.getElementById('menu-img-upload')?.addEventListener('change', handleMenuImageUpload);
    document.getElementById('save-design-btn')?.addEventListener('click', handleSaveDesign);
    document.getElementById('download-btn')?.addEventListener('click', handleDownload);
    document.getElementById('table-number')?.addEventListener('input', updateCardUI);
    document.getElementById('bg-color')?.addEventListener('input', () => { isCustomColor = true; updateCardUI(); checkFreemiumLogic(); });
    document.getElementById('qr-color')?.addEventListener('input', () => { isCustomColor = true; updateCardUI(); checkFreemiumLogic(); });
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('mob-logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('add-menu-fab')?.addEventListener('click', openMenuModal);
    document.getElementById('search-menu')?.addEventListener('input', renderMenus);

    navigateTo('overview');
  }, [goTo]);

  // ==========================================
  // RUN INIT ON VIEW CHANGE
  // ==========================================
  useEffect(() => {
    if (!isClient) return;
    if (view === 'landing') initLanding();
    else if (view === 'login') initLogin();
    else if (view === 'dashboard') initDashboard();
  }, [view, isClient, initLanding, initLogin, initDashboard]);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {view === 'landing' && (
        <>
          <style dangerouslySetInnerHTML={{ __html: styles }} />
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </>
      )}
      {view === 'login' && (
        <>
          <style dangerouslySetInnerHTML={{ __html: loginStyles }} />
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: loginBodyHtml }} />
        </>
      )}
      {view === 'dashboard' && (
        <>
          <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: dashboardBodyHtml }} />
        </>
      )}
    </>
  );
}
