-- Add new roles to the enum
ALTER TYPE public.app_role ADD VALUE 'community_leader';
ALTER TYPE public.app_role ADD VALUE 'collaborator';

-- Create table to map community leaders to their communities
CREATE TABLE public.community_leaders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE(user_id, community_id)
);

-- Enable RLS on community_leaders
ALTER TABLE public.community_leaders ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_leaders
CREATE POLICY "Admins can manage community leaders" 
ON public.community_leaders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Community leaders can view their assignments" 
ON public.community_leaders 
FOR SELECT 
USING (has_role(auth.uid(), 'community_leader'::app_role) AND user_id = auth.uid());

-- Add approval fields to events table
ALTER TABLE public.events ADD COLUMN approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.events ADD COLUMN submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE public.events ADD COLUMN approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.events ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.events ADD COLUMN rejection_reason TEXT;

-- Add approval fields to alliances table
ALTER TABLE public.alliances ADD COLUMN approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.alliances ADD COLUMN submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE public.alliances ADD COLUMN approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.alliances ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.alliances ADD COLUMN rejection_reason TEXT;

-- Add approval fields to calls table
ALTER TABLE public.calls ADD COLUMN approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.calls ADD COLUMN submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE public.calls ADD COLUMN approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.calls ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.calls ADD COLUMN rejection_reason TEXT;

-- Add approval fields to blog_posts table
ALTER TABLE public.blog_posts ADD COLUMN approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.blog_posts ADD COLUMN submitted_by UUID REFERENCES auth.users(id);
ALTER TABLE public.blog_posts ADD COLUMN approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.blog_posts ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.blog_posts ADD COLUMN rejection_reason TEXT;

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