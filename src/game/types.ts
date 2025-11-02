export type Cell = {
  id: string;
  level: number; // номер уровня/ранга мержаемого элемента
  x: number;
  y: number;
  locked?: boolean;
};

export type GameState = {
  grid: Cell[][];
  score: number;
  moves: number;
  lastUpdated: string;
  meta?: Record<string, unknown>;
};

export type MoveDirection = 'up' | 'down' | 'left' | 'right';
