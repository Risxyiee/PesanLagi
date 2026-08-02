"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import loginBodyHtml from "./login-html.json";
import { loginStyles } from "./login-styles";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signUp, signIn, signInWithGoogle } = useAuth();

  useEffect(() => {
    // === Toast ===
    function showToast(message: string) {
      const toast = document.getElementById('toast');
      const msg = document.getElementById('toast-message');
      if (toast && msg) {
        (msg as HTMLElement).textContent = message;
        (toast as HTMLElement).style.opacity = '1';
        setTimeout(() => { (toast as HTMLElement).style.opacity = '0'; }, 3000);
      }
    }

    // === Toggle Password ===
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

    // === Set Loading ===
    function setLoading(btnId: string, isLoading: boolean, loadingText: string) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      const textSpan = btn.querySelector('.btn-text') as HTMLElement;
      if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = textSpan.textContent || '';
        btn.classList.add('opacity-90', 'cursor-not-allowed');
        btn.classList.remove('hover:-translate-y-0.5');
        textSpan.innerHTML = `
          <svg class="animate-spin inline-block w-5 h-5 mr-2 -mt-1" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ${loadingText}
        `;
      } else {
        btn.disabled = false;
        btn.classList.remove('opacity-90', 'cursor-not-allowed');
        btn.classList.add('hover:-translate-y-0.5');
        textSpan.textContent = btn.dataset.originalText || '';
      }
    }

    // === Show Error ===
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

    // === Switch View ===
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

    // === Show Success ===
    function showSuccess(title: string, message: string) {
      switchView('success');
      const titleEl = document.getElementById('success-title');
      const msgEl = document.getElementById('success-msg');
      const bar = document.getElementById('success-bar');
      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;
      if (bar) {
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = '100%'; }, 100);
      }
    }

    // === Check Password Strength ===
    function checkPasswordStrength() {
      const pwd = (document.getElementById('register-password') as HTMLInputElement)?.value || '';
      const bars = [
        document.getElementById('strength-1'),
        document.getElementById('strength-2'),
        document.getElementById('strength-3'),
        document.getElementById('strength-4')
      ];
      const text = document.getElementById('strength-text');

      let strength = 0;
      if (pwd.length >= 6) strength++;
      if (pwd.length >= 10) strength++;
      if (/[A-Z]/.test(pwd)) strength++;
      if (/[0-9]/.test(pwd)) strength++;

      bars.forEach((bar) => {
        if (bar) bar.style.backgroundColor = '#E2E8F0';
      });

      if (!text) return;

      if (pwd.length === 0) {
        text.textContent = 'Gunakan minimal 6 karakter';
        text.className = 'text-xs text-slate-400 mt-1.5';
      } else if (strength <= 1) {
        if (bars[0]) bars[0].style.backgroundColor = '#EF4444';
        text.textContent = 'Lemah';
        text.className = 'text-xs text-red-500 mt-1.5';
      } else if (strength <= 2) {
        if (bars[0]) bars[0].style.backgroundColor = '#F59E0B';
        if (bars[1]) bars[1].style.backgroundColor = '#F59E0B';
        text.textContent = 'Cukup';
        text.className = 'text-xs text-yellow-500 mt-1.5';
      } else if (strength === 3) {
        if (bars[0]) bars[0].style.backgroundColor = '#10B981';
        if (bars[1]) bars[1].style.backgroundColor = '#10B981';
        if (bars[2]) bars[2].style.backgroundColor = '#10B981';
        text.textContent = 'Kuat';
        text.className = 'text-xs text-green-500 mt-1.5';
      } else {
        bars.forEach(b => { if (b) b.style.backgroundColor = '#10B981'; });
        text.textContent = 'Sangat Kuat';
        text.className = 'text-xs text-green-500 mt-1.5';
      }
    }

    // === Google Auth (real) ===
    function googleAuth() {
      signInWithGoogle();
    }

    // Make functions global for inline onclick handlers
    (window as any).showToast = showToast;
    (window as any).togglePassword = togglePassword;
    (window as any).switchView = switchView;
    (window as any).checkPasswordStrength = checkPasswordStrength;
    (window as any).googleAuth = googleAuth;

    // === Login Form ===
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('login-email') as HTMLInputElement)?.value;
      const password = (document.getElementById('login-password') as HTMLInputElement)?.value;

      if (!email || !password) {
        showError('login', 'Email dan password tidak boleh kosong.');
        return;
      }

      setLoading('login-btn', true, 'Memproses...');
      const result = await signIn(email, password);
      setLoading('login-btn', false);

      if (result.error) {
        showError('login', result.error);
      } else {
        showSuccess('Login Berhasil!', 'Mengarahkan ke dashboard...');
      }
    });

    // === Register Form ===
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('register-email') as HTMLInputElement)?.value;
      const password = (document.getElementById('register-password') as HTMLInputElement)?.value;
      const confirm = (document.getElementById('register-confirm') as HTMLInputElement)?.value;
      const terms = (document.getElementById('register-terms') as HTMLInputElement)?.checked;

      if (!email || !password || !confirm) {
        showError('register', 'Semua field wajib diisi.');
        return;
      }
      if (password.length < 6) {
        showError('register', 'Password minimal harus 6 karakter.');
        return;
      }
      if (password !== confirm) {
        showError('register', 'Password dan konfirmasi password tidak cocok.');
        return;
      }
      if (!terms) {
        showError('register', 'Anda harus menyetujui Syarat & Ketentuan.');
        return;
      }

      setLoading('register-btn', true, 'Mendaftarkan Warungmu...');
      const result = await signUp(email, password);
      setLoading('register-btn', false);

      if (result.error) {
        showError('register', result.error);
      } else if (result.requireEmailVerification) {
        showSuccess('Cek Email Kamu!', 'Kode verifikasi telah dikirim ke email kamu.');
      } else {
        showSuccess('Pendaftaran Berhasil!', 'Mengarahkan ke dashboard...');
      }
    });

    // === Hash Change ===
    function handleHashChange() {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'register') switchView('register');
      else if (hash === 'login' || hash === '') switchView('login');
    }

    // Check for auth callback params
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      showToast('Login berhasil! Selamat datang.');
      window.history.replaceState({}, '', '/login');
    }
    if (params.get('error')) {
      showError('login', params.get('error') || 'Autentikasi gagal');
      window.history.replaceState({}, '', '/login');
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  }, [signUp, signIn, signInWithGoogle]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: loginStyles }} />
      <div ref={containerRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: loginBodyHtml }} />
    </>
  );
}
