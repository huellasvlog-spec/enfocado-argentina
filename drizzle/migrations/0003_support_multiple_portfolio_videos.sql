ALTER TABLE public.photographers
  ADD COLUMN video_urls text[] NOT NULL DEFAULT '{}'::text[];