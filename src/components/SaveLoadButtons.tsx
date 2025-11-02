import React from 'react';
import { loadGame, clearSave } from '../game/utils/storage';

type Props = {
  onLoad?: (s: any) => void;
  className?: string;
};

export const SaveLoadButtons: React.FC<Props> = ({ onLoad, className }) => {
  const onSave = () => {
    // Запрос на сохранение текущего состояния: слушатель в приложении должен реагировать
    // (альтернатива — передавать state через пропсы)
    const evt = new CustomEvent('merge_battle_request_save');
    window.dispatchEvent(evt);
  };

  const onLoadClick = () => {
    const saved = loadGame();
    if (saved && onLoad) onLoad(saved);
  };

  const onClear = () => {
    clearSave();
    const evt = new CustomEvent('merge_battle_cleared');
    window.dispatchEvent(evt);
  };

  return (
    <div className={className ?? 'save-load-controls'}>
      <button onClick={onSave} className="btn btn-small">Сохранить</button>
      <button onClick={onLoadClick} className="btn btn-small">Загрузить</button>
      <button onClick={onClear} className="btn btn-small btn-danger">Удалить сохранение</button>
    </div>
  );
};
