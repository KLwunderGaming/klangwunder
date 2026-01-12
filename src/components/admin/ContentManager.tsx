import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Type,
  Image,
  Link,
  Eye,
  EyeOff,
  ChevronDown,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContentSection {
  id: string;
  section_key: string;
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  position: number;
  is_visible: boolean;
  section_type: 'hero' | 'about' | 'music' | 'events' | 'contact' | 'custom';
  created_at: string;
  updated_at: string;
}

const sectionTypes = [
  { id: 'hero', label: 'Hero-Bereich', icon: Image },
  { id: 'about', label: 'Über mich', icon: FileText },
  { id: 'music', label: 'Musik', icon: Type },
  { id: 'events', label: 'Events', icon: FileText },
  { id: 'contact', label: 'Kontakt', icon: Link },
  { id: 'custom', label: 'Benutzerdefiniert', icon: Plus },
];

export function ContentManager() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('position');

      if (error) {
        console.error('Error fetching sections:', error);
        setSections([]);
      } else {
        setSections((data as ContentSection[]) || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !editingSection) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `content-${Date.now()}.${fileExt}`;
      const filePath = `content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      setEditingSection({ ...editingSection, image_url: publicUrl });
      toast.success('Bild hochgeladen');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      toast.error('Fehler beim Hochladen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSection = () => {
    setEditingSection({
      id: '',
      section_key: '',
      title: '',
      content: '',
      image_url: null,
      link_url: null,
      position: sections.length,
      is_visible: true,
      section_type: 'custom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsDialogOpen(true);
  };

  const handleEditSection = (section: ContentSection) => {
    setEditingSection({ ...section });
    setIsDialogOpen(true);
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;
    setIsSaving(true);

    try {
      const sectionData = {
        section_key: editingSection.section_key || editingSection.title.toLowerCase().replace(/\s+/g, '_'),
        title: editingSection.title,
        content: editingSection.content,
        image_url: editingSection.image_url,
        link_url: editingSection.link_url,
        position: editingSection.position,
        is_visible: editingSection.is_visible,
        section_type: editingSection.section_type
      };

      if (editingSection.id) {
        const { error } = await supabase
          .from('content_sections')
          .update(sectionData)
          .eq('id', editingSection.id);

        if (error) throw error;
        toast.success('Sektion aktualisiert');
      } else {
        const { error } = await supabase
          .from('content_sections')
          .insert(sectionData);

        if (error) throw error;
        toast.success('Sektion erstellt');
      }

      setIsDialogOpen(false);
      setEditingSection(null);
      fetchSections();
    } catch (err: any) {
      console.error('Error saving section:', err);
      toast.error(err.message || 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Bist du sicher, dass du diese Sektion löschen möchtest?')) return;

    try {
      const { error } = await supabase
        .from('content_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Sektion gelöscht');
      fetchSections();
    } catch (err: any) {
      console.error('Error deleting section:', err);
      toast.error(err.message || 'Fehler beim Löschen');
    }
  };

  const handleToggleVisibility = async (section: ContentSection) => {
    try {
      const { error } = await supabase
        .from('content_sections')
        .update({ is_visible: !section.is_visible })
        .eq('id', section.id);

      if (error) throw error;
      fetchSections();
    } catch (err: any) {
      console.error('Error updating visibility:', err);
      toast.error(err.message || 'Fehler beim Aktualisieren');
    }
  };

  const getSectionIcon = (type: string) => {
    const found = sectionTypes.find(s => s.id === type);
    return found?.icon || FileText;
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
      {/* Header mit Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="font-display text-xl text-gradient">Seiten & Inhalte</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Bearbeite Texte, Bilder und Sektionen deiner Webseite
          </p>
        </div>
        <motion.button
          onClick={handleCreateSection}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} />
          Neue Sektion
        </motion.button>
      </div>

      {/* Sektionen Liste */}
      {sections.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h4 className="font-display text-xl mb-2">Keine Sektionen vorhanden</h4>
          <p className="text-muted-foreground mb-6">
            Erstelle deine erste Sektion, um Inhalte zu verwalten.
          </p>
          <motion.button
            onClick={handleCreateSection}
            className="px-6 py-3 rounded-xl btn-primary"
            whileHover={{ scale: 1.02 }}
          >
            <Plus size={18} className="inline mr-2" />
            Erste Sektion erstellen
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sections.map((section, index) => {
              const Icon = getSectionIcon(section.section_type);
              const isExpanded = expandedSections.has(section.id);
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass rounded-xl overflow-hidden ${
                    !section.is_visible ? 'opacity-60' : ''
                  }`}
                >
                  {/* Header */}
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => toggleExpanded(section.id)}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-lg truncate">{section.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {sectionTypes.find(t => t.id === section.section_type)?.label}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(section);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          section.is_visible 
                            ? 'hover:bg-primary/20 text-primary' 
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {section.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSection(section);
                        }}
                        className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit3 size={18} />
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                        className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>

                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={20} className="text-muted-foreground" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-primary/10 mt-2">
                          {section.content && (
                            <div className="mb-3">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Inhalt</span>
                              <p className="text-sm mt-1 text-foreground/80 whitespace-pre-wrap">
                                {section.content.substring(0, 200)}
                                {section.content.length > 200 && '...'}
                              </p>
                            </div>
                          )}
                          {section.image_url && (
                            <div className="mb-3">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Bild</span>
                              <img 
                                src={section.image_url} 
                                alt="" 
                                className="w-32 h-20 object-cover rounded-lg mt-1"
                              />
                            </div>
                          )}
                          {section.link_url && (
                            <div>
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">Link</span>
                              <p className="text-sm text-primary truncate mt-1">{section.link_url}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-strong border-primary/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gradient">
              {editingSection?.id ? 'Sektion bearbeiten' : 'Neue Sektion'}
            </DialogTitle>
          </DialogHeader>

          {editingSection && (
            <div className="space-y-6 mt-4">
              {/* Typ */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Sektionstyp</label>
                <div className="grid grid-cols-3 gap-2">
                  {sectionTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => setEditingSection({ ...editingSection, section_type: type.id as any })}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                        editingSection.section_type === type.id
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-primary/20 hover:border-primary/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <type.icon size={16} />
                      <span className="text-sm">{type.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Titel */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Titel</label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  placeholder="z.B. Über mich"
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                />
              </div>

              {/* Schlüssel */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Schlüssel (für technische Referenz)
                </label>
                <input
                  type="text"
                  value={editingSection.section_key}
                  onChange={(e) => setEditingSection({ ...editingSection, section_key: e.target.value })}
                  placeholder="z.B. about_section"
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none font-mono text-sm"
                />
              </div>

              {/* Inhalt */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Inhalt</label>
                <textarea
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  placeholder="Der Haupttext dieser Sektion..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none resize-none"
                />
              </div>

              {/* Bild Upload */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Bild</label>
                {editingSection.image_url ? (
                  <div className="relative inline-block">
                    <img 
                      src={editingSection.image_url} 
                      alt="" 
                      className="w-full max-w-md h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setEditingSection({ ...editingSection, image_url: null })}
                      className="absolute top-2 right-2 p-2 rounded-full bg-destructive/80 hover:bg-destructive text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-colors bg-background/30">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-primary mb-2" />
                        <span className="text-sm text-muted-foreground">Bild hochladen</span>
                        <span className="text-xs text-muted-foreground mt-1">oder per URL unten eingeben</span>
                      </>
                    )}
                  </label>
                )}
                
                {/* URL alternativ */}
                <input
                  type="url"
                  value={editingSection.image_url || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, image_url: e.target.value || null })}
                  placeholder="Oder Bild-URL einfügen..."
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none mt-3"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Link URL (optional)</label>
                <input
                  type="url"
                  value={editingSection.link_url || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, link_url: e.target.value || null })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                />
              </div>

              {/* Sichtbarkeit */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingSection({ ...editingSection, is_visible: !editingSection.is_visible })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editingSection.is_visible ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      editingSection.is_visible ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-muted-foreground">
                  {editingSection.is_visible ? 'Sichtbar' : 'Versteckt'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl btn-ghost"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Abbrechen
                </motion.button>
                <motion.button
                  onClick={handleSaveSection}
                  disabled={isSaving || !editingSection.title}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl btn-primary disabled:opacity-50"
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.98 }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Speichern
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
