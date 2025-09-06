-- Create networking tables for connections, skills, mentorship, and interests

-- Create connection status enum
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked', 'cancelled');

-- Create mentorship status enum  
CREATE TYPE mentorship_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- Table: user_connections - Manage connections between users
CREATE TABLE public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, requested_id),
  CHECK (requester_id != requested_id)
);

-- Table: user_skills - Skills and expertise of users
CREATE TABLE public.user_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  is_offering_mentorship BOOLEAN DEFAULT false,
  is_seeking_mentorship BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- Table: user_interests - User interests for matching
CREATE TABLE public.user_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, interest_name)
);

-- Table: mentorship_requests - Mentorship requests between users
CREATE TABLE public.mentorship_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_area TEXT NOT NULL,
  status mentorship_status NOT NULL DEFAULT 'pending',
  message TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (mentor_id != mentee_id)
);

-- Table: user_networking_profile - Extended networking profile
CREATE TABLE public.user_networking_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_available_for_mentoring BOOLEAN DEFAULT false,
  is_seeking_mentorship BOOLEAN DEFAULT false,
  networking_bio TEXT,
  location TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  available_for_connections BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all networking tables
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_networking_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_connections
CREATE POLICY "Users can view connections they're part of" ON public.user_connections
FOR SELECT USING (
  auth.uid() = requester_id OR 
  auth.uid() = requested_id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'coordinator'::app_role)
);

CREATE POLICY "Users can create connection requests" ON public.user_connections
FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connection requests" ON public.user_connections
FOR UPDATE USING (
  auth.uid() = requester_id OR 
  auth.uid() = requested_id OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage all connections" ON public.user_connections
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_skills
CREATE POLICY "Skills are viewable by everyone" ON public.user_skills
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own skills" ON public.user_skills
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all skills" ON public.user_skills
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_interests
CREATE POLICY "Interests are viewable by everyone" ON public.user_interests
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own interests" ON public.user_interests
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all interests" ON public.user_interests
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for mentorship_requests
CREATE POLICY "Users can view mentorship requests they're part of" ON public.mentorship_requests
FOR SELECT USING (
  auth.uid() = mentor_id OR 
  auth.uid() = mentee_id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'coordinator'::app_role)
);

CREATE POLICY "Users can create mentorship requests" ON public.mentorship_requests
FOR INSERT WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Users can update mentorship requests they're part of" ON public.mentorship_requests
FOR UPDATE USING (
  auth.uid() = mentor_id OR 
  auth.uid() = mentee_id OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage all mentorship requests" ON public.mentorship_requests
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_networking_profile
CREATE POLICY "Networking profiles are viewable by everyone" ON public.user_networking_profile
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own networking profile" ON public.user_networking_profile
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all networking profiles" ON public.user_networking_profile
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON public.user_skills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_requests_updated_at
  BEFORE UPDATE ON public.mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_networking_profile_updated_at
  BEFORE UPDATE ON public.user_networking_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update award_points function to include networking activities
CREATE OR REPLACE FUNCTION public.award_points(_user_id uuid, _points integer, _action_type text, _description text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert or update user points
  INSERT INTO public.user_points (user_id, total_points, community_joins, event_registrations)
  VALUES (
    _user_id, 
    _points,
    CASE WHEN _action_type = 'community_join' THEN 1 ELSE 0 END,
    CASE WHEN _action_type = 'event_registration' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + _points,
    community_joins = user_points.community_joins + (CASE WHEN _action_type = 'community_join' THEN 1 ELSE 0 END),
    event_registrations = user_points.event_registrations + (CASE WHEN _action_type = 'event_registration' THEN 1 ELSE 0 END),
    updated_at = now();
  
  -- Record in history
  INSERT INTO public.points_history (user_id, points_awarded, action_type, description)
  VALUES (_user_id, _points, _action_type, _description);
END;
$$;

-- Trigger for networking profile completion points
CREATE OR REPLACE FUNCTION public.handle_networking_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Award points for completing networking profile
  IF NEW.networking_bio IS NOT NULL AND NEW.location IS NOT NULL AND 
     (OLD IS NULL OR OLD.networking_bio IS NULL OR OLD.location IS NULL) THEN
    PERFORM public.award_points(
      NEW.user_id,
      10,
      'networking_profile_completion',
      'Completar perfil de networking'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_networking_profile_completion_trigger
  AFTER INSERT OR UPDATE ON public.user_networking_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_networking_profile_completion();

-- Trigger for first connection points
CREATE OR REPLACE FUNCTION public.handle_first_connection()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Award points for first accepted connection
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    -- Award points to both users if it's their first connection
    IF NOT EXISTS (
      SELECT 1 FROM public.user_connections 
      WHERE ((requester_id = NEW.requester_id OR requested_id = NEW.requester_id) 
             AND status = 'accepted' AND id != NEW.id)
    ) THEN
      PERFORM public.award_points(
        NEW.requester_id,
        5,
        'first_connection',
        'Primera conexión establecida'
      );
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM public.user_connections 
      WHERE ((requester_id = NEW.requested_id OR requested_id = NEW.requested_id) 
             AND status = 'accepted' AND id != NEW.id)
    ) THEN
      PERFORM public.award_points(
        NEW.requested_id,
        5,
        'first_connection',
        'Primera conexión establecida'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_first_connection_trigger
  AFTER INSERT OR UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_connection();

-- Trigger for completed mentorship points
CREATE OR REPLACE FUNCTION public.handle_mentorship_completion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Award points for completed mentorship
  IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
    -- Award points to mentor
    PERFORM public.award_points(
      NEW.mentor_id,
      20,
      'mentorship_completed_mentor',
      'Mentoría completada como mentor'
    );
    
    -- Award points to mentee
    PERFORM public.award_points(
      NEW.mentee_id,
      10,
      'mentorship_completed_mentee',
      'Mentoría completada como mentee'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER handle_mentorship_completion_trigger
  AFTER INSERT OR UPDATE ON public.mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_mentorship_completion();