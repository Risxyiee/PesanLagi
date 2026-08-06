"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface AdminStats {
  total_users: number;
  total_stores: number;
  total_menus: number;
  total_categories: number;
  total_pro_users: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const doFetch = () => {
      setLoading(true);
      Promise.all([
        fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch(`/api/admin/users?limit=50${search ? `&search=${encodeURIComponent(search)}` : ""}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]).then(([s, u]) => {
        if (cancelled) return;
        if (s) setStats(s);
        if (u) setUsers(u.users || []);
        setLoading(false);
      });
    };
    doFetch();
    return () => { cancelled = true; };
  }, [search]);

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

          {/* Users Table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Semua User & Toko</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama toko atau slug..."
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
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Toko</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
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
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                        Belum ada user terdaftar
                      </td>
                    </tr>
                  )}
                  {users.map((u: Record<string, unknown>, i: number) => {
                    const storeName = (u.store_name as string) || "(belum buat toko)";
                    const storeSlug = (u.store_slug as string) || "-";
                    const isOpen = u.store_is_open;
                    const menuCount = (u.menu_count as number) || 0;
                    const catCount = (u.category_count as number) || 0;
                    const isPro = u.is_pro;
                    const createdAt = u.created_at
                      ? new Date(u.created_at as string).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-";
                    return (
                      <tr key={(u.id as string) || i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-[160px] truncate">{storeName}</td>
                        <td className="px-4 py-3">
                          {storeSlug !== "-" ? (
                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{storeSlug}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold " +
                              (isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")
                            }
                          >
                            <span
                              className={
                                "w-1.5 h-1.5 rounded-full " +
                                (isOpen ? "bg-green-500" : "bg-red-500")
                              }
                            />
                            {isOpen ? "Buka" : "Tutup"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{menuCount}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">{catCount}</td>
                        <td className="px-4 py-3">
                          {isPro ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-bold">
                              <Crown className="w-3 h-3" /> Pro
                            </span>
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
