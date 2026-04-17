-- Trigger para manejar el actualizado_en automáticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a la tabla de citas
DROP TRIGGER IF EXISTS on_appointments_updated ON citas;
CREATE TRIGGER on_appointments_updated
  BEFORE UPDATE ON citas
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Aseguramos que la columna actualizado_en esté presente (por las dudas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citas' AND column_name='actualizado_en') THEN
        ALTER TABLE citas ADD COLUMN actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
