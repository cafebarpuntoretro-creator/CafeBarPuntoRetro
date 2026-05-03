"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Gamepad2, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("ERROR: CONFIGURACIÓN DE SUPABASE AUSENTE");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("ERROR: CREDENCIALES INVÁLIDAS");
      } else {
        router.push("/");
        return; // Success
      }
    } catch (err) {
      setError("ERROR: FALLO EN LA CONEXIÓN");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline-overlay" />
      
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary-neon/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-secondary-neon/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-black border-4 border-neutral-900 p-8 arcade-shadow-pink relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-neutral-900 flex items-center justify-center mb-4 border-2 border-primary-neon">
            <Gamepad2 className="text-primary-neon" size={32} />
          </div>
          <h1 className="text-2xl font-black italic text-primary-neon tracking-widest uppercase">
            INSERT <span className="text-secondary-neon">COIN</span>
          </h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-2">Acceso al Sistema POS</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-secondary-neon flex items-center gap-2 tracking-widest">
              <User size={12} /> Usuario / Email
            </label>
            <input 
              type="email" 
              required
              placeholder="USER_ID@RETRO"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 text-sm font-mono focus:border-secondary-neon outline-none text-white placeholder:text-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-secondary-neon flex items-center gap-2 tracking-widest">
              <Lock size={12} /> Contraseña
            </label>
            <input 
              type="password" 
              required
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 text-sm font-mono focus:border-secondary-neon outline-none text-white placeholder:text-neutral-700"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10 }}
              animate={{ x: [0, -5, 5, -5, 5, 0] }}
              className="bg-primary-neon/10 border-2 border-primary-neon p-3 text-[10px] font-black text-primary-neon text-center uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-primary-neon text-black font-black p-4 uppercase text-sm arcade-shadow-cyan disabled:opacity-50"
          >
            {loading ? "CARGANDO..." : "INGRESAR AL SISTEMA"}
          </motion.button>
        </form>

        <div className="mt-8 pt-8 border-t-2 border-neutral-900 text-center">
          <p className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest animate-pulse">
            SISTEMA OPERATIVO PUNTO_RETRO v1.0.4
          </p>
        </div>
      </motion.div>

      <div className="mt-8 text-neutral-700 text-[10px] font-bold uppercase tracking-[0.3em]">
        © 2026 PUNTO RETRO CAFE BAR
      </div>
    </div>
  );
}
