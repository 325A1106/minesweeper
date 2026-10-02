import React, { useRef, useState } from 'react';
import { Cell, ThemeConfig } from '../types/minesweeper';
import { NUMBER_COLORS, NUMBER_COLORS_DARK } from '../utils/themes';
import { PixelExplodedMine, PixelFalseFlag, PixelFlag, PixelMine, PixelQuestion } from '../utils/pixelSprites';

interface GameBoardProps {
  board: Cell[][];
  theme: ThemeConfig;
  isDarkTheme: boolean;
  cellSize: number;
  mobileFlagMode: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onCellChord: (row: number, col: number) => void;
  onBoardMouseDown: () => void;
  onBoardMouseUp: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  theme,
  isDarkTheme,
  cellSize,
  mobileFlagMode,
  onCellClick,
  onCellRightClick,
  onCellChord,
  onBoardMouseDown,
  onBoardMouseUp,
}) => {
  const longPressTimer = useRef<number | null>(null);
  const [highlightedCoords, setHighlightedCoords] = useState<Set<string>>(new Set());

  const numColors = isDarkTheme ? NUMBER_COLORS_DARK : NUMBER_COLORS;

  const handleTouchStart = (row: number, col: number) => {
    onBoardMouseDown();
    longPressTimer.current = window.setTimeout(() => {
      onCellRightClick(row, col);
      if (navigator.vibrate) navigator.vibrate(40);
      longPressTimer.current = null;
    }, 350);
  };

  const handleTouchEnd = (row: number, col: number) => {
    onBoardMouseUp();
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (mobileFlagMode) {
        onCellRightClick(row, col);
      } else {
        onCellClick(row, col);
      }
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Preview surrounding cells depressed when hovering/clicking on revealed number
  const handleNumberMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    if (e.button === 0 || e.buttons === 3) {
      // Left click or both buttons
      const coords = new Set<string>();
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          coords.add(`${row + dr},${col + dc}`);
        }
      }
      setHighlightedCoords(coords);
    }
  };

  const handleNumberMouseUp = (row: number, col: number) => {
    setHighlightedCoords(new Set());
    onCellChord(row, col);
  };

  return (
    <div
      className="inline-block p-1 bg-[#c0c0c0] retro-field-border overflow-auto max-w-full"
      style={{ backgroundColor: theme.boardBg }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={onBoardMouseDown}
      onMouseUp={() => {
        setHighlightedCoords(new Set());
        onBoardMouseUp();
      }}
      onMouseLeave={() => {
        setHighlightedCoords(new Set());
        onBoardMouseUp();
      }}
    >
      <div
        className="grid gap-[1px] bg-gray-500/40"
        style={{
          gridTemplateColumns: `repeat(${board[0]?.length || 9}, ${cellSize}px)`,
          width: 'fit-content',
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isHighlighted = highlightedCoords.has(`${r},${c}`) && !cell.isRevealed && !cell.isFlagged;

            // Revealed Cell
            if (cell.isRevealed) {
              if (cell.isExplodedMine) {
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{ width: cellSize, height: cellSize }}
                    className="border border-gray-400 flex items-center justify-center bg-red-600"
                  >
                    <PixelExplodedMine size={Math.round(cellSize * 0.72)} />
                  </div>
                );
              }

              if (cell.isMine) {
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{ width: cellSize, height: cellSize, backgroundColor: theme.cellRevealedBg }}
                    className="border border-gray-400 flex items-center justify-center"
                  >
                    <PixelMine size={Math.round(cellSize * 0.7)} />
                  </div>
                );
              }

              // Number or Empty Safe Tile
              const count = cell.neighborMines;
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: theme.cellRevealedBg,
                  }}
                  onMouseDown={(e) => {
                    if (count > 0) handleNumberMouseDown(r, c, e);
                  }}
                  onMouseUp={() => {
                    if (count > 0) handleNumberMouseUp(r, c);
                  }}
                  className={`border border-gray-400/80 flex items-center justify-center font-pixel font-bold select-none ${
                    count > 0 ? 'cursor-pointer hover:brightness-105' : 'cursor-default'
                  }`}
                >
                  {count > 0 && (
                    <span
                      style={{
                        color: numColors[count] || '#000000',
                        fontSize: Math.max(12, Math.round(cellSize * 0.62)),
                        lineHeight: 1,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </div>
              );
            }

            // Unrevealed Cell (Covered)
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: isHighlighted ? theme.cellRevealedBg : theme.cellCoveredBg,
                }}
                className={`relative flex items-center justify-center focus:outline-none select-none transition-none ${
                  isHighlighted ? 'retro-inset' : 'retro-outset active:retro-inset'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  if (mobileFlagMode) {
                    onCellRightClick(r, c);
                  } else {
                    onCellClick(r, c);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onCellRightClick(r, c);
                }}
                onTouchStart={() => handleTouchStart(r, c)}
                onTouchEnd={() => handleTouchEnd(r, c)}
                onTouchMove={handleTouchMove}
              >
                {cell.isFalseFlag ? (
                  <PixelFalseFlag size={Math.round(cellSize * 0.7)} />
                ) : cell.isFlagged ? (
                  <PixelFlag size={Math.round(cellSize * 0.7)} />
                ) : cell.isQuestion ? (
                  <PixelQuestion size={Math.round(cellSize * 0.65)} />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
