import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  ListMusic, 
  Settings, 
  LogOut, 
  Home,
  Menu,
  X,
  FileText,
  LayoutDashboard,
  CalendarDays,
  Disc3
} from 'lucide-react';
import klangwunderIcon from '@/assets/klangwunder-icon.png';
import { TracksManager } from './TracksManager';
import { PlaylistsManager } from './PlaylistsManager';
import { SettingsManager } from './SettingsManager';
import { ContentManager } from './ContentManager';
import { DashboardOverview } from './DashboardOverview';
import { EventsManager } from './EventsManager';
import { AlbumsManager } from './AlbumsManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'dashboard' | 'content' | 'tracks' | 'albums' | 'playlists' | 'events' | 'settings';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab as Tab);
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'content' as Tab, label: 'Seiten & Inhalte', icon: FileText },
    { id: 'tracks' as Tab, label: 'Tracks', icon: Music },
    { id: 'albums' as Tab, label: 'Alben', icon: Disc3 },
    { id: 'playlists' as Tab, label: 'Playlists', icon: ListMusic },
    { id: 'events' as Tab, label: 'Events', icon: CalendarDays },
    { id: 'settings' as Tab, label: 'Einstellungen', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-3 glass rounded-xl md:hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 glass-strong border-r border-primary/10 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <img
              src={klangwunderIcon}
              alt="Klangwunder"
              className="w-12 h-12 rounded-full"
              style={{ boxShadow: '0 0 20px hsl(var(--primary)/0.3)' }}
            />
            <div>
              <h1 className="font-display text-xl text-gradient">Klangwunder</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon size={20} />
              <span className="font-body">{tab.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary/10 space-y-2">
          <motion.button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
            whileHover={{ x: 5 }}
          >
            <Home size={20} />
            <span className="font-body">Zur Webseite</span>
          </motion.button>
          
          <motion.button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
            whileHover={{ x: 5 }}
          >
            <LogOut size={20} />
            <span className="font-body">Abmelden</span>
          </motion.button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 md:ml-0 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 pt-16 md:pt-0"
          >
            <h1 className="font-display text-3xl md:text-4xl text-gradient mb-2">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-muted-foreground font-body">
              {activeTab === 'dashboard' && 'Übersicht über deine Webseite'}
              {activeTab === 'content' && 'Bearbeite Seiten und Texte'}
              {activeTab === 'tracks' && 'Verwalte einzelne Tracks und Singles'}
              {activeTab === 'albums' && 'Lade komplette Alben mit mehreren Tracks hoch'}
              {activeTab === 'playlists' && 'Erstelle und bearbeite Playlists'}
              {activeTab === 'events' && 'Verwalte deine Konzerte und Events'}
              {activeTab === 'settings' && 'Passe die Webseite an'}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab + '-content'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {activeTab === 'dashboard' && <DashboardOverview onNavigate={handleNavigate} />}
            {activeTab === 'content' && <ContentManager />}
            {activeTab === 'tracks' && <TracksManager />}
            {activeTab === 'albums' && <AlbumsManager />}
            {activeTab === 'playlists' && <PlaylistsManager />}
            {activeTab === 'events' && <EventsManager />}
            {activeTab === 'settings' && <SettingsManager />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
