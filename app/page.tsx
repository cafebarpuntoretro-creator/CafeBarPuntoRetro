import { ArrowUpRight, Package, DollarSign, Users } from "lucide-react";

export default function Home() {
  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="neon-pink" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p className="retro-text" style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>System Ready - Press Start to begin</p>
      </header>

      <div className="retro-grid">
        <div className="retro-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <DollarSign className="neon-cyan" />
            <span className="retro-text neon-yellow" style={{ fontSize: '0.6rem' }}>+12%</span>
          </div>
          <p className="retro-text" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>Ventas Hoy</p>
          <h2 className="neon-cyan" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>$1,250</h2>
        </div>

        <div className="retro-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Package className="neon-pink" />
            <span className="retro-text neon-pink" style={{ fontSize: '0.6rem' }}>LOW STOCK</span>
          </div>
          <p className="retro-text" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>Items en Stock</p>
          <h2 className="neon-pink" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>142</h2>
        </div>

        <div className="retro-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Users className="neon-yellow" />
            <ArrowUpRight className="neon-cyan" />
          </div>
          <p className="retro-text" style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>Clientes</p>
          <h2 className="neon-yellow" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>28</h2>
        </div>
      </div>

      <div className="retro-card" style={{ marginTop: '2rem' }}>
        <h3 className="neon-cyan" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Recent Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="retro-text" style={{ fontSize: '0.6rem' }}>New Sale #00{i}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>2x Beer, 1x Snack</p>
              </div>
              <span className="neon-pink retro-text" style={{ fontSize: '0.7rem' }}>$45.00</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
