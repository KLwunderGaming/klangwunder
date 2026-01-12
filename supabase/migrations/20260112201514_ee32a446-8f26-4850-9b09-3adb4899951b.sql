-- Create content_sections table for managing page content
CREATE TABLE public.content_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  position INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  section_type TEXT NOT NULL DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view content sections
CREATE POLICY "Anyone can view content_sections"
ON public.content_sections
FOR SELECT
USING (true);

-- Admins can insert content sections
CREATE POLICY "Admins can insert content_sections"
ON public.content_sections
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update content sections
CREATE POLICY "Admins can update content_sections"
ON public.content_sections
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete content sections
CREATE POLICY "Admins can delete content_sections"
ON public.content_sections
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_content_sections_updated_at
BEFORE UPDATE ON public.content_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections
INSERT INTO public.content_sections (section_key, title, content, position, section_type) VALUES
('hero', 'Hero-Bereich', 'Klänge, die Wunder wirken', 0, 'hero'),
('about', 'Über mich', 'Erzähle hier etwas über dich und deine Musik...', 1, 'about'),
('music', 'Musik', 'Entdecke meine neuesten Tracks und Releases.', 2, 'music'),
('events', 'Events', 'Kommende Auftritte und Veranstaltungen.', 3, 'events'),
('contact', 'Kontakt', 'Nimm Kontakt mit mir auf.', 4, 'contact');