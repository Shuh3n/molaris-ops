-- 20260507000600_fix_license_fk_issue.sql
-- Solución para el error de violación de clave foránea al actualizar licencias

BEGIN;

-- 1. Asegurar que las licencias estándar existan con sus nombres únicos
-- Usamos INSERT ... ON CONFLICT para actualizar los datos sin cambiar los IDs si ya existen
INSERT INTO licencias (nombre, max_dentistas, max_recepcionistas, descripcion) VALUES 
('Básica', 1, 1, 'Ideal para consultorios individuales. 1 Doctor y 1 Recepcionista.'),
('Estándar', 3, 3, 'Para pequeñas clínicas. Hasta 3 Doctores y 3 Recepcionistas.'),
('Pro', 10, 10, 'Para clínicas medianas. Hasta 10 Doctores y 10 Recepcionistas.'),
('Pro+', 100, 100, 'Para grandes centros odontológicos. Hasta 100 Doctores y 100 Recepcionistas.')
ON CONFLICT (nombre) DO UPDATE SET 
  max_dentistas = EXCLUDED.max_dentistas, 
  max_recepcionistas = EXCLUDED.max_recepcionistas,
  descripcion = EXCLUDED.descripcion;

-- 2. Si hay clínicas apuntando a licencias inexistentes o que se desean eliminar,
-- primero debemos reasignarlas. 
-- Por ejemplo, si el usuario intentó borrar una licencia, 
-- aquí reasignamos todas las clínicas a la licencia 'Básica' si su licencia_id es nulo o inválido.
DO $$
DECLARE
  v_basica_id UUID;
BEGIN
  SELECT id INTO v_basica_id FROM licencias WHERE nombre = 'Básica' LIMIT 1;
  
  -- Reasignar clínicas que tengan una licencia que no existe en la tabla licencias (huérfanas)
  UPDATE clinicas 
  SET licencia_id = v_basica_id 
  WHERE licencia_id IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM licencias l WHERE l.id = clinicas.licencia_id);
    
  -- Asegurar que todas tengan licencia
  UPDATE clinicas SET licencia_id = v_basica_id WHERE licencia_id IS NULL;
END $$;

COMMIT;
