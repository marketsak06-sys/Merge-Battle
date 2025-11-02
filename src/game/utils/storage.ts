const STORAGE_KEY = 'merge_battle_save_v1';

export const saveGame = (state: object) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    // логируем и возвращаем false, чтобы вызывающая часть могла уведомить пользователя
    // (оставляем без изменения UI)
    // eslint-disable-next-line no-console
    console.error('Save failed', e);
    return false;
  }
};

export const loadGame = (): object | null => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Load failed', e);
    return null;
  }
};

export const clearSave = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};
