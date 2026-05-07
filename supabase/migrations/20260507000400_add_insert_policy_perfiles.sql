-- 20260507000400_add_insert_policy_perfiles.sql

BEGIN;

-- Permitir a usuarios insertar su propio perfil (como fallback del trigger)
DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON perfiles;
CREATE POLICY "Usuarios pueden insertar su propio perfil" ON perfiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

COMMIT;
