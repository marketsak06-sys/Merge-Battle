import { createEmptyGrid, applyMergeAt } from '../game/engine';
import { GameState } from '../game/types';

test('createEmptyGrid dimensions', () => {
  const g = createEmptyGrid(4, 3);
  expect(g.length).toBe(4);
  expect(g[0].length).toBe(3);
});

test('applyMergeAt increases level and score', () => {
  const state: GameState = {
    grid: createEmptyGrid(3, 3),
    score: 0,
    moves: 0,
    lastUpdated: new Date().toISOString(),
  };
  const { state: s2, scoreDelta } = applyMergeAt(state, 1, 1);
  expect(s2.moves).toBe(1);
  expect(typeof scoreDelta).toBe('number');
  expect(s2.score).toBeGreaterThanOrEqual(0);
});
