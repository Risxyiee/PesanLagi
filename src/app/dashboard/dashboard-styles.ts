export const dashboardStyles = `
/* ============================================
   PesanLagi Dashboard — Dark Glassmorphism
   ============================================ */

/* ---- Root & Base ---- */
#view-dashboard {
  background: #050505;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.font-display {
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: -0.02em;
}

/* ---- Scrollbar ---- */
#view-dashboard ::-webkit-scrollbar { width: 5px; height: 5px; }
#view-dashboard ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 99px; }
#view-dashboard ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }
#view-dashboard ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* ---- Page View Animation ---- */
.page-view {
  animation: dashFadeIn 600ms cubic-bezier(0.32,0.72,0,1) forwards;
}
@keyframes dashFadeIn {
  from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

/* ---- Global Transition ---- */
#view-dashboard *,
#view-dashboard *::before,
#view-dashboard *::after {
  transition-property: color, background-color, border-color, box-shadow, opacity, transform;
  transition-duration: 500ms;
  transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}
#view-dashboard input,
#view-dashboard textarea,
#view-dashboard select,
#view-dashboard button {
  transition-property: color, background-color, border-color, box-shadow, opacity, transform;
  transition-duration: 500ms;
  transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
}

/* ============================================
   Glass Primitives
   ============================================ */
.glass-panel {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 1rem;
}
.glass-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 1.5rem;
  padding: 0.375rem;
}
.glass-card > .glass-card-inner {
  background: rgba(255,255,255,0.04);
  border-radius: calc(1.5rem - 0.375rem);
}

/* ============================================
   Sidebar (Desktop)
   ============================================ */
#view-dashboard aside {
  background: #080608 !important;
  border-right: 1px solid rgba(255,255,255,0.04) !important;
}

/* ---- Nav Links ---- */
.nav-link {
  position: relative;
  border-radius: 0.75rem !important;
  color: rgba(255,255,255,0.5) !important;
}
.nav-link:hover {
  background: rgba(255,255,255,0.05) !important;
  color: rgba(255,255,255,0.9) !important;
}
.nav-link.active {
  background: rgba(249,115,22,0.15) !important;
  color: #fb923c !important;
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
  background: #F97316;
  box-shadow: 0 0 12px rgba(249,115,22,0.6);
}

/* ---- Mobile Nav ---- */
.mob-nav {
  color: rgba(255,255,255,0.35) !important;
  transition: all 500ms cubic-bezier(0.32,0.72,0,1);
}
.mob-nav.active {
  color: #F97316 !important;
}
.mob-nav.active svg {
  stroke: #F97316;
  filter: drop-shadow(0 0 6px rgba(249,115,22,0.5));
}
.mob-nav {
  -webkit-tap-highlight-color: transparent;
}

/* ============================================
   Bottom Nav (Mobile)
   ============================================ */
#view-dashboard nav[class*="fixed bottom"] {
  background: rgba(8,6,8,0.82) !important;
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border-top: 1px solid rgba(255,255,255,0.06) !important;
}

/* ============================================
   Glass Buttons
   ============================================ */
.btn-glass {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
  border-radius: 0.75rem;
}
.btn-glass:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.btn-primary {
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 24px -4px rgba(249,115,22,0.4);
}
.btn-primary:hover {
  box-shadow: 0 8px 32px -4px rgba(249,115,22,0.6);
  filter: brightness(1.1);
}

/* ---- Glow Orange ---- */
.glow-orange {
  box-shadow: 0 0 40px -10px rgba(249,115,22,0.35), 0 0 80px -20px rgba(249,115,22,0.15);
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
  background: rgba(255,255,255,0.06) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: #fff !important;
  border-radius: 0.75rem !important;
  outline: none;
}
#view-dashboard input:focus,
#view-dashboard textarea:focus,
#view-dashboard select:focus {
  border-color: rgba(249,115,22,0.5) !important;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
}
#view-dashboard input::placeholder,
#view-dashboard textarea::placeholder {
  color: rgba(255,255,255,0.25);
}
#view-dashboard select option {
  background: #111;
  color: #fff;
}
#view-dashboard input[type="color"] {
  background: transparent !important;
  border: none !important;
}

/* ============================================
   Modal Overlays
   ============================================ */
.modal-overlay {
  background: rgba(0,0,0,0.6) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  transition: opacity 0.3s ease;
}
.modal-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}
.modal-box {
  background: rgba(20,18,22,0.95) !important;
  backdrop-filter: blur(40px) !important;
  -webkit-backdrop-filter: blur(40px) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 1.25rem !important;
  box-shadow: 0 24px 80px -12px rgba(0,0,0,0.6);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}
.modal-overlay.hidden .modal-box {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

/* ============================================
   Toggle Switches
   ============================================ */
.toggle-bg {
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.1);
  position: relative;
  transition: background-color 500ms cubic-bezier(0.32,0.72,0,1);
}
.toggle-dot {
  position: absolute;
  left: 0.25rem;
  top: 0.25rem;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: rgba(255,255,255,0.6);
  transition: transform 500ms cubic-bezier(0.32,0.72,0,1), background-color 500ms;
}
input:checked ~ .toggle-bg {
  background: #F97316;
  box-shadow: 0 0 12px rgba(249,115,22,0.4);
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
 ring: 2px solid rgba(249,115,22,0.5);
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
  background: rgba(20,18,22,0.92) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 0.75rem !important;
}

/* ============================================
   CSS Overrides for Dynamically Generated Content
   (page.tsx injects light-themed HTML — override to dark)
   ============================================ */

/* ---- Overview: Stat Cards ---- */
#page-overview .bg-white,
#page-settings .bg-white,
#page-menus .bg-white,
#page-designer .bg-white,
#page-billing .bg-white {
  background: rgba(255,255,255,0.04) !important;
  border-color: rgba(255,255,255,0.06) !important;
  box-shadow: none !important;
}

/* ---- Cards with border-slate-100 ---- */
#view-dashboard .border-slate-100 {
  border-color: rgba(255,255,255,0.06) !important;
}
#view-dashboard .border-slate-200 {
  border-color: rgba(255,255,255,0.08) !important;
}

/* ---- Backgrounds ---- */
#view-dashboard .bg-slate-50 {
  background: rgba(255,255,255,0.04) !important;
}
#view-dashboard .bg-slate-100 {
  background: rgba(255,255,255,0.06) !important;
}

/* ---- Text Colors ---- */
#view-dashboard .text-slate-800 {
  color: #fff !important;
}
#view-dashboard .text-slate-700 {
  color: rgba(255,255,255,0.85) !important;
}
#view-dashboard .text-slate-600 {
  color: rgba(255,255,255,0.6) !important;
}
#view-dashboard .text-slate-500 {
  color: rgba(255,255,255,0.4) !important;
}
#view-dashboard .text-slate-400 {
  color: rgba(255,255,255,0.35) !important;
}
#view-dashboard .text-slate-300 {
  color: rgba(255,255,255,0.3) !important;
}

/* ---- Shadows ---- */
#view-dashboard .shadow-sm {
  box-shadow: none !important;
}

/* ---- Hover States ---- */
#view-dashboard .hover\\:bg-slate-50:hover {
  background: rgba(255,255,255,0.06) !important;
}
#view-dashboard .hover\\:bg-white:hover {
  background: rgba(255,255,255,0.08) !important;
}

/* ---- Orange backgrounds (keep but adjust for dark) ---- */
#view-dashboard .bg-orange-50 {
  background: rgba(249,115,22,0.1) !important;
}
#view-dashboard .border-orange-200 {
  border-color: rgba(249,115,22,0.3) !important;
}
#view-dashboard .bg-orange-100 {
  background: rgba(249,115,22,0.15) !important;
}
#view-dashboard .hover\\:bg-orange-50:hover {
  background: rgba(249,115,22,0.15) !important;
}

/* ---- Red backgrounds ---- */
#view-dashboard .bg-red-50 {
  background: rgba(239,68,68,0.1) !important;
}
#view-dashboard .border-red-100 {
  border-color: rgba(239,68,68,0.2) !important;
}
#view-dashboard .hover\\:bg-red-50:hover {
  background: rgba(239,68,68,0.15) !important;
}

/* ---- Green checkmarks ---- */
#view-dashboard .bg-green-50 {
  background: rgba(34,197,94,0.1) !important;
}
#view-dashboard .hover\\:bg-slate-50:hover {
  background: rgba(255,255,255,0.06) !important;
}

/* ---- Blue ---- */
#view-dashboard .bg-blue-50 {
  background: rgba(59,130,246,0.1) !important;
}

/* ---- Chart bars (dynamically generated) ---- */
#scan-chart-container .bg-orange-100 {
  background: rgba(249,115,22,0.25) !important;
  border-radius: 0.375rem 0.375rem 0 0;
}
#scan-chart-container .hover\\:bg-orange-200:hover {
  background: rgba(249,115,22,0.4) !important;
}

/* ---- Category Pills (dynamically generated) ---- */
.cat-pill {
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}
.cat-pill.bg-white {
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.6) !important;
 border: 1px solid rgba(255,255,255,0.08);
}
.cat-pill.bg-white:hover {
  background: rgba(255,255,255,0.1) !important;
  color: rgba(255,255,255,0.8) !important;
}
.cat-pill.bg-orange-500 {
  background: #F97316 !important;
  color: #fff !important;
  box-shadow: 0 4px 16px -4px rgba(249,115,22,0.5);
}

/* ---- Menu Grid Cards (dynamically generated) ---- */
#menu-grid > div {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  border-radius: 1rem !important;
  box-shadow: none !important;
  overflow: hidden;
}
#menu-grid .text-slate-800 {
  color: #fff !important;
}
#menu-grid .text-slate-500 {
  color: rgba(255,255,255,0.4) !important;
}
#menu-grid .text-orange-600 {
  color: #fb923c !important;
}
#menu-grid button {
  background: rgba(255,255,255,0.06) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: rgba(255,255,255,0.7) !important;
  border-radius: 0.5rem !important;
}
#menu-grid button:hover {
  background: rgba(255,255,255,0.1) !important;
}
#menu-grid .text-red-500,
#menu-grid button.text-red-500 {
  color: #f87171 !important;
}

/* ---- Empty State (dynamically generated) ---- */
#menu-grid .border-dashed {
  border-color: rgba(255,255,255,0.1) !important;
}
#menu-grid .bg-white.border-dashed {
  background: rgba(255,255,255,0.02) !important;
}
#menu-grid .text-slate-300 {
  color: rgba(255,255,255,0.3) !important;
}
#menu-grid .text-slate-700 {
  color: rgba(255,255,255,0.7) !important;
}

/* ---- Popular Menus (dynamically generated) ---- */
#popular-menus-list .text-slate-800 {
  color: #fff !important;
}
#popular-menus-list .text-slate-400 {
  color: rgba(255,255,255,0.4) !important;
}
#popular-menus-list .text-orange-500 {
  color: #F97316 !important;
}

/* ---- Dashed border for category add button ---- */
.border-dashed {
  border-style: dashed !important;
}

/* ---- Mobile Header ---- */
#view-dashboard header.md\\:hidden {
  background: rgba(8,6,8,0.9) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid rgba(255,255,255,0.04) !important;
}

/* ---- No Scrollbar Utility ---- */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* ---- Billing border highlight ---- */
.border-orange-500 {
  border-color: #F97316 !important;
  box-shadow: 0 0 24px -8px rgba(249,115,22,0.3);
}

/* ---- Stat Card Icons ---- */
.stat-icon {
  background: rgba(255,255,255,0.06) !important;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- Preset button active ring ---- */
.preset-btn {
  transition: all 500ms cubic-bezier(0.32,0.72,0,1);
}
.preset-btn:hover .aspect-square {
  border-color: rgba(249,115,22,0.5) !important;
  box-shadow: 0 0 20px -4px rgba(249,115,22,0.3);
}

/* ---- Color Swatch Buttons ---- */
#view-dashboard .border-slate-200[style] {
  border-color: rgba(255,255,255,0.15) !important;
}

/* ---- QR Card Preview Area ---- */
#view-dashboard .bg-slate-100:has(#qr-card) {
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.04) !important;
  border-radius: 1rem !important;
}

/* ---- Settings Form Labels ---- */
#view-dashboard label {
  color: rgba(255,255,255,0.6);
}

/* ---- Amber/Warning pro badge ---- */
#view-dashboard .bg-amber-50 {
  background: rgba(245,158,11,0.1) !important;
}
#view-dashboard .border-amber-100 {
  border-color: rgba(245,158,11,0.2) !important;
}
#view-dashboard .text-amber-600 {
  color: #fbbf24 !important;
}

/* ---- File input hidden ---- */
.hidden { display: none !important; }

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
  box-shadow: 0 8px 32px -4px rgba(249,115,22,0.5);
  z-index: 25;
  border: none;
  cursor: pointer;
  transition: all 500ms cubic-bezier(0.32,0.72,0,1);
}
.fab-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 40px -4px rgba(249,115,22,0.7);
}
.fab-btn:active {
  transform: scale(0.95);
}
@media (min-width: 768px) {
  .fab-btn { display: none; }
}
`;
