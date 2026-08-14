import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  Coffee,
  Brain,
  Sparkles,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { PomodoroModeType, PomodoroConfig, ThemePalette } from '../types';
import { soundEngine } from '../audio/soundEngine';

interface PomodoroTimerProps {
  theme: ThemePalette;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ theme }) => {
  const [config, setConfig] = useState<PomodoroConfig>(() => {
    try {
      const saved = localStorage.getItem('focus_wave_pomo_config');
      return saved ? JSON.parse(saved) : { work: 25, shortBreak: 5, longBreak: 15 };
    } catch {
      return { work: 25, shortBreak: 5, longBreak: 15 };
    }
  });

  const [mode, setMode] = useState<PomodoroModeType>('work');
  const [timeLeft, setTimeLeft] = useState<number>(config.work * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('focus_wave_pomo_sessions');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize time left when mode or config changes (when not running)
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(config.work * 60);
      if (mode === 'shortBreak') setTimeLeft(config.shortBreak * 60);
      if (mode === 'longBreak') setTimeLeft(config.longBreak * 60);
    }
  }, [mode, config]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);

            // Play gentle completion chime
            soundEngine.playPomodoroChime();

            // Increment completed sessions if work mode finished
            if (mode === 'work') {
              const newSessions = completedSessions + 1;
              setCompletedSessions(newSessions);
              try {
                localStorage.setItem('focus_wave_pomo_sessions', newSessions.toString());
              } catch {}
              // Auto switch to short break or long break after 4 sessions
              if (newSessions % 4 === 0) {
                setMode('longBreak');
                return config.longBreak * 60;
              } else {
                setMode('shortBreak');
                return config.shortBreak * 60;
              }
            } else {
              setMode('work');
              return config.work * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, completedSessions, config]);

  const toggleTimer = () => {
    soundEngine.ensureContext();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(config.work * 60);
    if (mode === 'shortBreak') setTimeLeft(config.shortBreak * 60);
    if (mode === 'longBreak') setTimeLeft(config.longBreak * 60);
  };

  const changeMode = (newMode: PomodoroModeType) => {
    setIsRunning(false);
    setMode(newMode);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('focus_wave_pomo_config', JSON.stringify(config));
    } catch {}
    setShowSettings(false);
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(config.work * 60);
      if (mode === 'shortBreak') setTimeLeft(config.shortBreak * 60);
      if (mode === 'longBreak') setTimeLeft(config.longBreak * 60);
    }
  };

  // Helper formatting
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalModeSeconds =
    mode === 'work' ? config.work * 60 : mode === 'shortBreak' ? config.shortBreak * 60 : config.longBreak * 60;
  const progressPercent = ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100;

  // SVG Circular progress math
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div id="pomodoro-timer-card" className={`p-6 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} space-y-6 shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <TimerIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-white tracking-wide">Temporizador Pomodoro</h2>
            <p className="text-xs text-slate-400">Técnica de enfoque por intervalos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700/60 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {completedSessions} Sesione{completedSessions !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all"
            title="Ajustar duraciones"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          id="pomo-mode-work"
          onClick={() => changeMode('work')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            mode === 'work'
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Trabajo ({config.work}m)</span>
        </button>

        <button
          id="pomo-mode-short"
          onClick={() => changeMode('shortBreak')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            mode === 'shortBreak'
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Descanso ({config.shortBreak}m)</span>
        </button>

        <button
          id="pomo-mode-long"
          onClick={() => changeMode('longBreak')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            mode === 'longBreak'
              ? 'bg-indigo-500 text-white font-semibold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Largo ({config.longBreak}m)</span>
        </button>
      </div>

      {/* Main Timer Dial */}
      <div className="relative flex flex-col items-center justify-center py-4">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-slate-800/80"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Ring */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className={`transition-all duration-500 ease-linear ${
                mode === 'work'
                  ? 'stroke-cyan-400'
                  : mode === 'shortBreak'
                  ? 'stroke-emerald-400'
                  : 'stroke-indigo-400'
              }`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-5xl font-bold tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </span>
            <span className="text-xs font-medium mt-1 text-slate-400 uppercase tracking-widest">
              {mode === 'work' ? 'Enfoque Total' : mode === 'shortBreak' ? 'Pausa Corta' : 'Pausa Larga'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          id="pomo-toggle-btn"
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-base shadow-lg transition-all transform active:scale-95 ${
            isRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : mode === 'work'
              ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
              : mode === 'shortBreak'
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
              : 'bg-indigo-500 text-white hover:bg-indigo-400'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
        </button>

        <button
          id="pomo-reset-btn"
          onClick={resetTimer}
          className="p-3 rounded-2xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all border border-slate-700/50"
          title="Reiniciar temporizador"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm p-6 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} space-y-5 shadow-2xl`}>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" /> Configurar Temporizador
            </h3>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tiempo de Trabajo (minutos):
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={config.work}
                  onChange={(e) => setConfig({ ...config, work: Math.max(1, parseInt(e.target.value) || 25) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descanso Corto (minutos):
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.shortBreak}
                  onChange={(e) => setConfig({ ...config, shortBreak: Math.max(1, parseInt(e.target.value) || 5) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descanso Largo (minutos):
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.longBreak}
                  onChange={(e) => setConfig({ ...config, longBreak: Math.max(1, parseInt(e.target.value) || 15) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
