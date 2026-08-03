'use client';

import { useEffect } from 'react';

export default function AuthCallbackPage() {
  useEffect(() => {
    // This page is no longer the OAuth callback target.
    // Server-side /api/auth/callback handles Google OAuth now.
    // Redirect to login as fallback.
    window.location.href = '/#login';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Mengalihkan...</p>
      </div>
    </div>
  );
}
