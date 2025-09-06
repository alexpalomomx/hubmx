-- Fix RLS to allow INSERTs for admins/coordinators and community leaders
-- Add WITH CHECK to existing policies so inserts are permitted when conditions are met

-- 1) Admins and coordinators full manage access should include WITH CHECK
ALTER POLICY "Admins and coordinators can manage events"
ON public.events
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role)
);

-- 2) Community leaders manage their community events: add WITH CHECK mirroring USING
ALTER POLICY "Community leaders can manage their community events"
ON public.events
USING (
  has_role(auth.uid(), 'community_leader'::app_role) AND (
    EXISTS (
      SELECT 1 FROM public.community_leaders cl
      WHERE (
        (cl.user_id = auth.uid()) 
        AND (cl.status = 'active'::text) 
        AND ((events.organizer_id = cl.community_id) OR (events.submitted_by = auth.uid()))
      )
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'community_leader'::app_role) AND (
    EXISTS (
      SELECT 1 FROM public.community_leaders cl
      WHERE (
        (cl.user_id = auth.uid()) 
        AND (cl.status = 'active'::text) 
        AND ((events.organizer_id = cl.community_id) OR (events.submitted_by = auth.uid()))
      )
    )
  )
);
