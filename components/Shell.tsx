"use client";

import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Boxes, 
  BarChart,
  Settings, 
  Bell, 
  User,
  History,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-start ml-4 pl-4 border-l-2 border-neutral-900">
      <span className="text-[10px] font-mono text-secondary-neon tracking-widest">
        {time.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
      </span>
      <span className="text-[10px] font-black text-white font-mono tracking-[0.2em]">
        {time.toLocaleTimeString('es-CO', { hour12: false })}
      </span>
    </div>
  );
};

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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'sale' | 'alert' | 'info';
  time: Date;
  read: boolean;
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showHub, setShowHub] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);

  // Global event listener for notifications
  useEffect(() => {
    const handleNotify = (e: any) => {
      const newNotify: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        ...e.detail,
        time: new Date(),
        read: false
      };
      setNotifications(prev => [newNotify, ...prev].slice(0, 20));
      setToast(newNotify);
      setTimeout(() => setToast(null), 4000);
    };

    window.addEventListener('pos-notify', handleNotify);
    
    // Keyboard shortcut Alt+N
    const handleKeys = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'n') {
        setShowHub(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowHub(false);
        setToast(null);
      }
    };
    window.addEventListener('keydown', handleKeys);

    return () => {
      window.removeEventListener('pos-notify', handleNotify);
      window.removeEventListener('keydown', handleKeys);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-void text-on-background">
      <div className="scanline-overlay" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-black border-b-4 border-neutral-900 shadow-[0_4px_0_0_#FF007F]">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black italic text-primary-neon drop-shadow-[3px_3px_0px_#00FFFF] uppercase tracking-widest">
            PUNTO RETRO <span className="text-secondary-neon">POS</span>
          </h1>
          <RealTimeClock />
        </div>
        <div className="flex items-center gap-6">
          {/* Campana de Notificaciones */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowHub(!showHub);
                if (!showHub) {
                  setNotifications(prev => prev.map(n => ({...n, read: true})));
                }
              }}
              className="relative cursor-pointer hover:scale-110 transition-transform outline-none"
            >
              <Bell size={24} className={showHub ? "text-primary-neon" : "text-secondary-neon"} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-neon rounded-full animate-pulse shadow-[0_0_10px_#00FFFF]" />
              )}
            </button>

            {/* Notification Hub Panel */}
            <AnimatePresence>
              {showHub && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-6 w-80 bg-black border-4 border-neutral-900 arcade-shadow-cyan z-[60] overflow-hidden"
                >
                  <div className="p-4 border-b-2 border-neutral-900 flex justify-between items-center bg-neutral-900/20">
                    <span className="text-[10px] font-black uppercase text-primary-neon tracking-widest">Bitácora de Sistema</span>
                    <span className="text-[8px] font-bold text-neutral-600">[ALT+N]</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-neutral-900">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-neutral-700 text-[10px] uppercase font-bold italic">
                        No hay registros recientes
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="p-4 hover:bg-neutral-900/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${n.type === 'alert' ? 'bg-primary-neon animate-pulse' : 'bg-secondary-neon'}`} />
                          <span className={`text-[10px] font-black uppercase ${n.type === 'alert' ? 'text-primary-neon' : 'text-secondary-neon'}`}>
                            {n.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-white font-bold mb-1 leading-tight">{n.message}</p>
                        <p className="text-[8px] text-neutral-600 font-mono">{n.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-24 right-6 z-[100] border-4 p-4 min-w-[280px] arcade-shadow-pink bg-black ${
              toast.type === 'alert' ? 'border-primary-neon' : 'border-secondary-neon'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={toast.type === 'alert' ? 'text-primary-neon' : 'text-secondary-neon'}>
                {toast.type === 'alert' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
              </div>
              <div>
                <h4 className={`text-[10px] font-black uppercase mb-1 ${toast.type === 'alert' ? 'text-primary-neon' : 'text-secondary-neon'}`}>
                  {toast.title}
                </h4>
                <p className="text-[11px] font-bold text-white uppercase leading-tight">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-neutral-700 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className={`mt-3 h-1 w-full bg-neutral-900 rounded-full overflow-hidden`}>
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className={`h-full ${toast.type === 'alert' ? 'bg-primary-neon' : 'bg-secondary-neon'}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <SidebarItem icon={BarChart} label="ESTADÍSTICAS" href="/stats" active={pathname === "/stats"} />
          <SidebarItem icon={History} label="HISTORIAL DE CIERRES" href="/cash-history" active={pathname === "/cash-history"} />
          <SidebarItem icon={Settings} label="SISTEMA" href="/settings" active={pathname === "/settings"} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-20 p-6">
        {children}
      </main>
    </div>
  );
}
