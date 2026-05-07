-- 20260507000500_sync_licenses_and_limits.sql

BEGIN;

-- 1. Limpiar licencias existentes para evitar conflictos de nombres
DELETE FROM licencias;

-- 2. Insertar los planes oficiales con sus límites
-- El Admin Global NO cuenta para max_dentistas ni max_recepcionistas en la lógica del trigger
INSERT INTO licencias (nombre, max_dentistas, max_recepcionistas, descripcion, default_period_days) VALUES 
('Básica', 1, 1, 'Plan inicial: 1 Admin + 1 Dr + 1 Rec = 3 miembros en total.', 15),
('Estándar', 3, 2, 'Plan intermedio para clínicas pequeñas.', 30),
('Pro', 10, 5, 'Plan avanzado para clínicas grandes.', 30),
('Pro+', 999, 999, 'Plan ilimitado para redes de consultorios.', 30)
ON CONFLICT (nombre) DO UPDATE SET 
  max_dentistas = EXCLUDED.max_dentistas,
  max_recepcionistas = EXCLUDED.max_recepcionistas,
  default_period_days = EXCLUDED.default_period_days;

COMMIT;
