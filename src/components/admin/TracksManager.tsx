import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Edit2, 
  Music, 
  X,
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  duration: number;
  cover_url: string | null;
  audio_url: string | null;
  created_at: string;
}

export function TracksManager() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artist: 'Klangwunder',
    album: '',
    genre: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Fehler beim Laden der Tracks');
    } else {
      setTracks(data || []);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({ title: '', artist: 'Klangwunder', album: '', genre: '' });
    setAudioFile(null);
    setCoverFile(null);
    setEditingTrack(null);
  };

  const openEditModal = (track: Track) => {
    setEditingTrack(track);
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      genre: track.genre || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let audioUrl = editingTrack?.audio_url || null;
      let coverUrl = editingTrack?.cover_url || null;
      let duration = editingTrack?.duration || 0;

      // Upload audio file
      if (audioFile) {
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${audioExt}`;
        
        const { data: audioData, error: audioError } = await supabase.storage
          .from('audio')
          .upload(audioPath, audioFile);
        
        if (audioError) throw new Error('Audio-Upload fehlgeschlagen');
        
        const { data: { publicUrl: audioPublicUrl } } = supabase.storage
          .from('audio')
          .getPublicUrl(audioPath);
        
        audioUrl = audioPublicUrl;

        // Get duration from audio file
        const audio = new Audio(URL.createObjectURL(audioFile));
        await new Promise((resolve) => {
          audio.onloadedmetadata = () => {
            duration = Math.round(audio.duration);
            resolve(null);
          };
        });
      }

      // Upload cover file
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
        
        const { data: coverData, error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);
        
        if (coverError) throw new Error('Cover-Upload fehlgeschlagen');
        
        const { data: { publicUrl: coverPublicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath);
        
        coverUrl = coverPublicUrl;
      }

      const trackData = {
        title: formData.title,
        artist: formData.artist,
        album: formData.album || null,
        genre: formData.genre || null,
        duration,
        audio_url: audioUrl,
        cover_url: coverUrl,
      };

      if (editingTrack) {
        // Update existing track
        const { error } = await supabase
          .from('tracks')
          .update(trackData)
          .eq('id', editingTrack.id);
        
        if (error) throw error;
        toast.success('Track aktualisiert');
      } else {
        // Create new track
        const { error } = await supabase
          .from('tracks')
          .insert(trackData);
        
        if (error) throw error;
        toast.success('Track erstellt');
      }

      setShowModal(false);
      resetForm();
      fetchTracks();
    } catch (err: any) {
      toast.error(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteTrack = async (track: Track) => {
    if (!confirm(`"${track.title}" wirklich löschen?`)) return;

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', track.id);
    
    if (error) {
      toast.error('Löschen fehlgeschlagen');
    } else {
      toast.success('Track gelöscht');
      fetchTracks();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Add Button */}
      <motion.button
        onClick={() => { resetForm(); setShowModal(true); }}
        className="flex items-center gap-2 px-6 py-3 rounded-xl btn-primary mb-6"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={20} />
        Neuen Track hinzufügen
      </motion.button>

      {/* Tracks List */}
      <div className="space-y-4">
        {tracks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-display text-xl mb-2">Keine Tracks vorhanden</h3>
            <p className="text-muted-foreground">Füge deinen ersten Track hinzu!</p>
          </div>
        ) : (
          tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-4 flex items-center gap-4"
            >
              {/* Cover */}
              <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {track.cover_url ? (
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <Music className="text-muted-foreground" size={24} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-semibold truncate">{track.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                {track.album && (
                  <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                )}
              </div>

              {/* Duration */}
              <span className="text-sm text-muted-foreground hidden sm:block">
                {formatDuration(track.duration)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => openEditModal(track)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 size={18} />
                </motion.button>
                <motion.button
                  onClick={() => deleteTrack(track)}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-gradient">
                  {editingTrack ? 'Track bearbeiten' : 'Neuer Track'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-muted/50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Titel *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Künstler *</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Album</label>
                    <input
                      type="text"
                      value={formData.album}
                      onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Genre</label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Audio Upload */}
                <div>
                  <label className="text-sm text-muted-foreground">
                    Audio-Datei {!editingTrack && '*'}
                  </label>
                  <label className="flex items-center gap-3 px-4 py-4 rounded-xl bg-background/50 border border-primary/20 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload size={20} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {audioFile ? audioFile.name : 'MP3 oder WAV auswählen'}
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="hidden"
                      required={!editingTrack}
                    />
                  </label>
                </div>

                {/* Cover Upload */}
                <div>
                  <label className="text-sm text-muted-foreground">Cover-Bild</label>
                  <label className="flex items-center gap-3 px-4 py-4 rounded-xl bg-background/50 border border-primary/20 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                    <ImageIcon size={20} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {coverFile ? coverFile.name : 'Bild auswählen (optional)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl btn-ghost"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-3 rounded-xl btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Hochladen...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Speichern
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
