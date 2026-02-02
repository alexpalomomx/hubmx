-- Crear tabla para registrar interés en eventos
CREATE TABLE public.event_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Habilitar RLS
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own event interests"
ON public.event_interests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own event interests"
ON public.event_interests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event interests"
ON public.event_interests
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all event interests"
ON public.event_interests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Función trigger para gamificación
CREATE OR REPLACE FUNCTION public.handle_event_interest()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.award_points(
    NEW.user_id,
    5,
    'event_interest',
    'Interés en evento'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para otorgar puntos al registrar interés
CREATE TRIGGER on_event_interest_created
AFTER INSERT ON public.event_interests
FOR EACH ROW
EXECUTE FUNCTION public.handle_event_interest();