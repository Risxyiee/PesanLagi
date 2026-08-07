"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  Store,
  UtensilsCrossed,
  List,
  Crown,
  Loader2,
  Search,
  Eye,
  Clock,
  Mail,
  Zap,
} from "lucide-react";

interface AdminStats {
  total_users: number;
  total_stores: number;
  total_menus: number;
  total_categories: number;
  total_pro_users: number;
}

interface ProUser {
  id: string;
  email: string;
  name: string | null;
  store_name: string | null;
  pro_expiry_date: string | null;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  is_pro: boolean;
  pro_expiry_date: string | null;
  created_at: string;
  store_name: string | null;
  store_slug: string | null;
  store_is_open: boolean;
  store_id: string | null;
  menu_count: number;
  category_count: number;
}

function formatCountdown(expiryDate: string): { text: string; urgent: boolean; expired: boolean } {
  const now = Date.now();
  const end = new Date(expiryDate).getTime();
  const diff = end - now;
  if (diff <= 0) return { text: "Expired", urgent: true, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const urgent = days <= 3;
  if (days > 0) return { text: `${days}h ${hours}j ${minutes}m ${seconds}d`, urgent, expired: false };
  return { text: `${hours}j ${minutes}m ${seconds}d`, urgent: true, expired: false };
}

function CountdownTimer({ expiryDate }: { expiryDate: string }) {
  const [countdown, setCountdown] = useState(() => formatCountdown(expiryDate));
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(expiryDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);
  return (
    <span className={`font-mono text-xs font-bold tabular-nums ${countdown.expired ? "text-red-500" : countdown.urgent ? "text-orange-500" : "text-green-600"}`}>
      {countdown.text}
    </span>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAllPro, setShowAllPro] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(`/api/admin/users?limit=50${search ? `&search=${encodeURIComponent(search)}` : ""}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([s, u]) => {
      if (s) setStats(s);
      if (u) setUsers(u.users || []);
      setLoading(false);
    });
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Active Pro users (with valid expiry)
  const activeProUsers = users.filter((u) => {
    if (!u.is_pro || !u.pro_expiry_date) return false;
    return new Date(u.pro_expiry_date).getTime() > Date.now();
  });

  // Expired Pro users
  const expiredProUsers = users.filter((u) => {
    if (!u.is_pro || !u.pro_expiry_date) return false;
    return new Date(u.pro_expiry_date).getTime() <= Date.now();
  });

  const displayedProUsers = showAllPro ? activeProUsers : activeProUsers.slice(0, 5);

  return (
    <section>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Admin Panel</h2>
            <p className="text-sm text-slate-500">Kelola platform PesanLagi</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{stats.total_users}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total User</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                  <Store className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{stats.total_stores}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total Toko</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{stats.total_menus}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total Menu</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                  <List className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{stats.total_categories}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Kategori</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                  <Crown className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{stats.total_pro_users}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">User Pro</p>
              </div>
            </div>
          )}

          {/* Active Pro Users Section */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">User Pro Aktif</h3>
                  <p className="text-[11px] text-slate-500">Hitung mundur berjalan real-time</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                {activeProUsers.length} aktif
              </span>
            </div>

            {activeProUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Crown className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">Belum ada user Pro aktif</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {displayedProUsers.map((u) => (
                  <div key={u.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-orange-600">
                        {(u.name || u.email || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {u.name || u.store_name || "Tanpa nama"}
                        </p>
                        <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    {/* Store name */}
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">
                        {u.store_name || "—"}
                      </p>
                    </div>
                    {/* Countdown */}
                    <div className="flex flex-col items-end shrink-0 min-w-[120px]">
                      {u.pro_expiry_date ? (
                        <CountdownTimer expiryDate={u.pro_expiry_date} />
                      ) : (
                        <span className="text-xs text-slate-400">No expiry</span>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {u.pro_expiry_date
                          ? new Date(u.pro_expiry_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeProUsers.length > 5 && (
              <div className="p-3 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowAllPro(!showAllPro)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
                >
                  {showAllPro ? "Tutup" : `Lihat semua ${activeProUsers.length} user Pro`}
                </button>
              </div>
            )}

            {/* Expired Pro users */}
            {expiredProUsers.length > 0 && (
              <div className="px-4 sm:px-5 py-3 bg-red-50/50 border-t border-red-100">
                <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {expiredProUsers.length} user Pro sudah expired (is_pro masih true, expiry lewat)
                </p>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Semua User & Toko</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, email, atau toko..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 w-full sm:w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Toko</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Menu</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Kat</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pro</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bergabung</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        Belum ada user terdaftar
                      </td>
                    </tr>
                  )}
                  {users.map((u, i) => {
                    const storeName = u.store_name || "(belum buat toko)";
                    const storeSlug = u.store_slug || "-";
                    const isOpen = u.store_is_open;
                    const menuCount = u.menu_count || 0;
                    const catCount = u.category_count || 0;
                    const isPro = u.is_pro;
                    const proExpiry = u.pro_expiry_date;
                    const isProActive = isPro && proExpiry && new Date(proExpiry).getTime() > Date.now();
                    const createdAt = u.created_at
                      ? new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-";
                    return (
                      <tr key={u.id || i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">{u.name || "—"}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOpen ? "bg-green-500" : "bg-slate-300"}`}
                            />
                            <span className="font-semibold text-slate-700 truncate max-w-[140px]">{storeName}</span>
                          </div>
                          {storeSlug !== "-" && (
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-3.5">{storeSlug}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{menuCount}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{catCount}</td>
                        <td className="px-4 py-3">
                          {isProActive ? (
                            <div className="flex flex-col">
                              <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-bold">
                                <Crown className="w-3 h-3" /> Pro
                              </span>
                              {proExpiry && (
                                <CountdownTimer expiryDate={proExpiry} />
                              )}
                            </div>
                          ) : isPro ? (
                            <span className="text-red-400 text-[10px] font-bold">Expired</span>
                          ) : (
                            <span className="text-slate-300 text-xs">Free</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{createdAt}</td>
                        <td className="px-4 py-3">
                          {storeSlug !== "-" && (
                            <button
                              onClick={() => window.open("/menu/" + storeSlug, "_blank")}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
