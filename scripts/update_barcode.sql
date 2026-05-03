-- Añadir columna de código de barras a la tabla de productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;

-- Asegurar que la columna sea buscable rápidamente
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
