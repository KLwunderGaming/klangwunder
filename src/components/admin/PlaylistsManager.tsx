import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ListMusic, 
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Music,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
}

interface PlaylistTrack {
  id: string;
  track_id: string;
  position: number;
  track?: Track;
}

export function PlaylistsManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTracksModal, setShowTracksModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPlaylists();
    fetchTracks();
  }, []);

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setPlaylists(data || []);
    }
    setIsLoading(false);
  };

  const fetchTracks = async () => {
    const { data } = await supabase
      .from('tracks')
      .select('id, title, artist, cover_url')
      .order('title');
    
    setTracks(data || []);
  };

  const fetchPlaylistTracks = async (playlistId: string) => {
    const { data } = await supabase
      .from('playlist_tracks')
      .select(`
        id,
        track_id,
        position,
        tracks (
          id,
          title,
          artist,
          cover_url
        )
      `)
      .eq('playlist_id', playlistId)
      .order('position');
    
    if (data) {
      const mappedData = data.map(item => ({
        id: item.id,
        track_id: item.track_id,
        position: item.position,
        track: item.tracks as unknown as Track
      }));
      setPlaylistTracks(mappedData);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setCoverFile(null);
    setEditingPlaylist(null);
  };

  const openEditModal = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || '',
    });
    setShowModal(true);
  };

  const openTracksModal = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    await fetchPlaylistTracks(playlist.id);
    setShowTracksModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let coverUrl = editingPlaylist?.cover_url || null;

      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `playlists/${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
        
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);
        
        if (coverError) throw new Error('Cover-Upload fehlgeschlagen');
        
        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath);
        
        coverUrl = publicUrl;
      }

      const playlistData = {
        name: formData.name,
        description: formData.description || null,
        cover_url: coverUrl,
      };

      if (editingPlaylist) {
        const { error } = await supabase
          .from('playlists')
          .update(playlistData)
          .eq('id', editingPlaylist.id);
        
        if (error) throw error;
        toast.success('Playlist aktualisiert');
      } else {
        const { error } = await supabase
          .from('playlists')
          .insert(playlistData);
        
        if (error) throw error;
        toast.success('Playlist erstellt');
      }

      setShowModal(false);
      resetForm();
      fetchPlaylists();
    } catch (err: any) {
      toast.error(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsUploading(false);
    }
  };

  const deletePlaylist = async (playlist: Playlist) => {
    if (!confirm(`"${playlist.name}" wirklich löschen?`)) return;

    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlist.id);
    
    if (error) {
      toast.error('Löschen fehlgeschlagen');
    } else {
      toast.success('Playlist gelöscht');
      fetchPlaylists();
    }
  };

  const addTrackToPlaylist = async (trackId: string) => {
    if (!selectedPlaylist) return;

    const maxPosition = playlistTracks.length > 0 
      ? Math.max(...playlistTracks.map(t => t.position)) + 1 
      : 0;

    const { error } = await supabase
      .from('playlist_tracks')
      .insert({
        playlist_id: selectedPlaylist.id,
        track_id: trackId,
        position: maxPosition
      });
    
    if (error) {
      if (error.code === '23505') {
        toast.error('Track bereits in Playlist');
      } else {
        toast.error('Fehler beim Hinzufügen');
      }
    } else {
      toast.success('Track hinzugefügt');
      fetchPlaylistTracks(selectedPlaylist.id);
    }
  };

  const removeTrackFromPlaylist = async (playlistTrackId: string) => {
    const { error } = await supabase
      .from('playlist_tracks')
      .delete()
      .eq('id', playlistTrackId);
    
    if (error) {
      toast.error('Fehler beim Entfernen');
    } else {
      toast.success('Track entfernt');
      if (selectedPlaylist) {
        fetchPlaylistTracks(selectedPlaylist.id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableTracks = tracks.filter(
    t => !playlistTracks.some(pt => pt.track_id === t.id)
  );

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
        Neue Playlist erstellen
      </motion.button>

      {/* Playlists Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center col-span-full">
            <ListMusic className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-display text-xl mb-2">Keine Playlists vorhanden</h3>
            <p className="text-muted-foreground">Erstelle deine erste Playlist!</p>
          </div>
        ) : (
          playlists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl overflow-hidden group"
            >
              {/* Cover */}
              <div 
                className="aspect-square bg-muted/30 flex items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={() => openTracksModal(playlist)}
              >
                {playlist.cover_url ? (
                  <img 
                    src={playlist.cover_url} 
                    alt={playlist.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ListMusic className="text-muted-foreground" size={48} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="text-sm font-body">Tracks verwalten</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-body font-semibold truncate">{playlist.name}</h3>
                {playlist.description && (
                  <p className="text-sm text-muted-foreground truncate">{playlist.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <motion.button
                    onClick={() => openEditModal(playlist)}
                    className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => deletePlaylist(playlist)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
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
              className="w-full max-w-md glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-gradient">
                  {editingPlaylist ? 'Playlist bearbeiten' : 'Neue Playlist'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted/50">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Beschreibung</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Cover-Bild</label>
                  <label className="flex items-center gap-3 px-4 py-4 rounded-xl bg-background/50 border border-primary/20 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                    <ImageIcon size={20} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {coverFile ? coverFile.name : 'Bild auswählen'}
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
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl btn-ghost">
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-3 rounded-xl btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Speichern
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracks Modal */}
      <AnimatePresence>
        {showTracksModal && selectedPlaylist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowTracksModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl glass rounded-2xl p-6 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-gradient">
                  {selectedPlaylist.name} - Tracks
                </h2>
                <button onClick={() => setShowTracksModal(false)} className="p-2 rounded-lg hover:bg-muted/50">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Current Tracks */}
                <div>
                  <h3 className="text-sm text-muted-foreground mb-3">In Playlist ({playlistTracks.length})</h3>
                  <div className="space-y-2">
                    {playlistTracks.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">Keine Tracks in dieser Playlist</p>
                    ) : (
                      playlistTracks.map((pt) => (
                        <div key={pt.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                          <GripVertical size={16} className="text-muted-foreground" />
                          <div className="w-10 h-10 rounded bg-muted/30 flex items-center justify-center overflow-hidden">
                            {pt.track?.cover_url ? (
                              <img src={pt.track.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Music size={16} className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body truncate">{pt.track?.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{pt.track?.artist}</p>
                          </div>
                          <button
                            onClick={() => removeTrackFromPlaylist(pt.id)}
                            className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Available Tracks */}
                <div>
                  <h3 className="text-sm text-muted-foreground mb-3">Verfügbare Tracks ({availableTracks.length})</h3>
                  <div className="space-y-2">
                    {availableTracks.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground text-sm">Alle Tracks bereits hinzugefügt</p>
                    ) : (
                      availableTracks.map((track) => (
                        <div key={track.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/30 hover:bg-muted/20 transition-colors">
                          <div className="w-10 h-10 rounded bg-muted/30 flex items-center justify-center overflow-hidden">
                            {track.cover_url ? (
                              <img src={track.cover_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Music size={16} className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <button
                            onClick={() => addTrackToPlaylist(track.id)}
                            className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
