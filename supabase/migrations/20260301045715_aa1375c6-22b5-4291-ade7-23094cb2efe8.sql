
-- Add community_id column to event_sources so admins can assign sources to communities
ALTER TABLE public.event_sources ADD COLUMN community_id uuid REFERENCES public.communities(id);

-- Create index for performance
CREATE INDEX idx_event_sources_community_id ON public.event_sources(community_id);

-- Allow community leaders to view event sources assigned to their community
CREATE POLICY "Community leaders can view their community sources"
ON public.event_sources
FOR SELECT
USING (
  has_role(auth.uid(), 'community_leader'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.community_leaders cl 
    WHERE cl.user_id = auth.uid() 
    AND cl.community_id = event_sources.community_id 
    AND cl.status = 'active'
  )
);

-- Allow community leaders to view event interests for events from their community sources
CREATE POLICY "Community leaders can view interests for their community events"
ON public.event_interests
FOR SELECT
USING (
  has_role(auth.uid(), 'community_leader'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.event_sources es ON e.source_id = es.id
    JOIN public.community_leaders cl ON cl.community_id = es.community_id
    WHERE e.id = event_interests.event_id
    AND cl.user_id = auth.uid()
    AND cl.status = 'active'
  )
);
