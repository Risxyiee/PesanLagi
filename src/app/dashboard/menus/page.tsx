'use client';

import { useEffect } from 'react';

export default function MenusRedirect() {
  useEffect(() => {
    window.location.href = '/#dashboard';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Memuat menu...</p>
      </div>
    </div>
  );
}
