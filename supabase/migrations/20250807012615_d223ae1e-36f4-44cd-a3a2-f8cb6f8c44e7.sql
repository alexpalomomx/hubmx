-- Create table for community members
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  phone TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Community members are viewable by everyone" 
ON public.community_members 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can join communities" 
ON public.community_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins and coordinators can manage members" 
ON public.community_members 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

-- Create trigger for timestamps
CREATE TRIGGER update_community_members_updated_at
BEFORE UPDATE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update community member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET members_count = (
      SELECT COUNT(*) 
      FROM public.community_members 
      WHERE community_id = NEW.community_id AND status = 'active'
    )
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.communities 
    SET members_count = (
      SELECT COUNT(*) 
      FROM public.community_members 
      WHERE community_id = NEW.community_id AND status = 'active'
    )
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET members_count = (
      SELECT COUNT(*) 
      FROM public.community_members 
      WHERE community_id = OLD.community_id AND status = 'active'
    )
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update member count
CREATE TRIGGER trigger_update_community_member_count
AFTER INSERT OR UPDATE OR DELETE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.update_community_member_count();