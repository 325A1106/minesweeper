import React, { useState } from 'react';
import { DifficultyConfig, DifficultyLevel, DIFFICULTY_PRESETS } from '../types/minesweeper';
import { sound } from '../utils/audio';

interface DifficultyModalProps {
  currentDifficulty: DifficultyLevel;
  customConfig: { rows: number; cols: number; mines: number };
  onSelect: (difficulty: DifficultyLevel, custom?: { rows: number; cols: number; mines: number }) => void;
  onClose: () => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  currentDifficulty,
  customConfig: initialCustom,
  onSelect,
  onClose,
}) => {
  const [selected, setSelected] = useState<DifficultyLevel>(currentDifficulty);
  const [rows, setRows] = useState(initialCustom.rows);
  const [cols, setCols] = useState(initialCustom.cols);
  const [mines, setMines] = useState(initialCustom.mines);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const maxMines = Math.max(1, rows * cols - 1);

  const handleApply = () => {
    sound.playButton();
    if (selected === 'custom') {
      if (rows < 8 || rows > 24) {
        setErrorMsg('高さ(行)は 8 〜 24 の範囲で指定してください');
        return;
      }
      if (cols < 8 || cols > 40) {
        setErrorMsg('幅(列)は 8 〜 40 の範囲で指定してください');
        return;
      }
      if (mines < 1 || mines > maxMines) {
        setErrorMsg(`地雷数は 1 〜 ${maxMines} の範囲で指定してください`);
        return;
      }
      onSelect('custom', { rows, cols, mines });
    } else {
      onSelect(selected);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-[#c0c0c0] retro-window-border shadow-2xl p-1 text-black font-pixel">
        {/* Title bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-sm">
          <span>難易度の設定</span>
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

        {/* Content Area */}
        <div className="p-4 space-y-4">
          <p className="text-xs text-gray-700 leading-relaxed">
            プレイスタイルに合わせて難易度を選択してください。
          </p>

          <div className="space-y-2">
            {(Object.keys(DIFFICULTY_PRESETS) as Array<keyof typeof DIFFICULTY_PRESETS>).map((key) => {
              const preset = DIFFICULTY_PRESETS[key];
              const isSelected = selected === key;
              return (
                <label
                  key={key}
                  onClick={() => {
                    sound.playButton();
                    setSelected(key);
                    setErrorMsg(null);
                  }}
                  className={`flex items-start gap-3 p-2 cursor-pointer border ${
                    isSelected ? 'bg-blue-100 border-blue-600' : 'bg-white border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    checked={isSelected}
                    onChange={() => setSelected(key)}
                    className="mt-1 accent-[#000080]"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-900">{preset.name}</div>
                    <div className="text-xs text-gray-600">{preset.description}</div>
                  </div>
                </label>
              );
            })}

            {/* Custom Option */}
            <div
              onClick={() => {
                sound.playButton();
                setSelected('custom');
              }}
              className={`p-2 border cursor-pointer ${
                selected === 'custom' ? 'bg-blue-100 border-blue-600' : 'bg-white border-gray-400 hover:bg-gray-50'
              }`}
            >
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="difficulty"
                  checked={selected === 'custom'}
                  onChange={() => setSelected('custom')}
                  className="accent-[#000080]"
                />
                <span className="font-bold text-sm text-gray-900">カスタム (Custom)</span>
              </label>

              {selected === 'custom' && (
                <div
                  className="mt-3 pt-3 border-t border-gray-300 grid grid-cols-3 gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <label className="text-[11px] block font-bold text-gray-700 mb-1">高さ (8-24)</label>
                    <input
                      type="number"
                      min={8}
                      max={24}
                      value={rows}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 8;
                        setRows(val);
                        if (mines > val * cols - 1) setMines(Math.max(1, val * cols - 1));
                      }}
                      className="w-full bg-white px-2 py-1 text-sm border-2 border-gray-500 retro-inset text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] block font-bold text-gray-700 mb-1">幅 (8-40)</label>
                    <input
                      type="number"
                      min={8}
                      max={40}
                      value={cols}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 8;
                        setCols(val);
                        if (mines > rows * val - 1) setMines(Math.max(1, rows * val - 1));
                      }}
                      className="w-full bg-white px-2 py-1 text-sm border-2 border-gray-500 retro-inset text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] block font-bold text-gray-700 mb-1">地雷数</label>
                    <input
                      type="number"
                      min={1}
                      max={maxMines}
                      value={mines}
                      onChange={(e) => setMines(parseInt(e.target.value) || 1)}
                      className="w-full bg-white px-2 py-1 text-sm border-2 border-gray-500 retro-inset text-center"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 text-xs p-2 font-bold">
              {errorMsg}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-300">
            <button
              onClick={() => {
                sound.playButton();
                onClose();
              }}
              className="px-4 py-1.5 bg-[#c0c0c0] retro-outset active:retro-inset text-xs font-bold hover:bg-[#d0d0d0]"
            >
              キャンセル
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-1.5 bg-[#c0c0c0] retro-outset active:retro-inset text-xs font-bold text-black border-2 border-blue-900 hover:bg-[#e0e0e0]"
            >
              確定して開始
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
