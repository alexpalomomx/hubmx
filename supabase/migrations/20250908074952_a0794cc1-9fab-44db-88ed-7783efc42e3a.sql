-- Add policy to allow admins to see pending alliance submissions
CREATE POLICY "Admins can view pending alliances" 
ON public.alliances 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'coordinator'::app_role)
  OR (approval_status = 'approved' AND status = 'active')
);

-- Add policy to allow admins to see pending community submissions
CREATE POLICY "Admins can view pending communities" 
ON public.communities 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'coordinator'::app_role)
  OR (status = 'active')
);