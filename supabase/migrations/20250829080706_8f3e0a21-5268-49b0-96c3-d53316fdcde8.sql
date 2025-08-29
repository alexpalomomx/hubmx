-- Arreglar search_path en las funciones de gamificación para mejorar la seguridad

-- Función para otorgar puntos (con search_path seguro)
CREATE OR REPLACE FUNCTION public.award_points(
  _user_id UUID,
  _points INTEGER,
  _action_type TEXT,
  _description TEXT DEFAULT NULL
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Insertar o actualizar puntos del usuario
  INSERT INTO public.user_points (user_id, total_points, community_joins, event_registrations)
  VALUES (
    _user_id, 
    _points,
    CASE WHEN _action_type = 'community_join' THEN 1 ELSE 0 END,
    CASE WHEN _action_type = 'event_registration' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + _points,
    community_joins = user_points.community_joins + (CASE WHEN _action_type = 'community_join' THEN 1 ELSE 0 END),
    event_registrations = user_points.event_registrations + (CASE WHEN _action_type = 'event_registration' THEN 1 ELSE 0 END),
    updated_at = now();
  
  -- Registrar en historial
  INSERT INTO public.points_history (user_id, points_awarded, action_type, description)
  VALUES (_user_id, _points, _action_type, _description);
END;
$$;

-- Trigger para otorgar puntos por unirse a una comunidad (con search_path seguro)
CREATE OR REPLACE FUNCTION public.handle_community_join() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    -- Otorgar 10 puntos por unirse a una comunidad
    PERFORM public.award_points(
      NEW.user_id,
      10,
      'community_join',
      'Unirse a la comunidad'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para otorgar puntos por registrarse en eventos (con search_path seguro)
CREATE OR REPLACE FUNCTION public.handle_event_registration() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Otorgar 5 puntos por registrarse en un evento
  PERFORM public.award_points(
    (SELECT user_id FROM public.profiles WHERE display_name = NEW.nickname LIMIT 1),
    5,
    'event_registration',
    'Registrarse en evento'
  );
  RETURN NEW;
END;
$$;