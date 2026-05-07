-- 20260507000700_enable_admin_management_policies.sql
-- Permitir a los administradores gestionar su equipo y su clínica

BEGIN;

-- 1. Política para permitir a ADMIN_GLOBAL actualizar perfiles de su clínica
DROP POLICY IF EXISTS "Admins pueden actualizar perfiles de su clinica" ON perfiles;
CREATE POLICY "Admins pueden actualizar perfiles de su clinica" ON perfiles
FOR UPDATE TO authenticated
USING (
  clinica_id IN (
    SELECT p.clinica_id 
    FROM perfiles p 
    JOIN roles r ON p.rol_id = r.id 
    WHERE p.id = auth.uid() AND r.nombre = 'ADMIN_GLOBAL'
  )
)
WITH CHECK (
  clinica_id IN (
    SELECT p.clinica_id 
    FROM perfiles p 
    JOIN roles r ON p.rol_id = r.id 
    WHERE p.id = auth.uid() AND r.nombre = 'ADMIN_GLOBAL'
  )
);

-- 2. Política para permitir a ADMIN_GLOBAL eliminar perfiles de su clínica
DROP POLICY IF EXISTS "Admins pueden borrar perfiles de su clinica" ON perfiles;
CREATE POLICY "Admins pueden borrar perfiles de su clinica" ON perfiles
FOR DELETE TO authenticated
USING (
  clinica_id IN (
    SELECT p.clinica_id 
    FROM perfiles p 
    JOIN roles r ON p.rol_id = r.id 
    WHERE p.id = auth.uid() AND r.nombre = 'ADMIN_GLOBAL'
  )
);

-- 3. Política para permitir a ADMIN_GLOBAL actualizar los datos de su propia clínica
DROP POLICY IF EXISTS "Admins pueden actualizar su clinica" ON clinicas;
CREATE POLICY "Admins pueden actualizar su clinica" ON clinicas
FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT p.clinica_id 
    FROM perfiles p 
    JOIN roles r ON p.rol_id = r.id 
    WHERE p.id = auth.uid() AND r.nombre = 'ADMIN_GLOBAL'
  )
)
WITH CHECK (
  id IN (
    SELECT p.clinica_id 
    FROM perfiles p 
    JOIN roles r ON p.rol_id = r.id 
    WHERE p.id = auth.uid() AND r.nombre = 'ADMIN_GLOBAL'
  )
);

COMMIT;
