import { CONFIG } from '../config';
import { pickEnemyType } from '../data/enemies';
import { newId, swapRemove, type GameWorld } from '../world';
import { createGem, rollGemValue } from './gemSystem';

export function getWave(elapsed: number) {
  return Math.floor(elapsed / CONFIG.WAVE_DURATION) + 1;
}

/** 화면 대각선 밖의 원 위 랜덤 지점 → 항상 화면 밖에서 나타난다. */
function spawnRadius(world: GameWorld) {
  return Math.hypot(world.view.w, world.view.h) / 2 + CONFIG.SPAWN_MARGIN;
}

export function spawnEnemies(world: GameWorld, dt: number) {
  const wave = getWave(world.elapsed);
  const interval = Math.max(0.12, 1.1 - wave * 0.1); // 웨이브마다 더 자주
  const batch = 1 + Math.floor(wave / 2); // 웨이브마다 더 많이

  world.spawnTimer -= dt;
  while (world.spawnTimer <= 0) {
    world.spawnTimer += interval;
    for (let i = 0; i < batch && world.enemies.length < CONFIG.ENEMY_MAX; i++) {
      const def = pickEnemyType(wave);
      const angle = Math.random() * Math.PI * 2;
      const r = spawnRadius(world);
      const hpMul = 1 + (wave - 1) * 0.15;
      world.enemies.push({
        id: newId(world),
        typeId: def.id,
        x: world.player.x + Math.cos(angle) * r,
        y: world.player.y + Math.sin(angle) * r,
        hp: def.hp * hpMul,
        maxHp: def.hp * hpMul,
        speed: def.speed,
        radius: def.radius,
        damage: def.damage,
        expBase: def.expBase,
        color: def.color,
        hitFlash: 0,
        orbitHitAt: -999,
      });
    }
  }
}

export function updateEnemies(world: GameWorld, dt: number) {
  const { player } = world;
  const farLimit = spawnRadius(world) * 1.6;
  for (const e of world.enemies) {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy) || 1;
    e.x += (dx / dist) * e.speed * dt;
    e.y += (dy / dist) * e.speed * dt;
    if (e.hitFlash > 0) e.hitFlash -= dt;

    // 너무 멀리 떨어진 적은 플레이어 반대편 화면 밖으로 옮긴다 (계속 쫓아오게)
    if (dist > farLimit) {
      e.x = player.x + (dx / dist) * spawnRadius(world);
      e.y = player.y + (dy / dist) * spawnRadius(world);
    }
  }
}

/** hp 가 0 이하인 적 제거 + 보석 드롭 */
export function removeDeadEnemies(world: GameWorld) {
  const wave = getWave(world.elapsed);
  const { enemies } = world;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.hp > 0) continue;
    createGem(world, e.x, e.y, rollGemValue(e.expBase, world.elapsed, wave));
    world.kills++;
    swapRemove(enemies, i);
  }
}
