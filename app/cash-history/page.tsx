"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  ChevronRight,
  Filter,
  Loader2,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X
} from "lucide-react";
import Shell from "@/components/Shell";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";

interface CashSession {
  id: string;
  opened_at: string;
  closed_at: string;
  initial_amount: number;
  final_amount_expected: number;
  final_amount_real: number;
  discrepancy_amount: number;
  discrepancy_reason: string;
  status: string;
}

interface Sale {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
}

export default function CashHistoryPage() {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null);
  const [sessionSales, setSessionSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("cash_sessions")
      .select("*")
      .order("opened_at", { ascending: false });

    if (error) console.error(error);
    else setSessions(data || []);
    setLoading(false);
  };

  const fetchSessionSales = async (sessionId: string) => {
    if (!supabase) return;
    setLoadingSales(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });
    
    if (error) console.error(error);
    else setSessionSales(data || []);
    setLoadingSales(false);
  };

  const handleRowClick = (session: CashSession) => {
    setSelectedSession(session);
    fetchSessionSales(session.id);
  };

  const filteredSessions = sessions.filter(s => {
    if (filter === "discrepancies") return Number(s.discrepancy_amount) !== 0;
    if (filter === "balanced") return Number(s.discrepancy_amount) === 0;
    return true;
  });

  const totalDiscrepancy = filteredSessions.reduce((sum, s) => sum + Number(s.discrepancy_amount), 0);

  return (
    <Shell>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-primary-neon font-black text-3xl italic uppercase tracking-tighter">Auditoría de Cierres</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Historial de arqueos y auditoría de turnos</p>
        </div>
        
        <div className="flex bg-neutral-900 p-1 border-2 border-neutral-800">
          {['all', 'discrepancies', 'balanced'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-black uppercase transition-colors ${filter === f ? 'bg-primary-neon text-black' : 'text-neutral-500 hover:text-white'}`}
            >
              {f === 'all' ? 'Todos' : f === 'discrepancies' ? 'Discrepancias' : 'Cuadrados'}
            </button>
          ))}
        </div>
      </header>

      {/* Resumen de Auditoría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-neutral-900/30 border-2 border-neutral-800 p-4">
          <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Total Turnos</p>
          <p className="text-2xl font-black text-white font-mono">{filteredSessions.length}</p>
        </div>
        <div className="bg-neutral-900/30 border-2 border-neutral-800 p-4">
          <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Balance de Diferencias</p>
          <p className={`text-2xl font-black font-mono ${totalDiscrepancy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${totalDiscrepancy.toLocaleString()}
          </p>
        </div>
        <div className="bg-neutral-900/30 border-2 border-neutral-800 p-4">
          <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Efectivo Real Total</p>
          <p className="text-2xl font-black text-secondary-neon font-mono">
            ${filteredSessions.reduce((sum, s) => sum + Number(s.final_amount_real), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-black border-4 border-neutral-900 overflow-hidden arcade-shadow-cyan">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-900 border-b-2 border-neutral-800">
                <th className="p-4 text-left text-[8px] font-mono text-neutral-500 uppercase">Fecha / Turno</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Base</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Sistema</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Real</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Diferencia</th>
                <th className="p-4 text-left text-[8px] font-mono text-neutral-500 uppercase">Observaciones</th>
                <th className="p-4 text-center text-[8px] font-mono text-neutral-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center"><Loader2 className="animate-spin text-primary-neon mx-auto" size={32} /></td>
                </tr>
              ) : filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-900/50 transition-colors group cursor-pointer" onClick={() => handleRowClick(s)}>
                  <td className="p-4">
                    <p className="text-[10px] font-black text-white uppercase">{new Date(s.opened_at).toLocaleDateString('es-CO')}</p>
                    <p className="text-[8px] text-neutral-600 font-mono mt-0.5">
                      {new Date(s.opened_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {s.closed_at ? new Date(s.closed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'OPEN'}
                    </p>
                  </td>
                  <td className="p-4 text-right text-[10px] font-bold text-neutral-400 font-mono">${Number(s.initial_amount).toFixed(0)}</td>
                  <td className="p-4 text-right text-[10px] font-bold text-white font-mono">${Number(s.final_amount_expected).toFixed(0)}</td>
                  <td className="p-4 text-right text-[10px] font-bold text-secondary-neon font-mono">${Number(s.final_amount_real).toFixed(0)}</td>
                  <td className="p-4 text-right">
                    <span className={`text-[10px] font-black font-mono ${Number(s.discrepancy_amount) === 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Number(s.discrepancy_amount) > 0 ? '+' : ''}{Number(s.discrepancy_amount).toFixed(0)}
                    </span>
                  </td>
                  <td className="p-4">
                    {s.discrepancy_reason ? (
                      <div className="flex items-start gap-2 max-w-[150px]">
                        <AlertTriangle size={10} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[8px] text-neutral-400 leading-tight italic truncate">{s.discrepancy_reason}</p>
                      </div>
                    ) : <CheckCircle2 size={12} className="text-green-900 opacity-20" />}
                  </td>
                  <td className="p-4 text-center">
                    <ChevronRight size={16} className="text-neutral-800 group-hover:text-primary-neon transition-colors mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Detalle de Ventas del Turno */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-black border-4 border-primary-neon p-8 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col arcade-shadow-cyan"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-primary-neon font-black text-2xl uppercase italic tracking-tighter">Detalle del Turno</h2>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Sesión: {selectedSession.id.slice(0,8)}</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="text-neutral-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-neutral-900 p-3 border-l-2 border-secondary-neon">
                  <p className="text-[8px] uppercase font-bold text-neutral-600">Base Inicial</p>
                  <p className="text-sm font-black text-white font-mono">${Number(selectedSession.initial_amount).toFixed(0)}</p>
                </div>
                <div className="bg-neutral-900 p-3 border-l-2 border-white">
                  <p className="text-[8px] uppercase font-bold text-neutral-600">Ventas Sistema</p>
                  <p className="text-sm font-black text-white font-mono">${(Number(selectedSession.final_amount_expected) - Number(selectedSession.initial_amount)).toFixed(0)}</p>
                </div>
                <div className="bg-neutral-900 p-3 border-l-2 border-primary-neon">
                  <p className="text-[8px] uppercase font-bold text-neutral-600">Total Real</p>
                  <p className="text-sm font-black text-primary-neon font-mono">${Number(selectedSession.final_amount_real).toFixed(0)}</p>
                </div>
                <div className={`bg-neutral-900 p-3 border-l-2 ${Number(selectedSession.discrepancy_amount) === 0 ? 'border-green-500' : 'border-red-500'}`}>
                  <p className="text-[8px] uppercase font-bold text-neutral-600">Diferencia</p>
                  <p className={`text-sm font-black font-mono ${Number(selectedSession.discrepancy_amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Number(selectedSession.discrepancy_amount).toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-black z-10">
                    <tr className="border-b-2 border-neutral-900 text-left">
                      <th className="py-3 text-[10px] font-black uppercase text-neutral-700">Hora</th>
                      <th className="py-3 text-[10px] font-black uppercase text-neutral-700">ID Venta</th>
                      <th className="py-3 text-[10px] font-black uppercase text-neutral-700">Método</th>
                      <th className="py-3 text-right text-[10px] font-black uppercase text-neutral-700">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {loadingSales ? (
                      <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="animate-spin text-primary-neon mx-auto" /></td></tr>
                    ) : sessionSales.length === 0 ? (
                      <tr><td colSpan={4} className="py-10 text-center text-[10px] text-neutral-800 uppercase font-bold">Sin ventas registradas en este turno</td></tr>
                    ) : sessionSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-neutral-900/20 transition-colors">
                        <td className="py-3 text-[10px] font-mono text-neutral-400">{new Date(sale.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="py-3 text-[10px] font-black text-white uppercase">#{sale.id.slice(0,8)}</td>
                        <td className="py-3 text-[10px] font-bold text-secondary-neon uppercase">{sale.payment_method}</td>
                        <td className="py-3 text-right text-[10px] font-black text-white font-mono">${Number(sale.total).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedSession.discrepancy_reason && (
                <div className="mt-6 p-4 bg-red-900/10 border-2 border-red-900/30">
                  <p className="text-[10px] font-black text-red-500 uppercase mb-1 flex items-center gap-2">
                    <AlertTriangle size={14} /> Nota de Auditoría:
                  </p>
                  <p className="text-[11px] text-neutral-300 italic font-medium leading-relaxed">
                    "{selectedSession.discrepancy_reason}"
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
