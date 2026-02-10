import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { slugify } from '@/lib/slugify';

export default function AlbumRedirect() {
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
        const { data: tracks } = await supabase.from('tracks').select('id, title, artist, album');
        const albumTrack = tracks?.find(t => t.album && slugify(t.album) === slug)
          || tracks?.find(t => t.album && slug.includes(slugify(t.album)))
          || tracks?.find(t => t.album && slugify(t.album).includes(slug));
        if (albumTrack) {
          document.title = `${albumTrack.album} – ${albumTrack.artist} | Klangwunder`;
          navigate(`/?play=${albumTrack.id}`, { replace: true });
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
