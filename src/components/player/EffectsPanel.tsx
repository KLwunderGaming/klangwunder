import { useAudio } from '@/contexts/AudioContext';
import { useState } from 'react';

export function EffectsPanel() {
  const { effects, updateEffects } = useAudio();
  const [activeTab, setActiveTab] = useState<'reverb' | 'delay' | 'compressor' | 'filter' | 'stereo'>('reverb');

  return (
    <div className="glass rounded-xl p-4">
      <h4 className="font-body text-sm font-semibold mb-4 text-foreground">Audio Effekte</h4>
      
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted/50 rounded-lg p-1">
        {(['reverb', 'delay', 'compressor', 'filter', 'stereo'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Reverb */}
      {activeTab === 'reverb' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Wet/Dry Mix</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effects.reverb}
              onChange={(e) => updateEffects({ reverb: parseFloat(e.target.value) })}
              className="w-full player-slider"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/70 mt-1">
              <span>Dry</span>
              <span>{(effects.reverb * 100).toFixed(0)}%</span>
              <span>Wet</span>
            </div>
          </div>
        </div>
      )}

      {/* Delay */}
      {activeTab === 'delay' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Delay Amount</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effects.delay}
              onChange={(e) => updateEffects({ delay: parseFloat(e.target.value) })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{(effects.delay * 100).toFixed(0)}%</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Delay Time</label>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={effects.delayTime}
              onChange={(e) => updateEffects({ delayTime: parseFloat(e.target.value) })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{(effects.delayTime * 1000).toFixed(0)}ms</span>
          </div>
        </div>
      )}

      {/* Compressor */}
      {activeTab === 'compressor' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Threshold</label>
            <input
              type="range"
              min="-50"
              max="0"
              step="1"
              value={effects.compressor.threshold}
              onChange={(e) => updateEffects({
                compressor: { ...effects.compressor, threshold: parseFloat(e.target.value) }
              })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{effects.compressor.threshold}dB</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ratio</label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={effects.compressor.ratio}
              onChange={(e) => updateEffects({
                compressor: { ...effects.compressor, ratio: parseFloat(e.target.value) }
              })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{effects.compressor.ratio}:1</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Attack</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effects.compressor.attack}
              onChange={(e) => updateEffects({
                compressor: { ...effects.compressor, attack: parseFloat(e.target.value) }
              })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{(effects.compressor.attack * 1000).toFixed(0)}ms</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Release</label>
            <input
              type="range"
              min="0.01"
              max="1"
              step="0.01"
              value={effects.compressor.release}
              onChange={(e) => updateEffects({
                compressor: { ...effects.compressor, release: parseFloat(e.target.value) }
              })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{(effects.compressor.release * 1000).toFixed(0)}ms</span>
          </div>
        </div>
      )}

      {/* Filter */}
      {activeTab === 'filter' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Filter Type</label>
            <select
              value={effects.filter.type}
              onChange={(e) => updateEffects({
                filter: { ...effects.filter, type: e.target.value as BiquadFilterType }
              })}
              className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm text-foreground"
            >
              <option value="lowpass">Lowpass</option>
              <option value="highpass">Highpass</option>
              <option value="bandpass">Bandpass</option>
              <option value="notch">Notch</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Frequency</label>
            <input
              type="range"
              min="20"
              max="20000"
              step="10"
              value={effects.filter.frequency}
              onChange={(e) => updateEffects({
                filter: { ...effects.filter, frequency: parseFloat(e.target.value) }
              })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{effects.filter.frequency}Hz</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Q (Resonance)</label>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={effects.filter.Q}
              onChange={(e) => updateEffects({
                filter: { ...effects.filter, Q: parseFloat(e.target.value) }
              })}
              className="w-full player-slider"
            />
            <span className="text-[10px] text-muted-foreground/70">{effects.filter.Q.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Stereo Panner */}
      {activeTab === 'stereo' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Stereo Pan</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={effects.stereoPanner}
              onChange={(e) => updateEffects({ stereoPanner: parseFloat(e.target.value) })}
              className="w-full player-slider"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/70 mt-1">
              <span>L</span>
              <span>{effects.stereoPanner === 0 ? 'Center' : effects.stereoPanner < 0 ? `L ${Math.abs(effects.stereoPanner * 100).toFixed(0)}%` : `R ${(effects.stereoPanner * 100).toFixed(0)}%`}</span>
              <span>R</span>
            </div>
          </div>
        </div>
      )}

      {/* Presets */}
      <div className="border-t border-border/50 mt-4 pt-4">
        <p className="text-xs text-muted-foreground mb-2">Presets</p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Clean', effects: { reverb: 0, delay: 0, stereoPanner: 0 } },
            { name: 'Ambient', effects: { reverb: 0.6, delay: 0.3, delayTime: 0.5 } },
            { name: 'Club', effects: { reverb: 0.2, delay: 0.1, delayTime: 0.15 } },
            { name: 'Wide', effects: { reverb: 0.3, stereoPanner: 0 } },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => updateEffects(preset.effects)}
              className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
