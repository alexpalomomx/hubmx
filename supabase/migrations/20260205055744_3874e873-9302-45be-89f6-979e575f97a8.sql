-- Tabla para solicitudes de registro de líder de comunidad
CREATE TABLE public.leader_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leader_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  description text,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_by uuid,
  approved_by uuid,
  approved_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leader_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a leader registration
CREATE POLICY "Anyone can submit leader registrations" 
ON public.leader_registrations 
FOR INSERT 
WITH CHECK (true);

-- Admins and coordinators can view all registrations
CREATE POLICY "Admins can view all leader registrations" 
ON public.leader_registrations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

-- Admins and coordinators can manage registrations
CREATE POLICY "Admins can manage leader registrations" 
ON public.leader_registrations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_leader_registrations_updated_at
BEFORE UPDATE ON public.leader_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();