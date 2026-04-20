-- 20260420000000_enable_rls_and_policies.sql
-- Habilitar RLS y crear políticas de seguridad por clínica

-- 1. Habilitar RLS en tablas críticas
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivos_consulta ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_pacientes ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'pacientes'
DROP POLICY IF EXISTS "Usuarios ven pacientes de su clinica" ON pacientes;
CREATE POLICY "Usuarios ven pacientes de su clinica" ON pacientes
FOR ALL TO authenticated
USING (
  clinica_id IN (
    SELECT clinica_id FROM perfiles WHERE id = auth.uid()
  )
);

-- 3. Políticas para 'citas'
DROP POLICY IF EXISTS "Usuarios ven citas de su clinica" ON citas;
CREATE POLICY "Usuarios ven citas de su clinica" ON citas
FOR ALL TO authenticated
USING (
  clinica_id IN (
    SELECT clinica_id FROM perfiles WHERE id = auth.uid()
  )
);

-- 4. Políticas para 'notas_pacientes'
DROP POLICY IF EXISTS "Usuarios ven notas de su clinica" ON notas_pacientes;
CREATE POLICY "Usuarios ven notas de su clinica" ON notas_pacientes
FOR ALL TO authenticated
USING (
  paciente_id IN (
    SELECT id FROM pacientes WHERE clinica_id IN (
      SELECT clinica_id FROM perfiles WHERE id = auth.uid()
    )
  )
);

-- 5. Políticas para 'clinicas'
DROP POLICY IF EXISTS "Usuarios ven su propia clinica" ON clinicas;
CREATE POLICY "Usuarios ven su propia clinica" ON clinicas
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT clinica_id FROM perfiles WHERE id = auth.uid()
  )
);

-- 6. Políticas para 'motivos_consulta' (Lectura global por ahora)
DROP POLICY IF EXISTS "Todos los autenticados ven motivos" ON motivos_consulta;
CREATE POLICY "Todos los autenticados ven motivos" ON motivos_consulta
FOR SELECT TO authenticated
USING (true);

-- 7. Asegurar que los perfiles tengan RLS (ya estaba en 00_initial_schema, pero reforzamos)
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON perfiles;
CREATE POLICY "Usuarios ven su propio perfil" ON perfiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Adicional: Permitir que los usuarios de la misma clínica vean los perfiles de sus colegas (necesario para selects de dentistas)
DROP POLICY IF EXISTS "Usuarios ven perfiles de su clinica" ON perfiles;
CREATE POLICY "Usuarios ven perfiles de su clinica" ON perfiles
FOR SELECT TO authenticated
USING (
  clinica_id IN (
    SELECT clinica_id FROM perfiles WHERE id = auth.uid()
  )
);
