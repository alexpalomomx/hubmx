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