import React, { useState } from 'react';
import { DifficultyLevel } from '../types/minesweeper';
import { addScore } from '../utils/leaderboard';
import { PixelTrophy } from '../utils/pixelSprites';
import { sound } from '../utils/audio';

interface HighScoreInputModalProps {
  time: number;
  difficulty: DifficultyLevel;
  difficultyLabel: string;
  customConfig?: { rows: number; cols: number; mines: number };
  onSaved: (rank: number) => void;
  onClose: () => void;
}

export const HighScoreInputModal: React.FC<HighScoreInputModalProps> = ({
  time,
  difficulty,
  difficultyLabel,
  customConfig,
  onSaved,
  onClose,
}) => {
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('pixel_minesweeper_last_name') || 'PLAYER';
    } catch {
      return 'PLAYER';
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playButton();
    const cleanName = playerName.trim() || 'ANON';
    try {
      localStorage.setItem('pixel_minesweeper_last_name', cleanName);
    } catch {
      // ignore
    }

    const { rank } = addScore({
      name: cleanName.toUpperCase(),
      difficulty,
      difficultyLabel,
      time,
      customConfig,
    });

    onSaved(rank);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#c0c0c0] retro-window-border shadow-2xl p-1 text-black font-pixel">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-sm">
          <span>★ VICTORY! クリア達成 ★</span>
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="w-5 h-5 bg-[#c0c0c0] text-black font-pixel text-xs retro-outset active:retro-inset flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 text-center space-y-4">
          <div className="flex justify-center my-1 animate-bounce">
            <PixelTrophy size={48} />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-wider">
              CONGRATULATIONS!
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              すべての地雷を無力化し、安全を確保しました！
            </p>
          </div>

          {/* Time & Difficulty badge */}
          <div className="bg-black/90 p-3 retro-inset text-center space-y-1">
            <div className="text-xs text-amber-400 font-pixel">
              {difficultyLabel}
            </div>
            <div className="text-3xl font-digital text-red-500 tracking-widest" style={{ textShadow: '0 0 8px rgba(239,68,68,0.6)' }}>
              {time} 秒
            </div>
          </div>

          {/* Name input */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-800 mb-1">
                ランキング登録名 (ニックネーム):
              </label>
              <input
                type="text"
                maxLength={10}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="PLAYER"
                autoFocus
                className="w-full bg-white px-3 py-1.5 text-center font-bold text-base tracking-widest uppercase border-2 border-gray-600 retro-inset text-black focus:outline-none focus:border-blue-700"
              />
              <span className="text-[10px] text-gray-500 block text-right mt-0.5">
                最大 10 文字
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playButton();
                  onClose();
                }}
                className="flex-1 py-1.5 bg-[#c0c0c0] retro-outset active:retro-inset text-xs font-bold hover:bg-[#d0d0d0]"
              >
                スキップ
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 bg-[#000080] text-white retro-outset active:retro-inset text-xs font-bold hover:bg-[#0000a0]"
              >
                記録を保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
