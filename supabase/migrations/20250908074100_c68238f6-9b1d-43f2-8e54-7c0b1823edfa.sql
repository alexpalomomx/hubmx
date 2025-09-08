-- Update RLS policy to allow any authenticated user to submit alliance requests
DROP POLICY IF EXISTS "Collaborators can submit alliances for approval" ON public.alliances;

CREATE POLICY "Authenticated users can submit alliances for approval" 
ON public.alliances 
FOR INSERT 
TO authenticated
WITH CHECK (submitted_by = auth.uid());