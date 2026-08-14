import React, { useState, useEffect } from 'react';
import { Wind, X, Play, Pause } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface BreatheModalProps {
  onClose: () => void;
}

export const BreatheModal: React.FC<BreatheModalProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            soundEngine.playPomodoroChime();
            return 7;
          } else if (phase === 'hold') {
            setPhase('exhale');
            soundEngine.playPomodoroChime();
            return 8;
          } else {
            setPhase('inhale');
            soundEngine.playPomodoroChime();
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#121824] border border-slate-800 text-center space-y-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" /> Respiro Consciente 4-7-8
          </h3>
          <p className="text-xs text-slate-400">Técnica para reducir la ansiedad y calmar la mente</p>
        </div>

        {/* Breathing Animation Circle */}
        <div className="relative my-8 flex items-center justify-center h-56">
          <div
            className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-1000 transform ${
              phase === 'inhale'
                ? 'scale-125 bg-cyan-500/20 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/30'
                : phase === 'hold'
                ? 'scale-125 bg-indigo-500/20 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/30'
                : 'scale-90 bg-emerald-500/10 border-2 border-emerald-500/40'
            }`}
          >
            <span className="font-mono text-4xl font-bold text-white">{seconds}s</span>
            <span className="text-xs font-semibold uppercase tracking-wider mt-1 text-slate-300">
              {phase === 'inhale' ? 'Inhala' : phase === 'hold' ? 'Mantén' : 'Exhala'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 italic">
          {phase === 'inhale'
            ? 'Inhala suavemente por la nariz...'
            : phase === 'hold'
            ? 'Sostén el aire en tus pulmones...'
            : 'Exhala completamente por la boca...'}
        </p>

        <div className="pt-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-6 py-2.5 rounded-xl font-medium text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all flex items-center gap-2 mx-auto"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pausar ejercicio' : 'Reanudar ejercicio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
