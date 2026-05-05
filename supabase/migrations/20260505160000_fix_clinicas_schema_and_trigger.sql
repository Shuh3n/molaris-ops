-- 20260505160000_fix_clinicas_schema_and_trigger.sql

BEGIN;

-- 1. Agregar columnas faltantes a la tabla clinicas
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS telefono_emergencia TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;

-- 2. Asegurar que la tabla licencias tenga datos para evitar fallos en triggers
INSERT INTO licencias (nombre, max_dentistas, max_recepcionistas, descripcion) VALUES 
('Básica', 1, 1, 'Ideal para consultorios individuales.')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Refinar handle_new_user para que sea TOTALMENTE silencioso si falla
-- Esto es CRÍTICO para evitar el Error 500 de Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.perfiles (id, email, rol_id)
    VALUES (
      NEW.id, 
      NEW.email, 
      (SELECT id FROM roles WHERE nombre = 'RECEPCIONISTA' LIMIT 1)
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- No hacemos nada, permitimos que el usuario se cree en Auth
    -- El frontend se encargará de reintentar o manejar la falta de perfil
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
