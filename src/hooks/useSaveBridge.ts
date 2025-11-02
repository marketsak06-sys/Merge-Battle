import { useEffect } from 'react';
import { saveGame } from '../game/utils/storage';
import { GameState } from '../game/types';

/**
 * useSaveBridge нужен если внешний контрол (например, отдельный компонент управления)
 * посылает событие merge_battle_request_save — мост слушает и сохраняет актуальный state.
 *
 * Использование: useSaveBridge(state)
 */
export const useSaveBridge = (state: GameState) => {
  useEffect(() => {
    const onRequest = () => {
      saveGame(state);
      // eslint-disable-next-line no-console
      console.log('Saved from bridge.');
    };

    window.addEventListener('merge_battle_request_save', onRequest);
    return () => {
      window.removeEventListener('merge_battle_request_save', onRequest);
    };
  }, [state]);
};
