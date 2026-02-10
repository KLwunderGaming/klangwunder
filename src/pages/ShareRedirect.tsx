import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ShareRedirect() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackId) {
      navigate('/#music', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const { data } = await supabase
          .from('tracks')
          .select('title, artist')
          .eq('id', trackId)
          .single();
        if (data) {
          document.title = `${data.title} – ${data.artist} | Klangwunder`;
        }
        navigate(`/?play=${trackId}#music`, { replace: true });
      } catch {
        navigate('/#music', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [trackId, navigate]);

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
