-- 20260421000000_add_activity_logs_and_triggers.sql
-- Sistema de Auditoría y Logs para Notificaciones

-- 1. Tabla de Logs de Actividad
CREATE TABLE logs_actividad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  accion TEXT NOT NULL, -- 'creacion', 'actualizacion', 'eliminacion', 'cambio_estado'
  entidad_tipo TEXT NOT NULL, -- 'citas', 'pacientes', 'facturas'
  entidad_id UUID,  
  detalles JSONB,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE logs_actividad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven logs de su clinica" ON logs_actividad
FOR SELECT TO authenticated
USING (
  clinica_id IN (
    SELECT clinica_id FROM perfiles WHERE id = auth.uid()
  )
);

-- 3. Función para capturar cambios en citas
CREATE OR REPLACE FUNCTION log_cita_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_clinica_id UUID;
    v_usuario_id UUID;
    v_accion TEXT;
    v_detalles JSONB;
BEGIN
    v_clinica_id := COALESCE(NEW.clinica_id, OLD.clinica_id);
    v_usuario_id := auth.uid(); -- Nota: Esto funciona si se hace desde el cliente web. Si es via Edge Function con Service Role, puede ser NULL a menos que se setee.

    IF (TG_OP = 'INSERT') THEN
        v_accion := 'creacion';
        v_detalles := jsonb_build_object(
            'paciente_id', NEW.paciente_id,
            'fecha_hora', NEW.fecha_hora,
            'estado', NEW.estado
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.estado <> NEW.estado) THEN
            v_accion := 'cambio_estado';
            v_detalles := jsonb_build_object(
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado,
                'fecha_hora', NEW.fecha_hora
            );
        ELSE
            v_accion := 'actualizacion';
            v_detalles := jsonb_build_object(
                'cambios', (to_jsonb(NEW) - 'actualizado_en')
            );
        END IF;
    END IF;

    INSERT INTO logs_actividad (clinica_id, usuario_id, accion, entidad_tipo, entidad_id, detalles)
    VALUES (v_clinica_id, v_usuario_id, v_accion, 'citas', NEW.id, v_detalles);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Triggers para citas
CREATE TRIGGER trigger_log_citas
AFTER INSERT OR UPDATE ON citas
FOR EACH ROW EXECUTE FUNCTION log_cita_changes();

-- 5. Función para capturar cambios en pacientes
CREATE OR REPLACE FUNCTION log_paciente_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_clinica_id UUID;
    v_usuario_id UUID;
    v_detalles JSONB;
BEGIN
    v_clinica_id := NEW.clinica_id;
    v_usuario_id := auth.uid();

    IF (TG_OP = 'INSERT') THEN
        v_detalles := jsonb_build_object(
            'nombre', NEW.nombre,
            'apellido', NEW.apellido
        );
        
        INSERT INTO logs_actividad (clinica_id, usuario_id, accion, entidad_tipo, entidad_id, detalles)
        VALUES (v_clinica_id, v_usuario_id, 'creacion', 'pacientes', NEW.id, v_detalles);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Triggers para pacientes
CREATE TRIGGER trigger_log_pacientes
AFTER INSERT ON pacientes
FOR EACH ROW EXECUTE FUNCTION log_paciente_changes();
