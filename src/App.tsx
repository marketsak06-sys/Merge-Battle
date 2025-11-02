import React, { useEffect } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Scoreboard } from './components/Scoreboard';
import { SaveLoadButtons } from './components/SaveLoadButtons';
import { saveGame } from './game/utils/storage';
import { useSaveBridge } from './hooks/useSaveBridge';

export const App: React.FC = () => {
  const { state, handleClickCell, reset, setState } = useGameEngine();
  // мост, чтобы внешние события сохраняли текущее состояние
  useSaveBridge(state);

  // Слушаем глобальные события load/clear от SaveLoadButtons (альтернативный путь)
  useEffect(() => {
    const onCleared = () => {
      // при удалении сохранения можно сбросить UI или показать уведомление
      // здесь просто логируем
      // eslint-disable-next-line no-console
      console.log('Save cleared by user');
    };

    window.addEventListener('merge_battle_cleared', onCleared);
    return () => {
      window.removeEventListener('merge_battle_cleared', onCleared);
    };
  }, []);

  return (
    <div className="game-root">
      <div className="topbar">
        <Scoreboard score={state.score} moves={state.moves} className="my-scoreboard" />
        <SaveLoadButtons
          className="my-save-controls"
          onLoad={(s) => {
            if (s) setState(s);
          }}
        />
      </div>

      <div className="grid">
        {state.grid.map((row, y) => (
          <div key={`row-${y}`} className="grid-row">
            {row.map((cell, x) => (
              <div
                key={cell.id}
                className={`cell level-${cell.level}`}
                onClick={() => handleClickCell(x, y)}
                aria-label={`cell-${x}-${y}`}
              >
                {/* Вставьте свою текущую визуализацию клетки здесь, чтобы не менять дизайн */}
                <span>{cell.level}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={() => reset()} className="btn btn-primary">Сброс</button>
      </div>
    </div>
  );
};

export default App;
