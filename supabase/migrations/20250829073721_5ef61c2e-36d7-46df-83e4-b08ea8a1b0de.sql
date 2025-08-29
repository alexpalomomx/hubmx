-- Add phone field to user profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text NULL;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);