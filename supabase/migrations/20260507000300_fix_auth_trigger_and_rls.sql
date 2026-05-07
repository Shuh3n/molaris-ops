-- 20260507000300_fix_auth_trigger_and_rls.sql

BEGIN;

-- 1. Asegurar que los roles existan
INSERT INTO roles (nombre, descripcion) VALUES 
('ADMIN_GLOBAL', 'Administrador del sistema'),
('ORTODONCISTA', 'Profesional dental'),
('RECEPCIONISTA', 'Personal administrativo')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Función robusta para crear perfil al crear usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Buscamos el rol RECEPCIONISTA como default
  SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'RECEPCIONISTA' LIMIT 1;
  
  -- Insertamos el perfil. Si ya existe (por alguna razón), no hacemos nada.
  -- El email lo tomamos de auth.users.
  INSERT INTO public.perfiles (id, email, rol_id)
  VALUES (NEW.id, NEW.email, v_role_id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asegurar que el trigger esté creado y activo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Corregir RLS para permitir el login y la consulta de perfil inicial
-- Asegurarnos de que RLS esté habilitado
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean su propio perfil
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON perfiles;
CREATE POLICY "Usuarios ven su propio perfil" ON perfiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Política para que usuarios puedan ver los roles (necesario para el join en login)
DROP POLICY IF EXISTS "Todos los autenticados pueden ver roles" ON roles;
CREATE POLICY "Todos los autenticados pueden ver roles" ON roles
FOR SELECT TO authenticated
USING (true);

-- Política para que usuarios vean la clínica (necesario para el join en login)
-- Si clinica_id es NULL, el join no devuelve nada, pero si tiene valor, debe poder leerlo.
DROP POLICY IF EXISTS "Usuarios ven su clinica" ON clinicas;
CREATE POLICY "Usuarios ven su clinica" ON clinicas
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT clinica_id FROM perfiles WHERE id = auth.uid()
  )
);

-- 5. Permitir a usuarios autenticados sin perfil (recién creados) leer su propia entrada en perfiles
-- A veces el trigger tarda unos milisegundos, pero auth.uid() ya está disponible.
DROP POLICY IF EXISTS "Usuarios recien creados ven su perfil" ON perfiles;
CREATE POLICY "Usuarios recien creados ven su perfil" ON perfiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

COMMIT;
