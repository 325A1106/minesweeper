import { DifficultyLevel, DifficultyStats, ScoreEntry } from '../types/minesweeper';

const LEADERBOARD_KEY = 'pixel_minesweeper_leaderboard_v1';
const STATS_KEY = 'pixel_minesweeper_stats_v1';

const DEFAULT_SCORES: ScoreEntry[] = [
  // Beginner
  { id: 'b1', name: 'WIN_PRO', difficulty: 'beginner', difficultyLabel: '初級', time: 9, date: '1995-08-24' },
  { id: 'b2', name: 'PIXEL', difficulty: 'beginner', difficultyLabel: '初級', time: 14, date: '1998-06-25' },
  { id: 'b3', name: '8BIT', difficulty: 'beginner', difficultyLabel: '初級', time: 22, date: '2001-10-25' },
  { id: 'b4', name: 'ACE', difficulty: 'beginner', difficultyLabel: '初級', time: 31, date: '2010-04-12' },
  { id: 'b5', name: 'MINER', difficulty: 'beginner', difficultyLabel: '初級', time: 45, date: '2022-01-15' },

  // Intermediate
  { id: 'i1', name: 'CYBER', difficulty: 'intermediate', difficultyLabel: '中級', time: 52, date: '1995-11-03' },
  { id: 'i2', name: 'RETRO', difficulty: 'intermediate', difficultyLabel: '中級', time: 68, date: '1999-03-18' },
  { id: 'i3', name: 'SWEEP', difficulty: 'intermediate', difficultyLabel: '中級', time: 89, date: '2005-09-02' },
  { id: 'i4', name: 'CHAMP', difficulty: 'intermediate', difficultyLabel: '中級', time: 115, date: '2018-07-20' },
  { id: 'i5', name: 'NINJA', difficulty: 'intermediate', difficultyLabel: '中級', time: 142, date: '2023-11-10' },

  // Expert
  { id: 'e1', name: 'LEGEND', difficulty: 'expert', difficultyLabel: '上級', time: 138, date: '1996-02-14' },
  { id: 'e2', name: 'MASTER', difficulty: 'expert', difficultyLabel: '上級', time: 175, date: '2000-08-19' },
  { id: 'e3', name: 'SHADOW', difficulty: 'expert', difficultyLabel: '上級', time: 220, date: '2008-12-05' },
  { id: 'e4', name: 'GHOST', difficulty: 'expert', difficultyLabel: '上級', time: 285, date: '2016-04-30' },
  { id: 'e5', name: 'TITAN', difficulty: 'expert', difficultyLabel: '上級', time: 340, date: '2024-05-18' },
];

export const getLeaderboard = (): ScoreEntry[] => {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SCORES;
  }
};

export const getScoresByDifficulty = (difficulty: DifficultyLevel): ScoreEntry[] => {
  const all = getLeaderboard();
  return all
    .filter((s) => s.difficulty === difficulty)
    .sort((a, b) => a.time - b.time);
};

export const checkIsHighScore = (difficulty: DifficultyLevel, time: number): boolean => {
  const scores = getScoresByDifficulty(difficulty);
  if (scores.length < 10) return true;
  return time < scores[scores.length - 1].time;
};

export const addScore = (entry: Omit<ScoreEntry, 'id' | 'date'>): { entry: ScoreEntry; rank: number } => {
  const all = getLeaderboard();
  const newEntry: ScoreEntry = {
    ...entry,
    id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    date: new Date().toISOString().split('T')[0],
  };

  all.push(newEntry);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }

  // Calculate rank for this difficulty
  const diffScores = all
    .filter((s) => s.difficulty === entry.difficulty)
    .sort((a, b) => a.time - b.time);

  const rank = diffScores.findIndex((s) => s.id === newEntry.id) + 1;
  return { entry: newEntry, rank };
};

export const resetLeaderboardToDefaults = (): void => {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_SCORES));
  } catch {
    // ignore
  }
};

export const clearAllLeaderboard = (): void => {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify([]));
  } catch {
    // ignore
  }
};

// Statistics Management
export const getStats = (difficulty: DifficultyLevel): DifficultyStats => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return { played: 0, won: 0, bestTime: null, currentStreak: 0, maxStreak: 0 };
    }
    const allStats = JSON.parse(raw);
    return allStats[difficulty] || { played: 0, won: 0, bestTime: null, currentStreak: 0, maxStreak: 0 };
  } catch {
    return { played: 0, won: 0, bestTime: null, currentStreak: 0, maxStreak: 0 };
  }
};

export const recordGameEnd = (difficulty: DifficultyLevel, won: boolean, time?: number): DifficultyStats => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const allStats = raw ? JSON.parse(raw) : {};
    const curr: DifficultyStats = allStats[difficulty] || {
      played: 0,
      won: 0,
      bestTime: null,
      currentStreak: 0,
      maxStreak: 0,
    };

    curr.played += 1;
    if (won) {
      curr.won += 1;
      curr.currentStreak += 1;
      if (curr.currentStreak > curr.maxStreak) {
        curr.maxStreak = curr.currentStreak;
      }
      if (time !== undefined) {
        if (curr.bestTime === null || time < curr.bestTime) {
          curr.bestTime = time;
        }
      }
    } else {
      curr.currentStreak = 0;
    }

    allStats[difficulty] = curr;
    localStorage.setItem(STATS_KEY, JSON.stringify(allStats));
    return curr;
  } catch {
    return { played: 0, won: 0, bestTime: null, currentStreak: 0, maxStreak: 0 };
  }
};

export const resetStats = (): void => {
  try {
    localStorage.removeItem(STATS_KEY);
  } catch {
    // ignore
  }
};
