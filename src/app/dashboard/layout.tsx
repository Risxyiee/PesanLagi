'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, QrCode, Settings, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { href: '/dashboard/menus', label: 'Menu', icon: Utensils },
  { href: '/dashboard/designer', label: 'QR', icon: QrCode },
  { href: '/dashboard/settings', label: 'Profil', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 antialiased">
      {/* Desktop Floating Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-28 flex-col items-center py-8 z-50">
        <div className="h-full w-20 glassmorphism rounded-3xl flex flex-col items-center justify-between py-6 shadow-premium">
          <div className="flex flex-col items-center gap-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/30">
              P
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className="group relative flex justify-center">
                    <div className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300",
                      isActive ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    )}>
                      <item.icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <span className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <Link href="/dashboard/settings" className="p-3 rounded-2xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
            <Sparkles className="w-6 h-6" strokeWidth={1.75} />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-28 pb-28 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
        <div className="glassmorphism rounded-3xl shadow-premium flex items-center justify-around p-2 relative">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors w-16",
                isActive ? "text-amber-600" : "text-slate-500"
              )}>
                <item.icon className="w-6 h-6" strokeWidth={1.75} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
          
          <Link href="/dashboard/menus" className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/40 -mt-8 border-4 border-white transition-transform active:scale-95">
            <Plus className="w-7 h-7" strokeWidth={2.5} />
          </Link>

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors w-16",
                isActive ? "text-amber-600" : "text-slate-500"
              )}>
                <item.icon className="w-6 h-6" strokeWidth={1.75} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
