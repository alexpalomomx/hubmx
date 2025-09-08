-- Add phone field to communities and alliances tables
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.alliances ADD COLUMN IF NOT EXISTS contact_phone TEXT;