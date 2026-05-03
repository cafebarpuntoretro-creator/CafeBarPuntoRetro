"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data for now
  const products = [
    { id: 1, name: "Pac-Man IPA", category: "Bebidas", price: 15.0, stock: 45 },
    { id: 2, name: "Donkey Kong Pretzels", category: "Snacks", price: 8.5, stock: 12 },
    { id: 3, name: "Pixel Latte", category: "Café", price: 12.0, stock: 30 },
  ];

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="neon-cyan" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Inventory</h1>
          <p className="retro-text" style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Manage your gear</p>
        </div>
        <button className="retro-button primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} />
          <span className="retro-text" style={{ fontSize: '0.7rem' }}>Add Item</span>
        </button>
      </header>

      {showAddForm && (
        <div className="retro-card" style={{ marginBottom: '2rem', border: '4px solid var(--primary)' }}>
          <h3 className="neon-pink" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>New Item</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="retro-text" style={{ fontSize: '0.5rem' }}>Name</label>
              <input type="text" placeholder="Product name..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="retro-text" style={{ fontSize: '0.5rem' }}>Category</label>
              <select>
                <option>Bebidas</option>
                <option>Snacks</option>
                <option>Café</option>
                <option>Games</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="retro-text" style={{ fontSize: '0.5rem' }}>Price</label>
              <input type="number" placeholder="0.00" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="retro-text" style={{ fontSize: '0.5rem' }}>Stock</label>
              <input type="number" placeholder="0" />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button className="retro-button secondary">Save</button>
            <button className="retro-button" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="retro-card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '4px solid var(--border)', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              style={{ width: '100%', paddingLeft: '40px' }}
            />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className="retro-text" style={{ fontSize: '0.8rem' }}>{p.name}</span>
                </td>
                <td>
                  <span className="retro-text neon-yellow" style={{ fontSize: '0.6rem' }}>{p.category}</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-retro)', fontSize: '0.7rem' }}>${p.price.toFixed(2)}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '60px', height: '10px', background: '#333' }}>
                      <div style={{ 
                        width: `${Math.min(p.stock, 100)}%`, 
                        height: '100%', 
                        background: p.stock < 15 ? 'var(--error)' : 'var(--success)' 
                      }} />
                    </div>
                    <span className="retro-text" style={{ fontSize: '0.6rem' }}>{p.stock}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}><Edit2 size={16}/></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
