-- 20260507000200_attach_member_limits_trigger.sql

BEGIN;

-- Asegurarnos de que el trigger esté vinculado a la tabla perfiles
DROP TRIGGER IF EXISTS trigger_check_member_limits ON perfiles;
CREATE TRIGGER trigger_check_member_limits
BEFORE INSERT OR UPDATE ON perfiles
FOR EACH ROW EXECUTE FUNCTION check_member_limits();

COMMIT;
