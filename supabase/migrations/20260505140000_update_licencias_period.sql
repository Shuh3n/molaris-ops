-- 20260505140000_update_licencias_period.sql
-- Agrega el periodo por defecto para cada licencia para gestionar vencimientos dinámicos.

BEGIN;

ALTER TABLE licencias ADD COLUMN IF NOT EXISTS default_period_days INTEGER DEFAULT 30;

-- Actualizar periodos por defecto
UPDATE licencias SET default_period_days = 30 WHERE nombre = 'Básica';
UPDATE licencias SET default_period_days = 30 WHERE nombre = 'Estándar';
UPDATE licencias SET default_period_days = 365 WHERE nombre = 'Pro';
UPDATE licencias SET default_period_days = 365 WHERE nombre = 'Pro+';

-- Asegurar que las clínicas tengan una fecha de vencimiento si no la tienen
UPDATE clinicas 
SET fecha_vencimiento = NOW() + (INTERVAL '1 day' * l.default_period_days)
FROM licencias l
WHERE clinicas.licencia_id = l.id 
  AND clinicas.fecha_vencimiento IS NULL;

COMMIT;
