import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Edit2, 
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Disc3,
  Music,
  ChevronRight
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

interface Album {
  name: string;
  tracks: Track[];
  coverUrl: string | null;
  genre: string | null;
}

export function AlbumsManager() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    albumName: '',
    artist: 'Klangwunder',
    genre: '',
  });
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    currentFileName: string;
    bytesUploaded: number;
    totalBytes: number;
    startTime: number;
    currentFileSize: number;
  } | null>(null);

  // Get albums from tracks
  const albums: Album[] = tracks.reduce((acc: Album[], track) => {
    if (!track.album) return acc;
    
    const existing = acc.find(a => a.name === track.album);
    if (existing) {
      existing.tracks.push(track);
    } else {
      acc.push({
        name: track.album,
        tracks: [track],
        coverUrl: track.cover_url,
        genre: track.genre,
      });
    }
    return acc;
  }, []);

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
    setFormData({ albumName: '', artist: 'Klangwunder', genre: '' });
    setAudioFiles([]);
    setCoverFile(null);
    setEditingAlbum(null);
    setUploadProgress(null);
  };

  const openNewAlbumModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditAlbumModal = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      albumName: album.name,
      artist: album.tracks[0]?.artist || 'Klangwunder',
      genre: album.genre || '',
    });
    setShowModal(true);
  };

  const uploadSingleTrack = async (audioFile: File, coverUrl: string | null) => {
    const audioExt = audioFile.name.split('.').pop();
    const audioPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${audioExt}`;
    
    const { error: audioError } = await supabase.storage
      .from('audio')
      .upload(audioPath, audioFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (audioError) throw new Error('Audio-Upload fehlgeschlagen: ' + audioError.message);
    
    const { data: { publicUrl: audioPublicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(audioPath);

    // Get duration from audio file with timeout to prevent hanging
    let duration = 0;
    const objectUrl = URL.createObjectURL(audioFile);
    try {
      const audio = new Audio(objectUrl);
      duration = await new Promise<number>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('Duration detection timeout for:', audioFile.name);
          resolve(0);
        }, 5000); // 5 second timeout
        
        audio.onloadedmetadata = () => {
          clearTimeout(timeout);
          resolve(Math.round(audio.duration));
        };
        audio.onerror = () => {
          clearTimeout(timeout);
          console.warn('Error loading audio metadata for:', audioFile.name);
          resolve(0);
        };
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    // Extract title from filename (remove extension and track numbers)
    let title = audioFile.name.replace(/\.[^/.]+$/, '');
    // Remove common track number patterns like "01 - ", "01. ", "1. ", etc.
    title = title.replace(/^\d+[\s\.\-_]+/, '').trim();

    return {
      title,
      audioUrl: audioPublicUrl,
      duration,
      coverUrl,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.albumName.trim()) {
      toast.error('Bitte Album-Namen eingeben');
      return;
    }

    setIsUploading(true);

    try {
      // Upload cover file
      let coverUrl: string | null = editingAlbum?.coverUrl || null;
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `albums/${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
        
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);
        
        if (coverError) throw new Error('Cover-Upload fehlgeschlagen: ' + coverError.message);
        
        const { data: { publicUrl: coverPublicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath);
        
        coverUrl = coverPublicUrl;
      }

      if (editingAlbum) {
        // Update existing album tracks
        const updateData: any = {
          album: formData.albumName,
          artist: formData.artist,
          genre: formData.genre || null,
        };
        
        if (coverUrl && coverUrl !== editingAlbum.coverUrl) {
          updateData.cover_url = coverUrl;
        }

        // Update all tracks in this album
        const { error } = await supabase
          .from('tracks')
          .update(updateData)
          .eq('album', editingAlbum.name);
        
        if (error) throw error;

        // Upload any new tracks
        if (audioFiles.length > 0) {
          const totalBytes = audioFiles.reduce((sum, f) => sum + f.size, 0);
          let bytesUploaded = 0;
          const startTime = Date.now();
          const tracksToInsert = [];
          
          for (let i = 0; i < audioFiles.length; i++) {
            const file = audioFiles[i];
            setUploadProgress({ 
              current: i + 1, 
              total: audioFiles.length,
              currentFileName: file.name,
              bytesUploaded,
              totalBytes,
              startTime,
              currentFileSize: file.size
            });
            
            const uploaded = await uploadSingleTrack(file, coverUrl);
            bytesUploaded += file.size;
            
            tracksToInsert.push({
              title: uploaded.title,
              artist: formData.artist,
              album: formData.albumName,
              genre: formData.genre || null,
              duration: uploaded.duration,
              audio_url: uploaded.audioUrl,
              cover_url: coverUrl,
            });
          }

          const { error: insertError } = await supabase
            .from('tracks')
            .insert(tracksToInsert);
          
          if (insertError) throw insertError;
        }

        toast.success('Album aktualisiert');
      } else {
        // Create new album with tracks
        if (audioFiles.length === 0) {
          toast.error('Bitte mindestens eine Audio-Datei auswählen');
          return;
        }

        const totalBytes = audioFiles.reduce((sum, f) => sum + f.size, 0);
        let bytesUploaded = 0;
        const startTime = Date.now();
        const tracksToInsert = [];
        
        for (let i = 0; i < audioFiles.length; i++) {
          const file = audioFiles[i];
          setUploadProgress({ 
            current: i + 1, 
            total: audioFiles.length,
            currentFileName: file.name,
            bytesUploaded,
            totalBytes,
            startTime,
            currentFileSize: file.size
          });
          
          const uploaded = await uploadSingleTrack(file, coverUrl);
          bytesUploaded += file.size;
          
          tracksToInsert.push({
            title: uploaded.title,
            artist: formData.artist,
            album: formData.albumName,
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
        toast.success(`Album "${formData.albumName}" mit ${tracksToInsert.length} Tracks erstellt`);
      }

      setShowModal(false);
      resetForm();
      fetchTracks();
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const deleteAlbum = async (album: Album) => {
    if (!confirm(`Album "${album.name}" und alle ${album.tracks.length} Tracks wirklich löschen?`)) return;

    const trackIds = album.tracks.map(t => t.id);
    
    const { error } = await supabase
      .from('tracks')
      .delete()
      .in('id', trackIds);
    
    if (error) {
      toast.error('Löschen fehlgeschlagen');
    } else {
      toast.success('Album gelöscht');
      setSelectedAlbum(null);
      fetchTracks();
    }
  };

  const deleteTrackFromAlbum = async (track: Track) => {
    if (!confirm(`"${track.title}" aus dem Album entfernen?`)) return;

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', track.id);
    
    if (error) {
      toast.error('Löschen fehlgeschlagen');
    } else {
      toast.success('Track entfernt');
      fetchTracks();
      // Update selected album
      if (selectedAlbum) {
        setSelectedAlbum({
          ...selectedAlbum,
          tracks: selectedAlbum.tracks.filter(t => t.id !== track.id)
        });
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = (tracks: Track[]) => {
    return tracks.reduce((sum, t) => sum + t.duration, 0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getUploadStats = () => {
    if (!uploadProgress) return null;
    
    const elapsed = (Date.now() - uploadProgress.startTime) / 1000;
    const bytesPerSecond = elapsed > 0 ? uploadProgress.bytesUploaded / elapsed : 0;
    const remainingBytes = uploadProgress.totalBytes - uploadProgress.bytesUploaded;
    const estimatedSecondsRemaining = bytesPerSecond > 0 ? remainingBytes / bytesPerSecond : 0;
    const percentComplete = uploadProgress.totalBytes > 0 
      ? Math.round((uploadProgress.bytesUploaded / uploadProgress.totalBytes) * 100) 
      : 0;
    
    return {
      elapsed,
      bytesPerSecond,
      estimatedSecondsRemaining,
      percentComplete,
      uploadedSize: formatFileSize(uploadProgress.bytesUploaded),
      totalSize: formatFileSize(uploadProgress.totalBytes),
      speed: formatFileSize(bytesPerSecond) + '/s',
      eta: formatTime(estimatedSecondsRemaining)
    };
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.button
          onClick={openNewAlbumModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          Neues Album hochladen
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-gradient">{albums.length}</p>
          <p className="text-sm text-muted-foreground">Alben</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-gradient">
            {albums.reduce((sum, a) => sum + a.tracks.length, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Album-Tracks</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-display text-gradient">
            {formatDuration(albums.reduce((sum, a) => sum + getTotalDuration(a.tracks), 0))}
          </p>
          <p className="text-sm text-muted-foreground">Gesamtdauer</p>
        </div>
      </div>

      {/* Content */}
      {selectedAlbum ? (
        /* Album Detail View */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start gap-4 md:gap-6">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="p-2 rounded-lg hover:bg-muted/50 mt-2"
            >
              <ChevronRight className="rotate-180" size={24} />
            </button>
            
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
              {selectedAlbum.coverUrl ? (
                <img src={selectedAlbum.coverUrl} alt={selectedAlbum.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <Disc3 className="w-12 h-12 text-foreground/30" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Album</p>
              <h3 className="font-display text-2xl md:text-3xl text-gradient truncate">{selectedAlbum.name}</h3>
              <p className="text-muted-foreground text-sm">
                {selectedAlbum.tracks[0]?.artist} • {selectedAlbum.tracks.length} Tracks • {formatDuration(getTotalDuration(selectedAlbum.tracks))}
              </p>
              {selectedAlbum.genre && (
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {selectedAlbum.genre}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => openEditAlbumModal(selectedAlbum)}
                className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                whileHover={{ scale: 1.1 }}
              >
                <Edit2 size={18} />
              </motion.button>
              <motion.button
                onClick={() => deleteAlbum(selectedAlbum)}
                className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                whileHover={{ scale: 1.1 }}
              >
                <Trash2 size={18} />
              </motion.button>
            </div>
          </div>

          {/* Track List */}
          <div className="glass rounded-xl divide-y divide-primary/10">
            {selectedAlbum.tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <span className="w-6 text-center text-sm text-muted-foreground">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                </div>
                <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                <button
                  onClick={() => deleteTrackFromAlbum(track)}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      ) : albums.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Disc3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-xl mb-2">Keine Alben vorhanden</h3>
          <p className="text-muted-foreground mb-4">Lade dein erstes Album mit mehreren Tracks hoch!</p>
        </div>
      ) : (
        /* Albums Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {albums.map((album, index) => (
            <motion.div
              key={album.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="aspect-square relative">
                {album.coverUrl ? (
                  <img 
                    src={album.coverUrl} 
                    alt={album.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Disc3 className="w-16 h-16 text-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4">
                <h4 className="font-semibold truncate group-hover:text-primary transition-colors">{album.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {album.tracks.length} Tracks • {formatDuration(getTotalDuration(album.tracks))}
                </p>
              </div>
            </motion.div>
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
                  {editingAlbum ? 'Album bearbeiten' : 'Neues Album hochladen'}
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
                  <label className="text-sm text-muted-foreground mb-1 block">Album-Name *</label>
                  <input
                    type="text"
                    value={formData.albumName}
                    onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                    placeholder="Name des Albums"
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    required
                  />
                </div>

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

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Genre</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="z.B. Electronic, Pop, Rock"
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                  />
                </div>

                {/* Cover Upload */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Album-Cover</label>
                  <div className="flex items-center gap-4">
                    {(coverFile || editingAlbum?.coverUrl) && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        <img 
                          src={coverFile ? URL.createObjectURL(coverFile) : editingAlbum?.coverUrl || ''} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-colors">
                      <ImageIcon size={20} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {coverFile ? coverFile.name : 'Cover-Bild auswählen'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Audio Files Upload */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Audio-Dateien {!editingAlbum && '*'}
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-colors">
                    <Upload size={24} className="text-muted-foreground" />
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground block">
                        {audioFiles.length > 0 
                          ? `${audioFiles.length} Datei${audioFiles.length > 1 ? 'en' : ''} ausgewählt`
                          : 'Mehrere Audio-Dateien auswählen'
                        }
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        Die Titel werden aus den Dateinamen übernommen
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={(e) => setAudioFiles(Array.from(e.target.files || []))}
                      className="hidden"
                    />
                  </label>
                  
                  {/* Selected files list */}
                  {audioFiles.length > 0 && (
                    <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                      {audioFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Music size={14} />
                          <span className="truncate">{file.name.replace(/\.[^/.]+$/, '').replace(/^\d+[\s\.\-_]+/, '')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress && (() => {
                  const stats = getUploadStats();
                  return (
                    <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      {/* Current file */}
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-primary" />
                        <span className="text-sm font-medium truncate flex-1">
                          {uploadProgress.currentFileName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(uploadProgress.currentFileSize)}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats?.percentComplete || 0}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{stats?.uploadedSize} / {stats?.totalSize}</span>
                          <span>{stats?.percentComplete}%</span>
                        </div>
                      </div>
                      
                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Track</p>
                          <p className="text-sm font-medium text-primary">
                            {uploadProgress.current}/{uploadProgress.total}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Geschwindigkeit</p>
                          <p className="text-sm font-medium text-primary">{stats?.speed}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Restzeit</p>
                          <p className="text-sm font-medium text-primary">~{stats?.eta}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <motion.button
                  type="submit"
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-primary disabled:opacity-50"
                  whileHover={{ scale: isUploading ? 1 : 1.02 }}
                  whileTap={{ scale: isUploading ? 1 : 0.98 }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {uploadProgress 
                        ? `Track ${uploadProgress.current}/${uploadProgress.total} wird hochgeladen...`
                        : 'Wird hochgeladen...'
                      }
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingAlbum ? 'Album aktualisieren' : 'Album erstellen'}
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
