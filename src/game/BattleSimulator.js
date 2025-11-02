// src/game/BattleSimulator.js
// Простейшая пошаговая симуляция между двумя командами (arrays of Unit)
// Возвращает объект с результатом: { winner: 'A'|'B'|'draw', rounds, remainingA, remainingB }

function cloneTeam(units) {
  return units.map((u) => {
    const clone = u.clone ? u.clone() : JSON.parse(JSON.stringify(u));
    if (clone.reset) clone.reset();
    return clone;
  });
}

export default function simulateBattle(unitsA = [], unitsB = [], opts = {}) {
  const teamA = cloneTeam(unitsA);
  const teamB = cloneTeam(unitsB);

  const maxRounds = opts.maxRounds ?? 200;
  let round = 0;

  while (round < maxRounds) {
    round += 1;
    // чередование: обе команды атакуют в порядке скорости глобально
    const all = [...teamA.filter((u) => u.isAlive && u.isAlive()), ...teamB.filter((u) => u.isAlive && u.isAlive())];
    if (!all.length) break;

    all.sort((a, b) => b.speed - a.speed);

    for (const actor of all) {
      if (!actor.isAlive || (typeof actor.isAlive === 'function' && !actor.isAlive())) continue;

      const isA = teamA.includes(actor);
      const enemyTeam = isA ? teamB : teamA;
      const target = enemyTeam.find((u) => u.isAlive && u.isAlive());
      if (!target) {
        const winner = isA ? 'A' : 'B';
        return {
          winner,
          rounds: round,
          remainingA: teamA.filter((u) => u.isAlive && u.isAlive()).map((u) => u.serialize ? u.serialize() : u),
          remainingB: teamB.filter((u) => u.isAlive && u.isAlive()).map((u) => u.serialize ? u.serialize() : u),
        };
      }

      // простой урон: atk +/- небольшой рандом
      const variance = opts.variance ?? 0.08;
      const randFactor = 1 + (Math.random() * 2 - 1) * variance;
      const damage = Math.max(1, Math.round(actor.atk * randFactor));

      if (typeof target.takeDamage === 'function') {
        target.takeDamage(damage);
      } else {
        target.currentHp = Math.max(0, (target.currentHp || target.hp) - damage);
      }
    }

    const aliveA = teamA.some((u) => u.isAlive && u.isAlive());
    const aliveB = teamB.some((u) => u.isAlive && u.isAlive());
    if (!aliveA && !aliveB) {
      return { winner: 'draw', rounds: round, remainingA: [], remainingB: [] };
    }
    if (!aliveA) return { winner: 'B', rounds: round, remainingA: [], remainingB: teamB.filter((u) => u.isAlive && u.isAlive()).map((u) => u.serialize ? u.serialize() : u) };
    if (!aliveB) return { winner: 'A', rounds: round, remainingA: teamA.filter((u) => u.isAlive && u.isAlive()).map((u) => u.serialize ? u.serialize() : u), remainingB: [] };
  }

  // если по таймауту, определим победителя по суммарной powerScore
  const scoreA = teamA.reduce((s, u) => s + (u.powerScore ? u.powerScore() : 0), 0);
  const scoreB = teamB.reduce((s, u) => s + (u.powerScore ? u.powerScore() : 0), 0);
  const winner = scoreA === scoreB ? 'draw' : (scoreA > scoreB ? 'A' : 'B');

  return {
    winner,
    rounds: round,
    remainingA: teamA.filter((u) => u.isAlive && u.isAlive()).map((u) => u.serialize ? u.serialize() : u),
    remainingB: teamB.filter((u) => u.isAlive && u.isAlive()).map((u) => u.serialize ? u.serialize() : u),
  };
}
