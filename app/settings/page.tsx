"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Store, 
  Bell, 
  Shield, 
  Database, 
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2
} from "lucide-react";
import Shell from "@/components/Shell";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Settings State
  const [config, setConfig] = useState({
    businessName: "Cafe Bar Punto Retro",
    address: "Calle Retro #123",
    phone: "300 000 0000",
    lowStockThreshold: 5,
    defaultTip: 10,
    enableStockDecrement: true,
    autoOpenDrawer: true
  });

  const handleSave = async () => {
    setLoading(true);
    // In a real app, we would save to a 'settings' table in Supabase
    // For now, we simulate success and save to localStorage
    localStorage.setItem('pos_config', JSON.stringify(config));
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  useEffect(() => {
    const saved = localStorage.getItem('pos_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="text-primary-neon font-black text-3xl italic uppercase tracking-tighter">Configuración del Sistema</h1>
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Personaliza tu experiencia de punto de venta</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Negocio */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-black border-4 border-neutral-900 p-6 arcade-shadow-cyan">
            <h2 className="text-primary-neon font-black text-sm uppercase mb-6 flex items-center gap-2">
              <Store size={18} /> Información del Establecimiento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Nombre del Negocio</label>
                <input 
                  type="text" 
                  value={config.businessName}
                  onChange={e => setConfig({...config, businessName: e.target.value})}
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-3 text-white font-bold outline-none focus:border-primary-neon transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Teléfono de Contacto</label>
                <input 
                  type="text" 
                  value={config.phone}
                  onChange={e => setConfig({...config, phone: e.target.value})}
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-3 text-white font-bold outline-none focus:border-primary-neon transition-colors"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Dirección Física</label>
                <input 
                  type="text" 
                  value={config.address}
                  onChange={e => setConfig({...config, address: e.target.value})}
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-3 text-white font-bold outline-none focus:border-primary-neon transition-colors"
                />
              </div>
            </div>
          </section>

          <section className="bg-black border-4 border-neutral-900 p-6 arcade-shadow-pink">
            <h2 className="text-secondary-neon font-black text-sm uppercase mb-6 flex items-center gap-2">
              <Bell size={18} /> Alertas e Inventario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Umbral de Stock Bajo</label>
                <p className="text-[9px] text-neutral-600 mb-2">Avisar cuando queden menos de:</p>
                <input 
                  type="number" 
                  value={config.lowStockThreshold}
                  onChange={e => setConfig({...config, lowStockThreshold: parseInt(e.target.value) || 0})}
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-3 text-white font-mono font-bold outline-none focus:border-secondary-neon transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase">Propina Sugerida (%)</label>
                <p className="text-[9px] text-neutral-600 mb-2">Valor por defecto en el POS:</p>
                <input 
                  type="number" 
                  value={config.defaultTip}
                  onChange={e => setConfig({...config, defaultTip: parseInt(e.target.value) || 0})}
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-3 text-white font-mono font-bold outline-none focus:border-secondary-neon transition-colors"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Acciones */}
        <div className="space-y-8">
          <section className="bg-neutral-900/50 border-2 border-neutral-800 p-6">
            <h2 className="text-white font-black text-xs uppercase mb-6 flex items-center gap-2">
              <Shield size={16} /> Preferencias de Seguridad
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={config.enableStockDecrement}
                  onChange={e => setConfig({...config, enableStockDecrement: e.target.checked})}
                  className="hidden"
                />
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${config.enableStockDecrement ? 'bg-primary-neon' : 'bg-neutral-800'}`}>
                  <div className={`w-3 h-3 bg-black rounded-full transition-transform ${config.enableStockDecrement ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-[10px] font-bold text-neutral-400 group-hover:text-white uppercase">Descontar Stock Automáticamente</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={config.autoOpenDrawer}
                  onChange={e => setConfig({...config, autoOpenDrawer: e.target.checked})}
                  className="hidden"
                />
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${config.autoOpenDrawer ? 'bg-primary-neon' : 'bg-neutral-800'}`}>
                  <div className={`w-3 h-3 bg-black rounded-full transition-transform ${config.autoOpenDrawer ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-[10px] font-bold text-neutral-400 group-hover:text-white uppercase">Abrir Cajón al completar venta</span>
              </label>
            </div>
          </section>

          <section className="bg-red-900/10 border-2 border-red-900/30 p-6">
            <h2 className="text-red-500 font-black text-xs uppercase mb-6 flex items-center gap-2">
              <Database size={16} /> Mantenimiento
            </h2>
            <p className="text-[9px] text-neutral-500 mb-4 font-medium uppercase leading-relaxed">Zona peligrosa. Estas acciones no se pueden deshacer.</p>
            <button 
              onClick={() => alert("Esta función requiere nivel de SuperAdmin")}
              className="w-full border-2 border-red-900 text-red-500 p-3 text-[10px] font-black uppercase hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Limpiar Historial de Ventas
            </button>
          </section>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary-neon text-black font-black p-5 uppercase text-sm arcade-shadow-pink hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : success ? <CheckCircle2 /> : <Save />}
            {loading ? 'Guardando...' : success ? '¡Configuración Guardada!' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </Shell>
  );
}
