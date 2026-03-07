
-- Add assigned_leader_id column to event_sources
ALTER TABLE public.event_sources 
ADD COLUMN assigned_leader_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS: Community leaders can view sources assigned to them
DROP POLICY IF EXISTS "Community leaders can view their community sources" ON public.event_sources;

CREATE POLICY "Community leaders can view assigned sources"
ON public.event_sources
FOR SELECT
USING (
  has_role(auth.uid(), 'community_leader'::app_role) 
  AND (
    assigned_leader_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_leaders cl
      WHERE cl.user_id = auth.uid() 
      AND cl.community_id = event_sources.community_id 
      AND cl.status = 'active'
    )
  )
);
