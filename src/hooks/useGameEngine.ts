import { useCallback, useEffect, useState } from 'react';
import { GameState } from '../game/types';
import { createEmptyGrid, applyMergeAt } from '../game/engine';
import { loadGame, saveGame } from '../game/utils/storage';

const DEFAULT_ROWS = 6;
const DEFAULT_COLS = 6;

export const useGameEngine = (rows = DEFAULT_ROWS, cols = DEFAULT_COLS) => {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadGame();
    if (saved && typeof saved === 'object') {
      try {
        return saved as GameState;
      } catch {
        // fall through to default
      }
    }
    return {
      grid: createEmptyGrid(rows, cols),
      score: 0,
      moves: 0,
      lastUpdated: new Date().toISOString(),
    } as GameState;
  });

  useEffect(() => {
    // Автосохранение при изменениях состояния (с дебаунсом)
    const id = setTimeout(() => {
      saveGame(state);
    }, 800);
    return () => clearTimeout(id);
  }, [state]);

  const handleClickCell = useCallback((x: number, y: number) => {
    setState((prev) => {
      const res = applyMergeAt(prev, x, y);
      // Сохраняем синхронно после применения (без ожидания)
      saveGame(res.state);
      return res.state;
    });
  }, []);

  const reset = useCallback(() => {
    const newState: GameState = {
      grid: createEmptyGrid(rows, cols),
      score: 0,
      moves: 0,
      lastUpdated: new Date().toISOString(),
    };
    setState(newState);
    saveGame(newState);
  }, [rows, cols]);

  return { state, handleClickCell, reset, setState };
};
