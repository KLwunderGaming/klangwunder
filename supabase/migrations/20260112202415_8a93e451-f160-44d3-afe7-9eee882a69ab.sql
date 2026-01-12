-- Create storage buckets for audio files and cover images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio bucket
CREATE POLICY "Audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Admins can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update audio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'audio' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Storage policies for covers bucket
CREATE POLICY "Covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Admins can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);