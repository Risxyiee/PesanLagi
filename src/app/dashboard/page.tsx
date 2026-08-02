"use client";

import { useEffect, useRef } from "react";
import dashboardBodyHtml from "./dashboard-html.json";
import { dashboardStyles } from "./dashboard-styles";

declare global {
  interface Window {
    InsForgeDB: any;
    navigateTo: (page: string) => void;
    autoGenerateSlug: () => void;
    formatSlug: (input: HTMLInputElement) => void;
    handleLogoUpload: (e: Event) => void;
    saveSettings: () => Promise<void>;
    renderCategories: () => void;
    setCategory: (cat: string) => void;
    addCategory: () => void;
    renderMenus: () => void;
    dragStart: (e: DragEvent, id: string) => void;
    dragOver: (e: DragEvent) => void;
    drop: (e: DragEvent, targetId: string) => void;
    openMenuModal: () => void;
    editMenu: (id: string) => void;
    deleteMenu: (id: string) => void;
    handleMenuImageUpload: (e: Event) => void;
    saveMenu: (e: Event) => void;
    closeMenuModal: () => void;
    initQRDesigner: () => void;
    generateQRCode: () => void;
    applyPreset: (presetName: string) => void;
    setBgColor: (color: string) => void;
    setQrColor: (color: string) => void;
    applyCustomColor: () => void;
    updateCardUI: () => void;
    checkFreemiumLogic: () => void;
    handleSaveDesign: () => void;
    handleDownload: () => void;
    setLoading: (btn: HTMLElement | null, isLoading: boolean, text?: string) => void;
    showToast: (message: string) => void;
    closeModal: (id: string) => void;
    handleLogout: () => void;
  }
}

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ==========================================
    // MOCK STATE & DB
    // ==========================================
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
        if (menu.id) {
          const idx = window.InsForgeDB.menus.findIndex((m: any) => m.id === menu.id);
          if(idx > -1) window.InsForgeDB.menus[idx] = menu;
        } else {
          menu.id = 'm' + Date.now();
          window.InsForgeDB.menus.push(menu);
        }
      },
      deleteMenu: (id: string) => { window.InsForgeDB.menus = window.InsForgeDB.menus.filter((m: any) => m.id !== id); }
    };

    let currentMenuFilter = 'all';
    let isCustomColor = false;
    let menuToDelete: string | null = null;
    let draggedId: string | null = null;

    // ==========================================
    // NAVIGATION
    // ==========================================
    function navigateTo(page: string) {
      document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
      const target = document.getElementById('page-' + page);
      if (target) {
        target.classList.remove('hidden');
        (target as HTMLElement).style.animation = 'none';
        void (target as HTMLElement).offsetHeight;
        (target as HTMLElement).style.animation = '';
      }
      
      document.querySelectorAll('.nav-link, .mob-nav').forEach(link => {
        if ((link as HTMLElement).dataset.page === page) {
          link.classList.add('active', 'bg-orange-500/10', 'text-orange-500');
          link.classList.remove('text-slate-400', 'hover:bg-white/5', 'hover:text-white');
        } else {
          link.classList.remove('active', 'bg-orange-500/10', 'text-orange-500');
          link.classList.add('text-slate-400');
          if (link.classList.contains('nav-link')) link.classList.add('hover:bg-white/5', 'hover:text-white');
        }
      });

      if (page === 'overview') {
        const statEl = document.getElementById('stat-total-menus');
        if (statEl) statEl.textContent = String(window.InsForgeDB.menus.length);
      }
      if (page === 'menus') { renderCategories(); renderMenus(); }
      if (page === 'designer') initQRDesigner();
    }

    // ==========================================
    // SETTINGS LOGIC
    // ==========================================
    function autoGenerateSlug() {
      const name = (document.getElementById('store-name') as HTMLInputElement)?.value;
      const slugInput = document.getElementById('store-slug') as HTMLInputElement;
      if (!slugInput.dataset.touched) {
        slugInput.value = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
    }

    function formatSlug(input: HTMLInputElement) {
      input.dataset.touched = 'true';
      input.value = input.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    function handleLogoUpload(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const preview = document.getElementById('logo-preview') as HTMLImageElement;
          if (preview) preview.src = (ev.target as FileReader).result as string;
          showToast('Logo diupload ke InsForge Storage...');
        };
        reader.readAsDataURL(file);
      }
    }

    async function saveSettings() {
      const btn = document.getElementById('settings-submit-btn');
      setLoading(btn, true, 'Menyimpan...');
      await new Promise(r => setTimeout(r, 1000));
      window.InsForgeDB.saveStore({
        name: (document.getElementById('store-name') as HTMLInputElement)?.value,
        slug: (document.getElementById('store-slug') as HTMLInputElement)?.value,
        logo_url: (document.getElementById('logo-preview') as HTMLImageElement)?.src
      });
      setLoading(btn, false);
      showToast('Profil warung berhasil disimpan!');
    }

    // ==========================================
    // MENUS LOGIC (CRUD + SEARCH + DRAG DROP)
    // ==========================================
    function renderCategories() {
      const container = document.getElementById('category-pills');
      if (!container) return;
      let html = `<button class="cat-pill ${currentMenuFilter === 'all' ? 'active bg-orange-500 text-white' : 'bg-white text-slate-600'} px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors" data-cat="all" onclick="setCategory('all')">Semua</button>`;
      window.InsForgeDB.categories.forEach((cat: string) => {
        html += `<button class="cat-pill ${currentMenuFilter === cat ? 'active bg-orange-500 text-white' : 'bg-white text-slate-600'} px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors" data-cat="${cat}" onclick="setCategory('${cat}')">${cat}</button>`;
      });
      html += `<button onclick="document.getElementById('cat-modal').classList.remove('hidden')" class="px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap border-2 border-dashed border-slate-200 text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-colors">+ Kategori</button>`;
      container.innerHTML = html;

      const select = document.getElementById('menu-cat') as HTMLSelectElement;
      if (select) select.innerHTML = window.InsForgeDB.categories.map((c: string) => `<option>${c}</option>`).join('');
    }

    function setCategory(cat: string) {
      currentMenuFilter = cat;
      renderCategories();
      renderMenus();
    }

    function addCategory() {
      const newCat = (document.getElementById('new-cat-name') as HTMLInputElement)?.value.trim();
      if (newCat && !window.InsForgeDB.categories.includes(newCat)) {
        window.InsForgeDB.categories.push(newCat);
        renderCategories();
        showToast('Kategori baru ditambahkan!');
      }
      (document.getElementById('new-cat-name') as HTMLInputElement).value = '';
      closeModal('cat-modal');
    }

    function renderMenus() {
      const grid = document.getElementById('menu-grid');
      if (!grid) return;
      const searchQuery = ((document.getElementById('search-menu') as HTMLInputElement)?.value || '').toLowerCase();
      const menus = window.InsForgeDB.menus.filter((m: any) => 
        (currentMenuFilter === 'all' || m.category === currentMenuFilter) &&
        (m.name.toLowerCase().includes(searchQuery) || m.desc.toLowerCase().includes(searchQuery))
      );
      
      const totalEl = document.getElementById('total-menus');
      if (totalEl) totalEl.textContent = String(window.InsForgeDB.menus.length);
      
      if (menus.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <h4 class="font-display font-bold text-slate-700 mb-1">Menu tidak ditemukan</h4>
            <p class="text-sm text-slate-400">Coba kata kunci lain atau tambah menu baru.</p>
          </div>`;
        return;
      }

      grid.innerHTML = menus.map((m: any) => `
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group cursor-move" draggable="true" ondragstart="dragStart(event, '${m.id}')" ondragover="dragOver(event)" ondrop="drop(event, '${m.id}')">
          <div class="relative h-40 overflow-hidden">
            <img src="${m.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${m.name}">
            ${!m.is_available ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">HABIS</div>' : ''}
            <div class="absolute top-2 right-2 bg-white/80 backdrop-blur p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 9l-3 3m0 0l3 3m-3-3h18m0 0l-3-3m3 3l-3 3"/></svg>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h4 class="font-display font-bold text-slate-800 text-sm leading-tight">${m.name}</h4>
              <span class="text-xs font-bold text-orange-600 whitespace-nowrap">Rp ${m.price.toLocaleString('id-ID')}</span>
            </div>
            <p class="text-xs text-slate-500 mb-3 line-clamp-2">${m.desc}</p>
            <div class="flex gap-2">
              <button onclick="editMenu('${m.id}')" class="flex-1 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg">Edit</button>
              <button onclick="deleteMenu('${m.id}')" class="flex-1 py-1.5 text-xs font-medium text-red-500 border border-red-100 hover:bg-red-50 rounded-lg">Hapus</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Drag & Drop Handlers
    function dragStart(e: DragEvent, id: string) {
      draggedId = id;
      (e.target as HTMLElement).classList.add('dragging');
    }

    function dragOver(e: DragEvent) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.add('drag-over');
    }

    function drop(e: DragEvent, targetId: string) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
      
      if (draggedId && draggedId !== targetId) {
        const draggedIndex = window.InsForgeDB.menus.findIndex((m: any) => m.id === draggedId);
        const targetIndex = window.InsForgeDB.menus.findIndex((m: any) => m.id === targetId);
        
        const [draggedItem] = window.InsForgeDB.menus.splice(draggedIndex, 1);
        window.InsForgeDB.menus.splice(targetIndex, 0, draggedItem);
        
        renderMenus();
        showToast('Urutan menu berhasil diubah!');
      }
    }

    function openMenuModal() {
      const title = document.getElementById('modal-title');
      const form = document.getElementById('menu-form') as HTMLFormElement;
      const imgPreview = document.getElementById('menu-img-preview') as HTMLImageElement;
      const available = document.getElementById('menu-available') as HTMLInputElement;
      const menuId = document.getElementById('menu-id') as HTMLInputElement;
      
      if (title) title.innerText = 'Tambah Menu Baru';
      if (form) form.reset();
      if (menuId) menuId.value = '';
      if (imgPreview) imgPreview.src = 'https://picsum.photos/seed/foodplaceholder/200/200.jpg';
      if (available) available.checked = true;
      renderCategories();
      document.getElementById('menu-modal')?.classList.remove('hidden');
    }

    function editMenu(id: string) {
      const m = window.InsForgeDB.menus.find((x: any) => x.id === id);
      if (!m) return;
      
      const title = document.getElementById('modal-title');
      const menuId = document.getElementById('menu-id') as HTMLInputElement;
      const menuName = document.getElementById('menu-name') as HTMLInputElement;
      const menuDesc = document.getElementById('menu-desc') as HTMLInputElement;
      const menuPrice = document.getElementById('menu-price') as HTMLInputElement;
      const menuCat = document.getElementById('menu-cat') as HTMLSelectElement;
      const imgPreview = document.getElementById('menu-img-preview') as HTMLImageElement;
      const available = document.getElementById('menu-available') as HTMLInputElement;
      
      if (title) title.innerText = 'Edit Menu';
      if (menuId) menuId.value = m.id;
      if (menuName) menuName.value = m.name;
      if (menuDesc) menuDesc.value = m.desc;
      if (menuPrice) menuPrice.value = String(m.price);
      if (menuCat) menuCat.value = m.category;
      if (imgPreview) imgPreview.src = m.image_url;
      if (available) available.checked = m.is_available;
      
      document.getElementById('menu-modal')?.classList.remove('hidden');
    }

    function deleteMenu(id: string) {
      menuToDelete = id;
      document.getElementById('delete-modal')?.classList.remove('hidden');
    }

    document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
      if (menuToDelete) {
        window.InsForgeDB.deleteMenu(menuToDelete);
        renderMenus();
        showToast('Menu berhasil dihapus.');
        menuToDelete = null;
      }
      closeModal('delete-modal');
    });

    function handleMenuImageUpload(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const preview = document.getElementById('menu-img-preview') as HTMLImageElement;
          if (preview) preview.src = (ev.target as FileReader).result as string;
          showToast('Foto diupload ke InsForge Storage...');
        };
        reader.readAsDataURL(file);
      }
    }

    function saveMenu(e: Event) {
      e.preventDefault();
      const id = (document.getElementById('menu-id') as HTMLInputElement)?.value;
      const menuData: any = {
        id: id || null,
        name: (document.getElementById('menu-name') as HTMLInputElement)?.value,
        desc: (document.getElementById('menu-desc') as HTMLInputElement)?.value,
        price: parseInt((document.getElementById('menu-price') as HTMLInputElement)?.value || '0'),
        category: (document.getElementById('menu-cat') as HTMLSelectElement)?.value,
        image_url: (document.getElementById('menu-img-preview') as HTMLImageElement)?.src,
        is_available: (document.getElementById('menu-available') as HTMLInputElement)?.checked
      };
      
      window.InsForgeDB.saveMenu(menuData);
      closeMenuModal();
      renderMenus();
      showToast(id ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!');
    }

    function closeMenuModal() {
      document.getElementById('menu-modal')?.classList.add('hidden');
    }

    // ==========================================
    // DESIGNER LOGIC
    // ==========================================
    function initQRDesigner() {
      generateQRCode();
      updateCardUI();
    }

    function generateQRCode() {
      const qrContainer = document.getElementById('qrcode');
      if (!qrContainer) return;
      qrContainer.innerHTML = '';
      const slug = window.InsForgeDB.stores.slug;
      const url = `https://pesanlagi.web.id/menu/${slug}`;
      
      // Check if QRCode library is available
      if (typeof (window as any).QRCode !== 'undefined') {
        new (window as any).QRCode(qrContainer, {
          text: url,
          width: 120,
          height: 120,
          colorDark: (document.getElementById('qr-color') as HTMLInputElement)?.value || '#000000',
          colorLight: '#ffffff',
          correctLevel: (window as any).QRCode.CorrectLevel.H
        });
      }
    }

    function applyPreset(presetName: string) {
      let bg = '', qr = '';
      if (presetName === 'kopi-susu') { bg = '#E8D0B3'; qr = '#4E342E'; isCustomColor = false; }
      else if (presetName === 'sage-segar') { bg = '#B2AC88'; qr = '#1A1A1A'; isCustomColor = false; }
      else if (presetName === 'midnight-orange') { bg = '#1A1A1A'; qr = '#FF6D00'; isCustomColor = false; }
      else if (presetName === 'neon-cyber') { bg = '#0F0F0F'; qr = '#00F0FF'; isCustomColor = true; }
      else if (presetName === 'warm-pastel') { bg = '#FFE4E6'; qr = '#DB2777'; isCustomColor = true; }
      else if (presetName === 'minimalist-black') { bg = '#FFFFFF'; qr = '#000000'; isCustomColor = true; }
      
      const bgInput = document.getElementById('bg-color') as HTMLInputElement;
      const qrInput = document.getElementById('qr-color') as HTMLInputElement;
      if (bgInput) bgInput.value = bg;
      if (qrInput) qrInput.value = qr;
      
      updateCardUI();
      checkFreemiumLogic();
    }

    function setBgColor(color: string) {
      isCustomColor = true;
      (document.getElementById('bg-color') as HTMLInputElement).value = color;
      updateCardUI();
      checkFreemiumLogic();
    }

    function setQrColor(color: string) {
      isCustomColor = true;
      (document.getElementById('qr-color') as HTMLInputElement).value = color;
      updateCardUI();
      checkFreemiumLogic();
    }

    function applyCustomColor() {
      isCustomColor = true;
      updateCardUI();
      checkFreemiumLogic();
    }

    function updateCardUI() {
      const bg = (document.getElementById('bg-color') as HTMLInputElement)?.value;
      const qr = (document.getElementById('qr-color') as HTMLInputElement)?.value;
      const tableNum = (document.getElementById('table-number') as HTMLInputElement)?.value || '';
      
      const card = document.getElementById('qr-card');
      if (card && bg) card.style.backgroundColor = bg;
      
      if (card) {
        card.querySelectorAll('h4, p').forEach(t => {
          (t as HTMLElement).style.color = qr || '#000';
        });
      }
      
      const tableNumEl = document.getElementById('qr-table-number');
      if (tableNumEl) {
        if (tableNum.trim()) {
          tableNumEl.textContent = tableNum;
          tableNumEl.classList.remove('hidden');
          (tableNumEl as HTMLElement).style.color = qr || '#000';
          (tableNumEl as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.2)';
        } else {
          tableNumEl.classList.add('hidden');
        }
      }
      
      generateQRCode();
    }

    function checkFreemiumLogic() {
      const isPro = window.InsForgeDB.users.is_pro;
      const watermark = document.getElementById('watermark');
      const proBadge = document.getElementById('pro-badge-custom');
      
      if (!isPro && isCustomColor) {
        watermark?.classList.remove('hidden');
        proBadge?.classList.remove('hidden');
      } else {
        watermark?.classList.add('hidden');
        if (!isCustomColor) proBadge?.classList.add('hidden');
      }
    }

    function handleSaveDesign() {
      const isPro = window.InsForgeDB.users.is_pro;
      const bg = (document.getElementById('bg-color') as HTMLInputElement)?.value;
      const qr = (document.getElementById('qr-color') as HTMLInputElement)?.value;
      
      if (!isPro && isCustomColor) {
        document.getElementById('upgrade-modal')?.classList.remove('hidden');
      } else {
        window.InsForgeDB.saveStore({ bg_color: bg, qr_color: qr });
        showToast('Desain kartu berhasil disimpan!');
      }
    }

    function handleDownload() {
      const isPro = window.InsForgeDB.users.is_pro;
      
      if (!isPro && isCustomColor) {
        document.getElementById('upgrade-modal')?.classList.remove('hidden');
      } else {
        showToast('Mengunduh PDF High-Res tanpa watermark...');
      }
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function setLoading(btn: HTMLElement | null, isLoading: boolean, text?: string) {
      if (!btn) return;
      if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin inline-block w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>${text || 'Loading...'}`;
      } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalText || '';
      }
    }

    function showToast(message: string) {
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-message');
      if (toast && msg) {
        (msg as HTMLElement).textContent = message;
        (toast as HTMLElement).style.opacity = '1';
        setTimeout(() => { (toast as HTMLElement).style.opacity = '0'; }, 3000);
      }
    }

    function closeModal(id: string) {
      document.getElementById(id)?.classList.add('hidden');
    }

    function handleLogout() {
      showToast('Berhasil logout. Mengarahkan ke /auth/login...');
      setTimeout(() => { window.location.href = '/#login'; }, 1500);
    }

    // ==========================================
    // BIND ALL TO WINDOW
    // ==========================================
    window.navigateTo = navigateTo;
    window.autoGenerateSlug = autoGenerateSlug;
    window.formatSlug = formatSlug;
    window.handleLogoUpload = handleLogoUpload;
    window.saveSettings = saveSettings;
    window.renderCategories = renderCategories;
    window.setCategory = setCategory;
    window.addCategory = addCategory;
    window.renderMenus = renderMenus;
    window.dragStart = dragStart;
    window.dragOver = dragOver;
    window.drop = drop;
    window.openMenuModal = openMenuModal;
    window.editMenu = editMenu;
    window.deleteMenu = deleteMenu;
    window.handleMenuImageUpload = handleMenuImageUpload;
    window.saveMenu = saveMenu;
    window.closeMenuModal = closeMenuModal;
    window.initQRDesigner = initQRDesigner;
    window.generateQRCode = generateQRCode;
    window.applyPreset = applyPreset;
    window.setBgColor = setBgColor;
    window.setQrColor = setQrColor;
    window.applyCustomColor = applyCustomColor;
    window.updateCardUI = updateCardUI;
    window.checkFreemiumLogic = checkFreemiumLogic;
    window.handleSaveDesign = handleSaveDesign;
    window.handleDownload = handleDownload;
    window.setLoading = setLoading;
    window.showToast = showToast;
    window.closeModal = closeModal;
    window.handleLogout = handleLogout;

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
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

    // INIT DASHBOARD
    navigateTo('overview');
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      <div ref={containerRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: dashboardBodyHtml }} />
    </>
  );
}
