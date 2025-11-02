// src/game/GameManager.js
// Доработка ключевых методов менеджера: merge на бэнче, размещение, симуляция боя.
// Предполагается, что в проекте есть EventEmitter (utils/EventEmitter) и UnitFactory.

import EventEmitter from '../utils/EventEmitter';
import { createBaseUnit } from './UnitFactory';
import { canMerge, mergeUnits } from './MergeSystem';
import simulateBattle from './BattleSimulator';
import Unit from './Unit';

class GameManager {
  constructor({ benchSize = 6, boardWidth = 4, boardHeight = 4, startingCoins = 100 } = {}) {
    this.emitter = new EventEmitter();
    this.benchSize = benchSize;
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.state = {
      bench: Array.from({ length: benchSize }).map(() => null),
      board: Array.from({ length: boardHeight }, () => Array.from({ length: boardWidth }, () => null)),
      coins: startingCoins,
      shop: [],
      turn: 0,
    };
  }

  emitState() {
    this.emitter.emit('state', this.serializeState());
  }

  serializeState() {
    return {
      bench: this.state.bench.map((u) => (u ? (u.serialize ? u.serialize() : u) : null)),
      board: this.state.board.map((row) => row.map((u) => (u ? (u.serialize ? u.serialize() : u) : null))),
      coins: this.state.coins,
      turn: this.state.turn,
    };
  }

  // Попытка мерджа на бэнче (indexA, indexB) — возвращает результат и эмитит события
  tryMergeBench(indexA, indexB) {
    if (indexA === indexB) return { ok: false, reason: 'same_index' };
    if (indexA < 0 || indexB < 0 || indexA >= this.benchSize || indexB >= this.benchSize) return { ok: false, reason: 'bad_index' };

    const a = this.state.bench[indexA];
    const b = this.state.bench[indexB];
    if (!a || !b) return { ok: false, reason: 'empty_slot' };

    if (!canMerge(a, b)) return { ok: false, reason: 'cannot_merge' };

    const merged = mergeUnits(a, b);
    // Кладём merged в indexA и очищаем indexB
    this.state.bench[indexA] = merged;
    this.state.bench[indexB] = null;

    this.emitter.emit('merge', { indexA, indexB, result: merged.serialize ? merged.serialize() : merged });
    this.emitState();

    return { ok: true, result: merged.serialize ? merged.serialize() : merged };
  }

  // Ставит юнит с бэнча на доску (x,y). Если на клетке уже есть юнит — попытка swap/замена.
  tryPlaceFromBench(benchIndex, x, y) {
    if (benchIndex < 0 || benchIndex >= this.benchSize) return { ok: false, reason: 'bad_bench_index' };
    if (x < 0 || y < 0 || y >= this.state.board.length || x >= this.state.board[0].length) return { ok: false, reason: 'bad_board_index' };

    const unit = this.state.bench[benchIndex];
    if (!unit) return { ok: false, reason: 'empty_bench_slot' };

    const target = this.state.board[y][x];
    // простая логика: если слот пуст — переместить; если занят — поменять местами
    this.state.board[y][x] = unit;
    this.state.bench[benchIndex] = target || null;

    this.emitter.emit('place', { benchIndex, x, y, placed: unit.serialize ? unit.serialize() : unit });
    this.emitState();
    return { ok: true };
  }

  // Покупка из магазина (item объект со стоимостью price и id) — простая логика
  buyFromShop(item) {
    if (!item || typeof item.price !== 'number') return { ok: false, reason: 'invalid_item' };
    if (this.state.coins < item.price) return { ok: false, reason: 'not_enough_coins' };
    this.state.coins -= item.price;

    // если item.type === 'unit' — созадать базовый юнит и положить в бэнч (первый пустой слот)
    if (item.type === 'unit') {
      const newUnit = createBaseUnit(item.unitType || 'generic');
      const idx = this.state.bench.findIndex((s) => !s);
      if (idx === -1) {
        // бэнч полон — возвращаем error (в дальнейшем можно сбрасывать или продавать)
        this.state.coins += item.price;
        return { ok: false, reason: 'bench_full' };
      }
      this.state.bench[idx] = newUnit;
      this.emitter.emit('shop:buy_unit', { item, idx, unit: newUnit.serialize ? newUnit.serialize() : newUnit });
    } else {
      // другие типы айтемов: powerup, tileset, theme и т.д.
      this.emitter.emit('shop:buy_item', { item });
    }

    this.emitState();
    return { ok: true };
  }

  // Запускаем симуляцию боя между board (или указанными командами)
  simulateBattle({ teamA = null, teamB = null } = {}) {
    // по умолчанию: берём расстановку игрока vs AI (на входе можно прокинуть юнитов)
    const extractUnitsFromBoard = (board) => {
      const units = [];
      for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
          const u = board[y][x];
          if (u) units.push(u instanceof Unit ? u : Unit.deserialize ? Unit.deserialize(u) : u);
        }
      }
      return units;
    };

    const aUnits = teamA ? teamA.map((u) => (u instanceof Unit ? u : Unit.deserialize ? Unit.deserialize(u) : u)) : extractUnitsFromBoard(this.state.board);
    // opponent: простая генерация (можно заменить AI)
    const bUnits = teamB ? teamB.map((u) => (u instanceof Unit ? u : Unit.deserialize ? Unit.deserialize(u) : u)) : [createBaseUnit('generic'), createBaseUnit('generic')];

    const result = simulateBattle(aUnits, bUnits);
    this.emitter.emit('battle:result', result);
    this.emitState();
    return result;
  }

  // Примеры небольших утилит:
  addCoins(n) {
    this.state.coins += n;
    this.emitState();
  }

  on(event, cb) {
    this.emitter.on(event, cb);
  }

  off(event, cb) {
    this.emitter.off(event, cb);
  }
}

export default GameManager
