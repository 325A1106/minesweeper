import React, { useState } from 'react';
import { DifficultyLevel, ScoreEntry } from '../types/minesweeper';
import {
  clearAllLeaderboard,
  getLeaderboard,
  getStats,
  resetLeaderboardToDefaults,
  resetStats,
} from '../utils/leaderboard';
import { PixelTrophy } from '../utils/pixelSprites';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  onClose: () => void;
  initialDifficulty?: DifficultyLevel;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  onClose,
  initialDifficulty = 'beginner',
}) => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'stats'>('ranking');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'all'>(initialDifficulty);
  const [copiedToast, setCopiedToast] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const scores = getLeaderboard();
  const filteredScores = scores
    .filter((s) => (filterDifficulty === 'all' ? true : s.difficulty === filterDifficulty))
    .sort((a, b) => a.time - b.time);

  const stats = {
    beginner: getStats('beginner'),
    intermediate: getStats('intermediate'),
    expert: getStats('expert'),
    custom: getStats('custom'),
  };

  const handleCopyShare = () => {
    sound.playButton();
    const topBeginner = scores.filter((s) => s.difficulty === 'beginner').sort((a, b) => a.time - b.time)[0];
    const topInter = scores.filter((s) => s.difficulty === 'intermediate').sort((a, b) => a.time - b.time)[0];
    const topExpert = scores.filter((s) => s.difficulty === 'expert').sort((a, b) => a.time - b.time)[0];

    const shareText = `💣 Pixel Minesweeper 95 ベスト記録
初級: ${topBeginner ? `${topBeginner.time}秒 (${topBeginner.name})` : '-'}
中級: ${topInter ? `${topInter.time}秒 (${topInter.name})` : '-'}
上級: ${topExpert ? `${topExpert.time}秒 (${topExpert.name})` : '-'}
#マインスイーパー #PixelMinesweeper`;

    navigator.clipboard.writeText(shareText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleResetDefaults = () => {
    sound.playButton();
    if (window.confirm('ランキングを初期殿堂入りレコードにリセットしますか？')) {
      resetLeaderboardToDefaults();
      setRefreshKey((k) => k + 1);
    }
  };

  const handleClearAll = () => {
    sound.playButton();
    if (window.confirm('すべての記録と統計データを完全に消去しますか？')) {
      clearAllLeaderboard();
      resetStats();
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div key={refreshKey} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-[#c0c0c0] retro-window-border shadow-2xl p-1 text-black font-pixel">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between font-bold text-sm">
          <div className="flex items-center gap-2">
            <PixelTrophy size={16} />
            <span>殿堂入りスコアランキング ＆ 統計</span>
          </div>
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

        {/* Tab Header */}
        <div className="flex border-b border-gray-400 bg-[#c0c0c0] px-2 pt-2 gap-1">
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('ranking');
            }}
            className={`px-4 py-1 text-xs font-bold ${
              activeTab === 'ranking'
                ? 'bg-white border-t-2 border-l-2 border-r-2 border-gray-600 -mb-[1px] z-10'
                : 'bg-[#d4d0c8] retro-outset text-gray-700 hover:bg-[#e0e0e0]'
            }`}
          >
            🏆 スコアランキング
          </button>
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('stats');
            }}
            className={`px-4 py-1 text-xs font-bold ${
              activeTab === 'stats'
                ? 'bg-white border-t-2 border-l-2 border-r-2 border-gray-600 -mb-[1px] z-10'
                : 'bg-[#d4d0c8] retro-outset text-gray-700 hover:bg-[#e0e0e0]'
            }`}
          >
            📊 プレイ統計
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-3 bg-white border border-gray-400 min-h-[340px] max-h-[460px] overflow-y-auto">
          {activeTab === 'ranking' && (
            <div>
              {/* Difficulty filter buttons */}
              <div className="flex flex-wrap gap-1 mb-3">
                {[
                  { id: 'all', label: 'すべて' },
                  { id: 'beginner', label: '初級 (9x9)' },
                  { id: 'intermediate', label: '中級 (16x16)' },
                  { id: 'expert', label: '上級 (30x16)' },
                  { id: 'custom', label: 'カスタム' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.playButton();
                      setFilterDifficulty(item.id as DifficultyLevel | 'all');
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold ${
                      filterDifficulty === item.id
                        ? 'bg-[#000080] text-white'
                        : 'bg-[#e0e0e0] retro-outset active:retro-inset text-black hover:bg-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Table */}
              {filteredScores.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  まだこの難易度の記録はありません。クリアして最初のチャンピオンになろう！
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-400 text-gray-700">
                      <th className="py-1.5 px-2 w-12 text-center">順位</th>
                      <th className="py-1.5 px-2">名前</th>
                      <th className="py-1.5 px-2">難易度</th>
                      <th className="py-1.5 px-2 text-right">クリアタイム</th>
                      <th className="py-1.5 px-2 text-right">日付</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScores.map((score, index) => {
                      const rank = index + 1;
                      const isTop3 = rank <= 3;
                      return (
                        <tr
                          key={score.id}
                          className={`border-b border-gray-200 ${
                            isTop3 ? 'bg-amber-50 font-bold' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-1.5 px-2 text-center">
                            {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `${rank}`}
                          </td>
                          <td className="py-1.5 px-2 text-gray-900 font-mono tracking-wider">
                            {score.name}
                          </td>
                          <td className="py-1.5 px-2 text-gray-600 text-[11px]">
                            {score.difficultyLabel || score.difficulty}
                          </td>
                          <td className="py-1.5 px-2 text-right font-digital text-base text-red-600">
                            {score.time}秒
                          </td>
                          <td className="py-1.5 px-2 text-right text-gray-500 text-[11px]">
                            {score.date}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                各難易度ごとの通算戦績と最速クリア記録です。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'beginner', title: '初級 (Beginner)', stat: stats.beginner },
                  { id: 'intermediate', title: '中級 (Intermediate)', stat: stats.intermediate },
                  { id: 'expert', title: '上級 (Expert)', stat: stats.expert },
                ].map((item) => {
                  const winRate =
                    item.stat.played > 0 ? Math.round((item.stat.won / item.stat.played) * 100) : 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-gray-50 p-2.5 border border-gray-300 rounded shadow-xs"
                    >
                      <h4 className="font-bold text-xs text-[#000080] border-b border-gray-300 pb-1 mb-2">
                        {item.title}
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">プレイ数:</span>
                          <span className="font-bold">{item.stat.played}回</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">勝利数:</span>
                          <span className="font-bold text-green-700">{item.stat.won}勝</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">勝率:</span>
                          <span className="font-bold text-blue-700">{winRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">最速タイム:</span>
                          <span className="font-bold text-red-600 font-digital text-sm">
                            {item.stat.bestTime !== null ? `${item.stat.bestTime}秒` : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">連勝記録:</span>
                          <span className="font-bold">{item.stat.currentStreak} (最多 {item.stat.maxStreak})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom stats */}
              {stats.custom.played > 0 && (
                <div className="bg-gray-50 p-2 border border-gray-300 text-xs">
                  <span className="font-bold text-gray-700">カスタム設定: </span>
                  <span>{stats.custom.played}回プレイ ({stats.custom.won}勝)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-2 flex flex-wrap items-center justify-between gap-2 bg-[#c0c0c0] border-t border-gray-400">
          <div className="flex gap-2">
            <button
              onClick={handleCopyShare}
              className="px-2.5 py-1 text-[11px] font-bold bg-[#c0c0c0] retro-outset active:retro-inset hover:bg-gray-200"
            >
              {copiedToast ? 'コピー完了！' : '📋 記録をコピー'}
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-2 py-1 text-[11px] text-gray-700 bg-[#c0c0c0] retro-outset active:retro-inset hover:bg-gray-200"
              title="初期殿堂入りレコードに戻す"
            >
              初期化
            </button>
            <button
              onClick={handleClearAll}
              className="px-2 py-1 text-[11px] text-red-700 bg-[#c0c0c0] retro-outset active:retro-inset hover:bg-gray-200"
              title="すべての記録を削除"
            >
              全消去
            </button>
          </div>

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
