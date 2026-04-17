-- 1. Crear tabla de Motivos de Consulta
CREATE TABLE motivos_consulta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('activo', 'inactivo')) DEFAULT 'activo',
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar motivos iniciales
INSERT INTO motivos_consulta (nombre) VALUES 
('Limpieza Dental'),
('Ortodoncia (Control)'),
('Extracción'),
('Blanqueamiento'),
('Urgencia'),
('Consulta General')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Modificar tabla de Citas para usar el FK de motivos
-- Agregamos la columna como anulable primero por seguridad
ALTER TABLE citas ADD COLUMN motivo_id UUID REFERENCES motivos_consulta(id) ON DELETE SET NULL;

-- 4. Opcional: Migrar datos existentes si los hay
-- UPDATE citas c SET motivo_id = (SELECT id FROM motivos_consulta m WHERE m.nombre = c.motivo LIMIT 1);

-- 5. Comentar la columna 'motivo' vieja (o borrarla después si querés)
-- ALTER TABLE citas DROP COLUMN motivo;

-- 6. Insertar Roles si no existen (solo por seguridad)
INSERT INTO roles (nombre, descripcion) VALUES 
('ORTODONCISTA', 'Profesional dental con acceso a pacientes y citas médicas')
ON CONFLICT (nombre) DO NOTHING;

-- Nota para el usuario:
-- Para insertar dentistas, necesitás los UUIDs de auth.users. 
-- Ejemplo de cómo insertar un dentista una vez que tenés el ID del usuario:
/*
INSERT INTO perfiles (id, nombre_completo, email, rol_id, clinica_id)
SELECT 
  'UUID_DEL_USUARIO_AQUÍ', 
  'Dr. Juan Pérez', 
  'juan.perez@molaris.com', 
  (SELECT id FROM roles WHERE nombre = 'ORTODONCISTA'),
  (SELECT id FROM clinicas LIMIT 1) -- Asigna a la primera clínica disponible
ON CONFLICT (id) DO UPDATE SET rol_id = EXCLUDED.rol_id;
*/
