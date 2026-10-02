import { Cell } from '../types/minesweeper';

export const createEmptyBoard = (rows: number, cols: number): Cell[][] => {
  const board: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        isQuestion: false,
        neighborMines: 0,
      });
    }
    board.push(row);
  }
  return board;
};

// Populate mines with guaranteed safe zone around the first clicked cell
export const populateMines = (
  initialBoard: Cell[][],
  rows: number,
  cols: number,
  minesCount: number,
  firstClickRow: number,
  firstClickCol: number
): Cell[][] => {
  // Deep clone
  const board: Cell[][] = initialBoard.map((row) => row.map((cell) => ({ ...cell })));

  // Generate safe zone coordinates: first click cell + its 8 neighbors (if total cells allow)
  const safeCoords = new Set<string>();
  const totalCells = rows * cols;
  const canSpareNeighbors = totalCells - 9 >= minesCount;

  if (canSpareNeighbors) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = firstClickRow + dr;
        const nc = firstClickCol + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          safeCoords.add(`${nr},${nc}`);
        }
      }
    }
  } else {
    // Only exclude the exact clicked cell
    safeCoords.add(`${firstClickRow},${firstClickCol}`);
  }

  // Pick random coordinates for mines
  let placed = 0;
  const clampedMines = Math.min(minesCount, totalCells - 1);

  while (placed < clampedMines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const key = `${r},${c}`;

    if (!safeCoords.has(key) && !board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }

  // Calculate neighbor mine counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[r][c].neighborMines = count;
    }
  }

  return board;
};

// Reveal single cell and cascade flood-fill if 0 neighbor mines
export interface RevealResult {
  board: Cell[][];
  exploded: boolean;
  won: boolean;
  revealedCount: number;
}

export const revealCell = (
  currentBoard: Cell[][],
  rows: number,
  cols: number,
  totalMines: number,
  row: number,
  col: number
): RevealResult => {
  const board = currentBoard.map((r) => r.map((c) => ({ ...c })));
  const target = board[row][col];

  if (target.isRevealed || target.isFlagged) {
    return { board, exploded: false, won: false, revealedCount: 0 };
  }

  // Hit a mine!
  if (target.isMine) {
    target.isRevealed = true;
    target.isExplodedMine = true;

    // Reveal all mines & mark false flags
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (cell.isMine && !cell.isFlagged) {
          cell.isRevealed = true;
        } else if (!cell.isMine && cell.isFlagged) {
          cell.isFalseFlag = true;
        }
      }
    }

    return { board, exploded: true, won: false, revealedCount: 1 };
  }

  // Safe cell: reveal and cascade if neighborMines === 0
  let newlyRevealed = 0;
  const queue: [number, number][] = [[row, col]];
  target.isRevealed = true;
  newlyRevealed++;

  while (queue.length > 0) {
    const [currR, currC] = queue.shift()!;
    const currCell = board[currR][currC];

    if (currCell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = currR + dr;
          const nc = currC + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = board[nr][nc];
            if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
              neighbor.isRevealed = true;
              newlyRevealed++;
              if (neighbor.neighborMines === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  }

  // Check victory condition: revealed count === totalCells - totalMines
  let revealedTotal = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isRevealed) revealedTotal++;
    }
  }

  const won = revealedTotal === rows * cols - totalMines;
  if (won) {
    // Flag all remaining unflagged mines automatically
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].isMine && !board[r][c].isFlagged) {
          board[r][c].isFlagged = true;
        }
      }
    }
  }

  return { board, exploded: false, won, revealedCount: newlyRevealed };
};

// Chording: Clicking a revealed number cell with matching neighbor flags
export const chordCell = (
  currentBoard: Cell[][],
  rows: number,
  cols: number,
  totalMines: number,
  row: number,
  col: number
): RevealResult => {
  const cell = currentBoard[row][col];
  if (!cell.isRevealed || cell.neighborMines === 0) {
    return { board: currentBoard, exploded: false, won: false, revealedCount: 0 };
  }

  // Count flags around this cell
  let flagCount = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && currentBoard[nr][nc].isFlagged) {
        flagCount++;
      }
    }
  }

  if (flagCount !== cell.neighborMines) {
    return { board: currentBoard, exploded: false, won: false, revealedCount: 0 };
  }

  // Reveal all unflagged & unrevealed neighbors
  let board = currentBoard;
  let exploded = false;
  let totalRevealed = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = board[nr][nc];
        if (!neighbor.isRevealed && !neighbor.isFlagged) {
          const res = revealCell(board, rows, cols, totalMines, nr, nc);
          board = res.board;
          totalRevealed += res.revealedCount;
          if (res.exploded) {
            exploded = true;
            return { board, exploded: true, won: false, revealedCount: totalRevealed };
          }
        }
      }
    }
  }

  // Check victory condition
  let revealedTotal = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isRevealed) revealedTotal++;
    }
  }
  const won = revealedTotal === rows * cols - totalMines;

  return { board, exploded, won, revealedCount: totalRevealed };
};

// Cycle flag: None -> Flag -> Question -> None
export const cycleFlag = (
  currentBoard: Cell[][],
  row: number,
  col: number,
  enableQuestion: boolean = true
): { board: Cell[][]; flagDelta: number } => {
  const board = currentBoard.map((r) => r.map((c) => ({ ...c })));
  const cell = board[row][col];

  if (cell.isRevealed) {
    return { board, flagDelta: 0 };
  }

  let flagDelta = 0;
  if (!cell.isFlagged && !cell.isQuestion) {
    // Set flag
    cell.isFlagged = true;
    cell.isQuestion = false;
    flagDelta = 1;
  } else if (cell.isFlagged) {
    // Remove flag, set question if enabled
    cell.isFlagged = false;
    flagDelta = -1;
    if (enableQuestion) {
      cell.isQuestion = true;
    }
  } else if (cell.isQuestion) {
    // Remove question
    cell.isQuestion = false;
  }

  return { board, flagDelta };
};
