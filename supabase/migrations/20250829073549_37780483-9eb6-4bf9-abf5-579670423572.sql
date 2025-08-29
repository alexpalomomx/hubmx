-- Add user linkage to community_members for user dashboards
ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS user_id uuid NULL,
  ADD COLUMN IF NOT EXISTS email text NULL;

-- Optional simple indexes for lookups
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_email ON public.community_members(email);
