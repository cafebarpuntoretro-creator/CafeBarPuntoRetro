import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-void text-on-background antialiased">
        {children}
      </body>
    </html>
  );
}
