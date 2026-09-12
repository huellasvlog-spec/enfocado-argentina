ALTER TABLE public.feedback_messages
  ADD CONSTRAINT feedback_email_format
  CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$') NOT VALID;