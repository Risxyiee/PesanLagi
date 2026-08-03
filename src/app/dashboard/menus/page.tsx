'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, UtensilsCrossed, Trash2 } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  available: boolean;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([
    { id: 1, name: 'Nasi Goreng Spesial', price: 15000, available: true },
    { id: 2, name: 'Mie Ayam Bakso', price: 12000, available: true },
    { id: 3, name: 'Es Teh Manis', price: 5000, available: false }
  ]);

  const toggleAvailability = (id: number) => {
    setMenus(menus.map(m => m.id === id ? { ...m, available: !m.available } : m));
  };

  const deleteMenu = (id: number) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  return (
    <div>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Menu Makanan 🍜</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola daftar makanan dan minuman yang tersedia.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-premium">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Tambah Menu
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menus.map((menu, i) => (
          <motion.div 
            key={menu.id} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-premium flex items-center gap-4 hover:-translate-y-0.5 transition-transform duration-300"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 truncate">{menu.name}</h3>
              <p className="text-sm text-amber-600 font-semibold">Rp {menu.price.toLocaleString('id-ID')}</p>
              <span className={`mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${menu.available ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                {menu.available ? 'Tersedia' : 'Stok Habis'}
              </span>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={menu.available} onChange={() => toggleAvailability(menu.id)} />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
              <button onClick={() => deleteMenu(menu.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
