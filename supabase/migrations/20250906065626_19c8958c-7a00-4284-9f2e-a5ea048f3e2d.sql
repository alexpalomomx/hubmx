-- Update RLS policies to allow users to insert their networking data

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can manage their own networking profile" ON user_networking_profile;
DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can manage their own interests" ON user_interests;

-- Create more permissive policies for user_networking_profile
CREATE POLICY "Users can create their networking profile" 
ON public.user_networking_profile 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all networking profiles" 
ON public.user_networking_profile 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own networking profile" 
ON public.user_networking_profile 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_skills
CREATE POLICY "Users can create their skills" 
ON public.user_skills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all skills" 
ON public.user_skills 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own skills" 
ON public.user_skills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" 
ON public.user_skills 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for user_interests
CREATE POLICY "Users can create their interests" 
ON public.user_interests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all interests" 
ON public.user_interests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own interests" 
ON public.user_interests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests" 
ON public.user_interests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Insert some sample networking profiles for existing users
INSERT INTO user_networking_profile (
  user_id, 
  networking_bio, 
  location, 
  available_for_connections,
  is_available_for_mentoring,
  is_seeking_mentorship
) VALUES 
(
  'ab0af45c-31ab-4252-9b0e-b7e1e2dd3111', 
  'Desarrollador full-stack apasionado por la tecnología y el aprendizaje continuo', 
  'Ciudad de México', 
  true, 
  true,
  false
),
(
  '586224e9-acc9-4e5a-8b43-3f814092fa8f', 
  'Especialista en ciberseguridad, hacking ético y pentesting', 
  'Guadalajara', 
  true, 
  false,
  true
),
(
  '94852b57-6c9a-4047-872a-872790de2628', 
  'Gestor de comunidades tecnológicas y eventos', 
  'Ciudad de México', 
  true, 
  true,
  false
)
ON CONFLICT (user_id) DO UPDATE SET
  networking_bio = EXCLUDED.networking_bio,
  location = EXCLUDED.location,
  available_for_connections = EXCLUDED.available_for_connections,
  is_available_for_mentoring = EXCLUDED.is_available_for_mentoring,
  is_seeking_mentorship = EXCLUDED.is_seeking_mentorship;

-- Insert some sample skills
INSERT INTO user_skills (user_id, skill_name, proficiency_level, is_offering_mentorship, is_seeking_mentorship) VALUES 
('ab0af45c-31ab-4252-9b0e-b7e1e2dd3111', 'React', 4, true, false),
('ab0af45c-31ab-4252-9b0e-b7e1e2dd3111', 'TypeScript', 4, true, false),
('ab0af45c-31ab-4252-9b0e-b7e1e2dd3111', 'Node.js', 3, false, false),
('586224e9-acc9-4e5a-8b43-3f814092fa8f', 'Cybersecurity', 5, false, false),
('586224e9-acc9-4e5a-8b43-3f814092fa8f', 'Penetration Testing', 4, false, false),
('586224e9-acc9-4e5a-8b43-3f814092fa8f', 'Network Security', 4, false, false),
('94852b57-6c9a-4047-872a-872790de2628', 'Community Management', 5, true, false),
('94852b57-6c9a-4047-872a-872790de2628', 'Event Planning', 4, true, false)
ON CONFLICT (user_id, skill_name) DO UPDATE SET
  proficiency_level = EXCLUDED.proficiency_level,
  is_offering_mentorship = EXCLUDED.is_offering_mentorship,
  is_seeking_mentorship = EXCLUDED.is_seeking_mentorship;

-- Insert some sample interests
INSERT INTO user_interests (user_id, interest_name) VALUES 
('ab0af45c-31ab-4252-9b0e-b7e1e2dd3111', 'Desarrollo Web'),
('ab0af45c-31ab-4252-9b0e-b7e1e2dd3111', 'Inteligencia Artificial'),
('586224e9-acc9-4e5a-8b43-3f814092fa8f', 'Ciberseguridad'),
('586224e9-acc9-4e5a-8b43-3f814092fa8f', 'Blockchain'),
('94852b57-6c9a-4047-872a-872790de2628', 'Gestión de Comunidades'),
('94852b57-6c9a-4047-872a-872790de2628', 'Networking')
ON CONFLICT (user_id, interest_name) DO NOTHING;

-- Create a networking suggestion
INSERT INTO networking_suggestions (
  user_id,
  suggested_user_id,
  suggestion_reason,
  match_score,
  status
) VALUES (
  'ab0af45c-31ab-4252-9b0e-b7e1e2dd3111',
  '586224e9-acc9-4e5a-8b43-3f814092fa8f',
  'Ambos están en México y tienen habilidades complementarias en tecnología',
  0.75,
  'pending'
) ON CONFLICT (user_id, suggested_user_id) DO NOTHING;