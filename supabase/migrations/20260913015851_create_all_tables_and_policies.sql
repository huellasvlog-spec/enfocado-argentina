/*
# Create all Enfocado database tables and policies

## What this does
Creates the complete schema for the Enfocado photographer directory:
photographers, portfolio_images, and feedback_messages tables, plus
storage policies for the portfolio bucket and a trigger to auto-create
a photographer row when a new auth user signs up.

## Tables created
1. `photographers` — photographer profiles (id linked to auth.users)
2. `portfolio_images` — image gallery entries per photographer
3. `feedback_messages` — visitor comments/feedback (public insert)

## Columns added to photographers
- full_name, bio, whatsapp, province, services[], price_text, avatar_url
- published, created_at, updated_at
- video_url (legacy), video_urls[] (current), portfolio_pdf_path
- instagram_url, website_url, creative_url, contact_email

## Security
- RLS enabled on all tables
- photographers: public SELECT, owner-only INSERT/UPDATE/DELETE
- portfolio_images: public SELECT, owner-only INSERT/DELETE
- feedback_messages: public INSERT only (anon + authenticated)
- storage.objects: public read on portfolio bucket, owner-scoped write/delete
*/

-- ===== photographers =====
CREATE TABLE IF NOT EXISTS public.photographers (
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
  updated_at timestamptz NOT NULL DEFAULT now(),
  video_url text,
  video_urls text[] NOT NULL DEFAULT '{}'::text[],
  portfolio_pdf_path text,
  instagram_url text,
  website_url text,
  creative_url text,
  contact_email text
);

ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfiles visibles para todos" ON public.photographers;
CREATE POLICY "Perfiles visibles para todos" ON public.photographers
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Dueño inserta su perfil" ON public.photographers;
CREATE POLICY "Dueño inserta su perfil" ON public.photographers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Dueño actualiza su perfil" ON public.photographers;
CREATE POLICY "Dueño actualiza su perfil" ON public.photographers
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Dueño borra su perfil" ON public.photographers;
CREATE POLICY "Dueño borra su perfil" ON public.photographers
  FOR DELETE TO authenticated USING (auth.uid() = id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.photographers TO authenticated;
GRANT SELECT ON public.photographers TO anon;
GRANT ALL ON public.photographers TO service_role;

-- ===== portfolio_images =====
CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolio visible para todos" ON public.portfolio_images;
CREATE POLICY "Portfolio visible para todos" ON public.portfolio_images
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Dueño agrega imagenes" ON public.portfolio_images;
CREATE POLICY "Dueño agrega imagenes" ON public.portfolio_images
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = photographer_id);
DROP POLICY IF EXISTS "Dueño borra imagenes" ON public.portfolio_images;
CREATE POLICY "Dueño borra imagenes" ON public.portfolio_images
  FOR DELETE TO authenticated USING (auth.uid() = photographer_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_images TO authenticated;
GRANT SELECT ON public.portfolio_images TO anon;
GRANT ALL ON public.portfolio_images TO service_role;

-- ===== feedback_messages =====
CREATE TABLE IF NOT EXISTS public.feedback_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  CONSTRAINT feedback_email_length CHECK (char_length(email) BETWEEN 3 AND 255),
  CONSTRAINT feedback_message_length CHECK (char_length(message) BETWEEN 1 AND 2000),
  CONSTRAINT feedback_email_format CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquiera puede enviar comentarios" ON public.feedback_messages;
CREATE POLICY "Cualquiera puede enviar comentarios"
ON public.feedback_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(email)) BETWEEN 3 AND 255
  AND char_length(btrim(message)) BETWEEN 1 AND 2000
);

GRANT INSERT ON public.feedback_messages TO anon, authenticated;
GRANT ALL ON public.feedback_messages TO service_role;

-- ===== storage policies for portfolio bucket =====
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Portfolio lectura publica" ON storage.objects;
CREATE POLICY "Portfolio lectura publica" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
DROP POLICY IF EXISTS "Portfolio subida propia" ON storage.objects;
CREATE POLICY "Portfolio subida propia" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Portfolio borrado propio" ON storage.objects;
CREATE POLICY "Portfolio borrado propio" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ===== auto-create photographer on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_photographer()
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

DROP TRIGGER IF EXISTS on_auth_user_created_photographer ON auth.users;
CREATE TRIGGER on_auth_user_created_photographer
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_photographer();