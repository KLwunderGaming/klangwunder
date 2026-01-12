import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  Sliders,
  Music2,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { AudioVisualizer } from './AudioVisualizer';
import { EqualizerPanel } from './EqualizerPanel';
import { EffectsPanel } from './EffectsPanel';
import type { VisualizerMode } from '@/types/music';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  const {
    isPlaying,
    currentTrack,
    queue,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playNext,
    playPrevious,
    playTrack,
    removeFromQueue,
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<'queue' | 'eq' | 'effects' | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('spectrum');

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Backdrop for expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Player */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed bottom-0 left-0 right-0 z-50 ${
          isExpanded ? 'bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[480px]' : ''
        }`}
      >
        <div className={`glass-strong rounded-t-2xl ${isExpanded ? 'rounded-b-2xl' : ''} overflow-hidden`}>
          {/* Progress bar (thin, at top) */}
          <div className="h-1 bg-muted relative">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Main player content */}
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Track info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
                  <Music2 className="w-6 h-6 text-foreground/50" />
                </div>
                <div className="min-w-0">
                  <p className="font-body font-semibold text-sm truncate">{currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={playPrevious}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SkipBack size={20} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-primary text-primary-foreground glow-primary"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={playNext}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SkipForward size={20} />
                </motion.button>
              </div>

              {/* Volume (desktop) */}
              <div className="hidden md:flex items-center gap-2">
                <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 player-slider"
                />
              </div>

              {/* Expand button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </motion.button>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {/* Seek bar */}
                    <div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        step="0.1"
                        value={currentTime}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="w-full player-slider"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Visualizer */}
                    <div className="flex justify-center">
                      <AudioVisualizer mode={visualizerMode} width={420} height={60} />
                    </div>

                    {/* Secondary controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={toggleShuffle}
                          className={`p-2 rounded-lg transition-colors ${
                            isShuffled ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Shuffle size={18} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={cycleRepeat}
                          className={`p-2 rounded-lg transition-colors ${
                            repeatMode !== 'off' ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-1">
                        {(['spectrum', 'waveform', 'off'] as VisualizerMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setVisualizerMode(mode)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              visualizerMode === mode
                                ? 'bg-primary/20 text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {mode === 'off' ? 'Off' : mode === 'spectrum' ? 'Spectrum' : 'Wave'}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActivePanel(activePanel === 'queue' ? null : 'queue')}
                          className={`p-2 rounded-lg transition-colors ${
                            activePanel === 'queue' ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <ListMusic size={18} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActivePanel(activePanel === 'eq' ? null : 'eq')}
                          className={`p-2 rounded-lg transition-colors ${
                            activePanel === 'eq' ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Sliders size={18} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setActivePanel(activePanel === 'effects' ? null : 'effects')}
                          className={`p-2 rounded-lg transition-colors ${
                            activePanel === 'effects' ? 'text-primary bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Effects"
                        >
                          <span className="text-xs font-bold">FX</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Panels */}
                    <AnimatePresence mode="wait">
                      {activePanel === 'queue' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="glass rounded-xl p-4 max-h-60 overflow-y-auto"
                        >
                          <h4 className="font-body text-sm font-semibold mb-3">Warteschlange</h4>
                          {queue.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Keine Tracks in der Warteschlange</p>
                          ) : (
                            <div className="space-y-2">
                              {queue.map((track, index) => (
                                <div
                                  key={`${track.id}-${index}`}
                                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                    track.id === currentTrack?.id
                                      ? 'bg-primary/20'
                                      : 'hover:bg-muted/50'
                                  }`}
                                  onClick={() => playTrack(track)}
                                >
                                  <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{track.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromQueue(track.id);
                                    }}
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activePanel === 'eq' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <EqualizerPanel />
                        </motion.div>
                      )}

                      {activePanel === 'effects' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <EffectsPanel />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}
