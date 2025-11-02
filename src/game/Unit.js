// src/game/Unit.js
// Полная реализация базового Unit с сериализацией и утилитами для мерджа.

export default class Unit {
  constructor({ id = null, type = 'generic', tier = 1, hp = 10, atk = 5, speed = 1.0, meta = {} } = {}) {
    this.id = id || `${type}-t${tier}-${Date.now().toString(36)}`;
    this.type = type;
    this.tier = tier;
    this.hp = hp;
    this.atk = atk;
    this.speed = speed;
    this.meta = meta;
    this.currentHp = hp;
  }

  clone() {
    return new Unit({
      id: `${this.type}-t${this.tier}-${Date.now().toString(36)}`,
      type: this.type,
      tier: this.tier,
      hp: this.hp,
      atk: this.atk,
      speed: this.speed,
      meta: { ...this.meta },
    });
  }

  reset() {
    this.currentHp = this.hp;
  }

  isAlive() {
    return this.currentHp > 0;
  }

  takeDamage(dmg) {
    this.currentHp = Math.max(0, this.currentHp - dmg);
  }

  // Простая эвристика силы для симулятора
  powerScore() {
    return this.atk * Math.sqrt(this.hp) / Math.max(0.1, this.speed);
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      tier: this.tier,
      hp: this.hp,
      atk: this.atk,
      speed: this.speed,
      meta: this.meta,
    };
  }

  static deserialize(obj) {
    if (!obj) return null;
    return new Unit({
      id: obj.id,
      type: obj.type,
      tier: obj.tier,
      hp: obj.hp,
      atk: obj.atk,
      speed: obj.speed,
      meta: obj.meta || {},
    });
  }
}