  -- 20260505150000_fix_signup_trigger.sql

  BEGIN;

  -- 1. Asegurar que los roles existan (por si acaso)
  INSERT INTO roles (nombre, descripcion) VALUES 
  ('ADMIN_GLOBAL', 'Administrador del sistema'),
  ('ORTODONCISTA', 'Profesional dental'),
  ('RECEPCIONISTA', 'Personal administrativo')
  ON CONFLICT (nombre) DO NOTHING;

  -- 2. Hacer que handle_new_user sea más resiliente
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  DECLARE
    v_role_id UUID;
  BEGIN
    -- Intentamos buscar el rol RECEPCIONISTA
    SELECT id INTO v_role_id FROM public.roles WHERE nombre = 'RECEPCIONISTA' LIMIT 1;
    
    -- Si no existe, no explotamos (evita Error 500 en Auth)
    IF v_role_id IS NULL THEN
      -- Opcional: Podríamos loguear esto o simplemente retornar
      RETURN NEW;
    END IF;

    -- Insertamos el perfil. clinica_id queda como NULL hasta que completen el registro
    INSERT INTO public.perfiles (id, email, rol_id)
    VALUES (NEW.id, NEW.email, v_role_id)
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- 3. Ajustar la validación de límites para ignorar perfiles sin clínica (proceso de registro)
  CREATE OR REPLACE FUNCTION check_member_limits()
  RETURNS trigger AS $$
  DECLARE
    v_count INTEGER;
    v_role_name TEXT;
    v_max_dentistas INTEGER;
    v_max_recepcionistas INTEGER;
  BEGIN
    -- Si no hay clinica_id, es un usuario en proceso de registro o invitación incompleta. 
    -- No validamos límites aún.
    IF NEW.clinica_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- 1. Obtenemos el nombre del rol que se está asignando
    SELECT nombre INTO v_role_name FROM roles WHERE id = NEW.rol_id;
    
    -- Solo aplicamos límites a ORTODONCISTA y RECEPCIONISTA
    IF v_role_name NOT IN ('ORTODONCISTA', 'RECEPCIONISTA') THEN
      RETURN NEW;
    END IF;

    -- 2. Obtenemos los límites de la licencia de la clínica
    SELECT l.max_dentistas, l.max_recepcionistas 
    INTO v_max_dentistas, v_max_recepcionistas
    FROM licencias l
    JOIN clinicas c ON c.licencia_id = l.id
    WHERE c.id = NEW.clinica_id;

    -- Si no encontramos límites, usamos Básica por defecto
    IF v_max_dentistas IS NULL THEN
      v_max_dentistas := 1;
      v_max_recepcionistas := 1;
    END IF;
    
    -- 3. Validamos según el rol
    IF v_role_name = 'ORTODONCISTA' THEN
      SELECT count(*) INTO v_count FROM perfiles 
      WHERE clinica_id = NEW.clinica_id 
        AND rol_id = NEW.rol_id 
        AND id != NEW.id;
      
      IF v_count >= v_max_dentistas THEN
        RAISE EXCEPTION 'Límite de Odontólogos alcanzado (%): Tu licencia actual no permite más.', v_max_dentistas;
      END IF;
      
    ELSIF v_role_name = 'RECEPCIONISTA' THEN
      SELECT count(*) INTO v_count FROM perfiles 
      WHERE clinica_id = NEW.clinica_id 
        AND rol_id = NEW.rol_id 
        AND id != NEW.id;
      
      IF v_count >= v_max_recepcionistas THEN
        RAISE EXCEPTION 'Límite de Recepcionistas alcanzado (%): Tu licencia actual no permite más.', v_max_recepcionistas;
      END IF;
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  COMMIT;
