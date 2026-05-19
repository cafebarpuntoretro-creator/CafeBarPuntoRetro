"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  Search, 
  Barcode, 
  PackagePlus, 
  AlertTriangle,
  ArrowUpRight,
  Boxes
} from "lucide-react";
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
}

interface BatchItem {
  product: Product;
  quantity: number;
}

export default function PurchasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Search and form states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Current batch of items to add to inventory
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  
  // Reference for focusing quantity input
  const qtyInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Scanner references (to prevent regular typing conflicts)
  const scanBuffer = useRef("");
  const lastKeyTime = useRef(Date.now());

  useEffect(() => {
    fetchProducts();
  }, []);

  // Global barcode listener for incoming shipments
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid scanner tracking if typing inside inputs that are not searching
      if (document.activeElement?.tagName === "INPUT" && document.activeElement !== searchInputRef.current) {
        // If it's a numeric typing inside Quantity, don't hijack it
        if (document.activeElement === qtyInputRef.current && e.key === "Enter") {
          e.preventDefault();
          handleAddProduct();
          return;
        }
        if (document.activeElement === searchInputRef.current && e.key === "Enter") {
          e.preventDefault();
          // Select first filtered product if available
          const filtered = getFilteredProducts();
          if (filtered.length > 0) {
            handleSelectProduct(filtered[0]);
          }
          return;
        }
        return;
      }

      if (e.key === "Control" || e.key === "Alt" || e.key === "Shift") return;

      const now = Date.now();
      if (now - lastKeyTime.current > 50) {
        scanBuffer.current = "";
      }
      lastKeyTime.current = now;

      if (e.key === "Enter") {
        if (scanBuffer.current.length >= 3) {
          e.preventDefault();
          handleBarcodeScan(scanBuffer.current);
          scanBuffer.current = "";
        }
      } else if (e.key.length === 1) {
        scanBuffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, selectedProduct, quantity, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    if (!supabase) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleBarcodeScan = (code: string) => {
    const found = products.find(
      p => p.barcode?.trim() === code.trim()
    );

    if (found) {
      handleSelectProduct(found);
      window.dispatchEvent(new CustomEvent("pos-notify", {
        detail: { 
          title: "Código Escaneado", 
          message: `Producto encontrado: ${found.name}`, 
          type: "info" 
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent("pos-notify", {
        detail: { 
          title: "No Encontrado", 
          message: `Código [${code}] no corresponde a ningún producto. Regístralo en inventario primero.`, 
          type: "alert" 
        }
      }));
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowDropdown(false);
    // Micro-delay to let DOM update, then focus quantity
    setTimeout(() => {
      qtyInputRef.current?.focus();
    }, 50);
  };

  const getFilteredProducts = () => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      p => p.name.toLowerCase().includes(query) || 
           (p.barcode && p.barcode.toLowerCase().includes(query))
    );
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      // Try to select first search query match if exact name
      const filtered = getFilteredProducts();
      if (filtered.length > 0) {
        handleSelectProduct(filtered[0]);
        return;
      }
      alert("Por favor selecciona un producto válido.");
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert("Por favor ingresa una cantidad válida mayor a 0.");
      qtyInputRef.current?.focus();
      return;
    }

    // Check if product is already in the batch, if so increment it
    const existingIndex = batchItems.findIndex(item => item.product.id === selectedProduct.id);
    if (existingIndex > -1) {
      const updated = [...batchItems];
      updated[existingIndex].quantity += qty;
      setBatchItems(updated);
    } else {
      setBatchItems([...batchItems, { product: selectedProduct, quantity: qty }]);
    }

    // Reset input states
    setSelectedProduct(null);
    setSearchQuery("");
    setQuantity("");
    searchInputRef.current?.focus();

    window.dispatchEvent(new CustomEvent("pos-notify", {
      detail: { 
        title: "Añadido", 
        message: "Producto agregado a la lista del pedido", 
        type: "info" 
      }
    }));
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...batchItems];
    updated.splice(index, 1);
    setBatchItems(updated);
  };

  const handleSavePurchase = async () => {
    if (batchItems.length === 0) return;
    if (!supabase) return;

    setSaving(true);
    try {
      // Process all stock additions
      for (const item of batchItems) {
        // RPC decrement_stock takes positive 'x' to subtract, negative 'x' to add.
        // We pass -item.quantity to add to the inventory
        const { error } = await supabase.rpc("decrement_stock", {
          row_id: item.product.id,
          x: -item.quantity
        });

        if (error) throw error;
      }

      window.dispatchEvent(new CustomEvent("pos-notify", {
        detail: { 
          title: "Pedido Guardado", 
          message: `Se agregaron existencias para ${batchItems.length} productos con éxito.`, 
          type: "info" 
        }
      }));

      setBatchItems([]);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      window.dispatchEvent(new CustomEvent("pos-notify", {
        detail: { 
          title: "Error", 
          message: `Ocurrió un error al guardar el pedido: ${err.message}`, 
          type: "alert" 
        }
      }));
    } finally {
      setSaving(false);
    }
  };

  // Low stock products filter (less than 10 items)
  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <Shell>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-secondary-neon font-black text-2xl md:text-3xl italic uppercase tracking-tighter flex items-center gap-3">
              <PackagePlus size={28} /> Compras / Ingreso de Mercancía
            </h1>
            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mt-1">
              Registra la llegada de nuevos pedidos y actualiza existencias automáticamente
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main batch creator - Left */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-black border-4 border-secondary-neon p-6 arcade-shadow-cyan">
              <h2 className="text-white font-black text-xs md:text-sm uppercase mb-6 flex items-center gap-2">
                <Boxes size={16} className="text-secondary-neon" /> 1. Escanear o Seleccionar Productos
              </h2>

              {/* Autocomplete Form */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Search Product Input */}
                <div className="md:col-span-7 relative">
                  <label className="text-[9px] uppercase font-black text-neutral-400 mb-1.5 block">
                    Nombre del producto o Código de Barras
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="BUSCAR O ESCANEAR CÓDIGO..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                        if (selectedProduct && e.target.value !== selectedProduct.name) {
                          setSelectedProduct(null);
                        }
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full bg-neutral-950 border-2 border-neutral-900 focus:border-secondary-neon p-3 pl-10 text-[10px] font-black uppercase text-white outline-none"
                    />
                    {selectedProduct && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[8px] font-black uppercase bg-secondary-neon/20 text-secondary-neon px-2 py-0.5 rounded border border-secondary-neon/30">
                        <Check size={8} /> Seleccionado
                      </span>
                    )}
                  </div>

                  {/* Dropdown Options */}
                  <AnimatePresence>
                    {showDropdown && searchQuery.trim() !== "" && !selectedProduct && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-black border-2 border-neutral-800 z-50 divide-y divide-neutral-900 custom-scrollbar"
                      >
                        {getFilteredProducts().length === 0 ? (
                          <div className="p-3 text-[9px] font-bold text-neutral-600 uppercase text-center">
                            Ningún producto coincide
                          </div>
                        ) : (
                          getFilteredProducts().map((product) => (
                            <div
                              key={product.id}
                              onClick={() => handleSelectProduct(product)}
                              className="p-3 hover:bg-neutral-900/50 cursor-pointer flex justify-between items-center transition-colors"
                            >
                              <div>
                                <p className="text-[10px] font-black text-white uppercase">{product.name}</p>
                                <p className="text-[8px] text-neutral-500 font-black mt-0.5 uppercase tracking-wider">
                                  Categoría: {product.category}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <p className="text-[8px] text-neutral-500 font-black">Stock Actual</p>
                                  <p className={`text-[10px] font-bold ${product.stock < 10 ? 'text-primary-neon' : 'text-neutral-400'}`}>
                                    {product.stock} unids
                                  </p>
                                </div>
                                {product.barcode && (
                                  <span className="text-[8px] font-mono font-black text-secondary-neon flex items-center gap-1 bg-neutral-900 px-1.5 py-0.5 rounded">
                                    <Barcode size={8} /> {product.barcode}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quantity Input */}
                <div className="md:col-span-3">
                  <label className="text-[9px] uppercase font-black text-neutral-400 mb-1.5 block">
                    Cantidad a Ingresar
                  </label>
                  <input
                    ref={qtyInputRef}
                    type="number"
                    min="1"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-neutral-950 border-2 border-neutral-900 focus:border-secondary-neon p-3 text-[10px] font-mono font-black uppercase text-white outline-none text-center"
                  />
                </div>

                {/* Add to Batch Button */}
                <div className="md:col-span-2">
                  <button
                    onClick={handleAddProduct}
                    className="w-full bg-secondary-neon hover:bg-white text-black font-black p-3 text-[10px] uppercase tracking-widest arcade-shadow-cyan hover:scale-[1.02] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 h-11"
                  >
                    <Plus size={14} /> Añadir
                  </button>
                </div>
              </div>
            </div>

            {/* Current Batch Table */}
            <div className="bg-black border-4 border-neutral-900 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-black text-xs md:text-sm uppercase flex items-center gap-2">
                  <PackagePlus size={16} className="text-primary-neon" /> 2. Detalle del Nuevo Pedido
                </h2>
                {batchItems.length > 0 && (
                  <span className="text-[8px] font-black bg-secondary-neon/20 text-secondary-neon px-2 py-0.5 rounded uppercase tracking-wider">
                    {batchItems.length} Productos en Cola
                  </span>
                )}
              </div>

              {batchItems.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-neutral-900 flex flex-col items-center justify-center text-center text-neutral-600">
                  <PackagePlus size={40} className="opacity-20 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-wider">No hay productos en cola</p>
                  <p className="text-[8px] uppercase mt-1">Escribe el nombre o escanea códigos arriba para armar el pedido</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto border-2 border-neutral-900">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-900/40 border-b-2 border-neutral-900 text-[8px] font-black uppercase text-neutral-400">
                          <th className="p-3">Producto</th>
                          <th className="p-3 text-center">Stock Actual</th>
                          <th className="p-3 text-center">Añadir</th>
                          <th className="p-3 text-center">Nuevo Stock</th>
                          <th className="p-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900 text-[9px] font-bold text-white uppercase">
                        {batchItems.map((item, index) => (
                          <tr key={item.product.id} className="hover:bg-neutral-900/20">
                            <td className="p-3">
                              <p className="font-black text-white">{item.product.name}</p>
                              {item.product.barcode && (
                                <p className="text-[7px] text-neutral-500 font-mono font-black mt-0.5 flex items-center gap-1">
                                  <Barcode size={8} /> {item.product.barcode}
                                </p>
                              )}
                            </td>
                            <td className="p-3 text-center font-mono text-neutral-400">{item.product.stock}</td>
                            <td className="p-3 text-center font-mono text-secondary-neon">+{item.quantity}</td>
                            <td className="p-3 text-center font-mono text-green-400 font-black">
                              {item.product.stock + item.quantity}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="text-neutral-700 hover:text-primary-neon transition-colors p-1"
                                title="Quitar de la lista"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Submission and Action */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-950 p-4 border-l-4 border-secondary-neon">
                    <div>
                      <p className="text-[10px] font-black text-white uppercase">¿Listo para ingresar?</p>
                      <p className="text-[8px] font-bold text-neutral-500 uppercase mt-0.5">
                        Al confirmar, se incrementará el stock físico de cada producto en la base de datos.
                      </p>
                    </div>
                    <button
                      onClick={handleSavePurchase}
                      disabled={saving}
                      className="w-full sm:w-auto bg-primary-neon hover:bg-white text-black font-black px-6 py-3 text-[11px] uppercase tracking-widest arcade-shadow-pink hover:scale-[1.02] active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Guardando Pedido...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Guardar Ingreso a Inventario
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick-helper sidebar - Right */}
          <div className="lg:col-span-4 space-y-6">
            {/* Low stock checklist */}
            <div className="bg-black border-4 border-primary-neon p-6 arcade-shadow-pink">
              <h3 className="text-primary-neon font-black text-xs md:text-sm uppercase mb-4 tracking-tighter flex items-center gap-2">
                <AlertTriangle size={16} /> Productos en Alerta (Bajo Stock)
              </h3>
              <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest mb-4">
                Productos con existencias inferiores a 10 unidades
              </p>

              {loading ? (
                <div className="p-8 text-center text-neutral-700 text-[10px] uppercase font-bold flex items-center justify-center gap-2">
                  <Loader2 size={12} className="animate-spin text-primary-neon" /> Cargando...
                </div>
              ) : lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-neutral-700 text-[9px] uppercase font-black bg-neutral-950 border border-neutral-900">
                  👍 Todo el Stock al Día
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-neutral-950 border border-neutral-900 p-2.5 flex justify-between items-center hover:border-neutral-800 transition-all group"
                    >
                      <div>
                        <p className="text-[9px] font-black text-white uppercase truncate max-w-[150px]">
                          {p.name}
                        </p>
                        <p className="text-[7px] text-neutral-500 font-mono font-black mt-0.5 uppercase">
                          Stock: <span className="text-primary-neon font-bold">{p.stock}</span> unids
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectProduct(p)}
                        className="text-[8px] font-black uppercase bg-primary-neon/10 text-primary-neon hover:bg-primary-neon hover:text-black border border-primary-neon/20 px-2 py-1 transition-all flex items-center gap-1"
                      >
                        Pedir <ArrowUpRight size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick tips panel */}
            <div className="bg-neutral-950 border-2 border-neutral-900 p-6 space-y-4">
              <h4 className="text-secondary-neon font-black text-[10px] uppercase tracking-wider">
                💡 Atajos y Tips de Escáner
              </h4>
              <ul className="text-[8px] font-bold text-neutral-500 uppercase space-y-2.5 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-secondary-neon">▸</span>
                  <span>Puedes usar tu **lector de código de barras USB** en cualquier parte de la pantalla. El sistema interceptará el escaneo, seleccionará el producto y te enfocará la cantidad de inmediato.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary-neon">▸</span>
                  <span>Estando en el input de **Cantidad**, puedes presionar la tecla **Enter** para agregar el producto a la lista sin tocar el mouse.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary-neon">▸</span>
                  <span>El valor de los productos y demás campos estructurados se configuran en la sección de **Inventario**.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
