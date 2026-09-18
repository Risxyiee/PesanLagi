"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim link reset password");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
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
          {!success ? (
            <>
              {/* Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                <div className="text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-100">
                    <Mail className="size-8 text-orange-600" />
                  </div>
                  <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0B1220]">
                    Lupa Password?
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Masukkan email Anda untuk menerima link reset password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-[#0B1220]"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
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
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Link Reset"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                  Ingat password?{" "}
                  <a href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
                    Masuk
                  </a>
                </div>
              </div>

              {/* Admin Contact */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500 mb-3">Masih ada masalah?</p>
                <a
                  href="https://t.me/Risxyie?text=Halo%2C%20saya%20butuh%20bantuan%20reset%20password%20PesanLagi"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  Hubungi Admin Telegram
                </a>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="size-8 text-green-600" />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0B1220]">
                Link Terkirim!
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Jika email terdaftar, link reset password telah dikirim ke{" "}
                <span className="font-semibold text-slate-700">{email}</span>
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Link akan kedaluwarsa dalam 1 jam
              </p>

              <div className="mt-6 space-y-3">
                <a
                  href="/login"
                  className="block w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-600/25"
                >
                  Kembali ke Login
                </a>
                <button
                  onClick={() => setSuccess(false)}
                  className="block w-full rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
                >
                  Coba Email Lain
                </button>
              </div>
            </div>
          )}
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