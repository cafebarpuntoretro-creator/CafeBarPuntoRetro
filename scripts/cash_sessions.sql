-- Tabla para sesiones de caja
CREATE TABLE IF NOT EXISTS cash_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  initial_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_amount_expected NUMERIC(10, 2),
  final_amount_real NUMERIC(10, 2),
  status TEXT DEFAULT 'open', -- 'open' o 'closed'
  user_id UUID REFERENCES auth.users(id)
);

-- Vincular ventas a una sesión de caja
ALTER TABLE sales ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES cash_sessions(id);

-- Habilitar RLS
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to cash_sessions" ON cash_sessions FOR ALL USING (true);
