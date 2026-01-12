import { useAudio } from '@/contexts/AudioContext';
import type { VisualizerMode } from '@/types/music';

interface AudioVisualizerProps {
  mode: VisualizerMode;
  width?: number;
  height?: number;
}

export function AudioVisualizer({ mode, width = 300, height = 60 }: AudioVisualizerProps) {
  const { analyserData, isPlaying } = useAudio();

  if (mode === 'off') return null;

  const barCount = 32;
  const dataStep = Math.floor(analyserData.length / barCount);

  if (mode === 'spectrum') {
    return (
      <div 
        className="flex items-end justify-center gap-[2px] bg-background/30 rounded-lg p-2"
        style={{ width, height }}
      >
        {Array.from({ length: barCount }).map((_, i) => {
          const value = isPlaying ? analyserData[i * dataStep] || 0 : 0;
          const barHeight = Math.max(2, (value / 255) * (height - 16));
          
          return (
            <div
              key={i}
              className="visualizer-bar flex-1"
              style={{
                height: barHeight,
                opacity: 0.6 + (value / 255) * 0.4,
              }}
            />
          );
        })}
      </div>
    );
  }

  if (mode === 'waveform') {
    const points = Array.from({ length: barCount }).map((_, i) => {
      const value = isPlaying ? analyserData[i * dataStep] || 128 : 128;
      const y = height / 2 - ((value - 128) / 128) * (height / 2 - 8);
      const x = (i / (barCount - 1)) * width;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg 
        width={width} 
        height={height} 
        className="bg-background/30 rounded-lg"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return null;
}
