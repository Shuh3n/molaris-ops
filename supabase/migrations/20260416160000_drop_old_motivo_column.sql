-- Eliminar la columna de texto 'motivo' de la tabla 'citas'
-- Primero nos aseguramos de que no haya dependencias (aunque no debería)
ALTER TABLE citas DROP COLUMN IF EXISTS motivo;
