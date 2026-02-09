import { useState, useRef, useCallback, useEffect } from 'react';
import type { Track, EQBand, AudioEffects, RepeatMode } from '@/types/music';

const DEFAULT_EQ_BANDS: EQBand[] = [
  { frequency: 32, gain: 0, label: '32' },
  { frequency: 64, gain: 0, label: '64' },
  { frequency: 125, gain: 0, label: '125' },
  { frequency: 250, gain: 0, label: '250' },
  { frequency: 500, gain: 0, label: '500' },
  { frequency: 1000, gain: 0, label: '1K' },
  { frequency: 2000, gain: 0, label: '2K' },
  { frequency: 4000, gain: 0, label: '4K' },
  { frequency: 8000, gain: 0, label: '8K' },
  { frequency: 16000, gain: 0, label: '16K' },
];

const DEFAULT_EFFECTS: AudioEffects = {
  reverb: 0,
  delay: 0,
  delayTime: 0.3,
  compressor: {
    threshold: -24,
    ratio: 12,
    attack: 0.003,
    release: 0.25,
  },
  filter: {
    type: 'lowpass',
    frequency: 20000,
    Q: 1,
  },
  stereoPanner: 0,
};

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [eqBands, setEqBands] = useState<EQBand[]>(DEFAULT_EQ_BANDS);
  const [effects, setEffects] = useState<AudioEffects>(DEFAULT_EFFECTS);
  const [analyserData, setAnalyserData] = useState<Uint8Array>(new Uint8Array(128));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const stereoPannerRef = useRef<StereoPannerNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const originalQueueRef = useRef<Track[]>([]);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      // Source
      sourceRef.current = ctx.createMediaElementSource(audioRef.current);

      // Analyser
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;

      // Gain node
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.value = volume;

      // EQ filters
      eqFiltersRef.current = DEFAULT_EQ_BANDS.map((band) => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = band.frequency;
        filter.Q.value = 1;
        filter.gain.value = band.gain;
        return filter;
      });

      // Delay
      delayNodeRef.current = ctx.createDelay(1);
      delayNodeRef.current.delayTime.value = effects.delayTime;
      delayGainRef.current = ctx.createGain();
      delayGainRef.current.gain.value = effects.delay;

      // Create reverb impulse response
      const createReverbImpulse = () => {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * 2;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const channelData = impulse.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
          }
        }
        return impulse;
      };

      convolverRef.current = ctx.createConvolver();
      convolverRef.current.buffer = createReverbImpulse();
      reverbGainRef.current = ctx.createGain();
      reverbGainRef.current.gain.value = effects.reverb;
      dryGainRef.current = ctx.createGain();
      dryGainRef.current.gain.value = 1 - effects.reverb;

      // Compressor
      compressorRef.current = ctx.createDynamicsCompressor();
      compressorRef.current.threshold.value = effects.compressor.threshold;
      compressorRef.current.ratio.value = effects.compressor.ratio;
      compressorRef.current.attack.value = effects.compressor.attack;
      compressorRef.current.release.value = effects.compressor.release;

      // Filter
      filterRef.current = ctx.createBiquadFilter();
      filterRef.current.type = effects.filter.type;
      filterRef.current.frequency.value = effects.filter.frequency;
      filterRef.current.Q.value = effects.filter.Q;

      // Stereo panner
      stereoPannerRef.current = ctx.createStereoPanner();
      stereoPannerRef.current.pan.value = effects.stereoPanner;

      // Connect nodes: source -> EQ -> compressor -> filter -> delay/reverb -> stereo -> gain -> analyser -> destination
      let lastNode: AudioNode = sourceRef.current;

      // EQ chain
      eqFiltersRef.current.forEach((filter) => {
        lastNode.connect(filter);
        lastNode = filter;
      });

      // Compressor
      lastNode.connect(compressorRef.current);
      lastNode = compressorRef.current;

      // Filter
      lastNode.connect(filterRef.current);
      lastNode = filterRef.current;

      // Delay (parallel)
      lastNode.connect(delayNodeRef.current);
      delayNodeRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(lastNode);

      // Reverb (parallel dry/wet)
      lastNode.connect(dryGainRef.current);
      lastNode.connect(convolverRef.current);
      convolverRef.current.connect(reverbGainRef.current);

      // Stereo panner
      dryGainRef.current.connect(stereoPannerRef.current);
      reverbGainRef.current.connect(stereoPannerRef.current);

      // Gain
      stereoPannerRef.current.connect(gainNodeRef.current);

      // Analyser
      gainNodeRef.current.connect(analyserRef.current);

      // Destination
      analyserRef.current.connect(ctx.destination);
    }
  }, [volume, effects]);

  const updateAnalyser = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      setAnalyserData(dataArray);
    }
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateAnalyser);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateAnalyser);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateAnalyser]);



  const playTrack = useCallback(async (track: Track) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener('ended', () => {
        handleTrackEnd();
      });
    }

    // Get audio URL - support both database tracks (audio_url) and local files
    const audioUrl = track.audio_url;
    
    if (!audioUrl) {
      console.error('No audio URL for track:', track.title);
      return;
    }

    audioRef.current.src = audioUrl;
    setCurrentTrack(track);
    
    initAudioContext();
    
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      
      // Update Media Session for background playback on mobile
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || '',
          artwork: track.cover_url
            ? [
                { src: track.cover_url, sizes: '96x96', type: 'image/png' },
                { src: track.cover_url, sizes: '128x128', type: 'image/png' },
                { src: track.cover_url, sizes: '192x192', type: 'image/png' },
                { src: track.cover_url, sizes: '256x256', type: 'image/png' },
                { src: track.cover_url, sizes: '384x384', type: 'image/png' },
                { src: track.cover_url, sizes: '512x512', type: 'image/png' },
              ]
            : [],
        });
      }
    } catch (error) {
      console.log('Playback error:', error);
    }
  }, [initAudioContext]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one' && currentTrack) {
      playTrack(currentTrack);
    } else {
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
      if (currentIndex < queue.length - 1) {
        playTrack(queue[currentIndex + 1]);
      } else if (repeatMode === 'all' && queue.length > 0) {
        playTrack(queue[0]);
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentTrack, queue, repeatMode, playTrack]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Playback error:', error);
      }
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : value;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = prev ? volume : 0;
      }
      return !prev;
    });
  }, [volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      if (!prev) {
        originalQueueRef.current = [...queue];
        const shuffled = [...queue].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
      } else {
        setQueue(originalQueueRef.current);
      }
      return !prev;
    });
  }, [queue]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const playNext = useCallback(() => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      playTrack(queue[0]);
    }
  }, [currentTrack, queue, repeatMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      playTrack(queue[queue.length - 1]);
    }
  }, [currentTrack, currentTime, queue, repeatMode, playTrack]);

  // Media Session API for lock screen / background playback controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play();
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevious();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
        setCurrentTime(details.seekTime);
      }
    });
  }, [playNext, playPrevious]);

  const setEqBandGain = useCallback((index: number, gain: number) => {
    setEqBands(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], gain };
      return updated;
    });
    if (eqFiltersRef.current[index]) {
      eqFiltersRef.current[index].gain.value = gain;
    }
  }, []);

  const updateEffects = useCallback((newEffects: Partial<AudioEffects>) => {
    setEffects(prev => {
      const updated = { ...prev, ...newEffects };
      
      if (newEffects.reverb !== undefined && reverbGainRef.current && dryGainRef.current) {
        reverbGainRef.current.gain.value = newEffects.reverb;
        dryGainRef.current.gain.value = 1 - newEffects.reverb;
      }
      
      if (newEffects.delay !== undefined && delayGainRef.current) {
        delayGainRef.current.gain.value = newEffects.delay;
      }
      
      if (newEffects.delayTime !== undefined && delayNodeRef.current) {
        delayNodeRef.current.delayTime.value = newEffects.delayTime;
      }
      
      if (newEffects.compressor && compressorRef.current) {
        if (newEffects.compressor.threshold !== undefined) {
          compressorRef.current.threshold.value = newEffects.compressor.threshold;
        }
        if (newEffects.compressor.ratio !== undefined) {
          compressorRef.current.ratio.value = newEffects.compressor.ratio;
        }
        if (newEffects.compressor.attack !== undefined) {
          compressorRef.current.attack.value = newEffects.compressor.attack;
        }
        if (newEffects.compressor.release !== undefined) {
          compressorRef.current.release.value = newEffects.compressor.release;
        }
      }
      
      if (newEffects.filter && filterRef.current) {
        if (newEffects.filter.type !== undefined) {
          filterRef.current.type = newEffects.filter.type;
        }
        if (newEffects.filter.frequency !== undefined) {
          filterRef.current.frequency.value = newEffects.filter.frequency;
        }
        if (newEffects.filter.Q !== undefined) {
          filterRef.current.Q.value = newEffects.filter.Q;
        }
      }
      
      if (newEffects.stereoPanner !== undefined && stereoPannerRef.current) {
        stereoPannerRef.current.pan.value = newEffects.stereoPanner;
      }
      
      return updated;
    });
  }, []);

  const addToQueue = useCallback((tracks: Track[]) => {
    setQueue(prev => [...prev, ...tracks]);
    originalQueueRef.current = [...originalQueueRef.current, ...tracks];
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    originalQueueRef.current = [];
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue(prev => prev.filter(t => t.id !== trackId));
    originalQueueRef.current = originalQueueRef.current.filter(t => t.id !== trackId);
  }, []);

  return {
    isPlaying,
    currentTrack,
    queue,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    eqBands,
    effects,
    analyserData,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playNext,
    playPrevious,
    setEqBandGain,
    updateEffects,
    addToQueue,
    clearQueue,
    removeFromQueue,
    setQueue,
  };
}
