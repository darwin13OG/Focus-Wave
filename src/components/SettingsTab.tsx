import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Palette,
  RotateCcw,
  Sliders,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ThemePalette, SoundChannel } from '../types';
import { THEME_PALETTES, DEFAULT_PRESETS } from '../data/constants';
import { soundEngine } from '../audio/soundEngine';

interface SettingsTabProps {
  theme: ThemePalette;
  onSelectTheme: (theme: ThemePalette) => void;
  onApplyPreset: (volumes: Record<SoundChannel['id'], number>) => void;
  onResetAll: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  theme,
  onSelectTheme,
  onApplyPreset,
  onResetAll,
}) => {
  const [masterVolume, setMasterVolume] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | null>(DEFAULT_PRESETS[0].id);

  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    setIsMuted(vol === 0);
    soundEngine.setMasterVolume(vol / 100);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMasterMute(nextMute);
  };

  const handlePresetSelect = (preset: typeof DEFAULT_PRESETS[0]) => {
    setActivePreset(preset.id);
    onApplyPreset(preset.volumes);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" /> Ajustes y Preferencias del Sistema
        </h2>
        <p className="text-xs text-slate-400">
          Personaliza el comportamiento del audio, temas visuales y combinaciones favoritas.
        </p>
      </div>

      {/* Global Audio Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" /> Control de Audio Maestro
        </h3>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <button
            onClick={handleToggleMute}
            className={`p-3 rounded-xl transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Volumen General Maestro</span>
              <span className="text-cyan-400 font-bold">{isMuted ? 'MUTE' : `${masterVolume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : masterVolume}
              onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Presets & Sound Combinations */}
      <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Mezclas y Ambientes Prediseñados
          </h3>
          <button
            onClick={() => {
              setActivePreset(null);
              onResetAll();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs font-medium border border-slate-700/60 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Apagar Sonidos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEFAULT_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{preset.name}</h4>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{preset.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Selection Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" /> Tema de Color Visual
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(THEME_PALETTES).map((t) => {
            const isSelected = theme.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t)}
                className={`p-3 rounded-2xl border transition-all text-center space-y-2 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className={`w-4 h-4 rounded-full ${t.particleColor}`} />
                  <span className={`w-4 h-4 rounded-full ${t.accentColor.replace('text-', 'bg-')}`} />
                </div>
                <p className="text-xs font-semibold text-white truncate">{t.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
