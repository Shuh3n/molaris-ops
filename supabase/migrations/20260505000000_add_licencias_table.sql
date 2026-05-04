-- 20260505000000_add_licencias_table.sql

BEGIN;

-- 1. Crear tabla de licencias
CREATE TABLE IF NOT EXISTS licencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  max_dentistas INTEGER NOT NULL,
  max_recepcionistas INTEGER NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar licencias por defecto
INSERT INTO licencias (nombre, max_dentistas, max_recepcionistas, descripcion) VALUES 
('Básica', 1, 1, 'Ideal para consultorios individuales. 1 Doctor y 1 Recepcionista.'),
('Estándar', 3, 3, 'Para pequeñas clínicas. Hasta 3 Doctores y 3 Recepcionistas.'),
('Pro', 10, 10, 'Para clínicas medianas. Hasta 10 Doctores y 10 Recepcionistas.'),
('Pro+', 100, 100, 'Para grandes centros odontológicos. Hasta 100 Doctores y 100 Recepcionistas.')
ON CONFLICT (nombre) DO UPDATE SET 
  max_dentistas = EXCLUDED.max_dentistas, 
  max_recepcionistas = EXCLUDED.max_recepcionistas,
  descripcion = EXCLUDED.descripcion;

-- 3. Vincular clínicas con licencias
-- Primero añadimos la columna permitiendo nulos para asociar las existentes
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS licencia_id UUID REFERENCES licencias(id);

-- Asociar por defecto la licencia 'Básica' a las clínicas existentes (o según su plan_licencia si existiera una lógica previa)
DO $$
DECLARE
  v_licencia_basica_id UUID;
BEGIN
  SELECT id INTO v_licencia_basica_id FROM licencias WHERE nombre = 'Básica' LIMIT 1;
  UPDATE clinicas SET licencia_id = v_licencia_basica_id WHERE licencia_id IS NULL;
END $$;

-- Ahora podemos ponerle NOT NULL si queremos asegurar consistencia
-- ALTER TABLE clinicas ALTER COLUMN licencia_id SET NOT NULL;

-- 4. Actualizar la función de validación de límites para que sea dinámica
CREATE OR REPLACE FUNCTION check_member_limits()
RETURNS trigger AS $$
DECLARE
  v_count INTEGER;
  v_role_name TEXT;
  v_max_dentistas INTEGER;
  v_max_recepcionistas INTEGER;
BEGIN
  -- 1. Obtenemos el nombre del rol que se está asignando
  SELECT nombre INTO v_role_name FROM roles WHERE id = NEW.rol_id;
  
  -- 2. Obtenemos los límites de la licencia de la clínica
  SELECT l.max_dentistas, l.max_recepcionistas 
  INTO v_max_dentistas, v_max_recepcionistas
  FROM licencias l
  JOIN clinicas c ON c.licencia_id = l.id
  WHERE c.id = NEW.clinica_id;

  -- Si no encontramos límites (clínica sin licencia?), usamos Básica por defecto por seguridad
  IF v_max_dentistas IS NULL THEN
    v_max_dentistas := 1;
    v_max_recepcionistas := 1;
  END IF;
  
  -- 3. Validamos según el rol
  IF v_role_name = 'ORTODONCISTA' THEN
    SELECT count(*) INTO v_count FROM perfiles 
    WHERE clinica_id = NEW.clinica_id 
      AND rol_id = NEW.rol_id 
      AND id != NEW.id; -- Excluimos al usuario actual si es un update
    
    IF v_count >= v_max_dentistas THEN
      RAISE EXCEPTION 'Límite de Odontólogos alcanzado (%): Tu licencia actual no permite más.', v_max_dentistas;
    END IF;
    
  ELSIF v_role_name = 'RECEPCIONISTA' THEN
    SELECT count(*) INTO v_count FROM perfiles 
    WHERE clinica_id = NEW.clinica_id 
      AND rol_id = NEW.rol_id 
      AND id != NEW.id;
    
    IF v_count >= v_max_recepcionistas THEN
      RAISE EXCEPTION 'Límite de Recepcionistas alcanzado (%): Tu licencia actual no permite más.', v_max_recepcionistas;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;
