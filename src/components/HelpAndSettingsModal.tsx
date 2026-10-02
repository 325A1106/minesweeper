import React from 'react';
import { sound } from '../utils/audio';
import { PixelFlag, PixelMine, PixelQuestion } from '../utils/pixelSprites';

interface HelpAndSettingsModalProps {
  crtEnabled: boolean;
  onToggleCrt: (enabled: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  questionEnabled: boolean;
  onToggleQuestion: (enabled: boolean) => void;
  onClose: () => void;
}

export const HelpAndSettingsModal: React.FC<HelpAndSettingsModalProps> = ({
  crtEnabled,
  onToggleCrt,
  soundEnabled,
  onToggleSound,
  questionEnabled,
  onToggleQuestion,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-[#c0c0c0] retro-window-border shadow-2xl p-1 text-black font-pixel">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-sm">
          <span>ヘルプ ＆ オプション設定</span>
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
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto bg-white border border-gray-400">
          {/* Settings Section */}
          <div>
            <h3 className="font-bold text-xs text-[#000080] border-b border-gray-300 pb-1 mb-2">
              ⚙️ システム設定
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100">
                <span className="font-bold">8-bit サウンド効果音</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    sound.playButton();
                    onToggleSound(e.target.checked);
                  }}
                  className="w-4 h-4 accent-[#000080]"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100">
                <div>
                  <span className="font-bold block">レトロ CRT スキャンライン効果</span>
                  <span className="text-[10px] text-gray-500">ブラウン管モニター風の走査線を表示</span>
                </div>
                <input
                  type="checkbox"
                  checked={crtEnabled}
                  onChange={(e) => {
                    sound.playButton();
                    onToggleCrt(e.target.checked);
                  }}
                  className="w-4 h-4 accent-[#000080]"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100">
                <div>
                  <span className="font-bold block">「？」マークの使用</span>
                  <span className="text-[10px] text-gray-500">右クリックで 旗 ➔ ？ ➔ 解除 の3段階切り替え</span>
                </div>
                <input
                  type="checkbox"
                  checked={questionEnabled}
                  onChange={(e) => {
                    sound.playButton();
                    onToggleQuestion(e.target.checked);
                  }}
                  className="w-4 h-4 accent-[#000080]"
                />
              </label>
            </div>
          </div>

          {/* Gameplay Instructions */}
          <div>
            <h3 className="font-bold text-xs text-[#000080] border-b border-gray-300 pb-1 mb-2">
              📖 あそびかた (ルールと操作方法)
            </h3>
            <div className="space-y-2 text-xs text-gray-800 leading-relaxed">
              <div className="p-2 bg-amber-50 border border-amber-200 flex gap-2 items-start">
                <PixelMine size={18} className="shrink-0 mt-0.5" />
                <div>
                  <strong>ゲームの目的:</strong> 地雷以外のすべての安全なマスを開ければ勝利となります。
                </div>
              </div>

              <div className="space-y-1.5 pl-1">
                <div>
                  <strong>マスを開く:</strong> マウス左クリック (スマホ: タップ)
                </div>
                <div className="flex items-center gap-1.5">
                  <PixelFlag size={14} />
                  <span><strong>旗を立てる:</strong> マウス右クリック (スマホ: 「🚩旗モード」ボタンまたは長押し)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PixelQuestion size={14} />
                  <span><strong>数字の意味:</strong> 周囲8マスに潜む地雷の総数を表しています。</span>
                </div>
                <div>
                  <strong>⚡ コードオープン (一括オープン):</strong> すでに開いた数字マスをクリックすると、周囲の旗の数が数字と一致している場合、残りの未開封マスを一気にオープンできます！
                </div>
                <div>
                  <strong>😊 フェイスボタン:</strong> クリックするといつでも新しいゲームを再開できます。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 flex justify-end bg-[#c0c0c0] border-t border-gray-400">
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="px-5 py-1 text-xs font-bold bg-[#c0c0c0] retro-outset active:retro-inset hover:bg-gray-200"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
