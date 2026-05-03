import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";

export const metadata: Metadata = {
  title: "Punto Retro POS",
  description: "Sistema de Inventario y Ventas Retro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="scanline" />
        <nav>
          <div className="logo retro-text neon-pink">
            Punto Retro <span className="neon-cyan">POS</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/" className="retro-button" style={{ border: 'none', background: 'none', boxShadow: 'none' }}>
              <LayoutDashboard size={18} className="neon-cyan" />
              <span className="retro-text" style={{ fontSize: '0.6rem' }}>Dashboard</span>
            </Link>
            <Link href="/inventory" className="retro-button" style={{ border: 'none', background: 'none', boxShadow: 'none' }}>
              <Package size={18} className="neon-pink" />
              <span className="retro-text" style={{ fontSize: '0.6rem' }}>Stock</span>
            </Link>
            <Link href="/pos" className="retro-button primary">
              <ShoppingCart size={18} />
              <span className="retro-text" style={{ fontSize: '0.6rem' }}>Insert Coin</span>
            </Link>
          </div>
        </nav>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
