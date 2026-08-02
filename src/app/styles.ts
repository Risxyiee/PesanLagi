export const styles = `:root {
      --bg: #0A0705;
      --bg-2: #14100B;
      --bg-3: #1C1410;
      --fg: #FFF7ED;
      --fg-2: #FED7AA;
      --muted: #A8A29E;
      --accent: #F97316;
      --accent-2: #EA580C;
      --accent-3: #FB923C;
      --accent-light: #FED7AA;
      --border: #2D2017;
    }
    
    * { -webkit-font-smoothing: antialiased; }
    html { scroll-behavior: smooth; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--fg);
      overflow-x: hidden;
    }
    
    .font-display {
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -0.02em;
    }
    
    /* Background orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      will-change: transform;
    }
    @keyframes orb-1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, -40px) scale(1.15); }
    }
    @keyframes orb-2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-30px, 30px) scale(0.9); }
    }
    
    /* iPhone float */
    @keyframes phone-float {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      50% { transform: translateY(-18px) rotate(-3deg); }
    }
    .phone-frame { animation: phone-float 6s ease-in-out infinite; }
    
    /* QR pulse ring */
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.7; }
      70% { transform: scale(1.3); opacity: 0; }
      100% { transform: scale(0.95); opacity: 0; }
    }
    .qr-pulse-ring { animation: pulse-ring 2.5s ease-out infinite; }
    
    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, #FDBA74 0%, #F97316 50%, #EA580C 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    /* Glass */
    .glass {
      background: rgba(20, 16, 11, 0.7);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(249, 115, 22, 0.15);
    }
    
    /* Reveal */
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    .reveal.active {
      opacity: 1;
      transform: translateY(0);
    }
    
    /* Noise texture */
    .noise {
      position: absolute;
      inset: 0;
      opacity: 0.04;
      pointer-events: none;
      mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E");
    }
    
    /* Grid pattern */
    .grid-pattern {
      background-image: 
        linear-gradient(rgba(249, 115, 22, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(249, 115, 22, 0.04) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    
    /* Button glow */
    @keyframes btn-pulse {
      0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5), 0 10px 30px -10px rgba(249, 115, 22, 0.6); }
      70% { box-shadow: 0 0 0 18px rgba(249, 115, 22, 0), 0 10px 30px -10px rgba(249, 115, 22, 0.6); }
      100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0), 0 10px 30px -10px rgba(249, 115, 22, 0.6); }
    }
    .btn-glow { animation: btn-pulse 2.5s infinite; }
    
    /* Color swatch */
    .color-swatch {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
    }
    .color-swatch.active {
      transform: scale(1.1);
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
    }
    .color-swatch:hover:not(.active) {
      transform: scale(1.08);
    }
    
    /* Template option */
    .template-option {
      transition: all 0.25s;
      cursor: pointer;
    }
    .template-option.active {
      border-color: var(--accent) !important;
      background: rgba(249, 115, 22, 0.1);
    }
    
    .qr-cell { transition: all 0.3s ease; }
    
    /* Scrollbar hide */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    .glow-orange { box-shadow: 0 0 80px -10px rgba(249, 115, 22, 0.5); }
    
    /* Card hover */
    .feature-card { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .feature-card:hover { transform: translateY(-6px); }
    
    .divider-glow {
      background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.4), transparent);
      height: 1px;
    }
    
    .counter { font-variant-numeric: tabular-nums; }
    
    /* WhatsApp pulse */
    @keyframes wa-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
      50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0); }
    }
    .wa-pulse { animation: wa-pulse 2s infinite; }
    
    /* Floating dots */
    @keyframes float-dot {
      0%, 100% { transform: translateY(0); opacity: 0.4; }
      50% { transform: translateY(-20px); opacity: 0.8; }
    }
    .float-dot { animation: float-dot 4s ease-in-out infinite; }
    
    ::selection {
      background: rgba(249, 115, 22, 0.3);
      color: #FFF7ED;
    }
    
    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 300;
    }
    .toast.show { transform: translateX(-50%) translateY(0); }
    
    /* Mobile menu */
    .mobile-menu {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease;
    }
    .mobile-menu.open { max-height: 400px; }
    
    /* Live indicator */
    @keyframes live-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .live-dot { animation: live-dot 1.5s infinite; }
    
    @media (max-width: 768px) {
      .phone-frame { transform: scale(0.85); }
    }
    
    /* === MODAL SYSTEM === */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(10, 7, 5, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .modal-box {
      background: #14100B;
      border: 1px solid rgba(249, 115, 22, 0.2);
      border-radius: 24px;
      max-width: 580px;
      width: 100%;
      max-height: 88vh;
      overflow-y: auto;
      position: relative;
      transform: scale(0.95) translateY(20px);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 25px 80px -10px rgba(0,0,0,0.6), 0 0 60px -10px rgba(249,115,22,0.15);
    }
    .modal-overlay.active .modal-box {
      transform: scale(1) translateY(0);
    }
    .modal-box::-webkit-scrollbar { width: 6px; }
    .modal-box::-webkit-scrollbar-track { background: transparent; }
    .modal-box::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.3); border-radius: 3px; }
    
    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 10;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(249,115,22,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #FED7AA;
    }
    .modal-close-btn:hover {
      background: rgba(249,115,22,0.15);
      border-color: rgba(249,115,22,0.4);
      transform: rotate(90deg);
    }
    
    /* FAQ Accordion */
    .faq-item {
      border: 1px solid rgba(249,115,22,0.12);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.3s;
      background: rgba(255,255,255,0.02);
    }
    .faq-item:hover { border-color: rgba(249,115,22,0.25); }
    .faq-item.active { border-color: rgba(249,115,22,0.4); background: rgba(249,115,22,0.04); }
    
    .faq-question {
      width: 100%;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      text-align: left;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      color: #FED7AA;
      transition: color 0.2s;
    }
    .faq-question:hover { color: #FB923C; }
    .faq-item.active .faq-question { color: #F97316; }
    
    .faq-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: rgba(249,115,22,0.1);
      transition: transform 0.3s ease, background 0.2s;
    }
    .faq-item.active .faq-icon {
      transform: rotate(45deg);
      background: rgba(249,115,22,0.25);
    }
    
    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .faq-answer-inner {
      padding: 0 18px 16px;
      font-size: 13px;
      line-height: 1.7;
      color: rgba(255,247,237,0.6);
    }
    
    /* Step connector */
    .step-connector {
      position: absolute;
      left: 27px;
      top: 56px;
      bottom: -16px;
      width: 2px;
      background: linear-gradient(180deg, rgba(249,115,22,0.4), rgba(249,115,22,0.05));
    }
    
    /* Blog card */
    .blog-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .blog-card:hover {
      transform: translateY(-4px);
    }
    .blog-card:hover .blog-img {
      transform: scale(1.05);
    }
    .blog-img {
      transition: transform 0.4s ease;
    }
    
    /* Legal text */
    .legal-section {
      margin-bottom: 20px;
    }
    .legal-section h4 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 14px;
      color: #FB923C;
      margin-bottom: 8px;
    }
    .legal-section p {
      font-size: 13px;
      line-height: 1.75;
      color: rgba(255,247,237,0.55);
    }
    
    @media (max-width: 640px) {
      .modal-box { border-radius: 20px; }
    }`;
