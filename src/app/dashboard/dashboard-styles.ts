export const dashboardStyles = `
/* ============================================
   PesanLagi Dashboard — Clean Light Theme
   ============================================ */

/* ---- Root & Base ---- */
#view-dashboard {
  background: #F8F9FA;
  color: #111827;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: -0.02em;
}

/* ---- Scrollbar ---- */
#view-dashboard ::-webkit-scrollbar { width: 5px; height: 5px; }
#view-dashboard ::-webkit-scrollbar-track { background: #F3F4F6; border-radius: 99px; }
#view-dashboard ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }
#view-dashboard ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

/* ---- Page View Animation ---- */
.page-view {
  animation: dashFadeIn 400ms cubic-bezier(0.32,0.72,0,1) forwards;
}
@keyframes dashFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- Global Transition ---- */
#view-dashboard *,
#view-dashboard *::before,
#view-dashboard *::after {
  transition-property: color, background-color, border-color, box-shadow, opacity, transform;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#view-dashboard input,
#view-dashboard textarea,
#view-dashboard select,
#view-dashboard button {
  transition-property: color, background-color, border-color, box-shadow, opacity, transform;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================
   Card Primitives
   ============================================ */
.glass-panel {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.glass-card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 1rem;
  padding: 0.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.glass-card > .glass-card-inner {
  background: #fff;
  border-radius: calc(1rem - 0.25rem);
}

/* ============================================
   Sidebar (Desktop)
   ============================================ */
#view-dashboard aside {
  background: #FFFFFF !important;
  border-right: 1px solid #E5E7EB !important;
  box-shadow: 2px 0 8px rgba(0,0,0,0.03);
}

/* ---- Nav Links ---- */
.nav-link {
  position: relative;
  border-radius: 0.75rem !important;
  color: #6B7280 !important;
}
.nav-link:hover {
  background: #F9FAFB !important;
  color: #111827 !important;
}
.nav-link.active {
  background: #FFF7ED !important;
  color: #EA580C !important;
  font-weight: 600;
}
.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 0 99px 99px 0;
  background: #EA580C;
}

/* ---- Mobile Nav ---- */
.mob-nav {
  color: #9CA3AF !important;
  transition: all 200ms ease;
}
.mob-nav.active {
  color: #EA580C !important;
}
.mob-nav.active svg {
  stroke: #EA580C;
}
.mob-nav {
  -webkit-tap-highlight-color: transparent;
}

/* ============================================
   Bottom Nav (Mobile)
   ============================================ */
#view-dashboard nav[class*="fixed bottom"] {
  background: rgba(255,255,255,0.92) !important;
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border-top: 1px solid #E5E7EB !important;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.04);
}

/* ============================================
   Buttons
   ============================================ */
.btn-glass {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  color: #374151;
  border-radius: 0.75rem;
}
.btn-glass:hover {
  background: #F3F4F6;
  color: #111827;
}
.btn-primary {
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px -2px rgba(234,88,12,0.4);
}
.btn-primary:hover {
  box-shadow: 0 4px 16px -2px rgba(234,88,12,0.5);
  filter: brightness(1.05);
}

/* ============================================
   Inputs
   ============================================ */
#view-dashboard input[type="text"],
#view-dashboard input[type="tel"],
#view-dashboard input[type="url"],
#view-dashboard input[type="number"],
#view-dashboard input[type="email"],
#view-dashboard input[type="password"],
#view-dashboard input[type="time"],
#view-dashboard textarea,
#view-dashboard select {
  background: #F9FAFB !important;
  border: 1px solid #E5E7EB !important;
  color: #111827 !important;
  border-radius: 0.75rem !important;
  outline: none;
}
#view-dashboard input:focus,
#view-dashboard textarea:focus,
#view-dashboard select:focus {
  border-color: #F97316 !important;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
  background: #fff !important;
}
#view-dashboard input::placeholder,
#view-dashboard textarea::placeholder {
  color: #9CA3AF;
}
#view-dashboard select option {
  background: #fff;
  color: #111827;
}
#view-dashboard input[type="color"] {
  background: transparent !important;
  border: none !important;
}

/* ============================================
   Modal Overlays
   ============================================ */
.modal-overlay {
  background: rgba(0,0,0,0.3) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  transition: opacity 0.2s ease;
}
.modal-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}
.modal-box {
  background: #FFFFFF !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 1.25rem !important;
  box-shadow: 0 20px 60px -12px rgba(0,0,0,0.15);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.modal-overlay.hidden .modal-box {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* ============================================
   Toggle Switches
   ============================================ */
.toggle-bg {
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: #D1D5DB;
  position: relative;
  transition: background-color 200ms ease;
}
.toggle-dot {
  position: absolute;
  left: 0.25rem;
  top: 0.25rem;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform 200ms ease, background-color 200ms;
}
input:checked ~ .toggle-bg {
  background: #F97316;
  box-shadow: 0 0 8px rgba(249,115,22,0.3);
}
input:checked ~ .toggle-dot {
  transform: translateX(1.25rem);
  background: #fff;
}

/* ============================================
   Drag & Drop
   ============================================ */
.dragging {
  opacity: 0.5 !important;
  transform: scale(0.95);
}
.drag-over {
  border-top: 3px solid #F97316 !important;
}

/* ============================================
   Watermark Overlay
   ============================================ */
.watermark-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 20;
  overflow: hidden;
  border-radius: 1rem;
}
.watermark-text {
  font-size: 2.5rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.3);
  transform: rotate(-30deg);
  text-transform: uppercase;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(0,0,0,0.1);
  letter-spacing: 0.2em;
}

/* ============================================
   Toast
   ============================================ */
#toast {
  background: #1F2937 !important;
  border: 1px solid #374151 !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 10px 30px -5px rgba(0,0,0,0.2);
}
#toast span {
  color: #fff !important;
}

/* ============================================
   CSS for Dynamically Generated Content (Light Theme)
   ============================================ */

/* ---- Category Pills (dynamically generated) ---- */
.cat-pill {
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}
.cat-pill.bg-white {
  background: #F3F4F6 !important;
  color: #6B7280 !important;
  border: 1px solid #E5E7EB;
}
.cat-pill.bg-white:hover {
  background: #E5E7EB !important;
  color: #374151 !important;
}
.cat-pill.bg-orange-500 {
  background: #F97316 !important;
  color: #fff !important;
  box-shadow: 0 2px 8px -2px rgba(249,115,22,0.4);
}

/* ---- Menu Grid Cards (dynamically generated) ---- */
#menu-grid > div {
  background: #fff !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 1rem !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
  overflow: hidden;
}
#menu-grid .text-white {
  color: #111827 !important;
}
#menu-grid .text-white\\\/60 {
  color: #6B7280 !important;
}
#menu-grid .text-white\\\/40 {
  color: #9CA3AF !important;
}
#menu-grid .text-orange-400 {
  color: #EA580C !important;
}
#menu-grid button {
  background: #F3F4F6 !important;
  border: 1px solid #E5E7EB !important;
  color: #4B5563 !important;
  border-radius: 0.5rem !important;
}
#menu-grid button:hover {
  background: #E5E7EB !important;
}
#menu-grid .text-red-400\\\/80 {
  color: #EF4444 !important;
}
#menu-grid .bg-red-500\\\/10 {
  background: #FEF2F2 !important;
}
#menu-grid .hover\\:bg-red-500\\\/20:hover {
  background: #FEE2E2 !important;
}
#menu-grid .bg-white\\\/\[0\.06\] {
  background: #F3F4F6 !important;
}
#menu-grid .hover\\:bg-white\\\/\[0\.10\]:hover {
  background: #E5E7EB !important;
}
#menu-grid .ring-white\\\/\[0\.06\] {
  --tw-ring-color: #E5E7EB !important;
}
#menu-grid .bg-white\\\/\[0\.04\] {
  background: #fff !important;
}

/* ---- Empty State (dynamically generated) ---- */
#menu-grid .border-dashed {
  border-color: #D1D5DB !important;
}
#menu-grid .bg-white.border-dashed {
  background: #FAFAFA !important;
}
#menu-grid .text-white\\\/20 {
  color: #D1D5DB !important;
}
#menu-grid .text-white\\\/80 {
  color: #374151 !important;
}
#menu-grid .text-white\\\/40 {
  color: #9CA3AF !important;
}
#menu-grid .border-white\\\/10 {
  border-color: #E5E7EB !important;
}

/* ---- Popular Menus (dynamically generated) ---- */
#popular-menus-list .text-white {
  color: #111827 !important;
}
#popular-menus-list .text-white\\\/40 {
  color: #9CA3AF !important;
}
#popular-menus-list .text-orange-400 {
  color: #EA580C !important;
}
#popular-menus-list .text-white\\\/30 {
  color: #D1D5DB !important;
}
#popular-menus-list .ring-white\\\/10 {
  --tw-ring-color: #E5E7EB !important;
}

/* ---- Chart bars (dynamically generated) ---- */
#scan-chart-container .bg-orange-500\\\/20 {
  background: #FED7AA !important;
  border-radius: 0.375rem 0.375rem 0 0;
}
#scan-chart-container .hover\\:bg-orange-500\\\/30:hover {
  background: #FDBA74 !important;
}
#scan-chart-container .text-white\\\/30 {
  color: #9CA3AF !important;
}

/* ---- Dashed border for category add button ---- */
.border-dashed {
  border-style: dashed !important;
}

/* ---- Mobile Header ---- */
#view-dashboard header.md\\:hidden {
  background: rgba(255,255,255,0.92) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-bottom: 1px solid #E5E7EB !important;
}

/* ---- No Scrollbar Utility ---- */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* ---- Billing border highlight ---- */
.border-orange-500 {
  border-color: #F97316 !important;
  box-shadow: 0 0 16px -4px rgba(249,115,22,0.2);
}

/* ---- Stat Card Icons ---- */
.stat-icon {
  background: #FFF7ED !important;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- Preset button active ring ---- */
.preset-btn {
  transition: all 200ms ease;
}
.preset-btn:hover .aspect-square {
  border-color: #F97316 !important;
  box-shadow: 0 0 12px -2px rgba(249,115,22,0.3);
}

/* ---- Color Swatch Buttons ---- */
#view-dashboard .border-white\\\/15[style],
#view-dashboard .border-slate-200[style] {
  border-color: #E5E7EB !important;
}

/* ---- QR Card Preview Area ---- */
#view-dashboard .bg-slate-100:has(#qr-card) {
  background: #F9FAFB !important;
  border: 1px solid #E5E7EB !important;
  border-radius: 1rem !important;
}

/* ---- Settings Form Labels ---- */
#view-dashboard label {
  color: #374151;
}

/* ---- Amber/Warning pro badge ---- */
#view-dashboard .bg-amber-500\\\/10 {
  background: #FFFBEB !important;
}
#view-dashboard .border-amber-500\\\/20 {
  border-color: #FDE68A !important;
}
#view-dashboard .text-amber-400 {
  color: #D97706 !important;
}

/* ---- File input hidden ---- */
.hidden { display: none !important; }

/* ---- Responsive: sidebar, bottom nav, mobile header ---- */
@media (min-width: 768px) {
  #view-dashboard aside {
    display: flex !important;
  }
  #view-dashboard nav[class*="fixed bottom"] {
    display: none !important;
  }
  #view-dashboard header[class*="md"] {
    display: none !important;
  }
  #view-dashboard main {
    margin-left: 260px;
  }
}
@media (max-width: 767px) {
  #view-dashboard aside {
    display: none !important;
  }
  #view-dashboard main {
    margin-left: 0 !important;
  }
}

/* ---- Responsive Padding ---- */
@media (max-width: 767px) {
  #view-dashboard main > div {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 1rem;
    padding-bottom: 6rem;
  }
}

/* ---- FAB ---- */
.fab-btn {
  position: fixed;
  bottom: 5.5rem;
  right: 1.25rem;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px -2px rgba(234,88,12,0.5);
  z-index: 25;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
}
.fab-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px -2px rgba(234,88,12,0.6);
}
.fab-btn:active {
  transform: scale(0.95);
}
@media (min-width: 768px) {
  .fab-btn { display: none; }
}

/* ---- Override dark-themed inline classes from HTML ---- */
#view-dashboard .text-white {
  color: #111827 !important;
}
#view-dashboard .text-white\\\/50 {
  color: #6B7280 !important;
}
#view-dashboard .text-white\\\/40 {
  color: #9CA3AF !important;
}
#view-dashboard .text-white\\\/30 {
  color: #D1D5DB !important;
}
#view-dashboard .text-white\\\/25 {
  color: #D1D5DB !important;
}
#view-dashboard .text-white\\\/80 {
  color: #374151 !important;
}
#view-dashboard .bg-white\\\/\[0\.04\] {
  background: #fff !important;
}
#view-dashboard .bg-white\\\/\[0\.06\] {
  background: #F3F4F6 !important;
}
#view-dashboard .bg-white\\\/\[0\.03\] {
  background: #F9FAFB !important;
}
#view-dashboard .border-white\\\/\[0\.06\] {
  border-color: #E5E7EB !important;
}
#view-dashboard .border-white\\\/\[0\.08\] {
  border-color: #E5E7EB !important;
}
#view-dashboard .border-white\\\/\[0\.04\] {
  border-color: #F3F4F6 !important;
}
#view-dashboard .bg-white\\\/\[0\.10\] {
  background: #F3F4F6 !important;
}
#view-dashboard .hover\\:bg-white\\\/\[0\.06\]:hover {
  background: #F3F4F6 !important;
}
#view-dashboard .hover\\:bg-white\\\/\[0\.10\]:hover {
  background: #E5E7EB !important;
}
#view-dashboard .ring-white\\\/\[0\.04\] {
  --tw-ring-color: #E5E7EB !important;
}
#view-dashboard .ring-white\\\/\[0\.06\] {
  --tw-ring-color: #E5E7EB !important;
}
#view-dashboard .ring-white\\\/\[0\.10\] {
  --tw-ring-color: #E5E7EB !important;
}
#view-dashboard .border-white\\\/10 {
  border-color: #E5E7EB !important;
}
#view-dashboard .border-white\\\/15 {
  border-color: #E5E7EB !important;
}
#view-dashboard .hover\\:text-white\\\/80:hover {
  color: #374151 !important;
}
#view-dashboard .hover\\:text-white:hover {
  color: #111827 !important;
}
#view-dashboard .hover\\:text-red-400:hover {
  color: #EF4444 !important;
}
#view-dashboard .hover\\:bg-red-500\\\/10:hover {
  background: #FEF2F2 !important;
}
#view-dashboard .bg-orange-500\\\/10 {
  background: #FFF7ED !important;
}
#view-dashboard .text-orange-400 {
  color: #FB923C !important;
}
#view-dashboard .text-orange-500 {
  color: #F97316 !important;
}
#view-dashboard .text-orange-500\\\/70 {
  color: #FB923C !important;
}
#view-dashboard .text-green-400 {
  color: #22C55E !important;
}
#view-dashboard .text-red-400 {
  color: #F87171 !important;
}
#view-dashboard .bg-red-500\\\/10 {
  background: #FEF2F2 !important;
}
#view-dashboard .bg-red-500\\\/20 {
  background: #FEE2E2 !important;
}
#view-dashboard .border-amber-500\\\/20 {
  border-color: #FDE68A !important;
}
#view-dashboard .bg-amber-500\\\/10 {
  background: #FFFBEB !important;
}
#view-dashboard .text-amber-400 {
  color: #F59E0B !important;
}
#view-dashboard .bg-black\\\/60 {
  background: rgba(0,0,0,0.6) !important;
}
#view-dashboard .bg-black\\\/20 {
  background: rgba(0,0,0,0.2) !important;
}
#view-dashboard .border-white\\\/\[0\.15\] {
  border-color: #E5E7EB !important;
}
#view-dashboard .hover\\:scale-110:hover {
  transform: scale(1.1) !important;
}
#view-dashboard .hover\\:bg-white\\\/5:hover {
  background: #F9FAFB !important;
}
#view-dashboard .hover\\:text-white\\\/60:hover {
  color: #4B5563 !important;
}
#view-dashboard .hover\\:border-orange-500\\\/50:hover {
  border-color: #FDBA74 !important;
}
#view-dashboard .hover\\:text-orange-400:hover {
  color: #F97316 !important;
}
#view-dashboard .text-white\\\/35 {
  color: #9CA3AF !important;
}
#view-dashboard .bg-white\\\/\[0\.05\] {
  background: #F9FAFB !important;
}
#view-dashboard .border-white\\\/\[0\.06\] {
  border-color: #E5E7EB !important;
}
#view-dashboard .hover\\:bg-white\\\/\[0\.06\]:hover {
  background: #F3F4F6 !important;
}
#view-dashboard .bg-gradient-to-br.from-orange-400.to-orange-600 {
  background: linear-gradient(135deg, #FB923C, #EA580C) !important;
}
#view-dashboard .shadow-orange-500\\\/30 {
  box-shadow: 0 4px 12px -2px rgba(249,115,22,0.3) !important;
}
#view-dashboard .bg-gradient-to-br.from-orange-400.to-red-500 {
  background: linear-gradient(135deg, #FB923C, #EF4444) !important;
}
#view-dashboard .text-orange-400\\\/70 {
  color: #FB923C !important;
}
#view-dashboard .hover\\:text-red-400:hover {
  color: #EF4444 !important;
}
#view-dashboard .hover\\:bg-red-500\\\/10:hover {
  background: #FEF2F2 !important;
}

/* ---- Dynamic nav active classes (from page.tsx) ---- */
.nav-link.bg-orange-500\\\/10 {
  background: #FFF7ED !important;
}
.nav-link.text-orange-500 {
  color: #EA580C !important;
}
.nav-link.text-slate-400 {
  color: #6B7280 !important;
}

/* ---- Popular menus dynamically generated ring ---- */
#popular-menus-list .ring-1 {
  --tw-ring-color: #E5E7EB !important;
}
#popular-menus-list [class*="ring-white"] {
  --tw-ring-color: #E5E7EB !important;
}

/* ---- Modal sticky header bg override ---- */
#view-dashboard .modal-box [style*="rgba(20,18,22"] {
  background: #fff !important;
}

/* ---- Additional dynamic content overrides ---- */
#view-dashboard .text-white\\\/60 {
  color: #6B7280 !important;
}
#view-dashboard .text-slate-400 {
  color: #6B7280 !important;
}
#view-dashboard .hover\\:bg-white\\\/5:hover {
  background: #F9FAFB !important;
}
#view-dashboard .hover\\:bg-white\\\/10:hover {
  background: #F3F4F6 !important;
}
#view-dashboard .hover\\:text-white\\\/90:hover {
  color: #111827 !important;
}
#view-dashboard .hover\\:border-orange-500\\\/50:hover {
  border-color: #FDBA74 !important;
}
#view-dashboard .hover\\:text-white\\\/60:hover {
  color: #4B5563 !important;
}
#view-dashboard .ring-white\\\/10 {
  --tw-ring-color: #E5E7EB !important;
}
#view-dashboard .shadow-orange-500\\\/25 {
  box-shadow: 0 4px 12px -2px rgba(249,115,22,0.25) !important;
}
#view-dashboard .shadow-lg {
  box-shadow: 0 4px 12px -2px rgba(0,0,0,0.1) !important;
}
#view-dashboard .text-white\\\/90 {
  color: #374151 !important;
}
#view-dashboard .text-white\\\/20 {
  color: #D1D5DB !important;
}
#view-dashboard .text-white\\\/70 {
  color: #4B5563 !important;
}
`;
