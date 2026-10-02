import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Cell,
  DifficultyConfig,
  DifficultyLevel,
  DIFFICULTY_PRESETS,
  FaceMood,
  GameStatus,
  ThemeId,
} from './types/minesweeper';
import { chordCell, createEmptyBoard, cycleFlag, populateMines, revealCell } from './utils/gameLogic';
import { recordGameEnd } from './utils/leaderboard';
import { THEMES } from './utils/themes';
import { sound } from './utils/audio';
import { PixelFace, PixelFlag, PixelMine, PixelTrophy } from './utils/pixelSprites';
import { SevenSegmentDisplay } from './components/SevenSegmentDisplay';
import { GameBoard } from './components/GameBoard';
import { DifficultyModal } from './components/DifficultyModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HighScoreInputModal } from './components/HighScoreInputModal';
import { HelpAndSettingsModal } from './components/HelpAndSettingsModal';

export default function App() {
  // Game Setup State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [customConfig, setCustomConfig] = useState({ rows: 16, cols: 30, mines: 99 });
  const [themeId, setThemeId] = useState<ThemeId>('win95');
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pixel_minesweeper_crt') === 'true';
    } catch {
      return false;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [enableQuestion, setEnableQuestion] = useState<boolean>(true);
  const [mobileFlagMode, setMobileFlagMode] = useState<boolean>(false);
  const [cellSize, setCellSize] = useState<number>(28);

  // Active Game State
  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard(9, 9));
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [faceMood, setFaceMood] = useState<FaceMood>('normal');
  const [remainingMines, setRemainingMines] = useState<number>(10);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [firstClickDone, setFirstClickDone] = useState<boolean>(false);

  // Modals
  const [showDifficultyModal, setShowDifficultyModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showHighScoreModal, setShowHighScoreModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Timer Ref
  const timerRef = useRef<number | null>(null);

  // Current config resolver
  const currentConfig: DifficultyConfig =
    difficulty === 'custom'
      ? {
          id: 'custom',
          name: 'カスタム (Custom)',
          rows: customConfig.rows,
          cols: customConfig.cols,
          mines: customConfig.mines,
          description: `${customConfig.cols}×${customConfig.rows} マス / 地雷 ${customConfig.mines}個`,
        }
      : DIFFICULTY_PRESETS[difficulty];

  // Theme resolver
  const currentTheme = THEMES[themeId] || THEMES.win95;
  const isDark = themeId === 'darkArcade' || themeId === 'cyberAmber';

  // Responsive default cell size adjuster on difficulty change
  const adjustCellSizeForBoard = useCallback((cols: number) => {
    if (window.innerWidth < 640) {
      if (cols > 20) setCellSize(20);
      else if (cols > 12) setCellSize(23);
      else setCellSize(28);
    } else {
      if (cols > 24) setCellSize(25);
      else setCellSize(30);
    }
  }, []);

  // Initialize or Reset Game
  const resetGame = useCallback(
    (diff: DifficultyLevel = difficulty, custom = customConfig) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const conf = diff === 'custom' ? custom : DIFFICULTY_PRESETS[diff];
      const newBoard = createEmptyBoard(conf.rows, conf.cols);

      setBoard(newBoard);
      setGameStatus('idle');
      setFaceMood('normal');
      setElapsedTime(0);
      setRemainingMines(conf.mines);
      setFirstClickDone(false);
      adjustCellSizeForBoard(conf.cols);
    },
    [difficulty, customConfig, adjustCellSizeForBoard]
  );

  // Initial load
  useEffect(() => {
    resetGame(difficulty, customConfig);
  }, []);

  // Timer runner
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = window.setInterval(() => {
        setElapsedTime((prev) => Math.min(prev + 1, 999));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Handle Board Cell Click (Reveal)
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    let activeBoard = board;

    // First Click Safety Engine
    if (!firstClickDone) {
      activeBoard = populateMines(
        board,
        currentConfig.rows,
        currentConfig.cols,
        currentConfig.mines,
        row,
        col
      );
      setFirstClickDone(true);
      setGameStatus('playing');
    }

    const cell = activeBoard[row][col];
    if (cell.isFlagged || cell.isRevealed) return;

    const result = revealCell(
      activeBoard,
      currentConfig.rows,
      currentConfig.cols,
      currentConfig.mines,
      row,
      col
    );

    setBoard(result.board);

    if (result.exploded) {
      sound.playExplosion();
      setGameStatus('lost');
      setFaceMood('lost');
      recordGameEnd(difficulty, false);
    } else if (result.won) {
      sound.playWin();
      setGameStatus('won');
      setFaceMood('won');
      setRemainingMines(0);
      recordGameEnd(difficulty, true, elapsedTime);
      setTimeout(() => setShowHighScoreModal(true), 600);
    } else {
      if (result.revealedCount > 1) {
        sound.playCascade(Math.min(7, Math.floor(result.revealedCount / 3)));
      } else {
        sound.playClick();
      }
    }
  };

  // Handle Right Click (Flag / Question mark)
  const handleCellRightClick = (row: number, col: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    const cell = board[row][col];
    if (cell.isRevealed) return;

    // Start timer on first flag if not yet started
    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }

    const { board: nextBoard, flagDelta } = cycleFlag(board, row, col, enableQuestion);
    setBoard(nextBoard);
    setRemainingMines((prev) => prev - flagDelta);

    if (flagDelta > 0) {
      sound.playFlag();
    } else if (flagDelta < 0) {
      sound.playUnflag();
    } else {
      sound.playButton();
    }
  };

  // Handle Chording (Clicking revealed number with full flags)
  const handleCellChord = (row: number, col: number) => {
    if (gameStatus !== 'playing') return;

    const result = chordCell(
      board,
      currentConfig.rows,
      currentConfig.cols,
      currentConfig.mines,
      row,
      col
    );

    if (result.revealedCount > 0) {
      setBoard(result.board);

      if (result.exploded) {
        sound.playExplosion();
        setGameStatus('lost');
        setFaceMood('lost');
        recordGameEnd(difficulty, false);
      } else if (result.won) {
        sound.playWin();
        setGameStatus('won');
        setFaceMood('won');
        setRemainingMines(0);
        recordGameEnd(difficulty, true, elapsedTime);
        setTimeout(() => setShowHighScoreModal(true), 600);
      } else {
        sound.playChord();
      }
    }
  };

  // Mouse Down / Up on Board triggers Scared Face 😮
  const handleBoardMouseDown = () => {
    if (gameStatus === 'playing' || gameStatus === 'idle') {
      setFaceMood('pressed');
    }
  };

  const handleBoardMouseUp = () => {
    if (gameStatus === 'playing' || gameStatus === 'idle') {
      setFaceMood('normal');
    }
  };

  // Keyboard Shortcuts (F2 / R to restart, 1/2/3 to switch difficulty, M mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDifficultyModal || showLeaderboardModal || showHighScoreModal || showHelpModal) return;

      if (e.key === 'r' || e.key === 'R' || e.key === 'F2') {
        e.preventDefault();
        sound.playButton();
        resetGame();
      } else if (e.key === '1') {
        setDifficulty('beginner');
        resetGame('beginner');
      } else if (e.key === '2') {
        setDifficulty('intermediate');
        resetGame('intermediate');
      } else if (e.key === '3') {
        setDifficulty('expert');
        resetGame('expert');
      } else if (e.key === 'm' || e.key === 'M') {
        const nextMute = sound.toggleMute();
        setIsMuted(nextMute);
      } else if (e.key === 'f' || e.key === 'F') {
        setMobileFlagMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetGame, showDifficultyModal, showLeaderboardModal, showHighScoreModal, showHelpModal]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-between p-2 sm:p-4 text-slate-800 ${
        isCrtEnabled ? 'crt-overlay' : ''
      }`}
      style={{
        backgroundColor: isDark ? '#0b0f13' : '#1e293b',
        backgroundImage: isDark
          ? 'radial-gradient(#1e293b 1px, transparent 1px)'
          : 'radial-gradient(#334155 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Application Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-1.5 px-3 bg-[#c0c0c0] retro-outset mb-3 text-black font-pixel">
        <div className="flex items-center gap-2">
          <PixelMine size={20} />
          <span className="font-bold text-sm tracking-wide">Pixel Minesweeper 95</span>
          <span className="hidden sm:inline text-xs text-gray-600">· レトロマインスイーパー</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Difficulty Button */}
          <button
            onClick={() => {
              sound.playButton();
              setShowDifficultyModal(true);
            }}
            className="px-2 sm:px-3 py-1 bg-[#c0c0c0] retro-outset active:retro-inset text-xs font-bold hover:bg-gray-200"
          >
            難易度: {currentConfig.name.split(' ')[0]}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              sound.playButton();
              setShowLeaderboardModal(true);
            }}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-[#c0c0c0] retro-outset active:retro-inset text-xs font-bold hover:bg-gray-200 text-amber-900"
          >
            <PixelTrophy size={14} />
            <span>ランキング</span>
          </button>

          {/* Settings / Help */}
          <button
            onClick={() => {
              sound.playButton();
              setShowHelpModal(true);
            }}
            className="px-2 py-1 bg-[#c0c0c0] retro-outset active:retro-inset text-xs font-bold hover:bg-gray-200"
            title="ヘルプ ＆ 設定"
          >
            ❓ 設定
          </button>
        </div>
      </header>

      {/* Main Game Window */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-full">
        <div
          className="retro-window-border p-1 shadow-2xl transition-all"
          style={{
            backgroundColor: currentTheme.windowBg,
            maxWidth: '100%',
          }}
        >
          {/* OS Window Title Bar */}
          <div
            className="px-2 py-1 flex items-center justify-between select-none mb-1"
            style={{
              backgroundColor: currentTheme.titleBarBg,
              color: currentTheme.titleBarText,
            }}
          >
            <div className="flex items-center gap-2 font-pixel text-xs font-bold">
              <PixelMine size={14} />
              <span>Minesweeper - [{currentConfig.name}]</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sound.playButton();
                  setShowHelpModal(true);
                }}
                className="w-4 h-4 bg-[#c0c0c0] text-black font-pixel text-[10px] retro-outset active:retro-inset flex items-center justify-center font-bold"
              >
                ?
              </button>
              <button
                onClick={() => {
                  sound.playButton();
                  resetGame();
                }}
                className="w-4 h-4 bg-[#c0c0c0] text-black font-pixel text-[10px] retro-outset active:retro-inset flex items-center justify-center font-bold"
                title="最小化/再起動"
              >
                _
              </button>
            </div>
          </div>

          {/* Game Window Menu Strip */}
          <div className="flex items-center justify-between px-2 py-0.5 text-xs font-pixel border-b border-gray-400 bg-[#c0c0c0] text-black mb-1">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playButton();
                  resetGame();
                }}
                className="hover:underline px-1"
              >
                新規(<u>N</u>)
              </button>
              <button
                onClick={() => {
                  sound.playButton();
                  setShowDifficultyModal(true);
                }}
                className="hover:underline px-1"
              >
                難易度(<u>D</u>)
              </button>
              <button
                onClick={() => {
                  sound.playButton();
                  setShowLeaderboardModal(true);
                }}
                className="hover:underline px-1"
              >
                殿堂入り(<u>S</u>)
              </button>
            </div>

            {/* Quick theme switcher in menu */}
            <div className="flex items-center gap-1">
              <select
                value={themeId}
                onChange={(e) => {
                  sound.playButton();
                  setThemeId(e.target.value as ThemeId);
                }}
                className="bg-white border border-gray-600 px-1 py-0.5 text-[10px] font-pixel cursor-pointer"
              >
                <option value="win95">Theme: Win95</option>
                <option value="darkArcade">Theme: Arcade CRT</option>
                <option value="gameboy">Theme: GameBoy</option>
                <option value="cyberAmber">Theme: Amber 80s</option>
              </select>
            </div>
          </div>

          {/* Minesweeper Header (LED Counters + Smiley Face) */}
          <div
            className="retro-field-border p-2 mb-2 flex items-center justify-between"
            style={{ backgroundColor: currentTheme.boardBg }}
          >
            {/* Remaining Mines LED */}
            <SevenSegmentDisplay
              value={remainingMines}
              themeColor={currentTheme.ledColor}
            />

            {/* Retro Face Button */}
            <div
              onClick={() => {
                sound.playButton();
                resetGame();
              }}
              title="クリックで新しいゲームを開始 (ショートカット: R)"
            >
              <PixelFace mood={faceMood} isPressed={faceMood === 'pressed'} />
            </div>

            {/* Elapsed Time LED */}
            <SevenSegmentDisplay
              value={elapsedTime}
              themeColor={currentTheme.ledColor}
            />
          </div>

          {/* Interactive Game Board */}
          <div className="flex justify-center overflow-auto max-h-[68vh] p-1">
            <GameBoard
              board={board}
              theme={currentTheme}
              isDarkTheme={isDark}
              cellSize={cellSize}
              mobileFlagMode={mobileFlagMode}
              onCellClick={handleCellClick}
              onCellRightClick={handleCellRightClick}
              onCellChord={handleCellChord}
              onBoardMouseDown={handleBoardMouseDown}
              onBoardMouseUp={handleBoardMouseUp}
            />
          </div>

          {/* In-Window Toolbar Controls (Zoom & Touch Flag Switch) */}
          <div className="mt-2 pt-1 border-t border-gray-400 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-pixel text-gray-700">
            {/* Mobile Flag Mode Toggle */}
            <button
              onClick={() => {
                sound.playButton();
                setMobileFlagMode((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded-none ${
                mobileFlagMode
                  ? 'bg-red-600 text-white retro-inset'
                  : 'bg-[#c0c0c0] text-black retro-outset active:retro-inset hover:bg-gray-200'
              }`}
            >
              <PixelFlag size={14} />
              <span>{mobileFlagMode ? '旗モード ON' : '掘るモード (タップで開く)'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#c0c0c0] px-1 py-0.5 retro-inset text-[11px] text-black">
              <span className="text-gray-600 text-[10px] hidden sm:inline">ズーム:</span>
              <button
                onClick={() => {
                  sound.playButton();
                  setCellSize((s) => Math.max(18, s - 3));
                }}
                className="w-5 h-5 bg-[#c0c0c0] retro-outset active:retro-inset font-bold flex items-center justify-center"
                title="縮小"
              >
                -
              </button>
              <span className="w-8 text-center font-mono">{cellSize}px</span>
              <button
                onClick={() => {
                  sound.playButton();
                  setCellSize((s) => Math.min(48, s + 3));
                }}
                className="w-5 h-5 bg-[#c0c0c0] retro-outset active:retro-inset font-bold flex items-center justify-center"
                title="拡大"
              >
                +
              </button>
              <button
                onClick={() => {
                  sound.playButton();
                  adjustCellSizeForBoard(currentConfig.cols);
                }}
                className="px-1.5 h-5 bg-[#c0c0c0] retro-outset active:retro-inset text-[10px]"
                title="画面幅に合わせて自動調整"
              >
                自動
              </button>
            </div>

            {/* Sound & CRT quick buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const muted = sound.toggleMute();
                  setIsMuted(muted);
                }}
                className="px-2 py-1 bg-[#c0c0c0] retro-outset active:retro-inset text-xs hover:bg-gray-200"
                title="音声切り替え (M)"
              >
                {isMuted ? '🔇 消音' : '🔊 音声'}
              </button>
              <button
                onClick={() => {
                  sound.playButton();
                  const next = !isCrtEnabled;
                  setIsCrtEnabled(next);
                  try {
                    localStorage.setItem('pixel_minesweeper_crt', String(next));
                  } catch {
                    // ignore
                  }
                }}
                className={`px-2 py-1 text-xs font-bold ${
                  isCrtEnabled
                    ? 'bg-[#000080] text-white retro-inset'
                    : 'bg-[#c0c0c0] text-black retro-outset hover:bg-gray-200'
                }`}
                title="CRT走査線エフェクト切り替え"
              >
                CRT
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Instructions / Shortcuts */}
      <footer className="w-full max-w-4xl mt-3 text-center text-[11px] font-pixel text-slate-400 select-none">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>左クリック: 開く</span>
          <span>右クリック / 長押し: 旗</span>
          <span>数字クリック: 周囲一括オープン (コード)</span>
          <span>F2 / R: やり直し</span>
          <span>1/2/3: 難易度切替</span>
        </div>
      </footer>

      {/* Modals */}
      {showDifficultyModal && (
        <DifficultyModal
          currentDifficulty={difficulty}
          customConfig={customConfig}
          onSelect={(newDiff, newCustom) => {
            setDifficulty(newDiff);
            if (newCustom) setCustomConfig(newCustom);
            resetGame(newDiff, newCustom || customConfig);
          }}
          onClose={() => setShowDifficultyModal(false)}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal
          initialDifficulty={difficulty}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}

      {showHighScoreModal && (
        <HighScoreInputModal
          time={elapsedTime}
          difficulty={difficulty}
          difficultyLabel={currentConfig.name}
          customConfig={difficulty === 'custom' ? customConfig : undefined}
          onSaved={() => {
            setShowHighScoreModal(false);
            setShowLeaderboardModal(true);
          }}
          onClose={() => setShowHighScoreModal(false)}
        />
      )}

      {showHelpModal && (
        <HelpAndSettingsModal
          crtEnabled={isCrtEnabled}
          onToggleCrt={(enabled) => {
            setIsCrtEnabled(enabled);
            try {
              localStorage.setItem('pixel_minesweeper_crt', String(enabled));
            } catch {
              // ignore
            }
          }}
          soundEnabled={!isMuted}
          onToggleSound={(enabled) => {
            sound.setMuted(!enabled);
            setIsMuted(!enabled);
          }}
          questionEnabled={enableQuestion}
          onToggleQuestion={(enabled) => setEnableQuestion(enabled)}
          onClose={() => setShowHelpModal(false)}
        />
      )}
    </div>
  );
}
