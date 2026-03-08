
-- Drop the old community-based policy for leaders viewing event_interests
DROP POLICY IF EXISTS "Community leaders can view interests for their community events" ON public.event_interests;

-- Create new policy that checks assigned_leader_id on event_sources
CREATE POLICY "Community leaders can view interests for their assigned source events"
ON public.event_interests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'community_leader'::app_role)
  AND EXISTS (
    SELECT 1
    FROM events e
    JOIN event_sources es ON e.source_id = es.id
    WHERE e.id = event_interests.event_id
    AND es.assigned_leader_id = auth.uid()
  )
);
