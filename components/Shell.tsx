"use client";

import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Boxes, 
  UtensilsCrossed, 
  Gamepad2, 
  Settings, 
  Bell, 
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link href={href} passHref legacyBehavior>
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-4 p-4 mx-2 my-1 border-2 transition-all cursor-pointer group ${
        active 
          ? 'bg-secondary-neon text-black border-black arcade-shadow-pink' 
          : 'text-secondary-neon border-transparent hover:border-secondary-neon hover:bg-neutral-900/50'
      }`}
    >
      <Icon size={20} className={active ? 'text-black' : 'text-secondary-neon'} />
      <span className="font-bold text-xs tracking-widest uppercase">{label}</span>
    </motion.a>
  </Link>
);

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-void text-on-background">
      <div className="scanline-overlay" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-black border-b-4 border-neutral-900 shadow-[0_4px_0_0_#FF007F]">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black italic text-primary-neon drop-shadow-[3px_3px_0px_#00FFFF] uppercase tracking-widest">
            PUNTO RETRO <span className="text-secondary-neon">POS</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer hover:scale-110 transition-transform">
            <Bell size={24} className="text-secondary-neon" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-neon rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-3 border-2 border-secondary-neon p-2 bg-neutral-900">
            <User size={20} className="text-secondary-neon" />
            <span className="font-bold text-[10px] text-secondary-neon tracking-widest">ADMIN_ROOT</span>
          </div>
          <button 
            onClick={async () => {
              await supabase?.auth.signOut();
              window.location.href = "/login";
            }}
            className="text-[10px] font-black text-primary-neon hover:text-white uppercase tracking-widest border-2 border-primary-neon px-3 py-2 bg-black arcade-shadow-cyan active:translate-y-1 transition-all"
          >
            SALIR
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-black border-r-4 border-neutral-900 flex flex-col py-4 overflow-y-auto z-40">
        <div className="px-6 py-4 border-b-4 border-neutral-900 mb-4">
          <h2 className="text-primary-neon font-black text-sm tracking-tighter uppercase">OPERADOR_01</h2>
          <p className="text-secondary-neon text-[10px] font-bold opacity-70 tracking-widest">NIVEL_99_ADMIN</p>
        </div>
        <nav className="flex flex-col gap-1">
          <SidebarItem icon={LayoutDashboard} label="TABLERO" href="/" active={pathname === "/"} />
          <SidebarItem icon={Boxes} label="INVENTARIO" href="/inventory" active={pathname === "/inventory"} />
          <SidebarItem icon={ReceiptText} label="NUEVA VENTA" href="/pos" active={pathname === "/pos"} />
          <SidebarItem icon={UtensilsCrossed} label="MENÚ" href="#" active={false} />
          <SidebarItem icon={Gamepad2} label="PERSONAL" href="#" active={false} />
          <SidebarItem icon={Settings} label="SISTEMA" href="#" active={false} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-20 p-6">
        {children}
      </main>
    </div>
  );
}
