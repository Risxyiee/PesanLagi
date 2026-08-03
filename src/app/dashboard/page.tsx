'use client';

import { motion } from 'framer-motion';
import { Utensils, QrCode, Store, Crown, PlusCircle, Palette, Settings, Share2, Copy, Eye, Sparkles, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function DashboardHome() {
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://pesanlagi.web.id/menu/warung-bu-tini');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Selamat datang kembali, Warung Bu Tini 👋</h1>
          <div className="mt-2 flex items-center gap-2">
            {isPro ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-sm">
                <Crown className="w-3.5 h-3.5" /> Member Pro Active
              </span>
            ) : (
              <>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">Akun Gratis</span>
                <button onClick={() => setIsPro(true)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <Sparkles className="w-3.5 h-3.5" /> Upgrade Pro Rp 29rb/bln
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="glassmorphism p-2 rounded-2xl flex items-center gap-2 shadow-premium border border-slate-100">
          <div className="px-3 py-2 bg-slate-50 rounded-xl flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 hidden sm:block">pesanlagi.web.id/menu/warung-bu-tini</span>
            <span className="text-xs font-medium text-slate-600 sm:hidden">/warung-bu-tini</span>
          </div>
          <button onClick={handleCopy} className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors">
            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button className="p-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-50 rounded-xl"><Utensils className="w-5 h-5 text-amber-600" strokeWidth={1.75} /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">24</h3>
          <p className="text-sm text-slate-500 mt-1">Total Menu Aktif</p>
        </motion.div>

        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 rounded-xl"><QrCode className="w-5 h-5 text-blue-600" strokeWidth={1.75} /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Siap Cetak</h3>
          <p className="text-sm text-slate-500 mt-1">Status Kartu Meja</p>
        </motion.div>

        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${isStoreOpen ? 'bg-green-50' : 'bg-slate-100'}`}>
              <Store className={`w-5 h-5 ${isStoreOpen ? 'text-green-600' : 'text-slate-600'}`} strokeWidth={1.75} />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isStoreOpen} onChange={() => setIsStoreOpen(!isStoreOpen)} />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          <h3 className={`text-lg font-bold ${isStoreOpen ? 'text-green-600' : 'text-slate-500'}`}>{isStoreOpen ? 'Toko Buka' : 'Toko Tutup'}</h3>
          <p className="text-sm text-slate-500 mt-1">Status Toko</p>
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-premium hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${isPro ? 'bg-amber-50' : 'bg-slate-100'}`}>
              <Crown className={`w-5 h-5 ${isPro ? 'text-amber-600' : 'text-slate-600'}`} strokeWidth={1.75} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${isPro ? 'text-amber-600' : 'text-slate-900'}`}>{isPro ? 'Pro Plan' : 'Free Plan'}</h3>
          <p className="text-sm text-slate-500 mt-1">{isPro ? 'Masa Aktif: 30 Hari' : 'Watermark Aktif'}</p>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Pintasan Cepat</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.a href="/dashboard/menus" custom={4} variants={cardVariants} initial="hidden" animate="visible" className="group relative overflow-hidden rounded-2xl p-5 text-left bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-premium hover:shadow-lg transition-all hover:-translate-y-1 duration-300 cursor-pointer">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PlusCircle className="w-24 h-24" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="p-2 bg-white/10 rounded-xl w-fit mb-8"><PlusCircle className="w-5 h-5 text-amber-400" strokeWidth={2} /></div>
              <h3 className="font-bold text-base">Tambah Menu</h3>
              <p className="text-xs text-slate-400 mt-1">Masukkan menu makanan baru</p>
            </div>
          </motion.a>

          <motion.a href="/dashboard/designer" custom={5} variants={cardVariants} initial="hidden" animate="visible" className="group relative overflow-hidden rounded-2xl p-5 text-left bg-white border border-slate-100 shadow-premium hover:shadow-lg transition-all hover:-translate-y-1 duration-300 cursor-pointer">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Palette className="w-24 h-24 text-amber-500" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="p-2 bg-amber-50 rounded-xl w-fit mb-8"><Palette className="w-5 h-5 text-amber-600" strokeWidth={2} /></div>
              <h3 className="font-bold text-base text-slate-900">Desain Kartu QR</h3>
              <p className="text-xs text-slate-500 mt-1">Editor QR Meja Makan</p>
            </div>
          </motion.a>

          <motion.a href="/dashboard/settings" custom={6} variants={cardVariants} initial="hidden" animate="visible" className="group relative overflow-hidden rounded-2xl p-5 text-left bg-white border border-slate-100 shadow-premium hover:shadow-lg transition-all hover:-translate-y-1 duration-300 cursor-pointer">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Settings className="w-24 h-24 text-slate-500" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="p-2 bg-slate-100 rounded-xl w-fit mb-8"><Settings className="w-5 h-5 text-slate-700" strokeWidth={2} /></div>
              <h3 className="font-bold text-base text-slate-900">Pengaturan Warung</h3>
              <p className="text-xs text-slate-500 mt-1">Logo, nama, dan slug</p>
            </div>
          </motion.a>

          <motion.a href="https://wa.me/?text=Halo%20pelanggan%20setia!%20Cek%20menu%20terbaru%20Warung%20Bu%20Tini%20di%20sini:%20https://pesanlagi.web.id/menu/warung-bu-tini" target="_blank" rel="noopener noreferrer" custom={7} variants={cardVariants} initial="hidden" animate="visible" className="group relative overflow-hidden rounded-2xl p-5 text-left bg-gradient-to-br from-green-500 to-green-600 text-white shadow-premium hover:shadow-lg transition-all hover:-translate-y-1 duration-300 cursor-pointer">
            <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Share2 className="w-24 h-24" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-8"><Share2 className="w-5 h-5 text-white" strokeWidth={2} /></div>
              <h3 className="font-bold text-base">Bagikan ke WA</h3>
              <p className="text-xs text-green-50 mt-1">Promosi menu otomatis</p>
            </div>
          </motion.a>
        </div>
      </section>
    </div>
  );
}
