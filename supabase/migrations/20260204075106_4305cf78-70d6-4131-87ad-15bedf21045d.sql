-- Create table for user calendar subscription preferences
CREATE TABLE public.user_calendar_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  selected_sources uuid[] DEFAULT '{}',
  include_all_sources boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_calendar_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_calendar_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_calendar_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_calendar_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
ON public.user_calendar_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- Add source_id to events table to track which external source imported the event
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.event_sources(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_events_source_id ON public.events(source_id);

-- Update RLS for event_sources to allow SELECT for authenticated users
CREATE POLICY "Authenticated users can view active event sources" 
ON public.event_sources FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));