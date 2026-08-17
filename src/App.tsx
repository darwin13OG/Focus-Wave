import React, { useState } from 'react';
import {
  Waves,
  Sliders,
  Timer as TimerIcon,
  ListTodo,
  Wind,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { SoundChannel, ThemePalette, ActiveTab } from './types';
import { INITIAL_SOUND_CHANNELS, THEME_PALETTES, DEFAULT_PRESETS } from './data/constants';
import { soundEngine } from './audio/soundEngine';
import { CanvasBackground } from './components/CanvasBackground';
import { SoundMixer } from './components/SoundMixer';
import { PomodoroTimer } from './components/PomodoroTimer';
import { TodoList } from './components/TodoList';
import { BreatheTab } from './components/BreatheTab';
import { SettingsTab } from './components/SettingsTab';
import { StartSessionOverlay } from './components/StartSessionOverlay';

export default function App() {
  const [channels, setChannels] = useState<SoundChannel[]>(INITIAL_SOUND_CHANNELS);
  const [theme, setTheme] = useState<ThemePalette>(THEME_PALETTES.amoled);
  const [activeTab, setActiveTab] = useState<ActiveTab>('mixer');
  const [isMasterMuted, setIsMasterMuted] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Handle Fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((e) => console.log(e));
        setIsFullScreen(false);
      }
    }
  };

  // Start Session (Bypasses Browser Autoplay)
  const handleStartSession = () => {
    soundEngine.init();
    setIsStarted(true);

    // Apply default cozy study preset to start gentle ambient sounds right away
    handleApplyPreset(DEFAULT_PRESETS[0].volumes);
  };

  // Volume change handler
  const handleVolumeChange = (id: SoundChannel['id'], volume: number) => {
    soundEngine.ensureContext();
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, volume, isMuted: false } : c))
    );
    const ch = channels.find((c) => c.id === id);
    soundEngine.setChannelVolume(id, volume, ch?.isMuted || false);
  };

  // Toggle Mute per channel
  const handleToggleMute = (id: SoundChannel['id']) => {
    soundEngine.ensureContext();
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newMuted = !c.isMuted;
          soundEngine.setChannelVolume(id, c.volume, newMuted);
          return { ...c, isMuted: newMuted };
        }
        return c;
      })
    );
  };

  // Toggle Master Mute
  const handleToggleMasterMute = () => {
    const newMasterMuted = !isMasterMuted;
    setIsMasterMuted(newMasterMuted);
    soundEngine.setMasterMute(newMasterMuted);
  };

  // Apply Preset
  const handleApplyPreset = (volumes: Record<SoundChannel['id'], number>) => {
    soundEngine.ensureContext();
    setChannels((prev) =>
      prev.map((c) => {
        const newVol = volumes[c.id] ?? 0;
        soundEngine.setChannelVolume(c.id, newVol, false);
        return { ...c, volume: newVol, isMuted: false };
      })
    );
  };

  // Random Mix (Preset Surprise)
  const handleRandomMix = () => {
    soundEngine.ensureContext();
    const ids: SoundChannel['id'][] = ['rain', 'thunder', 'coffee', 'fireplace', 'ocean', 'wind'];
    
    // Pick 2 to 4 random channels to activate
    const activeIds = [...ids].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);

    const randomVolumes: Record<SoundChannel['id'], number> = {
      rain: 0,
      thunder: 0,
      coffee: 0,
      fireplace: 0,
      ocean: 0,
      wind: 0,
    };

    activeIds.forEach((id) => {
      randomVolumes[id] = Math.floor(Math.random() * 50) + 25; // 25% to 75%
    });

    handleApplyPreset(randomVolumes);
  };

  // Reset / Turn off all
  const handleResetAll = () => {
    setChannels((prev) =>
      prev.map((c) => {
        soundEngine.setChannelVolume(c.id, 0, false);
        return { ...c, volume: 0, isMuted: false };
      })
    );
  };

  const activeSoundCount = channels.filter((c) => c.volume > 0 && !c.isMuted).length;

  return (
    <div className={`min-h-screen ${theme.bgClass} ${theme.textColor} relative transition-colors duration-700 selection:bg-cyan-500/20`}>
      {/* Dynamic Animated Canvas Background */}
      <CanvasBackground channels={channels} theme={theme} />

      {/* Start Session Overlay Modal */}
      {!isStarted && <StartSessionOverlay onStart={handleStartSession} />}

      {/* Main Layout Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-6 space-y-3 sm:space-y-5">
        {/* Top Header / Navigation Bar */}
        <header className="p-2.5 sm:p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-lg flex items-center justify-between gap-2.5">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20 shrink-0">
              <Waves className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
                  FOCUS WAVE
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                  LOFI ZEN
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active Sound Indicator Pill */}
            {activeSoundCount > 0 && (
              <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono whitespace-nowrap shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="hidden sm:inline">{activeSoundCount} sonido{activeSoundCount > 1 ? 's' : ''} sonando</span>
                <span className="sm:hidden font-bold">{activeSoundCount} activo{activeSoundCount > 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Fullscreen Zen Mode Toggle */}
            <button
              id="toggle-fullscreen-btn"
              onClick={toggleFullScreen}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/60 shrink-0"
              title={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa Zen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <nav id="app-tabs-nav" className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto scrollbar-none shadow-md touch-pan-x min-w-0">
          <button
            id="tab-btn-mixer"
            onClick={() => setActiveTab('mixer')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 sm:shrink sm:flex-1 justify-center ${
              activeTab === 'mixer'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Mezclador</span>
            {activeSoundCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'mixer' ? 'bg-slate-950/30 text-slate-950' : 'bg-cyan-500/20 text-cyan-300'}`}>
                {activeSoundCount}
              </span>
            )}
          </button>

          <button
            id="tab-btn-pomodoro"
            onClick={() => setActiveTab('pomodoro')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 sm:shrink sm:flex-1 justify-center ${
              activeTab === 'pomodoro'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TimerIcon className="w-4 h-4" />
            <span>Temporizador</span>
          </button>

          <button
            id="tab-btn-todo"
            onClick={() => setActiveTab('todo')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 sm:shrink sm:flex-1 justify-center ${
              activeTab === 'todo'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Tareas</span>
          </button>

          <button
            id="tab-btn-breathe"
            onClick={() => setActiveTab('breathe')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 sm:shrink sm:flex-1 justify-center ${
              activeTab === 'breathe'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Respiración</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 sm:shrink sm:flex-1 justify-center ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Ajustes</span>
          </button>
        </nav>

        {/* Tab Content Display */}
        <main className="transition-all duration-300 min-h-[420px]">
          {activeTab === 'mixer' && (
            <SoundMixer
              channels={channels}
              theme={theme}
              isMasterMuted={isMasterMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onToggleMasterMute={handleToggleMasterMute}
              onApplyPreset={handleApplyPreset}
              onRandomMix={handleRandomMix}
              onResetAll={handleResetAll}
              onOpenSettings={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'pomodoro' && (
            <div className="max-w-2xl mx-auto">
              <PomodoroTimer theme={theme} />
            </div>
          )}

          {activeTab === 'todo' && (
            <div className="max-w-2xl mx-auto">
              <TodoList theme={theme} />
            </div>
          )}

          {activeTab === 'breathe' && <BreatheTab theme={theme} />}

          {activeTab === 'settings' && (
            <SettingsTab
              theme={theme}
              onSelectTheme={setTheme}
              onApplyPreset={handleApplyPreset}
              onResetAll={handleResetAll}
            />
          )}
        </main>

        {/* Minimalist Ultra-Clean Footer */}
        <footer className="pt-4 pb-2 border-t border-slate-800/40 text-center">
          <p className="text-[11px] text-slate-500 font-mono tracking-tight">
            Focus Wave • Sonidos ambientales y concentración
          </p>
        </footer>
      </div>
    </div>
  );
}
