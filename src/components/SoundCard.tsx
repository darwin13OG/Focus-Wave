import React from 'react';
import {
  CloudRain,
  CloudLightning,
  Coffee,
  Flame,
  Waves,
  Wind,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { SoundChannel, ThemePalette } from '../types';

interface SoundCardProps {
  channel: SoundChannel;
  theme: ThemePalette;
  onVolumeChange: (id: SoundChannel['id'], volume: number) => void;
  onToggleMute: (id: SoundChannel['id']) => void;
}

export const SoundCard: React.FC<SoundCardProps> = ({
  channel,
  theme,
  onVolumeChange,
  onToggleMute,
}) => {
  const renderIcon = () => {
    const props = { className: 'w-6 h-6 transition-transform duration-300' };
    switch (channel.id) {
      case 'rain':
        return <CloudRain {...props} />;
      case 'thunder':
        return <CloudLightning {...props} />;
      case 'coffee':
        return <Coffee {...props} />;
      case 'fireplace':
        return <Flame {...props} />;
      case 'ocean':
        return <Waves {...props} />;
      case 'wind':
        return <Wind {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  const isActive = channel.volume > 0 && !channel.isMuted;

  return (
    <div
      id={`sound-card-${channel.id}`}
      className={`relative group rounded-2xl p-3.5 sm:p-4.5 border transition-all duration-300 ${
        isActive
          ? `${theme.cardBg} ${channel.color} border-opacity-60 shadow-lg shadow-black/25 ring-1 ring-white/10 scale-[1.008]`
          : `${theme.cardBg} ${theme.cardBorder} hover:border-slate-700/80`
      }`}
    >
      {/* Background glow when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col h-full justify-between gap-3 sm:gap-3.5">
        {/* Header row: Icon, Name & Equalizer/Mute */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 ${
                isActive
                  ? 'bg-white/15 text-white shadow-inner scale-105'
                  : 'bg-slate-800/40 text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {renderIcon()}
            </div>
            <div className="min-w-0">
              <h3 className={`font-semibold text-sm sm:text-base tracking-wide truncate ${isActive ? 'text-white' : theme.textColor}`}>
                {channel.name}
              </h3>
              <p className={`text-xs ${theme.mutedText} truncate`}>
                {channel.description}
              </p>
            </div>
          </div>

          {/* Quick Mute/Unmute button */}
          <button
            id={`mute-btn-${channel.id}`}
            onClick={() => onToggleMute(channel.id)}
            title={channel.isMuted ? 'Activar sonido' : 'Silenciar canal'}
            className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
              channel.isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : isActive
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-slate-800/30 text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            {channel.isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Active Equalizer Bar Indicator */}
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-400 uppercase">
            Volumen
          </span>
          <div className="flex items-center gap-1.5">
            {isActive && (
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-full bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-2/3 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-full bg-current rounded-full animate-bounce" />
              </div>
            )}
            <span
              className={`font-mono text-xs ${
                isActive ? 'text-white font-semibold' : 'text-slate-500'
              }`}
            >
              {channel.isMuted ? '0%' : `${channel.volume}%`}
            </span>
          </div>
        </div>

        {/* Volume Slider with comfortable touch hit area */}
        <div className="relative flex items-center py-1">
          <input
            id={`volume-slider-${channel.id}`}
            type="range"
            min="0"
            max="100"
            value={channel.isMuted ? 0 : channel.volume}
            onChange={(e) => onVolumeChange(channel.id, Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>
    </div>
  );
};
