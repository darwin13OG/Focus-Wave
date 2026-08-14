import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, RefreshCw, Heart } from 'lucide-react';
import { ThemePalette } from '../types';
import { soundEngine } from '../audio/soundEngine';

interface BreatheTabProps {
  theme: ThemePalette;
}

export const BreatheTab: React.FC<BreatheTabProps> = ({ theme }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);

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
            setCycleCount((c) => c + 1);
            soundEngine.playPomodoroChime();
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const resetExercise = () => {
    setPhase('inhale');
    setSeconds(4);
    setCycleCount(0);
    setIsActive(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl text-center space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
          <Wind className="w-3.5 h-3.5" />
          <span>Técnica 4-7-8</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Respiro Consciente & Calma</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Inhala durante 4s, mantén 7s y exhala durante 8s para sincronizar tu ritmo cardíaco y calmar la mente.
        </p>
      </div>

      {/* Animated Breathing Circle Container */}
      <div className="relative my-8 flex items-center justify-center h-64">
        {/* Glow Ring */}
        <div
          className={`absolute w-56 h-56 rounded-full transition-all duration-1000 blur-xl opacity-30 ${
            phase === 'inhale'
              ? 'bg-cyan-500 scale-125'
              : phase === 'hold'
              ? 'bg-indigo-500 scale-125'
              : 'bg-emerald-500 scale-90'
          }`}
        />

        <div
          className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-1000 transform border-2 ${
            phase === 'inhale'
              ? 'scale-125 bg-cyan-950/40 border-cyan-400 shadow-2xl shadow-cyan-500/40'
              : phase === 'hold'
              ? 'scale-125 bg-indigo-950/40 border-indigo-400 shadow-2xl shadow-indigo-500/40'
              : 'scale-95 bg-emerald-950/30 border-emerald-500 shadow-xl shadow-emerald-500/20'
          }`}
        >
          <span className="font-mono text-5xl font-extrabold text-white">{seconds}s</span>
          <span className="text-xs font-bold uppercase tracking-widest mt-2 text-slate-300">
            {phase === 'inhale' ? 'Inhala' : phase === 'hold' ? 'Mantén' : 'Exhala'}
          </span>
        </div>
      </div>

      {/* Phase Guidance Text */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs sm:text-sm text-slate-300 italic min-h-[50px] flex items-center justify-center">
        {phase === 'inhale'
          ? 'Inhala suavemente y despacio por la nariz...'
          : phase === 'hold'
          ? 'Retén el aire relajando hombros y mandíbula...'
          : 'Exhala lentamente soltando toda la tensión por la boca...'}
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Ciclos completados: <strong className="text-white">{cycleCount}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pausar' : 'Reanudar'}</span>
          </button>

          <button
            onClick={resetExercise}
            className="p-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700/60"
            title="Reiniciar ejercicio"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
