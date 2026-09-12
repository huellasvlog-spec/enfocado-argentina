CREATE TABLE public.photographers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  province text NOT NULL DEFAULT '',
  services text[] NOT NULL DEFAULT '{}',
  price_text text NOT NULL DEFAULT '',
  avatar_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.photographers TO authenticated;
GRANT SELECT ON public.photographers TO anon;
GRANT ALL ON public.photographers TO service_role;

ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles visibles para todos" ON public.photographers
  FOR SELECT USING (true);
CREATE POLICY "Dueño inserta su perfil" ON public.photographers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Dueño actualiza su perfil" ON public.photographers
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Dueño borra su perfil" ON public.photographers
  FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_images TO authenticated;
GRANT SELECT ON public.portfolio_images TO anon;
GRANT ALL ON public.portfolio_images TO service_role;

ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio visible para todos" ON public.portfolio_images
  FOR SELECT USING (true);
CREATE POLICY "Dueño agrega imagenes" ON public.portfolio_images
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = photographer_id);
CREATE POLICY "Dueño borra imagenes" ON public.portfolio_images
  FOR DELETE TO authenticated USING (auth.uid() = photographer_id);

CREATE FUNCTION public.handle_new_photographer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.photographers (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_photographer
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();