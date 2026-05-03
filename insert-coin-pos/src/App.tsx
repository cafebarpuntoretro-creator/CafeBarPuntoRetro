import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  LayoutDashboard, 
  UtensilsCrossed, 
  ReceiptText, 
  Boxes, 
  Gamepad2, 
  Settings, 
  Bell, 
  User, 
  PlusCircle, 
  PackagePlus, 
  Radio,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';

// --- Types ---
interface Transaction {
  id: string;
  items: string;
  amount: string;
  time: string;
  type: 'sale' | 'processing';
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <motion.a
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    href="#"
    className={`flex items-center gap-4 p-4 mx-2 my-1 border-2 transition-all group ${
      active 
        ? 'bg-secondary-neon text-black border-black arcade-shadow-pink' 
        : 'text-secondary-neon border-transparent hover:border-secondary-neon hover:bg-neutral-900/50'
    }`}
  >
    <Icon size={20} className={active ? 'text-black' : 'text-secondary-neon'} />
    <span className="font-bold text-xs tracking-widest uppercase">{label}</span>
  </motion.a>
);

const StatCard = ({ label, value, unit, color, progress }: { label: string, value: string, unit: string, color: string, progress: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-black border-4 p-4 shadow-[4px_4px_0_0_currentColor] flex flex-col justify-between`}
    style={{ borderColor: color, color: color }}
  >
    <span className="text-[10px] uppercase tracking-[0.2em] mb-2">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black italic tracking-tighter text-white">{value}</span>
      <span className="text-xs font-bold">{unit}</span>
    </div>
    <div className="mt-4 h-1 w-full bg-neutral-900 overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full bg-current"
      />
    </div>
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label, color, bgColor, iconFill = false }: { icon: any, label: string, color: string, bgColor: string, iconFill?: boolean }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ translate: '2px 2px', boxShadow: '0px 0px 0px 0px currentColor' }}
    className={`flex flex-col items-center justify-center gap-4 p-12 border-4 border-black transition-all group arcade-shadow-pink h-full`}
    style={{ backgroundColor: bgColor, color: color, boxShadow: `4px 4px 0px 0px ${color === '#00FFFF' ? '#00FFFF' : (color === '#d7ca00' ? '#d7ca00' : '#FF007F')}` }}
  >
    <Icon 
      size={48} 
      className="group-hover:scale-110 transition-transform" 
      fill={iconFill ? "currentColor" : "none"} 
    />
    <span className="font-bold text-sm tracking-widest uppercase">{label}</span>
  </motion.button>
);

const FeedItem = ({ transaction }: { transaction: Transaction }) => (
  <motion.div 
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className={`flex items-center justify-between p-4 bg-black border-l-4 hover:bg-neutral-900 transition-colors border-secondary-neon`}
  >
    <div className="flex gap-4 items-center">
      <span className="text-secondary-neon font-mono text-xs">{transaction.id}</span>
      <span className="text-sm font-medium">{transaction.items}</span>
    </div>
    <div className="flex gap-4 items-center">
      <span className="font-bold text-tertiary-neon">{transaction.amount} CR</span>
      <span className="text-[10px] font-mono text-neutral-500 uppercase">{transaction.time}</span>
    </div>
  </motion.div>
);

export default function App() {
  const [logs, setLogs] = useState<string[]>([
    '> INIT SYSTEM_CHECK...',
    '> NETWORK_LINK: ESTABLISHED [PING 12ms]',
    '> DATABASE_AUTH: SUCCESS',
    '> REVENUE_TRACKER: ACTIVE',
    '> SCANNING FOR ANOMALIES... NONE FOUND',
    '> WARNING: PRINTER_LOW_PAPER (TERMINAL_3)',
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: '#TRX_982', items: '2x NEON MARGARITA, 1x PIXEL FRIES', amount: '42.00', time: '2 MIN AGO', type: 'sale' },
    { id: '#TRX_981', items: '4x RETRO LAGER, 2x GLOW SLIDERS', amount: '68.50', time: '5 MIN AGO', type: 'sale' },
    { id: '#TRX_980', items: '1x CYBER COFFEE, 1x BIT-BROWNIE', amount: '15.25', time: '12 MIN AGO', type: 'sale' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLogs(prev => [...prev.slice(-10), `> WAITING FOR COMMAND_ ${new Date().toLocaleTimeString()}`]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-void text-on-background">
      <div className="scanline-overlay" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-black border-b-4 border-neutral-900 shadow-[0_4px_0_0_#FF007F]">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black italic text-primary-neon drop-shadow-[3px_3px_0px_#00FFFF] uppercase tracking-widest">
            INSERT COIN POS
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer hover:scale-110 transition-transform">
            <Bell size={24} className="text-secondary-neon" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-neon rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-3 border-2 border-secondary-neon p-2 bg-neutral-900">
            <User size={20} className="text-secondary-neon" />
            <span className="font-bold text-[10px] text-secondary-neon tracking-widest">ADMIN_ROOT</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-black border-r-4 border-neutral-900 flex flex-col py-4 overflow-y-auto z-40">
        <div className="px-6 py-4 border-b-4 border-neutral-900 mb-4">
          <h2 className="text-primary-neon font-black text-sm tracking-tighter uppercase">OPERATOR_01</h2>
          <p className="text-secondary-neon text-[10px] font-bold opacity-70 tracking-widest">LEVEL_99_ADMIN</p>
        </div>
        <nav className="flex flex-col gap-1">
          <SidebarItem icon={LayoutDashboard} label="DASHBOARD" active />
          <SidebarItem icon={UtensilsCrossed} label="MENU_ITEMS" />
          <SidebarItem icon={ReceiptText} label="LIVE_ORDERS" />
          <SidebarItem icon={Boxes} label="INVENTORY" />
          <SidebarItem icon={Gamepad2} label="STAFF_OPS" />
          <SidebarItem icon={Settings} label="SYSTEM_CFG" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-20 p-6 grid grid-cols-12 gap-6 pb-24">
        {/* Stats Section */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Sales (Today)" value="1,248.50" unit="CREDITS" color="#00FFFF" progress={75} />
          <StatCard label="Items Processed" value="342" unit="UNITS" color="#FF007F" progress={45} />
          <StatCard label="System Uptime" value="99.9" unit="% STABLE" color="#d7ca00" progress={99.9} />
        </section>

        {/* Quick Actions & Live Feed */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionButton icon={PlusCircle} label="NEW_SALE" color="#FF007F" bgColor="#3f001a" iconFill />
            <QuickActionButton icon={PackagePlus} label="ADD_PRODUCT" color="#00FFFF" bgColor="black" />
            <QuickActionButton icon={BarChart} label="VIEW_REPORTS" color="#d7ca00" bgColor="black" />
          </div>

          <section className="bg-neutral-900/40 border-2 border-neutral-800 p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-secondary-neon flex items-center gap-2 tracking-widest uppercase">
                <Radio size={20} className="animate-pulse" /> LIVE_FEED
              </h3>
              <span className="text-[10px] font-bold text-neutral-500 tracking-widest">SYNC_STATUS: OPERATIONAL</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {transactions.map((trx) => (
                  <FeedItem key={trx.id} transaction={trx} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Sidebar Info Panels */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Operator Card */}
          <div className="bg-black border-4 border-neutral-800 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-neutral-900 border-b-2 border-l-2 border-neutral-800">
              <span className="text-[10px] font-bold text-secondary-neon animate-pulse uppercase">● ONLINE</span>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 border-4 border-primary-neon p-1 relative overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmsYQf_CZfY9VCUo41fF5DrjIEz_FMLKfWchvJteRKTsgjgRVongMIMA5rp779eHscJVfgO1gAO7wngzQjKFnmR3hIUqKlWD-nKExz33pGwIXbBO12nB-PdEZddQYHdomb-mK9Sf8C6NqAxYAbLpKXuKStSiHsuu0yxgE1OWYg8MtzHjlSf09_xyqzeduUuvk3MQ9Tep5W-cEp77RpCklqH31FkTE9DNZQ4EfXGHJelxJZnRQ_VOGXFgD7pyWqdBYbySGRPfZ3ILPZ" 
                  alt="Operator Avatar" 
                  className="w-full h-full object-cover grayscale brightness-75 sepia-[0.3] hue-rotate-[280deg] contrast-150"
                />
                <div className="absolute inset-0 bg-primary-neon/10 pointer-events-none" />
              </div>
              <div>
                <h4 className="text-lg font-black text-primary-neon tracking-tight uppercase">OPERATOR_01</h4>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Current Shift: NIGHT_WLK</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">SHIFT_TIMER</span>
                <span className="font-mono text-secondary-neon text-xl tracking-widest">04:22:15</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 border border-neutral-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '55%' }}
                  className="h-full bg-secondary-neon shadow-[0_0_10px_#00FFFF]" 
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 uppercase tracking-widest">XP_PROGRESS</span>
                <span className="text-primary-neon font-bold">850 / 1000</span>
              </div>
            </div>
          </div>

          {/* Combo Meter */}
          <div className="bg-neutral-900/60 border-2 border-black p-4 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-[0.2em]">SESSION_COMBO</span>
              <span className="font-black italic text-2xl text-tertiary-neon animate-bounce">x12</span>
            </div>
            <div className="h-8 w-full bg-black border-2 border-neutral-800 p-1">
              <motion.div 
                animate={{ width: ['70%', '82%', '75%', '85%'] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-secondary-neon via-primary-neon to-pink-600 shadow-[0_0_15px_rgba(255,0,127,0.3)]" 
              />
            </div>
            <p className="text-[9px] text-neutral-500 text-center font-mono italic uppercase tracking-widest">KEEP_THE_FLOW_FOR_MAX_CREDITS</p>
          </div>

          {/* Logs */}
          <div className="bg-black border-2 border-neutral-900 font-mono text-[9px] p-4 text-cyan-800 h-48 overflow-hidden relative">
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p key={i} className={i === logs.length - 1 ? 'animate-pulse' : ''}>{log}</p>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-primary-neon text-white rounded-none border-4 border-black arcade-shadow-pink flex items-center justify-center cursor-pointer"
        >
          <Plus size={32} strokeWidth={4} />
        </motion.button>
      </div>
    </div>
  );
}
