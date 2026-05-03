"use client";

import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  PlusCircle, 
  PackagePlus, 
  Radio
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Shell from '@/components/Shell';

// --- Types ---
interface Transaction {
  id: string;
  items: string;
  amount: string;
  time: string;
  type: 'sale' | 'processing';
}

// --- Components ---

const StatCard = ({ label, value, unit, color, progress }: { label: string, value: string, unit: string, color: string, progress: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-black border-4 p-4 shadow-[4px_4px_0_0_currentColor] flex flex-col justify-between`}
    style={{ borderColor: color, color: color }}
  >
    <span className="text-[10px] uppercase tracking-[0.2em] mb-2">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black italic tracking-tighter text-white">{value}</span>
      <span className="text-xs font-bold">{unit}</span>
    </div>
    <div className="mt-4 h-1 w-full bg-neutral-900 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full bg-current"
      />
    </div>
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label, color, bgColor, iconFill = false, href = "#" }: { icon: any, label: string, color: string, bgColor: string, iconFill?: boolean, href?: string }) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ translate: '2px 2px', boxShadow: '0px 0px 0px 0px currentColor' }}
    className={`flex flex-col items-center justify-center gap-4 p-12 border-4 border-black transition-all group arcade-shadow-pink h-full cursor-pointer`}
    style={{ backgroundColor: bgColor, color: color, boxShadow: `4px 4px 0px 0px ${color === '#00FFFF' ? '#00FFFF' : (color === '#d7ca00' ? '#d7ca00' : '#FF007F')}` }}
  >
    <Icon 
      size={48} 
      className="group-hover:scale-110 transition-transform" 
      fill={iconFill ? "currentColor" : "none"} 
    />
    <span className="font-bold text-sm tracking-widest uppercase">{label}</span>
  </motion.a>
);

const FeedItem = ({ transaction }: { transaction: Transaction }) => (
  <motion.div 
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className={`flex items-center justify-between p-4 bg-black border-l-4 hover:bg-neutral-900 transition-colors border-secondary-neon`}
  >
    <div className="flex gap-4 items-center">
      <span className="text-secondary-neon font-mono text-xs">{transaction.id}</span>
      <span className="text-sm font-medium">{transaction.items}</span>
    </div>
    <div className="flex gap-4 items-center">
      <span className="font-bold text-tertiary-neon">{transaction.amount} CR</span>
      <span className="text-[10px] font-mono text-neutral-500 uppercase">{transaction.time}</span>
    </div>
  </motion.div>
);

export default function Home() {
  const [logs, setLogs] = useState<string[]>([
    '> INICIANDO CHEQUEO_SISTEMA...',
    '> ENLACE_RED: ESTABLECIDO [PING 12ms]',
    '> AUTH_BASE_DATOS: ÉXITO',
    '> RASTREADOR_INGRESOS: ACTIVO',
    '> ESCANEANDO ANOMALÍAS... NINGUNA',
    '> AVISO: PAPEL_IMPRESORA_BAJO (TERMINAL_3)',
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: '#TRX_982', items: '2x MARGARITA NEÓN, 1x PAPAS PÍXEL', amount: '42.00', time: 'HACE 2 MIN', type: 'sale' },
    { id: '#TRX_981', items: '4x CERVEZA RETRO, 2x SLIDERS GLOW', amount: '68.50', time: 'HACE 5 MIN', type: 'sale' },
    { id: '#TRX_980', items: '1x CAFÉ CYBER, 1x BROWNIE-BIT', amount: '15.25', time: 'HACE 12 MIN', type: 'sale' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogs(prev => [...prev.slice(-10), `> ESPERANDO COMANDO_ ${new Date().toLocaleTimeString()}`]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Shell>
      <div className="grid grid-cols-12 gap-6 pb-24">
        {/* Stats Section */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Ventas Totales (Hoy)" value="1,248.50" unit="CRÉDITOS" color="#00FFFF" progress={75} />
          <StatCard label="Ítems Procesados" value="342" unit="UNIDADES" color="#FF007F" progress={45} />
          <StatCard label="Estabilidad del Sistema" value="99.9" unit="% ESTABLE" color="#d7ca00" progress={99.9} />
        </section>

        {/* Quick Actions & Live Feed */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionButton icon={PlusCircle} label="NUEVA_VENTA" color="#FF007F" bgColor="#3f001a" iconFill href="/pos" />
            <QuickActionButton icon={PackagePlus} label="AGREGAR_PRODUCTO" color="#00FFFF" bgColor="black" href="/inventory" />
            <QuickActionButton icon={BarChart} label="REPORTES" color="#d7ca00" bgColor="black" />
          </div>

          <section className="bg-neutral-900/40 border-2 border-neutral-800 p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-secondary-neon flex items-center gap-2 tracking-widest uppercase">
                <Radio size={20} className="animate-pulse" /> FEED_EN_VIVO
              </h3>
              <span className="text-[10px] font-bold text-neutral-500 tracking-widest">ESTADO: OPERATIVO</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {transactions.map((trx) => (
                  <FeedItem key={trx.id} transaction={trx} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Sidebar Info Panels */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Operator Card */}
          <div className="bg-black border-4 border-neutral-800 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-neutral-900 border-b-2 border-l-2 border-neutral-800">
              <span className="text-[10px] font-bold text-secondary-neon animate-pulse uppercase">● EN LÍNEA</span>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 border-4 border-primary-neon p-1 relative overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmsYQf_CZfY9VCUo41fF5DrjIEz_FMLKfWchvJteRKTsgjgRVongMIMA5rp779eHscJVfgO1gAO7wngzQjKFnmR3hIUqKlWD-nKExz33pGwIXbBO12nB-PdEZddQYHdomb-mK9Sf8C6NqAxYAbLpKXuKStSiHsuu0yxgE1OWYg8MtzHjlSf09_xyqzeduUuvk3MQ9Tep5W-cEp77RpCklqH31FkTE9DNZQ4EfXGHJelxJZnRQ_VOGXFgD7pyWqdBYbySGRPfZ3ILPZ" 
                  alt="Operator Avatar" 
                  className="w-full h-full object-cover grayscale brightness-75 sepia-[0.3] hue-rotate-[280deg] contrast-150"
                />
                <div className="absolute inset-0 bg-primary-neon/10 pointer-events-none" />
              </div>
              <div>
                <h4 className="text-lg font-black text-primary-neon tracking-tight uppercase">OPERADOR_01</h4>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Turno: NOCHE_WLK</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">TIEMPO_TURNO</span>
                <span className="font-mono text-secondary-neon text-xl tracking-widest">04:22:15</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 border border-neutral-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '55%' }}
                  className="h-full bg-secondary-neon shadow-[0_0_10px_#00FFFF]" 
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 uppercase tracking-widest">PROGRESO_XP</span>
                <span className="text-primary-neon font-bold">850 / 1000</span>
              </div>
            </div>
          </div>

          {/* Combo Meter */}
          <div className="bg-neutral-900/60 border-2 border-black p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-[0.2em]">COMBO_SESIÓN</span>
              <span className="font-black italic text-2xl text-tertiary-neon animate-bounce">x12</span>
            </div>
            <div className="h-8 w-full bg-black border-2 border-neutral-800 p-1">
              <motion.div 
                animate={{ width: ['70%', '82%', '75%', '85%'] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-secondary-neon via-primary-neon to-pink-600 shadow-[0_0_15px_rgba(255,0,127,0.3)]" 
                style={{ width: '85%' }}
              />
            </div>
            <p className="text-[9px] text-neutral-500 text-center font-mono italic uppercase tracking-widest">MANTÉN EL RITMO PARA MÁXIMOS CRÉDITOS</p>
          </div>

          {/* Logs */}
          <div className="bg-black border-2 border-neutral-900 font-mono text-[9px] p-4 text-cyan-800 h-48 overflow-hidden relative">
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p key={i} className={i === logs.length - 1 ? 'animate-pulse' : ''}>{log}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
