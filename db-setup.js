require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function setup() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ACCESS_TOKEN_MOLARIS);
  
  const sql = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE TABLE IF NOT EXISTS clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_consultorio TEXT NOT NULL,
    plan_licencia TEXT DEFAULT 'standard',
    activa BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinica_id UUID REFERENCES clinicas(id),
    nombre_completo TEXT,
    rol TEXT CHECK (rol IN ('ADMIN_GLOBAL', 'ORTODONCISTA', 'RECEPCIONISTA')),
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    documento_id TEXT,
    fecha_nacimiento DATE,
    historial_notas TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS citas (
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
  `;

  // Nota: Dado que el cliente de Supabase no permite ejecutar SQL arbitrario directamente por el cliente REST,
  // se recomienda correr este SQL en el dashboard de Supabase (SQL Editor).
  // Sin embargo, voy a intentar usar una función RPC si está disponible o simplemente avisarte.
  console.log('SQL generado con éxito. Si no tienes RPC habilitado, por favor ejecuta este SQL en el Dashboard de Supabase para mayor seguridad.');
}

setup();
