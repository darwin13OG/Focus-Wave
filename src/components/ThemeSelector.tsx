import React from 'react';
import { Palette } from 'lucide-react';
import { THEME_PALETTES } from '../data/constants';
import { ThemePalette, ThemeId } from '../types';

interface ThemeSelectorProps {
  currentTheme: ThemePalette;
  onSelectTheme: (theme: ThemePalette) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
      <span className="p-1 text-slate-400" title="Paletas de color">
        <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </span>
      {Object.values(THEME_PALETTES).map((t) => {
        const isSelected = currentTheme.id === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t)}
            title={t.name}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isSelected
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${t.accentColor}`} />
            <span className="hidden md:inline">{t.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};
