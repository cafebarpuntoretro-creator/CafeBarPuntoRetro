-- Habilitar permisos de actualización para productos
CREATE POLICY "Allow public update access on products" 
ON products FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Habilitar permisos de eliminación para productos
CREATE POLICY "Allow public delete access on products" 
ON products FOR DELETE 
USING (true);

-- Nota: Si prefieres simplificar, también puedes usar:
-- DROP POLICY "Allow public read access on products" ON products;
-- DROP POLICY "Allow public insert access on products" ON products;
-- CREATE POLICY "Allow public all on products" ON products FOR ALL USING (true);
