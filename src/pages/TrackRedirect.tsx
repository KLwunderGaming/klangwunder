import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { slugify } from '@/lib/slugify';

export default function TrackRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      navigate('/', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const { data: tracks } = await supabase.from('tracks').select('id, title, artist');
        // Try exact slug match first, then partial match
        const track = tracks?.find(t => slugify(t.title) === slug)
          || tracks?.find(t => slug.includes(slugify(t.title)))
          || tracks?.find(t => slugify(t.title).includes(slug));
        if (track) {
          document.title = `${track.title} – ${track.artist} | Klangwunder`;
          navigate(`/?play=${track.id}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  if (!loading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Wird geladen...</p>
      </div>
    </div>
  );
}
