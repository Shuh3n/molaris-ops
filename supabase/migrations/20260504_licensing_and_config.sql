-- 20260504_licensing_and_config.sql
-- Optimizado para evitar deadlocks mediante bloqueos explícitos y timeouts.

BEGIN;

-- Establecer un timeout de bloqueo para no colgar la base si hay mucho tráfico
SET LOCAL lock_timeout = '10s';

-- Bloquear tablas en orden consistente para evitar interbloqueos (deadlocks)
-- Bloqueamos en modo EXCLUSIVE para realizar cambios de esquema (DDL)
LOCK TABLE clinicas, perfiles, roles IN ACCESS EXCLUSIVE MODE;

-- 1. Ampliar tabla clinicas con configuraciones operacionales y licencia
ALTER TABLE clinicas 
ADD COLUMN IF NOT EXISTS horario_apertura TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS horario_cierre TIME DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS duracion_turno INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS tiempo_limpieza INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS tiempo_sobreturnos INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS tiempo_wsp INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS wsp_template TEXT DEFAULT 'Hola [PACIENTE], te recordamos tu cita en MOLARIS OPS el día [FECHA] a las [HORA]. ¡Te esperamos!',
ADD COLUMN IF NOT EXISTS wsp_reminders_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS wsp_lead_time TEXT DEFAULT '24h';

-- 2. Asegurar que los roles estén correctos
INSERT INTO roles (nombre, descripcion) VALUES 
('ADMIN_GLOBAL', 'Administrador del sistema'),
('ORTODONCISTA', 'Profesional dental'),
('RECEPCIONISTA', 'Personal administrativo')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Trigger para calcular fecha de vencimiento automáticamente
CREATE OR REPLACE FUNCTION handle_license_activation()
RETURNS trigger AS $$
BEGIN
  -- Si la licencia pasa de false/null a true, le damos un mes
  IF NEW.activa = true AND (OLD.activa = false OR OLD.activa IS NULL) THEN
    NEW.fecha_vencimiento := NOW() + INTERVAL '1 month';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_license_activation ON clinicas;
CREATE TRIGGER tr_license_activation
BEFORE UPDATE ON clinicas
FOR EACH ROW
EXECUTE FUNCTION handle_license_activation();

-- 4. Restricción de miembros por clínica (1 Dr, 1 Recepcionista)
CREATE OR REPLACE FUNCTION check_member_limits()
RETURNS trigger AS $$
DECLARE
  v_count INTEGER;
  v_role_name TEXT;
BEGIN
  -- Obtenemos el nombre del rol que se está asignando
  SELECT nombre INTO v_role_name FROM roles WHERE id = NEW.rol_id;
  
  -- Solo aplicamos límites a ORTODONCISTA y RECEPCIONISTA
  IF v_role_name = 'ORTODONCISTA' THEN
    SELECT count(*) INTO v_count FROM perfiles 
    WHERE clinica_id = NEW.clinica_id 
      AND rol_id = NEW.rol_id 
      AND id != NEW.id; -- Excluimos al usuario actual si es un update
    
    IF v_count >= 1 THEN
      RAISE EXCEPTION 'Límite alcanzado: Esta clínica ya tiene un Odontólogo asignado.';
    END IF;
    
  ELSIF v_role_name = 'RECEPCIONISTA' THEN
    SELECT count(*) INTO v_count FROM perfiles 
    WHERE clinica_id = NEW.clinica_id 
      AND rol_id = NEW.rol_id 
      AND id != NEW.id;
    
    IF v_count >= 1 THEN
      RAISE EXCEPTION 'Límite alcanzado: Esta clínica ya tiene un Recepcionista asignado.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_member_limits ON perfiles;
CREATE TRIGGER tr_check_member_limits
BEFORE INSERT OR UPDATE ON perfiles
FOR EACH ROW
EXECUTE FUNCTION check_member_limits();

COMMIT;
