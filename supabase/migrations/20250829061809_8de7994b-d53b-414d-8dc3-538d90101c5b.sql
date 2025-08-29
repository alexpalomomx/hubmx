-- Update existing RLS policies for events to consider approval status and community leaders
DROP POLICY IF EXISTS "Admins and coordinators can manage events" ON public.events;
CREATE POLICY "Admins and coordinators can manage events" 
ON public.events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Community leaders can manage their community events" 
ON public.events 
FOR ALL 
USING (
  has_role(auth.uid(), 'community_leader'::app_role) AND 
  EXISTS (
    SELECT 1 FROM public.community_leaders cl 
    WHERE cl.user_id = auth.uid() AND cl.status = 'active'
    AND (organizer_id = cl.community_id OR submitted_by = auth.uid())
  )
);

CREATE POLICY "Collaborators can submit events for approval" 
ON public.events 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid());

CREATE POLICY "Collaborators can update their pending events" 
ON public.events 
FOR UPDATE 
USING (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid() AND approval_status = 'pending');

-- Update events view policy to only show approved events to public
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Approved events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (approval_status = 'approved' OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role) OR submitted_by = auth.uid());