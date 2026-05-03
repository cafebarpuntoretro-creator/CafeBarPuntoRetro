"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import Shell from "@/components/Shell";
import { motion } from "motion/react";

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  const products = [
    { id: 1, name: "Pac-Man IPA", category: "Bebidas", price: 15.0, stock: 45 },
    { id: 2, name: "Donkey Kong Pretzels", category: "Snacks", price: 8.5, stock: 12 },
    { id: 3, name: "Pixel Latte", category: "Café", price: 12.0, stock: 30 },
  ];

  return (
    <Shell>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-secondary-neon font-black text-3xl italic uppercase tracking-tighter">Inventario</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Gestiona tus suministros</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-primary-neon text-black font-black p-4 arcade-shadow-cyan uppercase text-xs"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={18} />
          Agregar Ítem
        </motion.button>
      </header>

      {showAddForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black border-4 border-primary-neon p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(255,0,127,0.3)]"
        >
          <h3 className="text-primary-neon font-black text-sm uppercase mb-6">Nuevo Ítem</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-neutral-500">Nombre</label>
              <input type="text" className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-primary-neon outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-neutral-500">Categoría</label>
              <select className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-primary-neon outline-none">
                <option>Bebidas</option>
                <option>Snacks</option>
                <option>Café</option>
                <option>Juegos</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-neutral-500">Precio</label>
              <input type="number" className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-primary-neon outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-neutral-500">Stock</label>
              <input type="number" className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-primary-neon outline-none" />
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button className="bg-secondary-neon text-black font-black px-6 py-2 text-xs uppercase arcade-shadow-pink">Guardar</button>
            <button className="text-neutral-500 font-bold px-6 py-2 text-xs uppercase hover:text-white" onClick={() => setShowAddForm(false)}>Cancelar</button>
          </div>
        </motion.div>
      )}

      <div className="bg-black border-4 border-neutral-900 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-900/50">
              <th className="p-4 text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Ítem</th>
              <th className="p-4 text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Categoría</th>
              <th className="p-4 text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Precio</th>
              <th className="p-4 text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Stock</th>
              <th className="p-4 text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-900 hover:bg-neutral-900/30 transition-colors">
                <td className="p-4 font-bold text-sm">{p.name}</td>
                <td className="p-4 text-xs text-tertiary-neon uppercase font-bold">{p.category}</td>
                <td className="p-4 font-mono text-sm">${p.price.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-neutral-900 border border-neutral-800 overflow-hidden">
                      <div 
                        className={`h-full ${p.stock < 15 ? 'bg-primary-neon' : 'bg-secondary-neon'}`}
                        style={{ width: `${Math.min(p.stock, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{p.stock}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-4">
                    <button className="text-secondary-neon hover:scale-110 transition-transform"><Edit2 size={16}/></button>
                    <button className="text-primary-neon hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
