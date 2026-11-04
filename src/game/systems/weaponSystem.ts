import { getBoltParams, getOrbitParams, type BoltWeaponId, type OrbitWeaponId } from '../data/weapons';
import type { IEnemy, WeaponId } from '../types';
import { newId, swapRemove, type GameWorld } from '../world';
import { circlesOverlap, damageEnemy, type SpatialGrid } from './collisionSystem';

const scratch: IEnemy[] = [];

function findNearestEnemy(world: GameWorld): IEnemy | null {
  let best: IEnemy | null = null;
  let bestD = Infinity;
  for (const e of world.enemies) {
    const d = (e.x - world.player.x) ** 2 + (e.y - world.player.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

/** 무기 자동 발사. 플레이어는 움직이기만 하고, 무기는 쿨타임마다 알아서 쏜다. */
export function updateWeapons(world: GameWorld, weapons: Partial<Record<WeaponId, number>>, grid: SpatialGrid, dt: number) {
  world.orbitBlades.length = 0;

  for (const [id, level] of Object.entries(weapons) as [WeaponId, number][]) {
    switch (id) {
      case 'sparkBolt':
      case 'prismLance':
        fireBolts(world, id, level, dt);
        break;
      case 'orbitBlade':
      case 'haloStorm':
        spinBlades(world, id, level, grid, dt);
        break;
    }
  }
}

function fireBolts(world: GameWorld, id: BoltWeaponId, level: number, dt: number) {
  const p = getBoltParams(id, level);
  const timer = (world.weaponTimers[id] ?? 0) - dt;
  if (timer > 0) {
    world.weaponTimers[id] = timer;
    return;
  }
  world.weaponTimers[id] = p.cooldown * world.stats.cooldownMul;

  const target = findNearestEnemy(world);
  const { player } = world;
  // 적이 없으면 바라보는 방향으로 쏜다
  const baseAngle = target ? Math.atan2(target.y - player.y, target.x - player.x) : Math.atan2(player.facingY, player.facingX);
  const evolved = id === 'prismLance';

  for (let i = 0; i < p.count; i++) {
    const angle = baseAngle + (i - (p.count - 1) / 2) * p.spread;
    world.projectiles.push({
      id: newId(world),
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * p.speed,
      vy: Math.sin(angle) * p.speed,
      radius: p.radius,
      damage: p.damage * world.stats.damageMul,
      pierce: p.pierce,
      life: 1.6,
      color: evolved ? `hsl(${(world.elapsed * 300 + i * 50) % 360} 90% 65%)` : '#ffe27a',
      hitIds: [],
    });
  }
}

function spinBlades(world: GameWorld, id: OrbitWeaponId, level: number, grid: SpatialGrid, dt: number) {
  const p = getOrbitParams(id, level);
  world.orbitAngle += p.spin * dt;
  const evolved = id === 'haloStorm';
  const orbitR = evolved ? p.orbitRadius + Math.sin(world.elapsed * 3) * 25 : p.orbitRadius;

  for (let i = 0; i < p.blades; i++) {
    const a = world.orbitAngle + (i / p.blades) * Math.PI * 2;
    const bx = world.player.x + Math.cos(a) * orbitR;
    const by = world.player.y + Math.sin(a) * orbitR;
    world.orbitBlades.push({ x: bx, y: by, radius: p.bladeRadius, color: evolved ? '#ffb3ff' : '#9be7ff' });

    for (const e of grid.query(bx, by, p.bladeRadius + 30, scratch)) {
      if (world.elapsed - e.orbitHitAt < p.hitCooldown) continue;
      if (circlesOverlap(bx, by, p.bladeRadius, e.x, e.y, e.radius)) {
        damageEnemy(e, p.damage * world.stats.damageMul);
        e.orbitHitAt = world.elapsed;
      }
    }
  }
}

/** 투사체 이동 + 적과 충돌 */
export function updateProjectiles(world: GameWorld, grid: SpatialGrid, dt: number) {
  const list = world.projectiles;
  for (let i = list.length - 1; i >= 0; i--) {
    const pr = list[i];
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    pr.life -= dt;

    for (const e of grid.query(pr.x, pr.y, pr.radius + 30, scratch)) {
      if (pr.pierce <= 0) break;
      if (e.hp <= 0 || pr.hitIds.includes(e.id)) continue;
      if (circlesOverlap(pr.x, pr.y, pr.radius, e.x, e.y, e.radius)) {
        damageEnemy(e, pr.damage);
        pr.hitIds.push(e.id);
        pr.pierce--;
      }
    }

    if (pr.life <= 0 || pr.pierce <= 0) swapRemove(list, i);
  }
}
