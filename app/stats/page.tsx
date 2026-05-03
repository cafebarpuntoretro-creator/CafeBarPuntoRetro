"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Clock, 
  ShoppingBag, 
  ArrowLeft, 
  Calendar,
  Filter,
  Loader2,
  ChevronRight
} from "lucide-react";
import Shell from "@/components/Shell";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";

interface Sale {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
  sale_items: {
    quantity: number;
    price: number;
    products: {
      name: string;
    } | { name: string }[] | null;
  }[];
}

export default function StatsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalSales: 0,
    avgTicket: 0
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    if (!supabase) return;
    
    // Fetch sales with items and product names
    const { data, error } = await supabase
      .from("sales")
      .select(`
        id,
        total,
        payment_method,
        created_at,
        sale_items (
          quantity,
          price,
          products (
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setSales(data || []);
      
      const total = data?.reduce((sum, s) => sum + Number(s.total), 0) || 0;
      setSummary({
        totalAmount: total,
        totalSales: data?.length || 0,
        avgTicket: data?.length ? total / data.length : 0
      });
    }
    setLoading(false);
  };

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-secondary-neon font-black text-3xl italic uppercase tracking-tighter">Historial de Ventas</h1>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Reporte detallado de operaciones del sistema</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black border-4 border-neutral-900 p-6 arcade-shadow-cyan">
          <div className="flex justify-between items-start mb-4">
            <TrendingUp className="text-secondary-neon" size={24} />
            <span className="text-[8px] font-mono text-neutral-600 uppercase">Total_Vendido</span>
          </div>
          <p className="text-3xl font-black text-white italic tracking-tighter">
            ${summary.totalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-black border-4 border-neutral-900 p-6 arcade-shadow-pink">
          <div className="flex justify-between items-start mb-4">
            <ShoppingBag className="text-primary-neon" size={24} />
            <span className="text-[8px] font-mono text-neutral-600 uppercase">Ordenes_Hoy</span>
          </div>
          <p className="text-3xl font-black text-white italic tracking-tighter">
            {summary.totalSales} <span className="text-xs text-neutral-500 font-bold tracking-widest uppercase">Tickets</span>
          </p>
        </div>

        <div className="bg-black border-4 border-neutral-900 p-6 arcade-shadow-yellow">
          <div className="flex justify-between items-start mb-4">
            <Filter className="text-yellow-500" size={24} />
            <span className="text-[8px] font-mono text-neutral-600 uppercase">Ticket_Promedio</span>
          </div>
          <p className="text-3xl font-black text-white italic tracking-tighter">
            ${summary.avgTicket.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-black border-4 border-neutral-900 relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
            <Loader2 className="text-secondary-neon animate-spin mb-4" size={48} />
          </div>
        ) : null}

        <div className="p-4 border-b-4 border-neutral-900 bg-neutral-900/20 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-secondary-neon tracking-widest">Registros Recientes</span>
          <div className="flex gap-4">
            <button className="text-[8px] font-black text-neutral-500 hover:text-white uppercase">Exportar CSV</button>
            <button className="text-[8px] font-black text-neutral-500 hover:text-white uppercase">Filtrar Fecha</button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
          {sales.length === 0 && !loading ? (
            <div className="p-20 text-center text-neutral-700 uppercase font-mono text-[10px] tracking-[0.5em]">
              Sin datos de ventas en el servidor
            </div>
          ) : (
            <div className="divide-y-4 divide-neutral-900">
              {sales.map((sale) => (
                <div key={sale.id} className="p-6 hover:bg-neutral-900/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center text-secondary-neon">
                      <Clock size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black text-white">VENTA #{sale.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm ${
                          sale.payment_method === 'Efectivo' ? 'bg-green-900 text-green-400' :
                          sale.payment_method === 'Tarjeta' ? 'bg-blue-900 text-blue-400' :
                          'bg-purple-900 text-purple-400'
                        }`}>
                          {sale.payment_method.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sale.sale_items?.map((item, idx) => {
                          const productName = Array.isArray(item.products) 
                            ? item.products[0]?.name 
                            : item.products?.name;
                          return (
                            <span key={idx} className="text-[10px] text-neutral-500 font-bold">
                              {item.quantity}x {productName}{idx < sale.sale_items.length - 1 ? ',' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-right">
                    <div className="hidden md:block">
                      <p className="text-[8px] font-mono text-neutral-600 uppercase">Fecha_Hora</p>
                      <p className="text-[10px] font-bold text-white uppercase">
                        {new Date(sale.created_at).toLocaleString('es-CO', { 
                          day: '2-digit', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-neutral-600 uppercase">Monto_Total</p>
                      <p className="text-xl font-black text-secondary-neon italic">
                        ${Number(sale.total).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <ChevronRight className="text-neutral-800" size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-[8px] font-mono text-neutral-700 uppercase tracking-widest">
          Los datos mostrados corresponden a la actividad de los últimos 30 días
        </p>
      </div>
    </Shell>
  );
}
