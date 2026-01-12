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
  // Website Allgemein
  { key: 'site_title', label: 'Künstlername / Seitentitel', placeholder: 'Klangwunder', type: 'text', group: 'general' },
  { key: 'site_description', label: 'Kurzbeschreibung (SEO)', placeholder: 'Erlebe Klänge, die Wunder wirken...', type: 'textarea', group: 'general' },
  
  // Hero Section
  { key: 'hero_title', label: 'Hero Titel', placeholder: 'Klangwunder', type: 'text', group: 'hero' },
  { key: 'hero_subtitle', label: 'Hero Untertitel', placeholder: 'Klänge, die Wunder wirken', type: 'text', group: 'hero' },
  
  // About
  { key: 'about_text', label: 'Über mich Text', placeholder: 'Erzähle etwas über dich...', type: 'textarea', group: 'about' },
  
  // Kontakt
  { key: 'contact_email', label: 'Kontakt E-Mail', placeholder: 'kontakt@klangwunder.de', type: 'email', group: 'contact' },
  { key: 'booking_email', label: 'Booking E-Mail', placeholder: 'booking@klangwunder.de', type: 'email', group: 'contact' },
  
  // Social Media
  { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/klangwunder', type: 'url', group: 'social' },
  { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@klangwunder', type: 'url', group: 'social' },
  { key: 'spotify_url', label: 'Spotify', placeholder: 'https://open.spotify.com/artist/...', type: 'url', group: 'social' },
  { key: 'soundcloud_url', label: 'SoundCloud', placeholder: 'https://soundcloud.com/klangwunder', type: 'url', group: 'social' },
  { key: 'tiktok_url', label: 'TikTok', placeholder: 'https://tiktok.com/@klangwunder', type: 'url', group: 'social' },
  { key: 'twitter_url', label: 'X / Twitter', placeholder: 'https://x.com/klangwunder', type: 'url', group: 'social' },
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

  const settingsGroups = [
    { key: 'general', label: 'Allgemein', icon: '⚙️' },
    { key: 'hero', label: 'Hero Section', icon: '🎬' },
    { key: 'about', label: 'Über mich', icon: '👤' },
    { key: 'contact', label: 'Kontakt', icon: '📧' },
    { key: 'social', label: 'Social Media', icon: '🔗' },
  ];

  return (
    <div className="space-y-6">
      {/* Grouped Settings */}
      {settingsGroups.map((group) => {
        const groupSettings = defaultSettings.filter(s => s.group === group.key);
        if (groupSettings.length === 0) return null;

        return (
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{group.icon}</span>
              <h3 className="font-display text-xl">{group.label}</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {groupSettings.map((setting) => (
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
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none resize-none transition-colors"
                      rows={4}
                    />
                  ) : (
                    <input
                      type={setting.type}
                      value={settings[setting.key] || ''}
                      onChange={(e) => updateSetting(setting.key, e.target.value)}
                      placeholder={setting.placeholder}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw size={16} />
          Aktualisieren
        </motion.button>
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
