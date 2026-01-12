export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  cover_url: string | null;
  audio_url: string | null;
  genre: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  position: number;
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
