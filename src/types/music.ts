export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  audio: string;
  genre: string;
  bpm: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  trackIds: string[];
}

export interface TracksData {
  tracks: Track[];
  playlists: Playlist[];
}

export interface EQBand {
  frequency: number;
  gain: number;
  label: string;
}

export interface AudioEffects {
  reverb: number;
  delay: number;
  delayTime: number;
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  filter: {
    type: BiquadFilterType;
    frequency: number;
    Q: number;
  };
  stereoPanner: number;
}

export interface EffectPreset {
  id: string;
  name: string;
  eq: number[];
  effects: AudioEffects;
}

export type RepeatMode = 'off' | 'all' | 'one';
export type VisualizerMode = 'spectrum' | 'waveform' | 'off';
