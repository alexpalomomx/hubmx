-- Relax community leader INSERT policy to allow creating events if they are the submitter,
-- even when they don't yet have an assignment in community_leaders.

ALTER POLICY "Community leaders can manage their community events"
ON public.events
USING (
  has_role(auth.uid(), 'community_leader'::app_role) AND (
    (events.submitted_by = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.community_leaders cl
      WHERE cl.user_id = auth.uid()
        AND cl.status = 'active'
        AND events.organizer_id = cl.community_id
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'community_leader'::app_role) AND (
    (events.submitted_by = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.community_leaders cl
      WHERE cl.user_id = auth.uid()
        AND cl.status = 'active'
        AND events.organizer_id = cl.community_id
    )
  )
);
