
-- Create community_categories table
CREATE TABLE public.community_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  color text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read active categories
CREATE POLICY "Categories are viewable by everyone" ON public.community_categories
  FOR SELECT USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON public.community_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Seed existing categories
INSERT INTO public.community_categories (value, label, sort_order) VALUES
  ('tech', 'Tecnología', 1),
  ('education', 'Educación', 2),
  ('social', 'Impacto Social', 3),
  ('entrepreneurship', 'Emprendimiento', 4),
  ('web3', 'Web3', 5);

-- Add updated_at trigger
CREATE TRIGGER update_community_categories_updated_at
  BEFORE UPDATE ON public.community_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
