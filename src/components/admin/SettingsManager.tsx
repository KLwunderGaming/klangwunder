import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Setting {
  id: string;
  key: string;
  value: string | null;
}

const defaultSettings = [
  { key: 'site_title', label: 'Seitentitel', placeholder: 'Klangwunder', type: 'text' },
  { key: 'site_description', label: 'Beschreibung', placeholder: 'Erlebe Klänge, die Wunder wirken...', type: 'textarea' },
  { key: 'hero_title', label: 'Hero Titel', placeholder: 'Klangwunder', type: 'text' },
  { key: 'hero_subtitle', label: 'Hero Untertitel', placeholder: 'Klänge, die Wunder wirken', type: 'text' },
  { key: 'about_text', label: 'Über mich Text', placeholder: 'Erzähle etwas über dich...', type: 'textarea' },
  { key: 'contact_email', label: 'Kontakt E-Mail', placeholder: 'kontakt@klangwunder.de', type: 'email' },
  { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...', type: 'url' },
  { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/...', type: 'url' },
  { key: 'spotify_url', label: 'Spotify URL', placeholder: 'https://open.spotify.com/...', type: 'url' },
  { key: 'soundcloud_url', label: 'SoundCloud URL', placeholder: 'https://soundcloud.com/...', type: 'url' },
];

export function SettingsManager() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*');
    
    const settingsMap: Record<string, string> = {};
    data?.forEach((s: Setting) => {
      settingsMap[s.key] = s.value || '';
    });
    setSettings(settingsMap);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Upsert all settings
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(
            { key, value: value || null },
            { onConflict: 'key' }
          );
        
        if (error) throw error;
      }

      toast.success('Einstellungen gespeichert');
    } catch (err) {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Grid */}
      <div className="glass rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Webseiten-Einstellungen</h3>
          <motion.button
            onClick={fetchSettings}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {defaultSettings.map((setting) => (
            <div 
              key={setting.key}
              className={setting.type === 'textarea' ? 'sm:col-span-2' : ''}
            >
              <label className="text-sm text-muted-foreground mb-2 block">
                {setting.label}
              </label>
              {setting.type === 'textarea' ? (
                <textarea
                  value={settings[setting.key] || ''}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  placeholder={setting.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none resize-none"
                  rows={4}
                />
              ) : (
                <input
                  type={setting.type}
                  value={settings[setting.key] || ''}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  placeholder={setting.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-8 py-4 rounded-xl btn-primary disabled:opacity-50"
        whileHover={{ scale: isSaving ? 1 : 1.02 }}
        whileTap={{ scale: isSaving ? 1 : 0.98 }}
      >
        {isSaving ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Speichern...
          </>
        ) : (
          <>
            <Save size={20} />
            Alle Einstellungen speichern
          </>
        )}
      </motion.button>

      {/* Info */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary/50">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Hinweis:</strong> Änderungen an den Einstellungen werden nach dem Speichern auf der Webseite sichtbar. 
          Für einige Änderungen muss die Seite neu geladen werden.
        </p>
      </div>
    </div>
  );
}
