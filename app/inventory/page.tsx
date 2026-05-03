"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Check } from "lucide-react";
import Shell from "@/components/Shell";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode?: string;
  image_url?: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Bebidas",
    price: 0,
    stock: 0,
    barcode: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // Clean data: Ensure numbers are numbers and barcode is null if empty
    const cleanData = {
      ...formData,
      barcode: formData.barcode.trim() === "" ? null : formData.barcode.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock)
    };

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(cleanData)
        .eq("id", editingId);
      
      if (error) {
        window.dispatchEvent(new CustomEvent('pos-notify', {
          detail: { title: 'Error', message: 'No se pudo actualizar: ' + error.message, type: 'alert' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('pos-notify', {
          detail: { title: 'Actualizado', message: 'Producto modificado exitosamente', type: 'info' }
        }));
        setEditingId(null);
        setShowAddForm(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([cleanData]);
      
      if (error) {
        window.dispatchEvent(new CustomEvent('pos-notify', {
          detail: { title: 'Error', message: 'Error al guardar: ' + error.message, type: 'alert' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('pos-notify', {
          detail: { title: 'Registrado', message: 'Nuevo producto añadido al sistema', type: 'info' }
        }));
        setShowAddForm(false);
        setFormData({ name: "", category: "Bebidas", price: 0, stock: 0, barcode: "" });
        fetchProducts();
      }
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      barcode: p.barcode || ""
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm("¿Estás seguro de eliminar este producto? Esta acción es definitiva.")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    
    if (error) {
      const isLinked = error.message.includes("violates foreign key constraint");
      window.dispatchEvent(new CustomEvent('pos-notify', {
        detail: { 
          title: 'Error al Eliminar', 
          message: isLinked 
            ? 'No puedes eliminarlo porque tiene ventas registradas. Intenta editar el stock a 0.' 
            : error.message, 
          type: 'alert' 
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('pos-notify', {
        detail: { title: 'Eliminado', message: 'Producto removido del sistema', type: 'info' }
      }));
      fetchProducts();
    }
  };

  return (
    <Shell>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-secondary-neon font-black text-2xl md:text-3xl italic uppercase tracking-tighter">Inventario</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Control de existencias</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 font-black p-3 md:p-4 arcade-shadow-cyan uppercase text-[10px] md:text-xs transition-colors w-full sm:w-auto justify-center ${
            showAddForm ? 'bg-primary-neon text-black' : 'bg-secondary-neon text-black'
          }`}
          onClick={() => {
            if (showAddForm) {
              setEditingId(null);
              setFormData({ name: "", category: "Bebidas", price: 0, stock: 0, barcode: "" });
            }
            setShowAddForm(!showAddForm);
          }}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Cerrar Panel' : 'Nuevo Producto'}
        </motion.button>
      </header>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black border-4 border-primary-neon p-4 md:p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(255,0,127,0.3)] md:shadow-[8px_8px_0px_0px_rgba(255,0,127,0.3)]"
          >
            <h3 className="text-primary-neon font-black text-[10px] md:text-sm uppercase mb-6 flex items-center gap-2">
              <PlusCircleIcon className="w-4 h-4" /> {editingId ? 'Editar Producto' : 'Registrar Nuevo Ítem'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] md:text-[10px] uppercase font-bold text-neutral-500">Nombre</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-secondary-neon outline-none text-white" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] md:text-[10px] uppercase font-bold text-neutral-500">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-secondary-neon outline-none text-white"
                  >
                    <option>Bebidas</option>
                    <option>Comida</option>
                    <option>Cafetería</option>
                    <option>Arcade</option>
                    <option>Merchandising</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] md:text-[10px] uppercase font-bold text-neutral-500">Precio (COP)</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-secondary-neon outline-none text-white font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] md:text-[10px] uppercase font-bold text-neutral-500">Stock</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                    className="bg-neutral-900 border-2 border-neutral-800 p-2 text-sm focus:border-secondary-neon outline-none text-white font-mono" 
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
                  <label className="text-[9px] md:text-[10px] uppercase font-bold text-secondary-neon">Barcode</label>
                  <input 
                    type="text" 
                    placeholder="Escanear..."
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="bg-black border-2 border-secondary-neon p-2 text-sm focus:bg-neutral-900 outline-none text-secondary-neon font-mono" 
                  />
                </div>
              </div>
              <div className="mt-8">
                <button type="submit" className="w-full sm:w-auto bg-secondary-neon text-black font-black px-6 py-3 text-[10px] md:text-xs uppercase arcade-shadow-pink flex items-center justify-center gap-2">
                  <Check size={16} /> {editingId ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-black border-4 border-neutral-900 overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
            <Loader2 className="text-secondary-neon animate-spin mb-4" size={48} />
            <p className="text-[10px] font-mono text-secondary-neon animate-pulse uppercase tracking-[0.3em]">Accediendo...</p>
          </div>
        ) : null}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-neutral-900/50">
                <th className="p-4 text-[9px] md:text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Producto</th>
                <th className="p-4 text-[9px] md:text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Categoría</th>
                <th className="p-4 text-[9px] md:text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Precio</th>
                <th className="p-4 text-[9px] md:text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Stock</th>
                <th className="p-4 text-[9px] md:text-[10px] uppercase text-secondary-neon font-black tracking-widest border-b-2 border-neutral-800">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-neutral-600 font-mono text-[10px] uppercase tracking-widest">
                    Vaciado
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-900 hover:bg-neutral-900/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="hidden xs:flex w-6 h-6 bg-neutral-900 border border-neutral-800 items-center justify-center text-xs grayscale group-hover:grayscale-0">
                          📦
                        </div>
                        <span className="font-bold text-xs md:text-sm tracking-tight truncate max-w-[120px] md:max-w-none">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[9px] md:text-[10px] text-tertiary-neon uppercase font-bold tracking-wider">{p.category}</td>
                    <td className="p-4 font-mono text-xs md:text-sm text-white">${Number(p.price).toFixed(0)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block w-24 h-1.5 bg-neutral-900 border border-neutral-800 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              p.stock < 10 ? 'bg-primary-neon animate-pulse' : 
                              p.stock < 30 ? 'bg-yellow-500' : 'bg-secondary-neon'
                            }`}
                            style={{ width: `${Math.min((p.stock / 100) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[9px] md:text-[10px] font-black font-mono ${p.stock < 10 ? 'text-primary-neon' : 'text-white'}`}>
                          {p.stock}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleEdit(p)}
                          className="text-secondary-neon"
                        >
                          <Edit2 size={14}/>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleDelete(p.id)}
                          className="text-primary-neon"
                        >
                          <Trash2 size={14}/>
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Stats Overlay - Adjusted for mobile */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-20 lg:left-64 right-0 h-10 bg-black border-t-2 border-neutral-900 px-4 md:px-6 flex items-center justify-between text-[7px] md:text-[8px] font-mono uppercase tracking-widest text-neutral-500 z-30">
        <div className="flex gap-4 md:gap-6">
          <span>Items: <span className="text-secondary-neon">{products.length}</span></span>
          <span className="hidden xs:inline">Alertas: <span className="text-primary-neon">{products.filter(p => p.stock < 10).length}</span></span>
        </div>
        <div className="animate-pulse">INV_SYS: OK</div>
      </div>
    </Shell>
  );
}

function PlusCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}
