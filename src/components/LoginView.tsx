"use client";

import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Store,
  X,
  CheckCircle2,
} from "lucide-react";
import s from "./LoginView.module.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LoginViewProps {
  onNavigate: (hash: string) => void;
  initialTab?: "login" | "register";
  errorParam?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LoginView({
  onNavigate,
  initialTab = "login",
  errorParam,
}: LoginViewProps) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [isMounted, setIsMounted] = useState(false);

  // Derived from props — no effect needed
  const loginErrorInit = typeof window !== 'undefined' && errorParam
    ? decodeURIComponent(errorParam)
    : '';
  const [loginError, setLoginError] = useState(loginErrorInit);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regTerms, setRegTerms] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  // pwdStrength is derived via IIFE below

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Success state
  const [successTitle, setSuccessTitle] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  /* ---- Mount / auth check ---- */
  useEffect(() => {
    // If user just logged out, do NOT auto-redirect to dashboard.
    // Clear the flag so subsequent page loads work normally.
    if (sessionStorage.getItem('pl_just_logged_out') === '1') {
      sessionStorage.removeItem('pl_just_logged_out');
      const id = requestAnimationFrame(() => setIsMounted(true));
      return () => cancelAnimationFrame(id);
    }

    // Check if already logged in
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) onNavigate("#dashboard");
      })
      .catch(() => {});
    // Deferred to avoid synchronous setState in effect
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- Hash change → switch tab ---- */
  useEffect(() => {
    const handler = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "register") setTab("register");
      else if (h === "login") setTab("login");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  /* ---- Password strength (derived) ---- */
  const pwdStrength = (() => {
    let score = 0;
    if (regPwd.length >= 6) score++;
    if (regPwd.length >= 10) score++;
    if (/[A-Z]/.test(regPwd)) score++;
    if (/[0-9]/.test(regPwd)) score++;
    if (!regPwd.length) return { score: 0, label: "", color: "" };
    if (score <= 1) return { score, label: "Lemah", color: "#EF4444" };
    if (score <= 2) return { score, label: "Cukup", color: "#F59E0B" };
    if (score === 3) return { score, label: "Kuat", color: "#10B981" };
    return { score, label: "Sangat Kuat", color: "#10B981" };
  })();

  /* ---- Handlers ---- */
  const switchTab = useCallback((t: "login" | "register") => {
    setTab(t);
    setLoginError("");
    setRegError("");
    window.location.hash = t;
  }, []);

  const handleLogin = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoginError("");
      if (!loginEmail || !loginPwd) {
        setLoginError("Email dan password tidak boleh kosong.");
        return;
      }
      setLoginLoading(true);
      try {
        const res = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, password: loginPwd }),
        });
        const data = await res.json();
        if (!res.ok) {
          setLoginError(data.error || "Login gagal");
        } else {
          setSuccessTitle("Login Berhasil!");
          setSuccessMsg("Mengarahkan ke dashboard...");
          setShowSuccess(true);
          setTimeout(() => onNavigate("#dashboard"), 400);
        }
      } catch {
        setLoginError("Terjadi kesalahan jaringan.");
      }
      setLoginLoading(false);
    },
    [loginEmail, loginPwd, onNavigate]
  );

  const handleRegister = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setRegError("");
      if (!regName || !regEmail || !regPwd) {
        setRegError("Semua field wajib diisi.");
        return;
      }
      if (regPwd.length < 6) {
        setRegError("Password minimal harus 6 karakter.");
        return;
      }
      if (!regTerms) {
        setRegError("Anda harus menyetujui Syarat & Ketentuan.");
        return;
      }
      setRegLoading(true);
      try {
        const res = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: regName, email: regEmail, password: regPwd }),
        });
        const data = await res.json();
        if (!res.ok) {
          setRegError(data.error || "Daftar gagal");
        } else if (data.requireEmailVerification) {
          setSuccessTitle("Cek Email Kamu!");
          setSuccessMsg("Kode verifikasi dikirim ke email kamu.");
          setShowSuccess(true);
        } else {
          setSuccessTitle("Pendaftaran Berhasil!");
          setSuccessMsg("Mengarahkan ke dashboard...");
          setShowSuccess(true);
          setTimeout(() => onNavigate("#dashboard"), 400);
        }
      } catch {
        setRegError("Terjadi kesalahan jaringan.");
      }
      setRegLoading(false);
    },
    [regName, regEmail, regPwd, regTerms, onNavigate]
  );

  const handleForgot = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    if (!forgotEmail) {
      setForgotError("Email tidak boleh kosong.");
      return;
    }
    setForgotLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSuccess(
        "Jika email terdaftar, link reset password telah dikirim."
      );
    } catch {
      setForgotError("Terjadi kesalahan jaringan.");
    }
    setForgotLoading(false);
  }, [forgotEmail]);

  /* ---- Hydration guard ---- */
  if (!isMounted) {
    return (
      <div
        className={s.loginView}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
        }}
      >
        <div className={s.spinner} />
      </div>
    );
  }

  /* ---- Footer text ---- */
  const footerText =
    tab === "login" ? (
      <>
        Belum punya akun?{" "}
        <button
          type="button"
          className={s.footerLink}
          onClick={() => switchTab("register")}
          style={{
            fontWeight: 600,
            color: "#D97706",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginLeft: 4,
            fontSize: "inherit",
          }}
        >
          Daftar gratis
        </button>
      </>
    ) : (
      <>
        Sudah punya akun?{" "}
        <button
          type="button"
          className={s.footerLink}
          onClick={() => switchTab("login")}
          style={{
            fontWeight: 600,
            color: "#D97706",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginLeft: 4,
            fontSize: "inherit",
          }}
        >
          Masuk
        </button>
      </>
    );

  /* ---- Success View ---- */
  if (showSuccess) {
    return (
      <div className={s.loginView}>
        <div className={s.gridBg} />
        <div className={s.blob1} />
        <div className={s.blob2} />
        <div className={s.blob3} />
        <main
          style={{
            position: "relative",
            zIndex: 10,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <div
            className={s.successView}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              border: "1px solid #F1F5F9",
              borderRadius: 16,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.12)",
              padding: "48px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <CheckCircle2
                size={32}
                style={{ color: "#D97706" }}
                strokeWidth={2}
              />
            </div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              {successTitle}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              {successMsg}
            </p>
            <div
              style={{
                marginTop: 24,
                height: 4,
                borderRadius: 99,
                background: "#F1F5F9",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background:
                    "linear-gradient(90deg, #FBBF24, #F59E0B, #D97706)",
                  animation: "progressFill 1.2s ease forwards",
                }}
              />
            </div>
            <style>{`@keyframes progressFill { from { width: 0; } to { width: 100%; } }`}</style>
          </div>
        </main>
      </div>
    );
  }

  /* ---- Main Auth View ---- */
  return (
    <div className={s.loginView}>
      {/* Background effects */}
      <div className={s.gridBg} />
      <div className={`${s.blob} ${s.blob1}`} />
      <div className={`${s.blob} ${s.blob2}`} />
      <div className={`${s.blob} ${s.blob3}`} />

      <main
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div
          className={s.authCard}
          style={{
            width: "100%",
            maxWidth: 448,
            background: "#fff",
            border: "1px solid #F1F5F9",
            borderRadius: 16,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08), 0 8px 20px -4px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "32px 24px",
              }}
            >
            {/* ---- Logo ---- */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 28,
              }}
            >
              <img src="/pesanlagi-logo.png" alt="PesanLagi" style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'contain' }} />
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "#0F172A",
                }}
              >
                Pesan<span style={{ color: "#F59E0B" }}>Lagi</span>
              </span>
            </div>

            {/* ---- Tab Switcher ---- */}
            <div
              style={{
                position: "relative",
                display: "flex",
                padding: 6,
                marginBottom: 28,
                background: "rgba(241,245,249,0.8)",
                borderRadius: 16,
              }}
              role="tablist"
            >
              <div
                className={`${s.tabIndicator} ${tab === "register" ? s.right : ""}`}
              />
              <button
                type="button"
                role="tab"
                aria-selected={tab === "login"}
                className={s.tabBtn}
                onClick={() => switchTab("login")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: tab === "login" ? "#fff" : "#64748B",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Masuk
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "register"}
                className={s.tabBtn}
                onClick={() => switchTab("register")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: tab === "register" ? "#fff" : "#64748B",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Daftar
              </button>
            </div>

            {/* ---- Form Stack ---- */}
            <div className={s.formStack}>
              {/* ========== LOGIN PANEL ========== */}
              <form
                onSubmit={handleLogin}
                noValidate
                autoComplete="on"
                className={`${s.panel} ${tab !== "login" ? s.panelHidden : ""}`}
                {...(tab !== "login" ? { "aria-hidden": true } : {})}
              >
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 24,
                  }}
                >
                  <h1
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#0F172A",
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Selamat Datang Kembali{" "}
                    <span className={s.waveEmoji}>👋</span>
                  </h1>
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#64748B",
                    }}
                  >
                    Masuk untuk mengelola menu digital warungmu
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Email */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: 6,
                        marginLeft: 4,
                      }}
                    >
                      Email Pemilik Warung
                    </label>
                    <div
                      className={s.inputWrap}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                      }}
                    >
                      <Mail
                        className={s.inputIcon}
                      size={18}
                      style={{
                        color: "#94A3B8",
                        transition: "color 0.25s ease",
                        flexShrink: 0,
                      }}
                    />
                      <input
                        type="email"
                        placeholder="kamu@warung.com"
                        value={loginEmail}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setLoginEmail(e.target.value)
                        }
                        style={{
                          flex: 1,
                          background: "transparent",
                          fontSize: 14,
                          color: "#0F172A",
                          border: "none",
                          outline: "none",
                          minWidth: 0,
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: 6,
                        marginLeft: 4,
                      }}
                    >
                      Kata Sandi
                    </label>
                    <div
                      className={s.inputWrap}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                      }}
                    >
                      <Lock
                        className={s.inputIcon}
                      size={18}
                      style={{
                        color: "#94A3B8",
                        transition: "color 0.25s ease",
                        flexShrink: 0,
                      }}
                      />
                      <input
                        type={showLoginPwd ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPwd}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setLoginPwd(e.target.value)
                        }
                        style={{
                          flex: 1,
                          background: "transparent",
                          fontSize: 14,
                          color: "#0F172A",
                          border: "none",
                          outline: "none",
                          minWidth: 0,
                        }}
                      />
                      <button
                        type="button"
                        className={s.eyeBtn}
                        onClick={() => setShowLoginPwd((v) => !v)}
                        aria-label={
                          showLoginPwd
                            ? "Sembunyikan kata sandi"
                            : "Tampilkan kata sandi"
                        }
                        style={{
                          color: "#94A3B8",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                        }}
                      >
                        {showLoginPwd ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {loginError && (
                  <div
                    className={s.errorShake}
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: 12,
                      fontSize: 13,
                      color: "#DC2626",
                    }}
                  >
                    {loginError}
                  </div>
                )}

                {/* Remember me & Forgot */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 12,
                    marginBottom: 20,
                    fontSize: 12,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      color: "#475569",
                      fontWeight: 500,
                      userSelect: "none",
                    }}
                  >
                    <input type="checkbox" className={s.customCheckbox} />
                    Ingat saya
                  </label>
                  <button
                    type="button"
                    className={s.inlineLink}
                    onClick={() => setShowForgot(true)}
                    style={{
                      fontWeight: 600,
                      color: "#D97706",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: 12,
                    }}
                  >
                    Lupa Password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className={s.ctaBtn}
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    cursor: loginLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 8px 20px rgba(245,158,11,0.3)",
                    opacity: loginLoading ? 0.8 : 1,
                  }}
                >
                  {loginLoading ? (
                    <>
                      <span className={s.spinner} />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* SSL Badge */}
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#94A3B8",
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Login dilindungi enkripsi SSL</span>
                </div>
              </form>

              {/* ========== REGISTER PANEL ========== */}
              <form
                onSubmit={handleRegister}
                noValidate
                autoComplete="on"
                className={`${s.panel} ${tab !== "register" ? s.panelHidden : ""}`}
                style={{
                  ...(tab !== "register" ? {} : {}),
                }}
                {...(tab !== "register" ? { "aria-hidden": true } : {})}
              >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <h1
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#0F172A",
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Mulai Buat Menu Digital{" "}
                    <span style={{ display: "inline-block", fontSize: 22 }}>
                      Warungmu{" "}
                    </span>
                    <span className={s.rocketEmoji}>🚀</span>
                  </h1>
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: "#64748B",
                    }}
                  >
                    Daftar gratis, tanpa biaya berlangganan
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Store Name */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: 6,
                        marginLeft: 4,
                      }}
                    >
                      Nama Warung / UMKM
                    </label>
                    <div
                      className={s.inputWrap}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                      }}
                    >
                      <Store
                        className={s.inputIcon}
                      size={18}
                      style={{
                        color: "#94A3B8",
                        transition: "color 0.25s ease",
                        flexShrink: 0,
                      }}
                      />
                      <input
                        type="text"
                        placeholder="Warung Bu Tini"
                        value={regName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setRegName(e.target.value)
                        }
                        style={{
                          flex: 1,
                          background: "transparent",
                          fontSize: 14,
                          color: "#0F172A",
                          border: "none",
                          outline: "none",
                          minWidth: 0,
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: 6,
                        marginLeft: 4,
                      }}
                    >
                      Email Aktif
                    </label>
                    <div
                      className={s.inputWrap}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                      }}
                    >
                      <Mail
                        className={s.inputIcon}
                      size={18}
                      style={{
                        color: "#94A3B8",
                        transition: "color 0.25s ease",
                        flexShrink: 0,
                      }}
                      />
                      <input
                        type="email"
                        placeholder="kamu@warung.com"
                        value={regEmail}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setRegEmail(e.target.value)
                        }
                        style={{
                          flex: 1,
                          background: "transparent",
                          fontSize: 14,
                          color: "#0F172A",
                          border: "none",
                          outline: "none",
                          minWidth: 0,
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: 6,
                        marginLeft: 4,
                      }}
                    >
                      Buat Kata Sandi
                    </label>
                    <div
                      className={s.inputWrap}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                      }}
                    >
                      <Lock
                        className={s.inputIcon}
                      size={18}
                      style={{
                        color: "#94A3B8",
                        transition: "color 0.25s ease",
                        flexShrink: 0,
                      }}
                      />
                      <input
                        type={showRegPwd ? "text" : "password"}
                        placeholder="Min. 6 karakter"
                        value={regPwd}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setRegPwd(e.target.value)
                        }
                        style={{
                          flex: 1,
                          background: "transparent",
                          fontSize: 14,
                          color: "#0F172A",
                          border: "none",
                          outline: "none",
                          minWidth: 0,
                        }}
                      />
                      <button
                        type="button"
                        className={s.eyeBtn}
                        onClick={() => setShowRegPwd((v) => !v)}
                        aria-label={
                          showRegPwd
                            ? "Sembunyikan kata sandi"
                            : "Tampilkan kata sandi"
                        }
                        style={{
                          color: "#94A3B8",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                        }}
                      >
                        {showRegPwd ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {regPwd.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            marginBottom: 4,
                          }}
                        >
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 99,
                                backgroundColor:
                                  i < pwdStrength.score
                                    ? pwdStrength.color
                                    : "#E2E8F0",
                                transition: "background-color 0.25s ease",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: pwdStrength.color || "#94A3B8",
                            transition: "color 0.25s ease",
                          }}
                        >
                          {pwdStrength.label ||
                            "Gunakan minimal 6 karakter"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error */}
                {regError && (
                  <div
                    className={s.errorShake}
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: 12,
                      fontSize: 13,
                      color: "#DC2626",
                    }}
                  >
                    {regError}
                  </div>
                )}

                {/* Terms */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    marginTop: 16,
                    marginBottom: 20,
                    fontSize: 12,
                    color: "#475569",
                    cursor: "pointer",
                    userSelect: "none",
                    lineHeight: 1.6,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={regTerms}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setRegTerms(e.target.checked)
                    }
                    className={s.customCheckbox}
                    style={{ marginTop: 2 }}
                  />
                  <span>
                    Saya menyetujui{" "}
                    <a
                      href="#"
                      className={s.inlineLink}
                      onClick={(e) => e.preventDefault()}
                      style={{
                        fontWeight: 600,
                        color: "#D97706",
                      }}
                    >
                      Syarat &amp; Ketentuan
                    </a>{" "}
                    serta{" "}
                    <a
                      href="#"
                      className={s.inlineLink}
                      onClick={(e) => e.preventDefault()}
                      style={{
                        fontWeight: 600,
                        color: "#D97706",
                      }}
                    >
                      Kebijakan Privasi
                    </a>{" "}
                    PesanLagi.
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className={s.ctaBtn}
                  style={{
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    cursor: regLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 8px 20px rgba(245,158,11,0.3)",
                    opacity: regLoading ? 0.8 : 1,
                  }}
                >
                  {regLoading ? (
                    <>
                      <span className={s.spinner} />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Akun Gratis</span>
                      <Sparkles size={16} />
                    </>
                  )}
                </button>

                {/* SSL Badge */}
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "#94A3B8",
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Data Anda dienkripsi &amp; diamankan dengan SSL</span>
                </div>
              </form>
            </div>

            {/* ---- Footer ---- */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 24,
                borderTop: "1px solid #F1F5F9",
                textAlign: "center",
                fontSize: 14,
                color: "#64748B",
              }}
            >
              {footerText}
            </div>
          </div>
        </div>
      </main>

      {/* ---- Forgot Password Modal ---- */}
      {showForgot && (
        <div
          className={s.modalOverlay}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.4)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForgot(false);
          }}
        >
          <div
            className={s.modalBox}
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow:
                "0 25px 50px -12px rgba(0,0,0,0.2)",
              padding: 24,
              width: "100%",
              maxWidth: 384,
              margin: "0 16px",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                color: "#94A3B8",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <X size={20} />
            </button>
            <div
              style={{
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <Mail size={28} style={{ color: "#D97706" }} strokeWidth={2} />
              </div>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#0F172A",
                }}
              >
                Lupa Password?
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#64748B",
                  marginTop: 4,
                }}
              >
                Masukkan email kamu untuk reset password.
              </p>
            </div>

            {forgotError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 12,
                  fontSize: 13,
                  color: "#DC2626",
                  marginBottom: 16,
                }}
              >
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: 12,
                  fontSize: 13,
                  color: "#16A34A",
                  marginBottom: 16,
                }}
              >
                {forgotSuccess}
              </div>
            )}

            <form
              onSubmit={handleForgot}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                className={s.inputWrap}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                }}
              >
                <Mail
                  className={s.inputIcon}
                  size={18}
                  style={{
                    color: "#94A3B8",
                    transition: "color 0.25s ease",
                    flexShrink: 0,
                  }}
                />
                <input
                  type="email"
                  placeholder="contoh@warung.com"
                  value={forgotEmail}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setForgotEmail(e.target.value)
                  }
                  style={{
                    flex: 1,
                    background: "transparent",
                    fontSize: 14,
                    color: "#0F172A",
                    border: "none",
                    outline: "none",
                    minWidth: 0,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className={s.ctaBtn}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "none",
                  cursor: forgotLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 8px 20px rgba(245,158,11,0.3)",
                  opacity: forgotLoading ? 0.8 : 1,
                }}
              >
                {forgotLoading ? (
                  <>
                    <span className={s.spinner} />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
