-- Create app_role enum for admin
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles - only admins can read
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create tracks table
CREATE TABLE public.tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT 'Klangwunder',
    album TEXT,
    genre TEXT,
    duration INTEGER DEFAULT 0,
    cover_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tracks
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Everyone can read tracks (public website)
CREATE POLICY "Anyone can view tracks"
ON public.tracks
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert/update/delete tracks
CREATE POLICY "Admins can insert tracks"
ON public.tracks
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tracks"
ON public.tracks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tracks"
ON public.tracks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create playlists table
CREATE TABLE public.playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Everyone can read playlists
CREATE POLICY "Anyone can view playlists"
ON public.playlists
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage playlists
CREATE POLICY "Admins can insert playlists"
ON public.playlists
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update playlists"
ON public.playlists
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete playlists"
ON public.playlists
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create playlist_tracks junction table
CREATE TABLE public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (playlist_id, track_id)
);

-- Enable RLS on playlist_tracks
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Everyone can read playlist_tracks
CREATE POLICY "Anyone can view playlist_tracks"
ON public.playlist_tracks
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage playlist_tracks
CREATE POLICY "Admins can insert playlist_tracks"
ON public.playlist_tracks
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update playlist_tracks"
ON public.playlist_tracks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete playlist_tracks"
ON public.playlist_tracks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create site_settings table for website customization
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site_settings
CREATE POLICY "Anyone can view site_settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage site_settings
CREATE POLICY "Admins can insert site_settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

-- Storage policies for audio bucket
CREATE POLICY "Anyone can view audio files"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'audio');

CREATE POLICY "Admins can upload audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for covers bucket
CREATE POLICY "Anyone can view cover images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'covers');

CREATE POLICY "Admins can upload cover images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cover images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cover images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_tracks_updated_at
BEFORE UPDATE ON public.tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
BEFORE UPDATE ON public.playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();