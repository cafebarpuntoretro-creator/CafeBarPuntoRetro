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
  Check,
  Clock,
  ReceiptText,
  Edit3,
  Pencil
} from "lucide-react";
import Shell from "@/components/Shell";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

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
  
  // Cash Session State
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [showOpenDrawer, setShowOpenDrawer] = useState(false);
  const [initialBase, setInitialBase] = useState(0);
  const [showCloseDrawer, setShowCloseDrawer] = useState(false);

  // Barcode scanning state
  const scanBuffer = useRef("");
  const lastKeyTime = useRef(Date.now());

  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    fetchSession();
    fetchProducts();
    fetchRecentSales();
  }, []); // Run only once on mount

  const fetchRecentSales = async () => {
    if (!supabase) return;
    
    // Calculate start of today in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data } = await supabase
      .from("sales")
      .select(`
        id,
        total,
        payment_method,
        created_at,
        sale_items (quantity, product_id, products (name))
      `)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });
    setRecentSales(data || []);
  };

  const handleDeleteSale = async (sale: any) => {
    if (!supabase) return;
    if (!confirm("¿Seguro que quieres eliminar esta venta? El stock será devuelto.")) return;

    // 1. Return stock
    for (const item of sale.sale_items) {
      await supabase.rpc('decrement_stock', { x: -item.quantity, row_id: item.product_id });
    }

    // 2. Delete sale (cascades to sale_items)
    const { error } = await supabase.from("sales").delete().eq("id", sale.id);
    
    if (error) alert(error.message);
    else {
      fetchRecentSales();
      fetchProducts();
    }
  };

  const handleEditPayment = async (saleId: string, newMethod: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("sales")
      .update({ payment_method: newMethod })
      .eq("id", saleId);
    
    if (error) alert(error.message);
    else fetchRecentSales();
  };

  useEffect(() => {
    // Global barcode listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if it's a modifier key
      if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift') return;

      const now = Date.now();
      
      // If time between keys is short (< 50ms), it's definitely a scanner
      // If it's slow, we reset the buffer
      if (now - lastKeyTime.current > 50) {
        scanBuffer.current = "";
      }
      
      lastKeyTime.current = now;

      if (e.key === 'Enter') {
        if (scanBuffer.current.length >= 3) {
          e.preventDefault(); // Stop form submissions
          handleBarcodeScan(scanBuffer.current);
          scanBuffer.current = "";
        }
      } else if (e.key.length === 1) {
        scanBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [products]); 

  const fetchSession = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("cash_sessions")
      .select("*")
      .eq("status", "open")
      .maybeSingle();
    
    if (data) {
      setCurrentSession(data);
    } else {
      setShowOpenDrawer(true);
    }
  };

  const handleOpenSession = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("cash_sessions")
      .insert([{ initial_amount: initialBase, status: 'open' }])
      .select()
      .single();
    
    if (error) alert(error.message);
    else {
      setCurrentSession(data);
      setShowOpenDrawer(false);
    }
  };

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
    if (p.stock <= 0) {
      alert("¡Sin Stock! No hay unidades disponibles de " + p.name);
      return;
    }

    // Low stock alert check (threshold 5)
    if (p.stock <= 5) {
      window.dispatchEvent(new CustomEvent('pos-notify', {
        detail: {
          title: 'Stock Crítico',
          message: `El producto ${p.name} tiene solo ${p.stock} unidades.`,
          type: 'alert'
        }
      }));
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === p.id);
      if (existing) {
        if (existing.qty >= p.stock) {
          alert("No puedes vender más de las existencias disponibles (" + p.stock + ")");
          return prev;
        }
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
        const product = products.find(p => p.id === id);
        const newQty = Math.max(1, item.qty + delta);
        if (product && newQty > product.stock) {
          alert("Máximo disponible alcanzado: " + product.stock);
          return item;
        }
        return {...item, qty: newQty};
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount + tip;

  const handleCompleteSale = async () => {
    if (cart.length === 0 || !supabase || !currentSession) return;
    
    // 1. Create Sale Record
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([{ 
        total: total, 
        payment_method: paymentMethod,
        session_id: currentSession.id 
      }])
      .select()
      .single();

    if (saleError) {
      alert("Error al registrar venta: " + saleError.message);
      return;
    }

    // 2. Create Sale Items
    const saleItems = cart.map(item => ({
      sale_id: sale.id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price
    }));

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);
    
    if (itemsError) {
      alert("Error al registrar items: " + itemsError.message);
      return;
    }

    // 3. Update stock (safely with error check)
    for (const item of cart) {
      const { error: stockError } = await supabase.rpc('decrement_stock', { 
        row_id: item.id,
        x: parseInt(item.qty.toString()) 
      });
      
      if (stockError) {
        alert("Error al descontar stock de " + item.name + ": " + stockError.message);
        console.error(stockError);
      }
    }

    alert(`¡Venta completada!\nTotal: $${total.toFixed(2)}\nMétodo: ${paymentMethod}`);
    
    // Dispatch Global Notification
    window.dispatchEvent(new CustomEvent('pos-notify', {
      detail: {
        title: 'Venta Exitosa',
        message: `Orden completada por $${total.toFixed(0)} vía ${paymentMethod}`,
        type: 'info'
      }
    }));

    setCart([]);
    setDiscount(0);
    setTip(0);
    fetchProducts(); // Refresh stock in UI
    fetchRecentSales(); // Refresh history
  };

  const [closingData, setClosingData] = useState({
    expectedCash: 0,
    expectedElectronic: 0,
    totalSales: 0,
    real: 0,
    reason: "",
    breakdown: { cash: 0, nequi: 0, daviplata: 0, card: 0 }
  });

  const prepareCloseSession = async () => {
    if (!supabase || !currentSession) return;
    
    const { data: sales } = await supabase
      .from("sales")
      .select("total, payment_method")
      .eq("session_id", currentSession.id);
    
    const breakdown = { cash: 0, nequi: 0, daviplata: 0, card: 0 };
    sales?.forEach(s => {
      const amt = Number(s.total);
      if (s.payment_method === 'Efectivo') breakdown.cash += amt;
      else if (s.payment_method === 'Nequi') breakdown.nequi += amt;
      else if (s.payment_method === 'Daviplata') breakdown.daviplata += amt;
      else if (s.payment_method === 'Tarjeta') breakdown.card += amt;
    });
    
    const expectedCash = Number(currentSession.initial_amount) + breakdown.cash;
    const expectedElectronic = breakdown.nequi + breakdown.daviplata + breakdown.card;
    const totalSales = breakdown.cash + expectedElectronic;
    
    setClosingData({ 
      expectedCash, 
      expectedElectronic, 
      totalSales, 
      real: expectedCash, 
      reason: "",
      breakdown
    });
    setShowCloseDrawer(true);
  };

  const generatePDFReport = (session: any, closing: any, sales: any[]) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header (Membrete)
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo (Placeholder for the logo we added earlier)
    doc.setTextColor(255, 0, 127); // Pink neon
    doc.setFontSize(22);
    doc.setFont("helvetica", "bolditalic");
    doc.text("PUNTO RETRO", 15, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("CAFE BAR & POS SYSTEM", 15, 32);
    
    doc.text([
      "NIT: 123.456.789-0",
      "Calle 123 # 45 - 67",
      "Tel: +57 300 000 0000",
      "Instagram: @CafeBarPuntoRetro"
    ], pageWidth - 15, 15, { align: "right" });

    // 2. Report Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE CIERRE DE CAJA (ARQUEO)", 15, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 15, 62);
    doc.text(`ID Sesión: #${session.id.slice(0, 8)}`, 15, 67);

    // 3. Financial Summary Table
    autoTable(doc, {
      startY: 75,
      head: [['Concepto', 'Monto Esperado', 'Monto Real', 'Diferencia']],
      body: [
        ['Efectivo (Base + Ventas)', `$${closing.expectedCash.toLocaleString()}`, `$${closing.real.toLocaleString()}`, `$${(closing.real - closing.expectedCash).toLocaleString()}`],
        ['Ventas Digitales', `$${closing.expectedElectronic.toLocaleString()}`, `$${closing.expectedElectronic.toLocaleString()}`, '$0'],
        ['TOTAL GENERAL', `$${(closing.expectedCash + closing.expectedElectronic).toLocaleString()}`, `$${(closing.real + closing.expectedElectronic).toLocaleString()}`, `$${(closing.real - closing.expectedCash).toLocaleString()}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [255, 0, 127] }
    });

    // 4. Detailed Sales Table
    doc.text("DETALLE DE VENTAS DEL TURNO", 15, (doc as any).lastAutoTable.finalY + 15);
    
    const salesBody = sales.map((s, i) => [
      i + 1,
      format(new Date(s.created_at), 'HH:mm'),
      s.payment_method,
      `$${Number(s.total).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['#', 'Hora', 'Método', 'Total']],
      body: salesBody,
      theme: 'grid',
      headStyles: { fillColor: [0, 255, 255], textColor: [0, 0, 0] }
    });

    // 5. Observations
    if (closing.reason) {
      doc.setFont("helvetica", "bold");
      doc.text("OBSERVACIONES / MOTIVO DIFERENCIA:", 15, (doc as any).lastAutoTable.finalY + 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(closing.reason, 15, (doc as any).lastAutoTable.finalY + 22, { maxWidth: pageWidth - 30 });
    }

    // 6. Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 40;
    doc.line(15, finalY, 80, finalY);
    doc.text("Firma Operador", 15, finalY + 5);
    
    doc.line(pageWidth - 80, finalY, pageWidth - 15, finalY);
    doc.text("Firma Administrador", pageWidth - 15, finalY + 5, { align: "right" });

    doc.save(`Arqueo_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
  };

  const handleCloseSession = async () => {
    if (!supabase || !currentSession) return;
    
    // Discrepancy is only based on physical CASH
    const diff = closingData.real - closingData.expectedCash;
    if (Math.abs(diff) > 0 && !closingData.reason) {
      alert("Debes escribir un motivo para la diferencia de efectivo.");
      return;
    }

    // Fetch ALL sales for the PDF before closing
    const { data: allSales } = await supabase
      .from("sales")
      .select("*")
      .eq("session_id", currentSession.id)
      .order("created_at", { ascending: true });

    const { error } = await supabase
      .from("cash_sessions")
      .update({
        closed_at: new Date().toISOString(),
        final_amount_expected: closingData.expectedCash + closingData.expectedElectronic,
        final_amount_real: closingData.real + closingData.expectedElectronic,
        discrepancy_amount: diff,
        discrepancy_reason: closingData.reason,
        status: 'closed'
      })
      .eq("id", currentSession.id);
    
    if (error) alert(error.message);
    else {
      // GENERATE PDF AUTOMATICALLY
      generatePDFReport(currentSession, closingData, allSales || []);
      
      alert("Arqueo guardado y reporte descargado exitosamente. Caja cerrada.");
      setCurrentSession(null);
      setShowCloseDrawer(false);
      setShowOpenDrawer(true);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  );

  return (
    <Shell>
      {/* Overlay: Abrir Caja */}
      <AnimatePresence>
        {showOpenDrawer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="bg-black border-4 border-secondary-neon p-8 w-full max-w-md arcade-shadow-pink">
              <h2 className="text-secondary-neon font-black text-2xl uppercase italic mb-6 tracking-tighter">Apertura de Caja</h2>
              <p className="text-neutral-500 text-[10px] uppercase font-bold mb-8">Ingresa el monto base de efectivo para iniciar el día</p>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-secondary-neon">Monto Base (Efectivo)</label>
                  <input 
                    type="number" 
                    value={initialBase}
                    onChange={(e) => setInitialBase(parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleOpenSession();
                    }}
                    className="bg-neutral-900 border-2 border-neutral-800 p-4 text-2xl font-mono text-white outline-none focus:border-secondary-neon"
                    autoFocus
                  />
                </div>
                <button 
                  onClick={handleOpenSession}
                  className="w-full bg-secondary-neon text-black font-black p-4 uppercase text-sm arcade-shadow-cyan"
                >
                  Abrir Turno [ENTER]
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay: Cerrar Caja (ARQUEO PROFESIONAL) */}
      <AnimatePresence>
        {showCloseDrawer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="bg-black border-4 border-primary-neon p-8 w-full max-w-2xl arcade-shadow-cyan">
              <h2 className="text-primary-neon font-black text-3xl uppercase italic mb-8 tracking-tighter flex items-center gap-3">
                <ReceiptText size={32} /> Arqueo de Caja Detallado
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="bg-neutral-900 p-4 border-l-4 border-secondary-neon">
                    <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Efectivo Esperado (Cajón)</p>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-black text-white font-mono">${closingData.expectedCash.toFixed(0)}</p>
                      <p className="text-[9px] text-neutral-600 font-bold uppercase pb-1">Base + Ventas Cash</p>
                    </div>
                  </div>

                  <div className="bg-neutral-900 p-4 border-l-4 border-purple-500">
                    <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Total Digital (Nequi/Tarjeta/etc)</p>
                    <p className="text-xl font-black text-purple-400 font-mono">${closingData.expectedElectronic.toFixed(0)}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-[8px] text-neutral-600 uppercase font-bold">NQ: ${closingData.breakdown.nequi}</div>
                      <div className="text-[8px] text-neutral-600 uppercase font-bold">DV: ${closingData.breakdown.daviplata}</div>
                      <div className="text-[8px] text-neutral-600 uppercase font-bold">TJ: ${closingData.breakdown.card}</div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-900 p-4 border-l-4 border-primary-neon">
                    <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Conteo Real de Efectivo</p>
                    <input 
                      type="number" 
                      value={closingData.real}
                      onChange={(e) => setClosingData({...closingData, real: parseFloat(e.target.value) || 0})}
                      className="bg-transparent border-none p-0 text-3xl font-black text-primary-neon font-mono outline-none w-full"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 border-l-4 ${closingData.real - closingData.expectedCash === 0 ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                    <p className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Diferencia de Efectivo</p>
                    <p className={`text-2xl font-black font-mono ${closingData.real - closingData.expectedCash === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${(closingData.real - closingData.expectedCash).toFixed(0)}
                    </p>
                  </div>

                  {Math.abs(closingData.real - closingData.expectedCash) > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-primary-neon">¿Por qué hay una diferencia?</label>
                      <textarea 
                        value={closingData.reason}
                        onChange={(e) => setClosingData({...closingData, reason: e.target.value})}
                        placeholder="Ej: Pago de hielo, error en vuelto, dinero retirado por dueño..."
                        className="w-full bg-neutral-900 border-2 border-neutral-800 p-3 text-[10px] font-bold text-white outline-none focus:border-primary-neon h-24"
                      />
                    </div>
                  )}
                  
                  <div className="bg-neutral-900/50 p-4 border-2 border-neutral-800">
                    <p className="text-[9px] uppercase font-bold text-neutral-700 mb-1">Ventas Totales del Turno</p>
                    <p className="text-lg font-black text-white opacity-50 font-mono">${closingData.totalSales.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleCloseSession}
                  className="w-full bg-primary-neon text-black font-black p-4 uppercase text-sm arcade-shadow-pink hover:scale-[1.02] transition-transform"
                >
                  Confirmar Arqueo y Cerrar Turno
                </button>
                <button 
                  onClick={() => setShowCloseDrawer(false)}
                  className="w-full text-neutral-500 text-[10px] uppercase font-bold hover:text-white"
                >
                  Volver al POS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-140px)]">
        {/* Catálogo */}
        <div className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
          <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-secondary-neon font-black text-3xl italic uppercase tracking-tighter">Terminal de Ventas</h1>
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  <Barcode size={12} /> Lector activo
                </p>
                <span className="text-neutral-800">|</span>
                <button 
                  onClick={prepareCloseSession}
                  className="text-[10px] font-black text-primary-neon uppercase hover:underline"
                >
                  Cerrar Caja [X]
                </button>
              </div>
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

          {/* Mini Historial Reciente */}
          <div className="mt-8 border-t-4 border-neutral-900 pt-6">
            <h3 className="text-[10px] font-black uppercase text-neutral-500 mb-4 tracking-widest flex items-center gap-2">
              <Clock size={12} /> Últimas Ventas del Turno
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="bg-neutral-900/30 border border-neutral-800 p-3 flex justify-between items-center group relative">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] font-black text-white uppercase">#{sale.id.slice(0,5)}</p>
                      <select 
                        value={sale.payment_method}
                        onChange={(e) => handleEditPayment(sale.id, e.target.value)}
                        className="bg-transparent text-[8px] font-bold text-secondary-neon uppercase outline-none cursor-pointer border border-transparent hover:border-secondary-neon px-1"
                      >
                        <option value="Efectivo" className="bg-black">Efectivo</option>
                        <option value="Nequi" className="bg-black">Nequi</option>
                        <option value="Daviplata" className="bg-black">Daviplata</option>
                        <option value="Tarjeta" className="bg-black">Tarjeta</option>
                      </select>
                    </div>
                    <p className="text-[8px] text-neutral-600 font-bold max-w-[150px] truncate">
                      {sale.sale_items?.map((i:any) => i.products?.name).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-secondary-neon font-black text-xs">${Number(sale.total).toFixed(0)}</span>
                    <button 
                      onClick={() => handleDeleteSale(sale)}
                      className="text-neutral-700 hover:text-primary-neon transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar Venta"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
