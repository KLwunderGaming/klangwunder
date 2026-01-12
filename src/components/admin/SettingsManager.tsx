import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2, RefreshCw, Upload, X } from 'lucide-react';
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
  { key: 'hero_subtitle', label: 'Hero Untertitel', placeholder: 'Klänge, die Wunder wirken', type: 'textarea', group: 'hero' },
  
  // About
  { key: 'about_text', label: 'Über mich Text', placeholder: 'Erzähle etwas über dich...', type: 'textarea', group: 'about' },
  { key: 'about_image', label: 'Profilbild', placeholder: '', type: 'image', group: 'about' },
  
  // Statistiken
  { key: 'stat_tracks_value', label: 'Tracks Anzahl', placeholder: '50+', type: 'text', group: 'stats' },
  { key: 'stat_tracks_label', label: 'Tracks Beschreibung', placeholder: 'Tracks', type: 'text', group: 'stats' },
  { key: 'stat_streams_value', label: 'Streams Anzahl', placeholder: '10K+', type: 'text', group: 'stats' },
  { key: 'stat_streams_label', label: 'Streams Beschreibung', placeholder: 'Streams', type: 'text', group: 'stats' },
  { key: 'stat_years_value', label: 'Jahre Anzahl', placeholder: '5', type: 'text', group: 'stats' },
  { key: 'stat_years_label', label: 'Jahre Beschreibung', placeholder: 'Jahre', type: 'text', group: 'stats' },
  
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
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

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

  const handleImageUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `settings-${key}-${Date.now()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      updateSetting(key, publicUrl);
      toast.success('Bild hochgeladen');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      toast.error('Fehler beim Hochladen');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Prepare all settings for batch upsert
      const settingsToSave = defaultSettings.map(s => ({
        key: s.key,
        value: settings[s.key] || null
      }));

      // Use batch upsert for all settings at once
      const { error } = await supabase
        .from('site_settings')
        .upsert(settingsToSave, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      toast.success('Einstellungen gespeichert!');
      
      // Refetch to confirm
      await fetchSettings();
    } catch (err: any) {
      console.error('Error saving settings:', err);
      toast.error(`Fehler: ${err.message || 'Speichern fehlgeschlagen'}`);
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
    { key: 'stats', label: 'Statistiken', icon: '📊' },
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
                  className={setting.type === 'textarea' || setting.type === 'image' ? 'sm:col-span-2' : ''}
                >
                  <label className="text-sm text-muted-foreground mb-2 block">
                    {setting.label}
                  </label>
                  
                  {setting.type === 'image' ? (
                    <div className="space-y-3">
                      {settings[setting.key] ? (
                        <div className="relative inline-block">
                          <img 
                            src={settings[setting.key]} 
                            alt={setting.label} 
                            className="w-40 h-40 object-cover rounded-xl"
                          />
                          <button
                            onClick={() => updateSetting(setting.key, '')}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 hover:bg-destructive text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-40 h-40 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-colors bg-background/30">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(setting.key, file);
                            }}
                            className="hidden"
                          />
                          {uploadingKey === setting.key ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-primary mb-2" />
                              <span className="text-xs text-muted-foreground">Hochladen</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  ) : setting.type === 'textarea' ? (
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
