import { useState, useEffect, useMemo } from 'react';
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
  Image as ImageIcon,
  Disc3,
  List,
  Grid3X3
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

type ViewMode = 'list' | 'albums';

export function TracksManager() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artist: 'Klangwunder',
    album: '',
    genre: '',
  });
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  // Group tracks by album
  const { albums, albumTracks } = useMemo(() => {
    const albumMap = new Map<string, Track[]>();
    
    tracks.forEach(track => {
      const albumName = track.album || 'Singles';
      const existing = albumMap.get(albumName) || [];
      existing.push(track);
      albumMap.set(albumName, existing);
    });

    const albumsArr = Array.from(albumMap.entries()).map(([name, tracks]) => ({
      name,
      tracks,
      coverUrl: tracks[0]?.cover_url,
      trackCount: tracks.length,
      totalDuration: tracks.reduce((sum, t) => sum + t.duration, 0),
    }));

    return { 
      albums: albumsArr.sort((a, b) => a.name === 'Singles' ? 1 : b.name === 'Singles' ? -1 : 0),
      albumTracks: selectedAlbum ? albumMap.get(selectedAlbum) || [] : []
    };
  }, [tracks, selectedAlbum]);

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
    setAudioFiles([]);
    setCoverFile(null);
    setEditingTrack(null);
    setUploadProgress(null);
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

  const openNewTrackModal = (albumName?: string) => {
    resetForm();
    if (albumName && albumName !== 'Singles') {
      setFormData(prev => ({ ...prev, album: albumName }));
    }
    setShowModal(true);
  };

  const uploadSingleTrack = async (audioFile: File, coverUrl: string | null) => {
    const audioExt = audioFile.name.split('.').pop();
    const audioPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${audioExt}`;
    
    const { error: audioError } = await supabase.storage
      .from('audio')
      .upload(audioPath, audioFile);
    
    if (audioError) throw new Error('Audio-Upload fehlgeschlagen: ' + audioError.message);
    
    const { data: { publicUrl: audioPublicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(audioPath);

    // Get duration from audio file with timeout
    let duration = 0;
    const objectUrl = URL.createObjectURL(audioFile);
    const audio = new Audio(objectUrl);
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        resolve();
      }, 5000);
      
      audio.onloadedmetadata = () => {
        clearTimeout(timeout);
        duration = Math.round(audio.duration);
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      audio.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
    });

    // Extract title from filename (remove extension)
    const title = audioFile.name.replace(/\.[^/.]+$/, '');

    return {
      title,
      audioUrl: audioPublicUrl,
      duration,
      coverUrl,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Upload cover file first (shared across all tracks if multiple)
      let coverUrl = editingTrack?.cover_url || null;
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
        
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);
        
        if (coverError) throw new Error('Cover-Upload fehlgeschlagen: ' + coverError.message);
        
        const { data: { publicUrl: coverPublicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath);
        
        coverUrl = coverPublicUrl;
      }

      if (editingTrack) {
        // Update existing track
        let audioUrl = editingTrack.audio_url;
        let duration = editingTrack.duration;

        if (audioFiles.length > 0) {
          const uploaded = await uploadSingleTrack(audioFiles[0], coverUrl);
          audioUrl = uploaded.audioUrl;
          duration = uploaded.duration;
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

        const { error } = await supabase
          .from('tracks')
          .update(trackData)
          .eq('id', editingTrack.id);
        
        if (error) throw error;
      } else {
        // Create new tracks (single or multiple)
        const totalFiles = audioFiles.length;
        
        if (totalFiles === 0) {
          toast.error('Bitte mindestens eine Audio-Datei auswählen');
          return;
        }

        setUploadProgress({ current: 0, total: totalFiles });

        const tracksToInsert = [];
        
        for (let i = 0; i < audioFiles.length; i++) {
          const file = audioFiles[i];
          setUploadProgress({ current: i + 1, total: totalFiles });
          
          const uploaded = await uploadSingleTrack(file, coverUrl);
          
          tracksToInsert.push({
            title: totalFiles === 1 ? formData.title : uploaded.title,
            artist: formData.artist,
            album: formData.album || null,
            genre: formData.genre || null,
            duration: uploaded.duration,
            audio_url: uploaded.audioUrl,
            cover_url: coverUrl,
          });
        }

        const { error } = await supabase
          .from('tracks')
          .insert(tracksToInsert);
        
        if (error) throw error;
      }

      await fetchTracks();
      resetForm();
      setShowModal(false);
      toast.success(editingTrack ? 'Track aktualisiert' : `${audioFiles.length} Track${audioFiles.length > 1 ? 's' : ''} erstellt`);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.button
          onClick={() => openNewTrackModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          Neuen Track hinzufügen
        </motion.button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setViewMode('list'); setSelectedAlbum(null); }}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => { setViewMode('albums'); setSelectedAlbum(null); }}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'albums' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
          >
            <Grid3X3 size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-gradient">{tracks.length}</p>
          <p className="text-sm text-muted-foreground">Tracks</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-gradient">{albums.filter(a => a.name !== 'Singles').length}</p>
          <p className="text-sm text-muted-foreground">Alben</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-gradient">{albums.find(a => a.name === 'Singles')?.trackCount || 0}</p>
          <p className="text-sm text-muted-foreground">Singles</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-gradient">
            {formatDuration(tracks.reduce((sum, t) => sum + t.duration, 0))}
          </p>
          <p className="text-sm text-muted-foreground">Gesamtdauer</p>
        </div>
      </div>

      {/* Content */}
      {tracks.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-xl mb-2">Keine Tracks vorhanden</h3>
          <p className="text-muted-foreground mb-4">Füge deinen ersten Track hinzu!</p>
        </div>
      ) : viewMode === 'albums' && !selectedAlbum ? (
        /* Albums Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album, index) => (
            <motion.div
              key={album.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedAlbum(album.name)}
            >
              <div className="aspect-square relative">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Disc3 className="w-12 h-12 text-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-semibold truncate">{album.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {album.trackCount} Tracks • {formatDuration(album.totalDuration)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : selectedAlbum ? (
        /* Album Detail View */
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="p-2 rounded-lg hover:bg-muted/50"
            >
              ←
            </button>
            <div>
              <h3 className="font-display text-2xl">{selectedAlbum}</h3>
              <p className="text-sm text-muted-foreground">{albumTracks.length} Tracks</p>
            </div>
            <motion.button
              onClick={() => openNewTrackModal(selectedAlbum)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
              whileHover={{ scale: 1.02 }}
            >
              <Plus size={16} />
              Track hinzufügen
            </motion.button>
          </div>
          
          {albumTracks.map((track, index) => (
            <TrackRow 
              key={track.id} 
              track={track} 
              index={index}
              onEdit={() => openEditModal(track)}
              onDelete={() => deleteTrack(track)}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      ) : (
        /* All Tracks List */
        <div className="space-y-3">
          {tracks.map((track, index) => (
            <TrackRow 
              key={track.id} 
              track={track} 
              index={index}
              onEdit={() => openEditModal(track)}
              onDelete={() => deleteTrack(track)}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      )}

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
              className="w-full max-w-lg glass-strong rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
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
                {(editingTrack || audioFiles.length <= 1) && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Titel *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Song-Titel"
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                      required={!!editingTrack || audioFiles.length <= 1}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Künstler *</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    placeholder="Künstlername"
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Album</label>
                    <input
                      type="text"
                      value={formData.album}
                      onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                      placeholder="Albumname (optional)"
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Genre</label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      placeholder="z.B. Electronic"
                      className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Audio Upload - Multiple files allowed */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Audio-Datei(en) {!editingTrack && '*'}
                    {!editingTrack && <span className="text-xs ml-2 text-primary">(Mehrfachauswahl möglich)</span>}
                  </label>
                  <label className="flex items-center gap-3 px-4 py-4 rounded-xl bg-background/50 border border-primary/20 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload size={20} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {audioFiles.length > 0 
                        ? audioFiles.length === 1 
                          ? audioFiles[0].name 
                          : `${audioFiles.length} Dateien ausgewählt`
                        : 'MP3 oder WAV auswählen (Mehrfachauswahl mit Strg/Cmd)'
                      }
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple={!editingTrack}
                      onChange={(e) => setAudioFiles(e.target.files ? Array.from(e.target.files) : [])}
                      className="hidden"
                      required={!editingTrack && audioFiles.length === 0}
                    />
                  </label>
                  {audioFiles.length > 1 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {audioFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-muted/30 rounded px-2 py-1">
                          <span className="truncate flex-1">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setAudioFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="ml-2 text-destructive hover:text-destructive/80"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {audioFiles.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Titel werden automatisch aus Dateinamen übernommen
                    </p>
                  )}
                </div>

                {/* Cover Upload */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Cover-Bild</label>
                  <label className="flex items-center gap-3 px-4 py-4 rounded-xl bg-background/50 border border-primary/20 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                    <ImageIcon size={20} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
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
                        {uploadProgress 
                          ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                          : 'Hochladen...'
                        }
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

// Track Row Component
interface TrackRowProps {
  track: Track;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  formatDuration: (s: number) => string;
}

function TrackRow({ track, index, onEdit, onDelete, formatDuration }: TrackRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-xl p-4 flex items-center gap-4"
    >
      {/* Cover */}
      <div className="w-14 h-14 rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <Music className="text-muted-foreground" size={20} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-body font-semibold truncate">{track.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        {track.album && (
          <p className="text-xs text-muted-foreground/70 truncate">{track.album}</p>
        )}
      </div>

      {/* Genre */}
      {track.genre && (
        <span className="hidden md:block text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
          {track.genre}
        </span>
      )}

      {/* Duration */}
      <span className="text-sm text-muted-foreground hidden sm:block">
        {formatDuration(track.duration)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <motion.button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit2 size={16} />
        </motion.button>
        <motion.button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
