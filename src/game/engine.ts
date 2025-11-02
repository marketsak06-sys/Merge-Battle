import { Cell, GameState } from './types';

/**
 * Core game engine functions.
 * Эти функции не зависят от UI — можно покрыть тестами.
 */

export const createEmptyGrid = (rows: number, cols: number): Cell[][] => {
  const grid: Cell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        id: `${x}-${y}`,
        level: 0,
        x,
        y,
      });
    }
    grid.push(row);
  }
  return grid;
};

export const cloneState = (s: GameState): GameState => {
  // глубокое копирование через JSON (подходит для простых структур)
  return JSON.parse(JSON.stringify(s));
};

/**
 * applyMergeAt — простое правило мержа:
 * - при клике увеличиваем level на 1
 * - если level >= threshold, начисляем очки и сбрасываем уровень (можно заменить на логику мерджа соседей)
 * 
 * Возвращаем новый state и delta очков для UI/анимаций.
 */
export const applyMergeAt = (state: GameState, x: number, y: number): { state: GameState; scoreDelta: number } => {
  const ns = cloneState(state);
  const cell = ns.grid?.[y]?.[x];
  if (!cell) return { state: ns, scoreDelta: 0 };
  if (cell.locked) return { state: ns, scoreDelta: 0 };

  const threshold = 5;
  cell.level = (cell.level || 0) + 1;
  let scoreDelta = 0;
  if (cell.level >= threshold) {
    scoreDelta = cell.level * 10;
    cell.level = 1;
  }
  ns.score = (ns.score || 0) + scoreDelta;
  ns.moves = (ns.moves || 0) + 1;
  ns.lastUpdated = new Date().toISOString();
  return { state: ns, scoreDelta };
};
