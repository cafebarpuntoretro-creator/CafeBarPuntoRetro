"use client";

import { useState, useEffect } from "react";
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  PieChart as PieChartIcon
} from "lucide-react";
import Shell from "@/components/Shell";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface SaleData {
  day: string;
  total: number;
}

interface MonthlyData {
  month: string;
  total: number;
}

interface ProductStat {
  name: string;
  sales: number;
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlySales, setMonthlySales] = useState<SaleData[]>([]);
  const [annualSales, setAnnualSales] = useState<MonthlyData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [bottomProducts, setBottomProducts] = useState<ProductStat[]>([]);
  const [totals, setTotals] = useState({ month: 0, year: 0, orders: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'));

  const generateMembrete = (doc: jsPDF, title: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 0, 127);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bolditalic");
    doc.text("PUNTO RETRO", 15, 25);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("CAFE BAR & POS SYSTEM - REPORTES", 15, 32);
    doc.text([
      "NIT: 123.456.789-0",
      "Calle 123 # 45 - 67",
      "Tel: +57 300 000 0000"
    ], pageWidth - 15, 15, { align: "right" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, 15, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 15, 62);
  };

  const exportPDF = (title: string, head: string[][], body: any[][], filename: string) => {
    const doc = new jsPDF();
    generateMembrete(doc, title);
    autoTable(doc, {
      startY: 75,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [255, 0, 127] }
    });
    doc.save(`${filename}.pdf`);
  };

  const exportExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const fetchDailyReport = async () => {
    if (!supabase) return;
    const start = new Date(selectedDay);
    start.setHours(0,0,0,0);
    const end = new Date(selectedDay);
    end.setHours(23,59,59,999);

    const { data: sales } = await supabase
      .from("sales")
      .select("id, total, payment_method, created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());
    
    if (!sales || sales.length === 0) {
      alert("No hay ventas registradas para este día.");
      return;
    }

    const body = sales.map(s => [s.id.slice(0,8), format(new Date(s.created_at), 'HH:mm'), s.payment_method, `$${Number(s.total).toLocaleString()}`]);
    exportPDF(`REPORTE DIARIO - ${selectedDay}`, [['ID Venta', 'Hora', 'Método', 'Total']], body, `Ventas_${selectedDay}`);
  };

  const fetchStats = async () => {
    if (!supabase) return;
    setLoading(true);

    const now = new Date();
    const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstDayYear = new Date(now.getFullYear(), 0, 1).toISOString();

    const { data: yearSales } = await supabase
      .from("sales")
      .select("total, created_at")
      .gte("created_at", firstDayYear);

    const { data: items } = await supabase
      .from("sale_items")
      .select("quantity, products(name)")
      .gte("created_at", firstDayMonth);

    if (yearSales) {
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const annualMap = months.map(m => ({ month: m, total: 0 }));
      let monthTotal = 0;
      let yearTotal = 0;

      yearSales.forEach(s => {
        const d = new Date(s.created_at);
        annualMap[d.getMonth()].total += Number(s.total);
        yearTotal += Number(s.total);
        if (d.getMonth() === now.getMonth()) monthTotal += Number(s.total);
      });
      setAnnualSales(annualMap);
      setTotals(prev => ({ ...prev, year: yearTotal, month: monthTotal, orders: yearSales.length }));

      const dailyMap: { [key: string]: number } = {};
      yearSales.filter(s => new Date(s.created_at).getMonth() === now.getMonth()).forEach(s => {
        const day = new Date(s.created_at).getDate().toString();
        dailyMap[day] = (dailyMap[day] || 0) + Number(s.total);
      });
      const monthlyArray = Array.from({ length: now.getDate() }, (_, i) => ({
        day: (i + 1).toString(),
        total: dailyMap[i + 1] || 0
      }));
      setMonthlySales(monthlyArray);
    }

    if (items) {
      const prodMap: { [key: string]: number } = {};
      items.forEach((i: any) => {
        const productData = Array.isArray(i.products) ? i.products[0] : i.products;
        const name = productData?.name || "Desconocido";
        prodMap[name] = (prodMap[name] || 0) + Number(i.quantity);
      });
      const sorted = Object.entries(prodMap)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales);
      
      setTopProducts(sorted.slice(0, 5));
      setBottomProducts(sorted.slice(-5).reverse());
    }

    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border-2 border-primary-neon p-3 arcade-shadow-cyan">
          <p className="text-[10px] font-black text-primary-neon uppercase mb-1">{label}</p>
          <p className="text-white font-mono font-bold">${Number(payload[0].value).toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Shell>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary-neon" size={48} />
          <p className="text-secondary-neon font-black uppercase tracking-[0.3em] animate-pulse">Cargando Datos Financieros...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-primary-neon font-black text-2xl md:text-4xl italic uppercase tracking-tighter">Inteligencia</h1>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Auditoría {new Date().getFullYear()}</p>
        </div>
        
        {/* Generador de Reporte Diario */}
        <div className="bg-neutral-900 border-2 border-neutral-800 p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 arcade-shadow-cyan">
          <div className="flex flex-col flex-1">
            <label className="text-[8px] font-black text-secondary-neon uppercase mb-1">Día Específico</label>
            <input 
              type="date" 
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="bg-black border border-neutral-700 text-xs text-white p-2 outline-none focus:border-secondary-neon"
            />
          </div>
          <button 
            onClick={fetchDailyReport}
            className="bg-secondary-neon text-black font-black text-[10px] px-4 py-3 sm:py-2 uppercase hover:scale-105 transition-transform"
          >
            Reporte Diario
          </button>
        </div>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-neutral-900/50 border-2 border-neutral-800 p-4 md:p-6 arcade-shadow-pink">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-pink-500/10 p-2 md:p-3 rounded-xl"><DollarSign className="text-secondary-neon" size={20} /></div>
            <span className="text-[9px] font-black text-secondary-neon uppercase flex items-center gap-1"><ArrowUpRight size={10} /> +12%</span>
          </div>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Mes</p>
          <h2 className="text-xl md:text-3xl font-black text-white font-mono">${totals.month.toLocaleString()}</h2>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-neutral-900/50 border-2 border-neutral-800 p-4 md:p-6 arcade-shadow-cyan">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-cyan-500/10 p-2 md:p-3 rounded-xl"><Package className="text-primary-neon" size={20} /></div>
            <span className="text-[9px] font-black text-primary-neon uppercase flex items-center gap-1"><TrendingUp size={10} /> OK</span>
          </div>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Tickets</p>
          <h2 className="text-xl md:text-3xl font-black text-white font-mono">{totals.orders}</h2>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-neutral-900/50 border-2 border-neutral-800 p-4 md:p-6 sm:col-span-2 lg:col-span-1 arcade-shadow-pink">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-500/10 p-2 md:p-3 rounded-xl"><TrendingUp className="text-purple-400" size={20} /></div>
            <span className="text-[9px] font-black text-purple-400 uppercase flex items-center gap-1">ESTABLE</span>
          </div>
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Balance Año</p>
          <h2 className="text-xl md:text-3xl font-black text-white font-mono">${totals.year.toLocaleString()}</h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico Mensual */}
        <div className="bg-black border-4 border-neutral-900 p-6 arcade-shadow-cyan">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-primary-neon flex items-center gap-2">
              <Calendar size={14} /> Rendimiento Diario (Mes)
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => exportPDF("REPORTE MENSUAL", [['Día', 'Total Venta']], monthlySales.map(m => [m.day, `$${m.total.toLocaleString()}`]), "Ventas_Mensuales")}
                className="text-[8px] font-black text-primary-neon border border-primary-neon px-2 py-1 uppercase hover:bg-primary-neon hover:text-black transition-all"
              >
                PDF
              </button>
              <button 
                onClick={() => exportExcel(monthlySales, "Ventas_Mensuales")}
                className="text-[8px] font-black text-green-500 border border-green-500 px-2 py-1 uppercase hover:bg-green-500 hover:text-black transition-all"
              >
                Excel
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="day" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#00FFFF" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#00FFFF', strokeWidth: 2 }}
                  activeDot={{ r: 8, fill: '#FF007F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Anual */}
        <div className="bg-black border-4 border-neutral-900 p-6 arcade-shadow-pink">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-secondary-neon flex items-center gap-2">
              <BarChartIcon size={14} /> Balance Mensual (Año)
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => exportPDF("BALANCE ANUAL", [['Mes', 'Total Venta']], annualSales.map(m => [m.month, `$${m.total.toLocaleString()}`]), "Balance_Anual")}
                className="text-[8px] font-black text-secondary-neon border border-secondary-neon px-2 py-1 uppercase hover:bg-secondary-neon hover:text-black transition-all"
              >
                PDF
              </button>
              <button 
                onClick={() => exportExcel(annualSales, "Balance_Anual")}
                className="text-[8px] font-black text-green-500 border border-green-500 px-2 py-1 uppercase hover:bg-green-500 hover:text-black transition-all"
              >
                Excel
              </button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="month" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {annualSales.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === new Date().getMonth() ? '#FF007F' : '#262626'} 
                      className="hover:fill-primary-neon transition-colors"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Productos */}
        <div className="bg-neutral-900/20 border-2 border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-green-400 flex items-center gap-2">
              <TrendingUp size={14} /> Los más vendidos (Mes)
            </h3>
            <button 
              onClick={() => exportPDF("RANKING TOP PRODUCTOS", [['#', 'Producto', 'Ventas']], topProducts.map((p, i) => [i+1, p.name, p.sales]), "Top_Productos")}
              className="text-[8px] font-black text-green-400 border border-green-400 px-2 py-1 uppercase hover:bg-green-400 hover:text-black transition-all"
            >
              PDF
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-neutral-700">0{i+1}</span>
                  <span className="text-[12px] font-black text-white uppercase group-hover:text-primary-neon transition-colors">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 flex-1 mx-8">
                  <div className="h-1 bg-neutral-900 flex-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.sales / topProducts[0].sales) * 100}%` }}
                      className="h-full bg-primary-neon"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-secondary-neon font-black">{p.sales} UDS</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Productos */}
        <div className="bg-neutral-900/20 border-2 border-neutral-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase text-red-400 flex items-center gap-2">
              <TrendingDown size={14} /> Menos vendidos (Mes)
            </h3>
            <button 
              onClick={() => exportPDF("RANKING PRODUCTOS BAJA ROTACION", [['#', 'Producto', 'Ventas']], bottomProducts.map((p, i) => [i+1, p.name, p.sales]), "Bottom_Productos")}
              className="text-[8px] font-black text-red-400 border border-red-400 px-2 py-1 uppercase hover:bg-red-400 hover:text-black transition-all"
            >
              PDF
            </button>
          </div>
          <div className="space-y-4">
            {bottomProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-neutral-700">0{i+1}</span>
                  <span className="text-[12px] font-black text-white uppercase group-hover:text-red-400 transition-colors">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 flex-1 mx-8">
                  <div className="h-1 bg-neutral-900 flex-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.sales / topProducts[0].sales) * 100}%` }}
                      className="h-full bg-red-900"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono text-red-400 font-black">{p.sales} UDS</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
