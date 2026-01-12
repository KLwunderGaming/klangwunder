import { useAudio } from '@/contexts/AudioContext';
import { motion } from 'framer-motion';

export function EqualizerPanel() {
  const { eqBands, setEqBandGain } = useAudio();

  return (
    <div className="glass rounded-xl p-4">
      <h4 className="font-body text-sm font-semibold mb-4 text-foreground">10-Band Equalizer</h4>
      
      <div className="flex justify-between items-end gap-2 h-40">
        {eqBands.map((band, index) => (
          <div key={band.frequency} className="flex flex-col items-center gap-2">
            <div className="relative h-24 w-6 flex flex-col items-center">
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={band.gain}
                onChange={(e) => setEqBandGain(index, parseFloat(e.target.value))}
                className="eq-slider h-20 w-1.5"
              />
              <motion.div
                className="absolute bottom-0 w-1 bg-gradient-to-t from-primary to-accent rounded-full pointer-events-none"
                style={{
                  height: `${((band.gain + 12) / 24) * 100}%`,
                  opacity: 0.6,
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{band.label}</span>
            <span className="text-[9px] text-muted-foreground/70">
              {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { name: 'Flat', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: 'Bass Boost', values: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
          { name: 'Treble Boost', values: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6] },
          { name: 'Vocal', values: [-2, -1, 0, 2, 4, 4, 3, 0, -1, -2] },
          { name: 'Dance', values: [4, 3, 1, 0, -1, 0, 2, 4, 4, 3] },
        ].map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              preset.values.forEach((val, i) => setEqBandGain(i, val));
            }}
            className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
