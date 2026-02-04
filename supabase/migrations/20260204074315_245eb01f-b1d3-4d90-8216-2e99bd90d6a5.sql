-- Add foreign key from event_interests.user_id to profiles.user_id
ALTER TABLE public.event_interests
ADD CONSTRAINT event_interests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;