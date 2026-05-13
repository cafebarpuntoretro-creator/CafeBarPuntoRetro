-- Script para migrar categorías antiguas a la nueva estructura específica
-- Ejecutar en el SQL Editor de Supabase

UPDATE products 
SET category = 'Cerveza' 
WHERE category = 'Bebidas' 
   OR category = 'BEBIDAS';

-- Verificar resultados
SELECT name, category FROM products WHERE category = 'Cerveza';
