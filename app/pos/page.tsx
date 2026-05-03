"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Percent, 
  HeartHandshake, 
  Barcode,
  Search,
  Loader2,
  Check
} from "lucide-react";
import Shell from "@/components/Shell";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  qty: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Nequi" | "Daviplata" | "Tarjeta">("Efectivo");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Barcode scanning state
  const scanBuffer = useRef("");
  const lastKeyTime = useRef(Date.now());

  useEffect(() => {
    fetchProducts();
    
    // Global barcode listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // If time between keys is short, it's likely a scanner
      if (now - lastKeyTime.current > 100) {
        scanBuffer.current = "";
      }
      
      lastKeyTime.current = now;

      if (e.key === 'Enter') {
        if (scanBuffer.current.length > 2) {
          handleBarcodeScan(scanBuffer.current);
          scanBuffer.current = "";
        }
      } else if (e.key.length === 1) {
        scanBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]); // Re-bind when products change to have latest list

  const fetchProducts = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error(error);
    else setProducts(data || []);
    setLoading(false);
  };

  const handleBarcodeScan = (code: string) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      addToCart(product);
      // Visual feedback or sound could go here
    }
  };

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === p.id);
      if (existing) {
        return prev.map(item => item.id === p.id ? {...item, qty: item.qty + 1} : item);
      }
      return [...prev, {...p, qty: 1}];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return {...item, qty: newQty};
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount + tip;

  const handleCompleteSale = async () => {
    if (cart.length === 0 || !supabase) return;
    
    // In a real app, you'd save to 'sales' and 'sale_items' tables here
    // And update product stock
    alert(`¡Venta completada!\nTotal: $${total.toFixed(2)}\nMétodo: ${paymentMethod}`);
    setCart([]);
    setDiscount(0);
    setTip(0);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  );

  return (
    <Shell>
      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        {/* Catálogo */}
        <div className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
          <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-secondary-neon font-black text-3xl italic uppercase tracking-tighter">Terminal de Ventas</h1>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                <Barcode size={12} /> Lector activo | Esperando escaneo...
              </p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="text"
                placeholder="BUSCAR PRODUCTO O SCAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black border-2 border-neutral-900 p-3 pl-10 text-[10px] font-black uppercase focus:border-secondary-neon outline-none w-full md:w-64"
              />
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-secondary-neon" size={48} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <motion.div 
                    key={p.id} 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-neutral-900/50 border-2 border-neutral-800 p-4 flex flex-col items-center cursor-pointer hover:border-secondary-neon transition-colors relative group"
                    onClick={() => addToCart(p)}
                  >
                    <div className="text-2xl mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                      {p.category === 'Bebidas' ? '🥤' : p.category === 'Comida' ? '🍔' : '📦'}
                    </div>
                    <p className="text-[9px] font-black uppercase text-center mb-1 leading-tight">{p.name}</p>
                    <p className="text-tertiary-neon font-bold text-xs">${Number(p.price).toFixed(2)}</p>
                    <div className="absolute top-1 right-1 text-[7px] text-neutral-600 font-mono">STOCK: {p.stock}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Carrito / Checkout */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full">
          <div className="bg-black border-4 border-primary-neon p-6 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(255,0,127,0.2)]">
            <h3 className="text-primary-neon font-black text-sm uppercase mb-6 flex items-center gap-3">
              <ShoppingCart size={20} /> Carrito de Venta
            </h3>
            
            <div className="flex-1 overflow-y-auto mb-6 space-y-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <div className="text-center mt-12 text-neutral-600">
                    <div className="w-16 h-16 border-2 border-dashed border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                      <Barcode size={32} />
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest">Esperando Productos</p>
                    <p className="text-[8px] uppercase mt-2">Escanea un código para empezar</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-neutral-900 border border-neutral-800 p-3 flex justify-between items-center group"
                    >
                      <div className="flex-1">
                        <p className="text-[9px] font-black uppercase truncate pr-2">{item.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center border border-neutral-800">
                            <button onClick={() => updateQty(item.id, -1)} className="px-2 py-0.5 text-xs hover:bg-primary-neon hover:text-black">-</button>
                            <span className="px-2 text-[10px] font-bold font-mono">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="px-2 py-0.5 text-xs hover:bg-secondary-neon hover:text-black">+</button>
                          </div>
                          <span className="text-tertiary-neon text-[10px] font-bold">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-neutral-700 hover:text-primary-neon transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="border-t-2 border-neutral-900 pt-4 space-y-4">
              {/* Descuentos y Propinas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                    <Percent size={10} /> Descuento (%)
                  </label>
                  <input 
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono text-white outline-none focus:border-primary-neon"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-bold text-neutral-500 flex items-center gap-1">
                    <HeartHandshake size={10} /> Propina ($)
                  </label>
                  <input 
                    type="number"
                    value={tip}
                    onChange={(e) => setTip(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono text-white outline-none focus:border-secondary-neon"
                  />
                </div>
              </div>

              {/* Medios de Pago */}
              <div className="space-y-2">
                <label className="text-[8px] uppercase font-bold text-neutral-500">Medio de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {id: 'Efectivo', icon: Banknote, color: 'hover:border-secondary-neon'},
                    {id: 'Nequi', icon: Smartphone, color: 'hover:border-primary-neon'},
                    {id: 'Daviplata', icon: Smartphone, color: 'hover:border-tertiary-neon'},
                    {id: 'Tarjeta', icon: CreditCard, color: 'hover:border-white'}
                  ].map((m) => (
                    <button 
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex items-center gap-2 p-2 border-2 text-[9px] font-black uppercase transition-all ${
                        paymentMethod === m.id 
                          ? 'bg-secondary-neon text-black border-white' 
                          : `bg-neutral-900 border-neutral-800 text-neutral-400 ${m.color}`
                      }`}
                    >
                      <m.icon size={12} /> {m.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-neutral-900 p-4 border-l-4 border-secondary-neon">
                <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold uppercase mb-1">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-primary-neon font-bold uppercase mb-1">
                    <span>Descuento ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {tip > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-tertiary-neon font-bold uppercase mb-1">
                    <span>Propina</span>
                    <span>+${tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 border-t border-neutral-800 pt-2">
                  <span className="text-xs font-black uppercase">Total Neto</span>
                  <span className="text-secondary-neon font-black text-2xl italic tracking-tighter">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary-neon text-black font-black p-4 uppercase text-sm arcade-shadow-cyan disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                disabled={cart.length === 0}
                onClick={handleCompleteSale}
              >
                <Check size={20} /> Completar Venta [ENTER]
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
