-- Migración para expandir datos de pacientes (Contacto, Clínico y Menores)
ALTER TABLE public.pacientes 
  ADD COLUMN IF NOT EXISTS genero TEXT,
  ADD COLUMN IF NOT EXISTS telefono_secundario TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS direccion TEXT,
  ADD COLUMN IF NOT EXISTS ocupacion TEXT,
  ADD COLUMN IF NOT EXISTS alergias TEXT,
  ADD COLUMN IF NOT EXISTS enfermedades_sistemicas TEXT,
  ADD COLUMN IF NOT EXISTS nombre_representante TEXT,
  ADD COLUMN IF NOT EXISTS cedula_representante TEXT,
  ADD COLUMN IF NOT EXISTS parentesco_representante TEXT;

-- Comentarios para documentación de campos
COMMENT ON COLUMN public.pacientes.alergias IS 'Alergias a medicamentos, látex o metales';
COMMENT ON COLUMN public.pacientes.enfermedades_sistemicas IS 'Diabetes, hipertensión, problemas cardíacos, etc.';
COMMENT ON COLUMN public.pacientes.nombre_representante IS 'Nombre del representante legal para menores de edad';
