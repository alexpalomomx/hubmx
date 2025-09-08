-- Update RLS policies to allow anonymous users to submit community and alliance requests

-- Update communities table policy
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
DROP POLICY IF EXISTS "Admins and coordinators can manage communities" ON public.communities;

CREATE POLICY "Communities are viewable by everyone" 
ON public.communities 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and coordinators can manage communities" 
ON public.communities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Anyone can submit community requests" 
ON public.communities 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Update alliances table policy to also allow anonymous users
DROP POLICY IF EXISTS "Authenticated users can submit alliances for approval" ON public.alliances;

CREATE POLICY "Anyone can submit alliance requests" 
ON public.alliances 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);