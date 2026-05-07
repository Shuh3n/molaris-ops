-- 20260507000100_fix_registration_rls.sql

BEGIN;

-- 1. Permitir a usuarios autenticados crear su clínica
DROP POLICY IF EXISTS "Autenticados pueden crear clinica" ON clinicas;
CREATE POLICY "Autenticados pueden crear clinica" ON clinicas
FOR INSERT TO authenticated
WITH CHECK (true);

-- 2. Permitir a usuarios actualizar su propio perfil (necesario para asociar clinica_id tras registro)
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON perfiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON perfiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Permitir a administradores actualizar su propia clínica
DROP POLICY IF EXISTS "Administradores pueden actualizar su clinica" ON clinicas;
CREATE POLICY "Administradores pueden actualizar su clinica" ON clinicas
FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT clinica_id FROM perfiles 
    WHERE id = auth.uid() 
    AND rol_id IN (SELECT id FROM roles WHERE nombre = 'ADMIN_GLOBAL')
  )
)
WITH CHECK (
  id IN (
    SELECT clinica_id FROM perfiles 
    WHERE id = auth.uid() 
    AND rol_id IN (SELECT id FROM roles WHERE nombre = 'ADMIN_GLOBAL')
  )
);

COMMIT;
