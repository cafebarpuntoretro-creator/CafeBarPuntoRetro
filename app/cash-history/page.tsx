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
  FileText
} from "lucide-react";
import Shell from "@/components/Shell";
import { motion } from "motion/react";
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

export default function CashHistoryPage() {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, discrepancies, balanced

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

  const filteredSessions = sessions.filter(s => {
    if (filter === "discrepancies") return Number(s.discrepancy_amount) !== 0;
    if (filter === "balanced") return Number(s.discrepancy_amount) === 0;
    return true;
  });

  return (
    <Shell>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-primary-neon font-black text-3xl italic uppercase tracking-tighter">Auditoría de Cierres</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Historial de arqueos y discrepancias de caja</p>
        </div>
        
        <div className="flex bg-neutral-900 p-1 border-2 border-neutral-800">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-[10px] font-black uppercase transition-colors ${filter === 'all' ? 'bg-primary-neon text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter("discrepancies")}
            className={`px-4 py-2 text-[10px] font-black uppercase transition-colors ${filter === 'discrepancies' ? 'bg-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}
          >
            Discrepancias
          </button>
          <button 
            onClick={() => setFilter("balanced")}
            className={`px-4 py-2 text-[10px] font-black uppercase transition-colors ${filter === 'balanced' ? 'bg-green-500 text-white' : 'text-neutral-500 hover:text-white'}`}
          >
            Cuadrados
          </button>
        </div>
      </header>

      <div className="bg-black border-4 border-neutral-900 overflow-hidden arcade-shadow-cyan">
        <div className="p-4 border-b-4 border-neutral-900 bg-neutral-900/20 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-primary-neon tracking-widest">Sesiones de Caja Registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-900/50 border-b-2 border-neutral-800">
                <th className="p-4 text-left text-[8px] font-mono text-neutral-500 uppercase">Fecha / Turno</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Base</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Esperado</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Real</th>
                <th className="p-4 text-right text-[8px] font-mono text-neutral-500 uppercase">Diferencia</th>
                <th className="p-4 text-left text-[8px] font-mono text-neutral-500 uppercase">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin text-primary-neon mx-auto" size={48} />
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-neutral-700 uppercase font-mono text-[10px]">
                    No se encontraron registros de cierre
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-900/30 transition-colors group">
                    <td className="p-4">
                      <p className="text-[10px] font-black text-white uppercase">
                        {new Date(s.opened_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[8px] text-neutral-600 font-mono mt-0.5">
                        {new Date(s.opened_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {s.closed_at ? new Date(s.closed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Abierto'}
                      </p>
                    </td>
                    <td className="p-4 text-right text-[10px] font-bold text-neutral-400 font-mono">
                      ${Number(s.initial_amount).toFixed(0)}
                    </td>
                    <td className="p-4 text-right text-[10px] font-bold text-white font-mono">
                      ${Number(s.final_amount_expected).toFixed(0)}
                    </td>
                    <td className="p-4 text-right text-[10px] font-bold text-secondary-neon font-mono">
                      ${Number(s.final_amount_real).toFixed(0)}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-[10px] font-black font-mono ${Number(s.discrepancy_amount) === 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {Number(s.discrepancy_amount) > 0 ? '+' : ''}{Number(s.discrepancy_amount).toFixed(0)}
                      </span>
                    </td>
                    <td className="p-4">
                      {s.discrepancy_reason ? (
                        <div className="flex items-start gap-2 max-w-xs">
                          <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                          <p className="text-[9px] text-neutral-400 leading-tight italic">"{s.discrepancy_reason}"</p>
                        </div>
                      ) : (
                        <CheckCircle2 size={12} className="text-green-900 opacity-30" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
