
-- 1. Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_email text NOT NULL,
  referred_user_id uuid,
  referral_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  points_awarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Authenticated users can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can manage referrals" ON public.referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 2. Add content_shares counter to user_points
ALTER TABLE public.user_points 
  ADD COLUMN IF NOT EXISTS content_shares integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referrals integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS blog_posts integer NOT NULL DEFAULT 0;

-- 3. Update award_points function to handle new action types
CREATE OR REPLACE FUNCTION public.award_points(_user_id uuid, _points integer, _action_type text, _description text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_points (user_id, total_points, community_joins, event_registrations, content_shares, referrals, blog_posts)
  VALUES (
    _user_id, 
    _points,
    CASE WHEN _action_type = 'community_join' THEN 1 ELSE 0 END,
    CASE WHEN _action_type IN ('event_registration', 'event_interest') THEN 1 ELSE 0 END,
    CASE WHEN _action_type = 'content_share' THEN 1 ELSE 0 END,
    CASE WHEN _action_type = 'referral' THEN 1 ELSE 0 END,
    CASE WHEN _action_type = 'blog_post_approved' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + _points,
    community_joins = user_points.community_joins + (CASE WHEN _action_type = 'community_join' THEN 1 ELSE 0 END),
    event_registrations = user_points.event_registrations + (CASE WHEN _action_type IN ('event_registration', 'event_interest') THEN 1 ELSE 0 END),
    content_shares = user_points.content_shares + (CASE WHEN _action_type = 'content_share' THEN 1 ELSE 0 END),
    referrals = user_points.referrals + (CASE WHEN _action_type = 'referral' THEN 1 ELSE 0 END),
    blog_posts = user_points.blog_posts + (CASE WHEN _action_type = 'blog_post_approved' THEN 1 ELSE 0 END),
    updated_at = now();
  
  INSERT INTO public.points_history (user_id, points_awarded, action_type, description)
  VALUES (_user_id, _points, _action_type, _description);
END;
$$;

-- 4. Create trigger for blog post approval (20 pts)
CREATE OR REPLACE FUNCTION public.handle_blog_post_approved()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND NEW.status = 'published' 
     AND (OLD IS NULL OR OLD.approval_status != 'approved') 
     AND NEW.author_id IS NOT NULL THEN
    PERFORM public.award_points(
      NEW.author_id,
      20,
      'blog_post_approved',
      'Blog post aprobado y publicado'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_blog_post_approved
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_blog_post_approved();

-- 5. Create trigger for referral completion (10 pts)
CREATE OR REPLACE FUNCTION public.handle_referral_completion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- When a new user signs up, check if they were referred
  -- Match by email in referrals table
  UPDATE public.referrals
  SET referred_user_id = NEW.id,
      status = 'completed',
      completed_at = now()
  WHERE referred_email = NEW.email
    AND status = 'pending';

  -- Award points to referrer
  IF FOUND THEN
    PERFORM public.award_points(
      (SELECT referrer_id FROM public.referrals WHERE referred_user_id = NEW.id LIMIT 1),
      10,
      'referral',
      'Usuario referido se registró'
    );
    
    UPDATE public.referrals SET points_awarded = true WHERE referred_user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Attach existing triggers that are missing
CREATE TRIGGER on_community_member_join
  AFTER INSERT OR UPDATE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_community_join();

CREATE TRIGGER on_event_interest
  AFTER INSERT ON public.event_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_event_interest();

CREATE TRIGGER on_event_registration
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_event_registration();

CREATE TRIGGER on_networking_profile_update
  AFTER INSERT OR UPDATE ON public.user_networking_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_networking_profile_completion();

CREATE TRIGGER on_connection_accepted
  AFTER UPDATE ON public.user_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_connection();

CREATE TRIGGER on_mentorship_completed
  AFTER UPDATE ON public.mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_mentorship_completion();

CREATE TRIGGER on_community_member_count
  AFTER INSERT OR UPDATE OR DELETE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_member_count();
