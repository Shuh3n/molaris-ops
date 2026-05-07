-- 00_initial_schema.sql
-- Molaris OPS - Esquema Inicial (Definitivo y Unificado)

-- 1. Limpieza total
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS recordatorios CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS estados_cita CASCADE;
DROP TABLE IF EXISTS motivos_consulta CASCADE;
DROP TABLE IF EXISTS notas_pacientes CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS clinicas CASCADE;
DROP TABLE IF EXISTS licencias CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS conversaciones_telegram CASCADE;
DROP TABLE IF EXISTS logs_actividad CASCADE;

-- 2. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO roles (nombre, descripcion) VALUES 
('ADMIN_GLOBAL', 'Administrador del sistema'),
('ORTODONCISTA', 'Profesional dental'),
('RECEPCIONISTA', 'Personal administrativo')
ON CONFLICT (nombre) DO NOTHING;

-- 4. Licencias
CREATE TABLE licencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  max_dentistas INTEGER NOT NULL,
  max_recepcionistas INTEGER NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  default_period_days INTEGER DEFAULT 30
);

INSERT INTO licencias (nombre, max_dentistas, max_recepcionistas, descripcion) VALUES 
('Standard', 1, 1, 'Plan básico para consultorios individuales.')
ON CONFLICT (nombre) DO NOTHING;

-- 5. Clínicas
CREATE TABLE clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_consultorio TEXT NOT NULL,
  plan_licencia TEXT DEFAULT 'standard',
  activa BOOLEAN DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  horario_apertura TIME DEFAULT '08:00',
  horario_cierre TIME DEFAULT '18:00',
  duracion_turno INTEGER DEFAULT 30,
  tiempo_limpieza INTEGER DEFAULT 10,
  tiempo_sobreturnos INTEGER DEFAULT 15,
  tiempo_wsp INTEGER DEFAULT 5,
  fecha_vencimiento TIMESTAMP WITH TIME ZONE,
  wsp_template TEXT DEFAULT 'Hola [PACIENTE], te recordamos tu cita en MOLARIS OPS el día [FECHA] a las [HORA]. ¡Te esperamos!',
  wsp_reminders_enabled BOOLEAN DEFAULT true,
  wsp_lead_time TEXT DEFAULT '24h',
  licencia_id UUID REFERENCES licencias(id),
  telefono TEXT,
  telefono_emergencia TEXT,
  email TEXT
);

-- 6. Estados de Cita
CREATE TABLE estados_cita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO estados_cita (nombre, descripcion) VALUES 
('programada', 'Cita agendada y pendiente de atención'),
('completada', 'Cita finalizada exitosamente'),
('cancelada', 'Cita cancelada por el paciente o la clínica'),
('noshow', 'El paciente no asistió a la cita')
ON CONFLICT (nombre) DO NOTHING;

-- 7. Perfiles
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID REFERENCES clinicas(id) ON DELETE SET NULL,
  rol_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
  nombre_completo TEXT,
  email TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  documento_id TEXT,
  fecha_nacimiento DATE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT true,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  genero TEXT,
  telefono_secundario TEXT,
  email TEXT,
  direccion TEXT,
  ocupacion TEXT,
  alergias TEXT,
  enfermedades_sistemicas TEXT,
  nombre_representante TEXT,
  cedula_representante TEXT,
  parentesco_representante TEXT,
  requiere_acompanante BOOLEAN DEFAULT false,
  telegram_chat_id TEXT UNIQUE
);

-- 9. Motivos de Consulta
CREATE TABLE motivos_consulta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  costo_base NUMERIC DEFAULT 0
);

INSERT INTO motivos_consulta (nombre, costo_base) VALUES 
('Limpieza Dental', 500),
('Ortodoncia (Control)', 800),
('Extracción', 1200),
('Blanqueamiento', 2000),
('Urgencia', 600),
('Consulta General', 400)
ON CONFLICT (nombre) DO NOTHING;

-- 10. Citas
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID REFERENCES perfiles(id),
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  notas_medicas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  motivo_id UUID REFERENCES motivos_consulta(id),
  estado_id UUID NOT NULL REFERENCES estados_cita(id)
);

-- 11. Facturas
CREATE TABLE facturas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  paciente UUID NOT NULL REFERENCES pacientes(id),
  categoria CHARACTER VARYING,
  descripcion CHARACTER VARYING,
  costo NUMERIC DEFAULT 0,
  fecha_servicio DATE,
  estado CHARACTER VARYING,
  cita_id UUID REFERENCES citas(id)
);

-- 12. Recordatorios
CREATE TABLE recordatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id UUID REFERENCES citas(id) ON DELETE CASCADE,
  tipo TEXT,
  enviado BOOLEAN DEFAULT false,
  enviado_en TIMESTAMP WITHOUT TIME ZONE
);

-- 13. Notas de Pacientes
CREATE TABLE notas_pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  nota TEXT NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Telegram
CREATE TABLE conversaciones_telegram (
  chat_id TEXT PRIMARY KEY,
  step TEXT NOT NULL DEFAULT 'inicio',
  paciente_id UUID REFERENCES pacientes(id),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 15. Logs
CREATE TABLE logs_actividad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID REFERENCES clinicas(id),
  usuario_id UUID REFERENCES perfiles(id),
  accion TEXT NOT NULL,
  entidad_tipo TEXT NOT NULL,
  entidad_id UUID,
  detalles JSONB,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Funciones y Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'RECEPCIONISTA' LIMIT 1;
  
  INSERT INTO public.perfiles (id, email, rol_id)
  VALUES (new.id, new.email, v_role_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 17. Seguridad (RLS) básica
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su propio perfil" ON perfiles FOR SELECT USING (auth.uid() = id);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos los autenticados pueden ver roles" ON roles FOR SELECT TO authenticated USING (true);
