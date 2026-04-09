-- 00_initial_schema.sql
-- Molaris OPS - Esquema Inicial (Normalizado y Corregido Definitivamente)

-- 1. Limpieza total para evitar conflictos de esquema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS notas_pacientes CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS clinicas CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 2. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Tabla de Roles (Normalización)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL, -- 'ADMIN_GLOBAL', 'ORTODONCISTA', 'RECEPCIONISTA'
  descripcion TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserción de roles iniciales
INSERT INTO roles (nombre, descripcion) VALUES 
('ADMIN_GLOBAL', 'Administrador del sistema con acceso total'),
('ORTODONCISTA', 'Profesional dental con acceso a pacientes y citas médicas'),
('RECEPCIONISTA', 'Personal administrativo con acceso a gestión de citas y pacientes')
ON CONFLICT (nombre) DO NOTHING;

-- 4. Tabla de Clínicas (Tenants)
CREATE TABLE clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_consultorio TEXT NOT NULL,
  plan_licencia TEXT DEFAULT 'standard',
  activa BOOLEAN DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de Perfiles (Usuarios vinculados a Auth con FK a Roles)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID REFERENCES clinicas(id) ON DELETE SET NULL,
  rol_id UUID REFERENCES roles(id) ON DELETE RESTRICT, -- Conexión normalizada
  nombre_completo TEXT,
  email TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Pacientes
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  documento_id TEXT,
  fecha_nacimiento DATE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabla de Notas de Pacientes (Histórico normalizado)
CREATE TABLE notas_pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES perfiles(id) ON DELETE SET NULL, -- Asignada a un usuario autor
  nota TEXT NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabla de Citas
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id UUID REFERENCES perfiles(id),
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  estado TEXT CHECK (estado IN ('programada', 'completada', 'cancelada', 'noshow')) DEFAULT 'programada',
  motivo TEXT,
  notas_medicas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Función para crear el perfil automáticamente al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Buscamos el ID del rol RECEPCIONISTA por defecto
  SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'RECEPCIONISTA' LIMIT 1;
  
  -- Verificación de seguridad
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Error: El rol RECEPCIONISTA no existe en la tabla roles.';
  END IF;

  INSERT INTO public.perfiles (id, email, rol_id)
  VALUES (new.id, new.email, v_role_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Seguridad (RLS) básica
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven su propio perfil" ON perfiles FOR SELECT USING (auth.uid() = id);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos los autenticados pueden ver roles" ON roles FOR SELECT TO authenticated USING (true);
