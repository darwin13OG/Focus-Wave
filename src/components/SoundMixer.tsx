import React, { useState } from 'react';
import {
  Play,
  Pause,
  VolumeX,
  Volume2,
  Shuffle,
  BookmarkPlus,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SoundChannel, SoundPreset, ThemePalette } from '../types';
import { SoundCard } from './SoundCard';
import { DEFAULT_PRESETS } from '../data/constants';

interface SoundMixerProps {
  channels: SoundChannel[];
  theme: ThemePalette;
  isMasterMuted: boolean;
  onVolumeChange: (id: SoundChannel['id'], volume: number) => void;
  onToggleMute: (id: SoundChannel['id']) => void;
  onToggleMasterMute: () => void;
  onApplyPreset: (volumes: Record<SoundChannel['id'], number>) => void;
  onRandomMix: () => void;
  onResetAll: () => void;
}

export const SoundMixer: React.FC<SoundMixerProps> = ({
  channels,
  theme,
  isMasterMuted,
  onVolumeChange,
  onToggleMute,
  onToggleMasterMute,
  onApplyPreset,
  onRandomMix,
  onResetAll,
}) => {
  const [customPresets, setCustomPresets] = useState<SoundPreset[]>(() => {
    try {
      const saved = localStorage.getItem('focus_wave_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const activeCount = channels.filter((c) => c.volume > 0 && !c.isMuted).length;

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const volumes: Record<string, number> = {} as Record<SoundChannel['id'], number>;
    channels.forEach((c) => {
      volumes[c.id] = c.volume;
    });

    const newPreset: SoundPreset = {
      id: `custom_${Date.now()}`,
      name: `✨ ${newPresetName.trim()}`,
      description: 'Mezcla personalizada guardada',
      volumes,
      isCustom: true,
    };

    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    try {
      localStorage.setItem('focus_wave_custom_presets', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save preset:', e);
    }

    setNewPresetName('');
    setShowSaveModal(false);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('focus_wave_custom_presets', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update presets:', e);
    }
  };

  return (
    <div id="sound-mixer-container" className="space-y-6">
      {/* Control Bar: Presets & Master Controls */}
      <div className={`p-5 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} space-y-4`}>
        {/* Top row: Master Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg tracking-wide text-white flex items-center gap-2">
                <span>Mezclador de Sonidos</span>
                {activeCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono whitespace-nowrap shrink-0 inline-block">
                    {activeCount} activo{activeCount > 1 ? 's' : ''}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Master Mute / Unmute */}
            <button
              id="master-mute-btn"
              onClick={onToggleMasterMute}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isMasterMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800/60 text-slate-200 hover:bg-slate-700/80 border border-slate-700/50'
              }`}
            >
              {isMasterMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Silenciado</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Silenciar Todo</span>
                </>
              )}
            </button>

            {/* Random Preset Surprise */}
            <button
              id="random-mix-btn"
              onClick={onRandomMix}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-500/30 transition-all shadow-sm"
              title="Genera una combinación de ambiente al azar"
            >
              <Shuffle className="w-4 h-4 text-cyan-400" />
              <span>Mezcla Aleatoria</span>
            </button>

            {/* Reset / Clear All */}
            {activeCount > 0 && (
              <button
                id="reset-all-btn"
                onClick={onResetAll}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
              >
                Apagar Todos
              </button>
            )}

            {/* Save Custom Preset */}
            <button
              id="save-preset-btn"
              onClick={() => setShowSaveModal(true)}
              disabled={activeCount === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeCount > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-slate-800/30 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Guardar Mezcla</span>
            </button>
          </div>
        </div>

        {/* Presets Row */}
        <div className="pt-2 border-t border-slate-800/60">
          <p className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets de Ambiente Recomendados:
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DEFAULT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => onApplyPreset(preset.volumes)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/50 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 border border-slate-700/50 hover:border-cyan-500/30 transition-all"
              >
                {preset.name}
              </button>
            ))}

            {/* Custom Presets */}
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onApplyPreset(preset.volumes)}
                className="group flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <span>{preset.name}</span>
                <button
                  onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                  title="Eliminar mezcla guardada"
                  className="opacity-60 hover:opacity-100 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of 6 Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <SoundCard
            key={channel.id}
            channel={channel}
            theme={theme}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />
        ))}
      </div>

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} space-y-4 shadow-2xl`}>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-emerald-400" /> Guardar Mezcla Personalizada
            </h3>
            <p className="text-xs text-slate-400">
              Asigna un nombre a tu configuración de volúmenes actual para cargarla rápidamente cuando quieras.
            </p>
            <form onSubmit={handleSavePreset} className="space-y-4">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Ej. Mi Estudio Nocturno"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newPresetName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
