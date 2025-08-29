-- Complete RLS policies for alliances, calls, and blog_posts
-- Similar policies for alliances
DROP POLICY IF EXISTS "Admins can manage alliances" ON public.alliances;
CREATE POLICY "Admins can manage alliances" 
ON public.alliances 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Collaborators can submit alliances for approval" 
ON public.alliances 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid());

CREATE POLICY "Collaborators can update their pending alliances" 
ON public.alliances 
FOR UPDATE 
USING (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid() AND approval_status = 'pending');

DROP POLICY IF EXISTS "Alliances are viewable by everyone" ON public.alliances;
CREATE POLICY "Approved alliances are viewable by everyone" 
ON public.alliances 
FOR SELECT 
USING (approval_status = 'approved' OR has_role(auth.uid(), 'admin'::app_role) OR submitted_by = auth.uid());

-- Similar policies for calls
DROP POLICY IF EXISTS "Admins and coordinators can manage calls" ON public.calls;
CREATE POLICY "Admins and coordinators can manage calls" 
ON public.calls 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Collaborators can submit calls for approval" 
ON public.calls 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid());

CREATE POLICY "Collaborators can update their pending calls" 
ON public.calls 
FOR UPDATE 
USING (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid() AND approval_status = 'pending');

DROP POLICY IF EXISTS "Calls are viewable by everyone" ON public.calls;
CREATE POLICY "Approved calls are viewable by everyone" 
ON public.calls 
FOR SELECT 
USING (approval_status = 'approved' OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role) OR submitted_by = auth.uid());

-- Similar policies for blog_posts
DROP POLICY IF EXISTS "Admins and coordinators can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins and coordinators can manage blog posts" 
ON public.blog_posts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Collaborators can submit blog posts for approval" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid());

CREATE POLICY "Collaborators can update their pending blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (has_role(auth.uid(), 'collaborator'::app_role) AND submitted_by = auth.uid() AND approval_status = 'pending');

DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;
CREATE POLICY "Published and approved blog posts are viewable by everyone" 
ON public.blog_posts 
FOR SELECT 
USING ((status = 'published' AND approval_status = 'approved') OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role) OR submitted_by = auth.uid());

-- Create helper function to check if user is community leader of specific community
CREATE OR REPLACE FUNCTION public.is_community_leader(_user_id UUID, _community_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_leaders
    WHERE user_id = _user_id 
    AND community_id = _community_id 
    AND status = 'active'
  );
$$;