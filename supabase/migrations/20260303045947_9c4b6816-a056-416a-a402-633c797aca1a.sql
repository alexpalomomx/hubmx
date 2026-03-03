
-- Fix: Change events SELECT policy to PERMISSIVE so public users can see approved events
DROP POLICY IF EXISTS "Approved events are viewable by everyone" ON public.events;

CREATE POLICY "Approved events are viewable by everyone"
ON public.events
FOR SELECT
USING (
  (approval_status = 'approved')
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'coordinator'::app_role)
  OR (submitted_by = auth.uid())
);

-- Also fix event_sources so the source filter works for public users
DROP POLICY IF EXISTS "Authenticated users can view active event sources" ON public.event_sources;

CREATE POLICY "Active event sources are viewable by everyone"
ON public.event_sources
FOR SELECT
USING (
  is_active = true
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'coordinator'::app_role)
);
