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
    <div id="sound-mixer-container" className="space-y-3.5 sm:space-y-5">
      {/* Sleek Compact Control Strip: Master Actions & Horizontal Presets */}
      <div className={`p-3 sm:p-4 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} space-y-3 shadow-md`}>
        {/* Top row: Section title / active badge & Compact Master Action Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Active status indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="font-bold text-sm sm:text-base tracking-wide text-white whitespace-nowrap">
                Mezclador
              </h2>
              {activeCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono whitespace-nowrap">
                  {activeCount} activo{activeCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
            {/* Master Mute / Unmute */}
            <button
              id="master-mute-btn"
              onClick={onToggleMasterMute}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium transition-all ${
                isMasterMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 ring-1 ring-rose-500/30'
                  : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 border border-slate-700/60'
              }`}
              title={isMasterMuted ? 'Reanudar todos los sonidos' : 'Silenciar todo temporalmente'}
            >
              {isMasterMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="whitespace-nowrap">Silenciado</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="hidden xs:inline whitespace-nowrap">Silenciar</span>
                </>
              )}
            </button>

            {/* Random Preset Generator */}
            <button
              id="random-mix-btn"
              onClick={onRandomMix}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-200 border border-cyan-500/30 transition-all shadow-sm shrink-0"
              title="Generar mezcla aleatoria de ambiente"
            >
              <Shuffle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden xs:inline whitespace-nowrap">Aleatorio</span>
            </button>

            {/* Save Custom Preset */}
            <button
              id="save-preset-btn"
              onClick={() => setShowSaveModal(true)}
              disabled={activeCount === 0}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeCount > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-slate-800/30 text-slate-600 border border-slate-800/60 cursor-not-allowed opacity-50'
              }`}
              title="Guardar tu combinación actual como preset"
            >
              <BookmarkPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Guardar</span>
            </button>

            {/* Reset / Clear All */}
            {activeCount > 0 && (
              <button
                id="reset-all-btn"
                onClick={onResetAll}
                className="px-2 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all shrink-0"
                title="Apagar todos los sonidos"
              >
                Apagar
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Presets Carousel Strip */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0 pr-1">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Presets:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 touch-pan-x min-w-0 flex-1">
            {DEFAULT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => onApplyPreset(preset.volumes)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 border border-slate-700/50 hover:border-cyan-500/30 transition-all shrink-0"
              >
                {preset.name}
              </button>
            ))}

            {/* Custom Saved Presets */}
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onApplyPreset(preset.volumes)}
                className="group flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer shrink-0"
              >
                <span>{preset.name}</span>
                <button
                  onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                  title="Eliminar mezcla guardada"
                  className="opacity-60 group-hover:opacity-100 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Sound Channels - Appears directly above the fold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
