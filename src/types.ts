export type SoundId = 'rain' | 'thunder' | 'coffee' | 'fireplace' | 'ocean' | 'wind';

export type ActiveTab = 'mixer' | 'pomodoro' | 'todo' | 'breathe' | 'settings';

export interface SoundChannel {
  id: SoundId;
  name: string;
  category: string;
  icon: string; // Lucide icon name or indicator
  description: string;
  volume: number; // 0 to 100
  isMuted: boolean;
  color: string; // Tailwind color accent
}

export interface SoundPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  volumes: Record<SoundId, number>;
  isCustom?: boolean;
}

export type PomodoroModeType = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroConfig {
  work: number; // minutes
  shortBreak: number;
  longBreak: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority?: 'low' | 'medium' | 'high';
  estimatedPomodoros?: number;
  completedPomodoros?: number;
}

export type ThemeId = 'amoled' | 'twilight' | 'forest' | 'lavender' | 'cream';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  bgClass: string;
  cardBg: string;
  cardBorder: string;
  accentColor: string;
  accentText: string;
  textColor: string;
  mutedText: string;
  particleColor: string;
  isDark: boolean;
}

export interface BinauralPreset {
  id: string;
  name: string;
  description: string;
  frequency: number; // in Hz (e.g. 10 for Alpha)
  category: 'Alpha' | 'Beta' | 'Theta' | 'Delta';
}
