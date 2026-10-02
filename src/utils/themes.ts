import { ThemeConfig, ThemeId } from '../types/minesweeper';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  win95: {
    id: 'win95',
    name: 'Windows 95',
    windowBg: '#c0c0c0',
    boardBg: '#c0c0c0',
    cellCoveredBg: '#c0c0c0',
    cellRevealedBg: '#bdbdbd',
    borderColorOutset: '#ffffff #7b7b7b #7b7b7b #ffffff',
    titleBarBg: '#000080',
    titleBarText: '#ffffff',
    textColor: '#000000',
    ledBg: '#000000',
    ledColor: '#ff0000',
  },
  darkArcade: {
    id: 'darkArcade',
    name: 'Arcade CRT',
    windowBg: '#181e24',
    boardBg: '#0f1418',
    cellCoveredBg: '#222b33',
    cellRevealedBg: '#13191f',
    borderColorOutset: '#3a4957 #0b0e12 #0b0e12 #3a4957',
    titleBarBg: '#0d5c36',
    titleBarText: '#39ff14',
    textColor: '#e2e8f0',
    ledBg: '#050a07',
    ledColor: '#39ff14',
  },
  gameboy: {
    id: 'gameboy',
    name: 'GameBoy 1989',
    windowBg: '#8bac0f',
    boardBg: '#8bac0f',
    cellCoveredBg: '#9bbc0f',
    cellRevealedBg: '#8bac0f',
    borderColorOutset: '#9bbc0f #306230 #306230 #9bbc0f',
    titleBarBg: '#0f380f',
    titleBarText: '#9bbc0f',
    textColor: '#0f380f',
    ledBg: '#0f380f',
    ledColor: '#9bbc0f',
  },
  cyberAmber: {
    id: 'cyberAmber',
    name: 'Amber 80s',
    windowBg: '#1c150c',
    boardBg: '#120c05',
    cellCoveredBg: '#2a1f11',
    cellRevealedBg: '#160e05',
    borderColorOutset: '#4d371d #080502 #080502 #4d371d',
    titleBarBg: '#b45309',
    titleBarText: '#fef3c7',
    textColor: '#fbbf24',
    ledBg: '#0a0601',
    ledColor: '#f59e0b',
  },
};

// Authentic color mapping for numbers 1 to 8
export const NUMBER_COLORS: Record<number, string> = {
  1: '#0000ff', // Blue
  2: '#008000', // Green
  3: '#ff0000', // Red
  4: '#000080', // Navy
  5: '#800000', // Maroon
  6: '#008080', // Teal
  7: '#000000', // Black
  8: '#808080', // Gray
};

export const NUMBER_COLORS_DARK: Record<number, string> = {
  1: '#60a5fa', // Blue
  2: '#4ade80', // Green
  3: '#f87171', // Red
  4: '#818cf8', // Indigo
  5: '#fb923c', // Orange
  6: '#2dd4bf', // Teal
  7: '#e2e8f0', // White/Slate
  8: '#94a3b8', // Gray
};
