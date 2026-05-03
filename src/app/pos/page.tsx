"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, CreditCard, Banknote } from "lucide-react";

export default function POSPage() {
  const [cart, setCart] = useState<{id: number, name: string, price: number, qty: number}[]>([]);

  const products = [
    { id: 1, name: "Pac-Man IPA", price: 15.0, icon: "🍺" },
    { id: 2, name: "Donkey Kong Pretzels", price: 8.5, icon: "🥨" },
    { id: 3, name: "Pixel Latte", price: 12.0, icon: "☕" },
    { id: 4, name: "Retro Burger", price: 22.0, icon: "🍔" },
    { id: 5, name: "8-bit Cookie", price: 5.0, icon: "🍪" },
    { id: 6, name: "Power-up Soda", price: 7.0, icon: "🥤" },
  ];

  const addToCart = (p: any) => {
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCart([...cart, {...p, qty: 1}]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', height: 'calc(100vh - 150px)' }}>
      {/* Catalog */}
      <div style={{ overflowY: 'auto', paddingRight: '1rem' }}>
        <h2 className="neon-cyan" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Catalog</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {products.map((p) => (
            <div 
              key={p.id} 
              className="retro-card" 
              style={{ cursor: 'pointer', textAlign: 'center', borderColor: 'var(--muted)' }}
              onClick={() => addToCart(p)}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{p.icon}</div>
              <p className="retro-text" style={{ fontSize: '0.6rem', marginBottom: '0.5rem' }}>{p.name}</p>
              <p className="neon-yellow retro-text" style={{ fontSize: '0.7rem' }}>${p.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="retro-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'var(--primary)' }}>
        <h3 className="neon-pink" style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={20} /> Current Order
        </h3>
        
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--muted-foreground)' }}>
              <p className="retro-text" style={{ fontSize: '0.5rem' }}>Cart is empty</p>
              <p className="retro-text" style={{ fontSize: '0.4rem', marginTop: '1rem' }}>Awaiting input...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#00000044', border: '2px solid var(--border)' }}>
                  <div>
                    <p className="retro-text" style={{ fontSize: '0.5rem' }}>{item.qty}x {item.name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--neon-yellow)' }}>${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '4px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span className="retro-text" style={{ fontSize: '0.8rem' }}>Total</span>
            <span className="neon-yellow retro-text" style={{ fontSize: '1.2rem' }}>${total.toFixed(2)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button className="retro-button" style={{ fontSize: '0.5rem' }}>
              <Banknote size={14} /> Cash
            </button>
            <button className="retro-button" style={{ fontSize: '0.5rem' }}>
              <CreditCard size={14} /> Card
            </button>
          </div>
          
          <button 
            className="retro-button primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={cart.length === 0}
            onClick={() => {
              alert("Transaction Complete! Game Over.");
              setCart([]);
            }}
          >
            <span className="retro-text">Insert Coin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
