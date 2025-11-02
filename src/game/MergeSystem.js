// src/game/MergeSystem.js
// Правила слияния и реализация mergeUnits.

import Unit from './Unit';

/**
 * Правило: merge возможен если у юнитов одинаковый type и одинаковый tier.
 * (Можно расширить: учёт редкости, тэгов, специальных правил)
 */
export function canMerge(unitA, unitB) {
  if (!unitA || !unitB) return false;
  if (unitA.type !== unitB.type) return false;
  if (unitA.tier !== unitB.tier) return false;
  // дополнительные проверки (locked, temporary flags) можно добавить здесь
  return true;
}

/**
 * mergeUnits: объединяет два юнита в новый юнит высшего тира.
 * Логика:
 * - новый tier = oldTier + 1
 * - параметры масштабируются: hp и atk суммируются и множатся на коэффициент роста
 * - скорость усредняется и немного улучшается
 * - новый id формируется автоматически
 *
 * Возвращает новый Unit (объект Unit) — НЕ мутирует исходные.
 */
export function mergeUnits(unitA, unitB, options = {}) {
  if (!canMerge(unitA, unitB)) {
    throw new Error('Units cannot be merged');
  }

  const baseTier = unitA.tier;
  const newTier = baseTier + 1;

  // базовая агрегация
  const combinedHp = (unitA.hp || 0) + (unitB.hp || 0);
  const combinedAtk = (unitA.atk || 0) + (unitB.atk || 0);
  const avgSpeed = ((unitA.speed || 1) + (unitB.speed || 1)) / 2;

  // коэффициенты роста (настраиваемые через options)
  const hpGrowth = options.hpGrowth ?? (1 + 0.15 * (newTier - 1));
  const atkGrowth = options.atkGrowth ?? (1 + 0.18 * (newTier - 1));
  const speedGrowth = options.speedGrowth ?? (1 + 0.02 * (newTier - 1));

  const merged = new Unit({
    type: unitA.type,
    tier: newTier,
    hp: Math.max(1, Math.round(combinedHp * hpGrowth)),
    atk: Math.max(1, Math.round(combinedAtk * atkGrowth)),
    speed: Math.max(0.2, +(avgSpeed * speedGrowth).toFixed(2)),
    meta: {
      mergedFrom: [unitA.id, unitB.id],
      createdAt: Date.now(),
      ...options.meta,
    },
  });

  return merged;
}

export default {
  canMerge,
  mergeUnits,
};
