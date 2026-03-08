-- Add country and state columns to communities
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS country text DEFAULT 'México';
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS state text;

-- Add country and state columns to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS state text;