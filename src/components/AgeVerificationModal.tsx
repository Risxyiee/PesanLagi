'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'is_age_verified_18';

function subscribe() {
  // localStorage has no native change event — return no-op
  return () => {};
}

function getSnapshot() {
  return true; // client-side: always return a stable value (actual check via ref below)
}

function getServerSnapshot() {
  return false; // server: treat as not mounted yet
}

export default function AgeVerificationModal() {
  // useSyncExternalStore ensures we only render client-confirmed state after hydration
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const readVerified = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
   }, []);

  // On server: render nothing (isClient === false)
  // On client: check localStorage (readVerified runs on every render, but only meaningful first time)
  if (!isClient) return null;

  const verified = readVerified();
  if (verified) return null;

  const handleConfirm = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* storage unavailable */
    }
    // Force re-render by triggering navigation to same URL
    window.location.reload();
  };

  const handleDeny = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/85 backdrop-blur-md">
      <div className="mx-4 w-full max-w-md rounded-3xl border border-amber-500/20 bg-slate-900 p-8 shadow-2xl shadow-amber-500/5">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
          <ShieldCheck className="h-10 w-10 text-slate-900" strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-2xl font-bold text-white">
          Konfirmasi Usia Pengunjung 🔞
        </h2>

        {/* Description */}
        <p className="mb-8 text-center text-sm leading-relaxed text-slate-300">
          Katalog ini berisi produk khusus dewasa (18+). Apakah Anda
          berusia 18 tahun atau lebih?
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/40 active:scale-[0.98]"
          >
            Ya, Saya 18+ Tahun
          </button>

          <button
            type="button"
            onClick={handleDeny}
            className="w-full cursor-pointer rounded-xl border border-slate-600 bg-transparent px-6 py-3.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-300 active:scale-[0.98]"
          >
            Saya Di Bawah 18 Tahun
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Dengan melanjutkan, Anda menyetujui bahwa Anda berusia 18 tahun
          atau lebih.
        </p>
      </div>
    </div>
  );
}
