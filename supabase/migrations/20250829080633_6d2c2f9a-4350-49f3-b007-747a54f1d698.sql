-- Crear tabla para puntos de usuarios
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  community_joins INTEGER NOT NULL DEFAULT 0,
  event_registrations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Crear tabla para historial de puntos
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points_awarded INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_points
CREATE POLICY "User points are viewable by everyone"
ON public.user_points FOR SELECT
USING (true);

CREATE POLICY "Admins can manage user points"
ON public.user_points FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para points_history
CREATE POLICY "Points history viewable by everyone"
ON public.points_history FOR SELECT
USING (true);

CREATE POLICY "Admins can manage points history"
ON public.points_history FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Función para otorgar puntos
CREATE OR REPLACE FUNCTION public.award_points(
  _user_id UUID,
  _points INTEGER,
  _action_type TEXT,
  _description TEXT DEFAULT NULL
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para otorgar puntos por unirse a una comunidad
CREATE OR REPLACE FUNCTION public.handle_community_join() 
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_points_community_join
AFTER INSERT OR UPDATE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_community_join();

-- Trigger para otorgar puntos por registrarse en eventos
CREATE OR REPLACE FUNCTION public.handle_event_registration() 
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_points_event_registration
AFTER INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_event_registration();

-- Trigger para updated_at en user_points
CREATE TRIGGER update_user_points_updated_at
BEFORE UPDATE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();