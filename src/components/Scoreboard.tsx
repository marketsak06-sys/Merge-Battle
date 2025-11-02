import React from 'react';

type Props = {
  score: number;
  moves?: number;
  className?: string;
};

export const Scoreboard: React.FC<Props> = ({ score, moves, className }) => {
  return (
    <div className={className ?? 'scoreboard'}>
      <div className="scoreboard-row">
        <span className="label">Очки</span>
        <span className="value">{score}</span>
      </div>
      <div className="scoreboard-row">
        <span className="label">Ходы</span>
        <span className="value">{moves ?? 0}</span>
      </div>
    </div>
  );
};
