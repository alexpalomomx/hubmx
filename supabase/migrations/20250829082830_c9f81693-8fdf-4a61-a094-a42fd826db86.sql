-- Agregar foreign key y unique constraint para user_points
ALTER TABLE public.user_points 
ADD CONSTRAINT fk_user_points_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Agregar unique constraint para evitar duplicados
ALTER TABLE public.user_points 
ADD CONSTRAINT unique_user_points_user_id 
UNIQUE (user_id);

-- Crear índice para mejorar performance de joins
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);

-- Crear función auxiliar para obtener email de usuario (necesaria para sync)
CREATE OR REPLACE FUNCTION public.get_user_email_by_profile(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email
  FROM auth.users
  WHERE id = _user_id
$$;