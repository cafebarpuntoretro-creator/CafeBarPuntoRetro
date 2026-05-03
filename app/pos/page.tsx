"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, CreditCard, Banknote } from "lucide-react";
import Shell from "@/components/Shell";
import { motion, AnimatePresence } from "motion/react";

export default function POSPage() {
  const [cart, setCart] = useState<{id: number, name: string, price: number, qty: number}[]>([]);

  const products = [
    { id: 1, name: "Pac-Man IPA", price: 15.0, icon: "🍺" },
    { id: 2, name: "Donkey Kong Pretzels", price: 8.5, icon: "🥨" },
    { id: 3, name: "Pixel Latte", price: 12.0, icon: "☕" },
    { id: 4, name: "Retro Burger", price: 22.0, icon: "🍔" },
    { id: 5, name: "8-bit Cookie", price: 5.0, icon: "🍪" },
    { id: 6, name: "Power-up Soda", price: 7.0, icon: "🥤" },
  ];

  const addToCart = (p: any) => {
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCart([...cart, {...p, qty: 1}]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <Shell>
      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        {/* Catálogo */}
        <div className="col-span-12 lg:col-span-8 overflow-y-auto pr-4">
          <header className="mb-8">
            <h1 className="text-secondary-neon font-black text-3xl italic uppercase tracking-tighter">Menú de Ventas</h1>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Selecciona productos para la orden</p>
          </header>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <motion.div 
                key={p.id} 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black border-4 border-neutral-900 p-6 flex flex-col items-center cursor-pointer hover:border-primary-neon transition-colors arcade-shadow-cyan hover:arcade-shadow-pink"
                onClick={() => addToCart(p)}
              >
                <div className="text-4xl mb-4">{p.icon}</div>
                <p className="text-[10px] font-black uppercase text-center mb-2">{p.name}</p>
                <p className="text-tertiary-neon font-bold">${p.price.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full">
          <div className="bg-black border-4 border-primary-neon p-6 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(255,0,127,0.2)]">
            <h3 className="text-primary-neon font-black text-sm uppercase mb-6 flex items-center gap-3">
              <ShoppingCart size={20} /> Orden Actual
            </h3>
            
            <div className="flex-1 overflow-y-auto mb-6 space-y-3">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <div className="text-center mt-12 text-neutral-600">
                    <p className="text-[10px] uppercase font-bold tracking-widest">Carrito vacío</p>
                    <p className="text-[8px] uppercase mt-2">Esperando selección...</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-neutral-900/50 border-2 border-neutral-800 p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase">{item.qty}x {item.name}</p>
                        <p className="text-tertiary-neon text-xs font-bold">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-primary-neon hover:scale-110 transition-transform">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="border-t-4 border-neutral-900 pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold uppercase text-neutral-500">Total a Pagar</span>
                <span className="text-secondary-neon font-black text-2xl italic">${total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="bg-neutral-900 border-2 border-neutral-800 p-3 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:border-secondary-neon">
                  <Banknote size={16} /> Efectivo
                </button>
                <button className="bg-neutral-900 border-2 border-neutral-800 p-3 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:border-secondary-neon">
                  <CreditCard size={16} /> Tarjeta
                </button>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary-neon text-black font-black p-4 uppercase text-sm arcade-shadow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cart.length === 0}
                onClick={() => {
                  alert("¡Venta completada! INSERT COIN");
                  setCart([]);
                }}
              >
                Completar Venta
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
