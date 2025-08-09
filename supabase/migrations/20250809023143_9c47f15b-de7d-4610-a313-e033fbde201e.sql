-- 1) Add full_name to community_members
ALTER TABLE public.community_members
ADD COLUMN IF NOT EXISTS full_name text;

-- 2) Harden functions: set immutable search_path
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT email
  FROM auth.users
  WHERE id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;