"use client";

import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  PlusCircle, 
  PackagePlus, 
  Radio,
  AlertTriangle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

// --- Types ---
interface Sale {
  id: string;
  total: number;
  created_at: string;
  payment_method: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

// --- Components ---

const StatCard = ({ label, value, unit, color, icon: Icon }: { label: string, value: string, unit: string, color: string, icon: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-black border-4 p-4 shadow-[4px_4px_0_0_currentColor] flex flex-col justify-between"
    style={{ borderColor: color, color: color }}
  >
    <div className="flex justify-between items-start">
      <span className="text-[10px] uppercase tracking-[0.2em] mb-2 font-black">{label}</span>
      <Icon size={16} />
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black italic tracking-tighter text-white">
        {value}
      </span>
      <span className="text-xs font-bold">{unit}</span>
    </div>
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label, color, bgColor, href = "#" }: { icon: any, label: string, color: string, bgColor: string, href?: string }) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="flex flex-col items-center justify-center gap-3 p-8 border-4 border-black arcade-shadow-pink h-full cursor-pointer transition-all"
    style={{ backgroundColor: bgColor, color: color, boxShadow: `4px 4px 0px 0px ${color}` }}
  >
    <Icon size={32} />
    <span className="font-black text-xs tracking-widest uppercase">{label}</span>
  </motion.a>
);

export default function DashboardPage() {
  const [salesToday, setSalesToday] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    if (!supabase) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Fetch Sales Today
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (sales) {
        const total = sales.reduce((acc, sale) => acc + Number(sale.total), 0);
        setSalesToday(total);
        setOrdersCount(sales.length);
        setRecentSales(sales.slice(0, 5));
      }

      // 2. Fetch Low Stock
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock')
        .lt('stock', 5);
      
      if (products) {
        setLowStockCount(products.length);
        setLowStockItems(products.slice(0, 5));
      }

      // 3. Check Session Status
      const { data: session } = await supabase
        .from('cash_sessions')
        .select('id')
        .is('closed_at', null)
        .single();
      
      setIsSessionOpen(!!session);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 pb-24 md:pb-6">
        {/* Header Status */}
        <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900/50 p-4 border-2 border-neutral-800">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse ${isSessionOpen ? 'bg-secondary-neon' : 'bg-primary-neon'}`} />
            <h2 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-white">
              SISTEMA {isSessionOpen ? 'OPERATIVO' : 'EN ESPERA'} - {format(new Date(), 'dd/MM/yyyy')}
            </h2>
          </div>
          <span className="text-[8px] md:text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            {isSessionOpen ? 'CAJA ABIERTA' : 'INICIAR SESIÓN PARA VENDER'}
          </span>
        </div>

        {/* Main Stats */}
        <section className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard 
            label="Ventas Hoy" 
            value={salesToday.toLocaleString()} 
            unit="COP" 
            color="#00FFFF" 
            icon={TrendingUp}
          />
          <StatCard 
            label="Órdenes" 
            value={ordersCount.toString()} 
            unit="TICKETS" 
            color="#FF007F" 
            icon={CreditCard}
          />
          <StatCard 
            label="Alertas" 
            value={lowStockCount.toString()} 
            unit="STOCK" 
            color="#d7ca00" 
            icon={AlertTriangle}
          />
        </section>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-8 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <QuickActionButton 
              icon={PlusCircle} 
              label="Nueva Venta" 
              color="#FF007F" 
              bgColor="#3f001a" 
              href="/pos" 
            />
            <QuickActionButton 
              icon={PackagePlus} 
              label="Inventario" 
              color="#00FFFF" 
              bgColor="black" 
              href="/inventory" 
            />
          </div>

          {/* Live Sales Feed */}
          <section className="bg-black border-4 border-neutral-900 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-sm md:text-lg font-black text-secondary-neon flex items-center gap-2 tracking-widest uppercase italic">
                <Radio size={18} className="animate-pulse" /> Registro Reciente
              </h3>
            </div>
            <div className="space-y-2 md:space-y-3">
              <AnimatePresence mode="popLayout">
                {recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <motion.div 
                      key={sale.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center justify-between p-3 md:p-4 bg-neutral-900/50 border-l-4 border-secondary-neon hover:bg-neutral-800 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[10px] text-neutral-500 font-mono uppercase">#{sale.id.slice(0,8)}</span>
                        <span className="text-[10px] md:text-xs font-bold text-white uppercase">{sale.payment_method}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-secondary-neon font-black italic text-xs md:text-base">${Number(sale.total).toLocaleString()}</div>
                        <div className="text-[8px] md:text-[10px] text-neutral-600 font-mono">{format(new Date(sale.created_at), 'HH:mm')}</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 md:py-12 text-neutral-700 font-black uppercase italic tracking-widest border-2 border-dashed border-neutral-800 text-[10px]">
                    No hay ventas registradas
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Panel: Alerts & Audit */}
        <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-black border-4 border-tertiary-neon p-4 md:p-6">
            <h4 className="text-xs md:text-sm font-black text-tertiary-neon uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={14} /> Stock Bajo
            </h4>
            <div className="space-y-2">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-primary-neon/5 border border-primary-neon/20">
                    <span className="text-[10px] md:text-xs font-bold text-white uppercase truncate pr-2">{item.name}</span>
                    <span className="bg-primary-neon text-black text-[8px] md:text-[10px] font-black px-2 py-0.5 whitespace-nowrap">
                      {item.stock} UNID
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[8px] md:text-[10px] text-neutral-600 uppercase font-bold text-center py-4 italic">
                  Inventario en orden
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-neutral-900/80 border-2 border-neutral-800 p-4 md:p-6">
            <h4 className="text-[8px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">Métricas</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[8px] md:text-[10px] font-bold uppercase mb-1">
                  <span className="text-neutral-400">Objetivo</span>
                  <span className="text-secondary-neon">{(salesToday / 500000 * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 md:h-2 bg-black border border-neutral-800">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((salesToday / 500000) * 100, 100)}%` }}
                    className="h-full bg-secondary-neon shadow-[0_0_10px_#00FFFF]" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
