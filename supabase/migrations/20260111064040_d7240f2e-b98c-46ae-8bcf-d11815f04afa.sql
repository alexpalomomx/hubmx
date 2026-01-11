-- Create table for event sources (Meetup, Luma, ICS feeds)
CREATE TABLE public.event_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('meetup', 'luma', 'ics')),
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,
  events_imported INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_sources ENABLE ROW LEVEL SECURITY;

-- Only admins and coordinators can manage event sources
CREATE POLICY "Admins and coordinators can manage event sources"
  ON public.event_sources
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

-- Event sources are viewable by admins and coordinators
CREATE POLICY "Event sources viewable by admins and coordinators"
  ON public.event_sources
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_event_sources_updated_at
  BEFORE UPDATE ON public.event_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();