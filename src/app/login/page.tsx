"use client";

import { useState } from "react";
import { MessageCircle, Mail, Lock, Eye, EyeOff, ArrowRight, Send } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi login - redirect ke dashboard
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-500/5 via-white to-orange-600/5">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/pesanlagi-logo.png" alt="PesanLagi Logo" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-lg font-extrabold tracking-tight text-[#0B1220]">
              Pesan<span className="text-orange-600">Lagi</span>
            </span>
          </a>
          <a
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-[#0B1220]"
          >
            Kembali ke Beranda
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-100">
                <MessageCircle className="size-8 text-orange-600" fill="currentColor" />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0B1220]">
                Masuk ke Dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Kelola bot auto-responder AI Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#0B1220]"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 pl-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[#0B1220]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 pl-10 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-600">Ingat saya</span>
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Lupa password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="size-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Memuat...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Account */}
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs font-medium text-slate-500 mb-2">
                Akun Demo (tidak perlu password):
              </p>
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Masuk sebagai Demo User →
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <a href="#" className="font-semibold text-orange-600 hover:text-orange-700">
              Daftar sekarang
            </a>
          </p>
        </div>
      </main>

      {/* Admin Contact Info */}
      <div className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto px-5 text-center sm:px-8">
          <p className="text-xs text-slate-500 mb-3">
            Butuh bantuan? Hubungi Admin:
          </p>
          <a
            href="https://t.me/Risxyie?text=Halo%2C%20saya%20butuh%20bantuan%20login%20PesanLagi"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-600/25"
          >
            <Send className="size-4" fill="currentColor" />
            Chat Telegram Admin
          </a>
          <p className="mt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} PesanLagi. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}