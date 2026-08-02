export const dashboardStyles = `* { -webkit-font-smoothing: antialiased; }
    body { font-family: 'Inter', sans-serif; background-color: #F8FAFC; overflow-x: hidden; }
    .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    
    .page-view { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .modal-overlay { transition: opacity 0.3s ease; }
    .modal-box { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .modal-overlay.hidden { opacity: 0; pointer-events: none; }
    .modal-overlay.hidden .modal-box { transform: scale(0.9) translateY(20px); }
    
    .toggle-bg { transition: background-color 0.2s; }
    .toggle-dot { transition: transform 0.2s; }
    input:checked ~ .toggle-bg { background-color: #F97316; }
    input:checked ~ .toggle-dot { transform: translateX(20px); }
    
    .watermark-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 20; overflow: hidden; }
    .watermark-text { font-size: 2.5rem; font-weight: 800; color: rgba(255, 255, 255, 0.3); transform: rotate(-30deg); text-transform: uppercase; white-space: nowrap; text-shadow: 0 0 10px rgba(0,0,0,0.1); letter-spacing: 0.2em; }

    .nav-link.active { background-color: rgba(249, 115, 22, 0.1); color: #FB923C; }
    .mob-nav.active { color: #F97316; }
    .mob-nav.active svg { stroke: #F97316; }

    /* Drag and Drop Styles */
    .dragging { opacity: 0.5; transform: scale(0.95); }
    .drag-over { border-top: 3px solid #F97316; }`;
