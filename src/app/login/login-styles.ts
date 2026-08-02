export const loginStyles = `* { -webkit-font-smoothing: antialiased; }
    body {
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }
    .font-display {
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -0.02em;
    }
    
    /* View Transitions */
    .view {
      animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Background Orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      will-change: transform;
    }
    @keyframes float-orb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, -30px) scale(1.1); }
    }
    
    /* Grid Pattern */
    .grid-pattern-dark {
      background-image: 
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .grid-pattern-light {
      background-image: 
        linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    
    /* Shake Animation */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .shake { animation: shake 0.3s ease-in-out; }
    
    /* Password Strength */
    .strength-bar {
      height: 4px;
      border-radius: 2px;
      transition: all 0.3s ease;
      background-color: #E2E8F0;
    }`;
