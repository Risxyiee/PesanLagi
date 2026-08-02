export const loginStyles = `* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    overflow-x: hidden;
  }
  .font-display {
    font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }

  /* View Transitions */
  .view {
    animation: fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Shake Animation */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .shake { animation: shake 0.3s ease-in-out; }

  /* Password Strength Bars */
  .strength-bar {
    height: 3px;
    border-radius: 2px;
    transition: all 0.3s ease;
    background-color: #E7E5E4;
  }

  /* Button hover lift */
  button[type="submit"]:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px -4px rgba(249,115,22,0.6);
  }
  button[type="submit"]:active {
    transform: translateY(0);
  }

  /* Input focus glow */
  input:focus {
    box-shadow: 0 0 0 4px rgba(251,146,60,0.1);
  }

  /* Smooth checkbox */
  input[type="checkbox"] {
    accent-color: #F97316;
  }

  /* Custom scrollbar for card if needed */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 2px; }
`;