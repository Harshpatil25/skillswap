
CREATE POLICY "Shared media readable by signed-in users" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('avatars','workshop-images','company-logos'));
CREATE POLICY "Users upload own files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars','workshop-images','company-logos','certificates','resumes') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('avatars','workshop-images','company-logos','certificates','resumes') AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id IN ('avatars','workshop-images','company-logos','certificates','resumes') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('avatars','workshop-images','company-logos','certificates','resumes') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users read own private docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('certificates','resumes') AND (storage.foldername(name))[1] = auth.uid()::text);
