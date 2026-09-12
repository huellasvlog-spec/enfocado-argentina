ALTER TABLE public.photographers
  ADD COLUMN video_url text,
  ADD COLUMN portfolio_pdf_path text,
  ADD COLUMN instagram_url text,
  ADD COLUMN website_url text,
  ADD COLUMN creative_url text;

CREATE TABLE public.feedback_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feedback_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  CONSTRAINT feedback_email_length CHECK (char_length(email) BETWEEN 3 AND 255),
  CONSTRAINT feedback_message_length CHECK (char_length(message) BETWEEN 1 AND 2000)
);

GRANT INSERT ON public.feedback_messages TO anon, authenticated;
GRANT ALL ON public.feedback_messages TO service_role;

ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede enviar comentarios"
ON public.feedback_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 100
  AND char_length(btrim(email)) BETWEEN 3 AND 255
  AND char_length(btrim(message)) BETWEEN 1 AND 2000
);