"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Lock, User, ArrowLeft, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, loading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsSubmitting(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan");
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(formData.email, formData.password);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    // If email verification is required
    if (result.requireEmailVerification) {
      setError("");
      // Will redirect on auth state change
    }
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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0B1220] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Signup Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-100">
                <MessageCircle className="size-8 text-orange-600" fill="currentColor" />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0B1220]">
                Daftar Akun Baru
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Mulai gunakan PesanLagi gratis untuk bisnis Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#0B1220]"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 pl-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 pl-10 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">Minimal 6 karakter</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-[#0B1220]"
                >
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 pl-10 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-600">
                  Saya setuju dengan{" "}
                  <a href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                    Syarat & Ketentuan
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || loading ? (
                  <>
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24">
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
                    Mendaftar...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-slate-600">
              Sudah punya akun?{" "}
              <a href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
                Masuk
              </a>
            </p>
          </div>

          {/* Admin Contact */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 mb-3">Butuh bantuan?</p>
            <a
              href="https://t.me/Risxyie?text=Halo%2C%20saya%20ingin%20mendaftar%20PesanLagi"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Hubungi Admin Telegram
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto px-5 text-center sm:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} PesanLagi. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}