import React, { useState } from 'react';
import { Waves, Sparkles } from 'lucide-react';

interface StartSessionOverlayProps {
  onStart: () => void;
}

export const StartSessionOverlay: React.FC<StartSessionOverlayProps> = ({ onStart }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onStart();
    }, 600); // Wait for fade-out transition duration
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0B0F17] transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Intro Card Container */}
      <div className="max-w-sm w-full text-center space-y-8 relative z-10 animate-fade-in px-4">
        {/* Animated Brand Logo */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-2xl shadow-cyan-500/20">
          <Waves className="w-10 h-10 animate-pulse stroke-[2.2]" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider">
            FOCUS WAVE
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed max-w-xs mx-auto">
            Tu espacio de sonido ambiental, concentración y calma.
          </p>
        </div>

        {/* Enter Button */}
        <div className="pt-2">
          <button
            id="enter-app-btn"
            onClick={handleEnter}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group"
          >
            <span>Entrar</span>
            <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
