import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Music, 
  ListMusic, 
  FileText, 
  Users,
  TrendingUp,
  Eye,
  Activity
} from 'lucide-react';

interface Stats {
  totalTracks: number;
  totalPlaylists: number;
  totalSections: number;
  visibleSections: number;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalTracks: 0,
    totalPlaylists: 0,
    totalSections: 0,
    visibleSections: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [tracksResult, playlistsResult, sectionsResult] = await Promise.all([
        supabase.from('tracks').select('id', { count: 'exact', head: true }),
        supabase.from('playlists').select('id', { count: 'exact', head: true }),
        (supabase.from('content_sections') as any).select('id, is_visible')
      ]);

      const sections = sectionsResult.data || [];
      
      setStats({
        totalTracks: tracksResult.count || 0,
        totalPlaylists: playlistsResult.count || 0,
        totalSections: sections.length,
        visibleSections: sections.filter((s: any) => s.is_visible).length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Tracks', 
      value: stats.totalTracks, 
      icon: Music, 
      color: 'from-purple-500 to-violet-600',
      description: 'Musikstücke in der Bibliothek'
    },
    { 
      label: 'Playlists', 
      value: stats.totalPlaylists, 
      icon: ListMusic, 
      color: 'from-pink-500 to-rose-600',
      description: 'Kuratierte Sammlungen'
    },
    { 
      label: 'Sektionen', 
      value: stats.totalSections, 
      icon: FileText, 
      color: 'from-cyan-500 to-blue-600',
      description: 'Inhaltsbereiche'
    },
    { 
      label: 'Sichtbar', 
      value: stats.visibleSections, 
      icon: Eye, 
      color: 'from-emerald-500 to-green-600',
      description: 'Aktive Sektionen'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Willkommen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 30% 50%, hsl(var(--primary)), transparent 50%)'
          }}
        />
        <div className="relative z-10">
          <h2 className="font-display text-3xl md:text-4xl text-gradient mb-3">
            Willkommen zurück! 👋
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Hier kannst du alle Inhalte deiner Klangwunder-Webseite verwalten. 
            Bearbeite Texte, füge neue Tracks hinzu oder passe das Design an.
          </p>
        </div>
      </motion.div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl p-6 relative overflow-hidden group hover:border-primary/30 transition-colors"
          >
            {/* Background Gradient */}
            <div 
              className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${stat.color}`}
            />
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <motion.p 
                  className="font-display text-4xl"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                >
                  {isLoading ? '-' : stat.value}
                </motion.p>
                <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} opacity-80`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Schnellaktionen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-display text-xl mb-4 flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          Schnellaktionen
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Music size={20} className="text-primary" />
            <div className="text-left">
              <p className="font-medium">Track hinzufügen</p>
              <p className="text-xs text-muted-foreground">Neuen Song hochladen</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText size={20} className="text-primary" />
            <div className="text-left">
              <p className="font-medium">Inhalte bearbeiten</p>
              <p className="text-xs text-muted-foreground">Texte anpassen</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ListMusic size={20} className="text-primary" />
            <div className="text-left">
              <p className="font-medium">Playlist erstellen</p>
              <p className="text-xs text-muted-foreground">Songs gruppieren</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Tipps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-4 border-l-4 border-primary/50"
      >
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">💡 Tipp:</strong> Nutze die Seitenleiste, um zwischen den verschiedenen 
          Bereichen zu navigieren. Unter "Seiten & Inhalte" kannst du alle Texte deiner Webseite bearbeiten.
        </p>
      </motion.div>
    </div>
  );
}