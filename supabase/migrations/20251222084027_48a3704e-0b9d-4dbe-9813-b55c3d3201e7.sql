-- Create storage bucket for student profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-profiles', 'student-profiles', true);

-- Policy: Anyone can view student profile images (public bucket)
CREATE POLICY "Public can view student profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-profiles');

-- Policy: Authenticated users can upload profile images
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-profiles' AND auth.role() = 'authenticated');

-- Policy: Users can update their own uploaded images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-profiles' AND auth.role() = 'authenticated');

-- Policy: Users can delete their own uploaded images
CREATE POLICY "Users can delete profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-profiles' AND auth.role() = 'authenticated');