"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(`ERROR: ${error.message.toUpperCase()}`);
      } else if (data.user) {
        window.location.href = "/";
        return;
      }
    } catch (err: any) {
      setError(`ERROR CRÍTICO: ${err.message || 'FALLO DE RED'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 brightness-90"
      >
        <source src="/logovideo.mp4" type="video/mp4" />
      </video>

      <div className="scanline-overlay z-10" />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-black/80 backdrop-blur-md border-4 border-primary-neon p-8 arcade-shadow-pink relative z-20"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.img 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            src="/branding-logo.jpg" 
            alt="Punto Retro Logo" 
            className="w-48 h-auto mb-4 border-2 border-primary-neon p-1 bg-black arcade-shadow-cyan"
          />
          <p className="text-[10px] font-bold text-secondary-neon uppercase tracking-[0.4em] mt-2 animate-pulse">SISTEMA POS ACTIVO</p>
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
              className="w-full bg-black/50 border-2 border-neutral-800 p-4 text-sm font-mono focus:border-secondary-neon outline-none text-white placeholder:text-neutral-700 transition-all"
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
              className="w-full bg-black/50 border-2 border-neutral-800 p-4 text-sm font-mono focus:border-secondary-neon outline-none text-white placeholder:text-neutral-700 transition-all"
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
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px #FF007F' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-primary-neon text-black font-black p-4 uppercase text-sm arcade-shadow-cyan disabled:opacity-50 transition-all"
          >
            {loading ? "CARGANDO..." : "INGRESAR AL SISTEMA"}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-neutral-900 text-center">
          <p className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">
            CONTROL DE ACCESO V1.0.5
          </p>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-neutral-500 text-[10px] font-bold uppercase tracking-[0.5em] z-20">
        © 2026 PUNTO RETRO CAFE BAR
      </div>
    </div>
  );
}
