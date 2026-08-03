'use client';

import { useEffect, useState } from 'react';
import { insforgeClient } from '@/lib/insforge-client';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleCallback() {
      try {
        // Wait for the InsForge SDK to auto-detect and exchange insforge_code
        // The SDK's detectAuthCallback() runs on initialization
        await insforgeClient.auth.authCallbackHandled;

        // Small delay to ensure session is saved
        await new Promise(r => setTimeout(r, 500));

        const session = insforgeClient.auth.getSession();
        if (!session?.user?.email) {
          setStatus('error');
          setErrorMsg('Tidak bisa mendapatkan data user dari Google.');
          return;
        }

        // Sync: create our own session cookie via our API
        const res = await fetch('/api/auth/google-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email }),
        });

        if (res.ok) {
          window.location.href = '/dashboard';
        } else {
          const data = await res.json();
          setStatus('error');
          setErrorMsg(data.error || 'Gagal menyinkronkan sesi.');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setErrorMsg(err.message || 'Terjadi kesalahan saat login Google.');
      }
    }

    // Check for error param from InsForge
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setStatus('error');
      setErrorMsg(decodeURIComponent(params.get('error') || 'Autentikasi Google gagal'));
      return;
    }

    handleCallback();
  }, []);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-premium max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Login Gagal</h2>
          <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>
          <a href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
            Coba Lagi
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Menghubungkan akun Google...</p>
      </div>
    </div>
  );
}
