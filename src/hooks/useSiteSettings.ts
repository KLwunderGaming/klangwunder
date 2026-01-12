import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  site_title?: string;
  site_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  about_text?: string;
  contact_email?: string;
  instagram_url?: string;
  youtube_url?: string;
  spotify_url?: string;
  soundcloud_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  booking_email?: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: SiteSettings = {};
      data?.forEach((item) => {
        (settingsMap as Record<string, string>)[item.key] = item.value || '';
      });

      setSettings(settingsMap);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { settings, isLoading, refetch: fetchSettings };
}
