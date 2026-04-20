ALTER TABLE motivos_consulta ADD COLUMN IF NOT EXISTS costo_base NUMERIC DEFAULT 0;
UPDATE motivos_consulta SET costo_base = 500 WHERE nombre = 'Limpieza Dental';
UPDATE motivos_consulta SET costo_base = 800 WHERE nombre = 'Ortodoncia (Control)';
UPDATE motivos_consulta SET costo_base = 1200 WHERE nombre = 'Extracción';
UPDATE motivos_consulta SET costo_base = 2000 WHERE nombre = 'Blanqueamiento';
UPDATE motivos_consulta SET costo_base = 600 WHERE nombre = 'Urgencia';
UPDATE motivos_consulta SET costo_base = 400 WHERE nombre = 'Consulta General';
