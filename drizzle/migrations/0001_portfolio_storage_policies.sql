CREATE POLICY "Portfolio lectura publica" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "Portfolio subida propia" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Portfolio borrado propio" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);