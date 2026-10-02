export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert' | 'custom';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  rows: number;
  cols: number;
  mines: number;
  description: string;
}

export const DIFFICULTY_PRESETS: Record<Exclude<DifficultyLevel, 'custom'>, DifficultyConfig> = {
  beginner: {
    id: 'beginner',
    name: '初級 (Beginner)',
    rows: 9,
    cols: 9,
    mines: 10,
    description: '9×9 マス / 地雷 10個',
  },
  intermediate: {
    id: 'intermediate',
    name: '中級 (Intermediate)',
    rows: 16,
    cols: 16,
    mines: 40,
    description: '16×16 マス / 地雷 40個',
  },
  expert: {
    id: 'expert',
    name: '上級 (Expert)',
    rows: 16,
    cols: 30,
    mines: 99,
    description: '30×16 マス / 地雷 99個',
  },
};

export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isQuestion: boolean;
  neighborMines: number;
  isExplodedMine?: boolean;
  isFalseFlag?: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type FaceMood = 'normal' | 'pressed' | 'won' | 'lost';

export interface ScoreEntry {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  time: number; // in seconds
  date: string;
  customConfig?: {
    rows: number;
    cols: number;
    mines: number;
  };
}

export interface DifficultyStats {
  played: number;
  won: number;
  bestTime: number | null;
  currentStreak: number;
  maxStreak: number;
}

export type ThemeId = 'win95' | 'darkArcade' | 'gameboy' | 'cyberAmber';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  windowBg: string;
  boardBg: string;
  cellCoveredBg: string;
  cellRevealedBg: string;
  borderColorOutset: string;
  titleBarBg: string;
  titleBarText: string;
  textColor: string;
  ledBg: string;
  ledColor: string;
}
