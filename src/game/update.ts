import { useGameStore } from '../store/gameStore';
import { CONFIG } from './config';
import { computeStats } from './data/passives';
import type { Vec2 } from './types';
import { SpatialGrid } from './systems/collisionSystem';
import { getWave, removeDeadEnemies, spawnEnemies, updateEnemies } from './systems/enemySystem';
import { updateGems } from './systems/gemSystem';
import { updateProjectiles, updateWeapons } from './systems/weaponSystem';
import type { GameWorld } from './world';

const grid = new SpatialGrid();
const contactBuf: GameWorld['enemies'] = [];

/**
 * 한 프레임 진행. 순서가 중요하다:
 * 능력치 반영 → 이동 → 스폰 → 적 이동 → 격자 갱신 → 무기 → 투사체 → 접촉 피해 → 사망 처리 → 보석 → Zustand 로 이벤트 전달
 */
export function updateWorld(world: GameWorld, axis: Vec2, dt: number) {
  const store = useGameStore.getState(); // 구독이 아니라 "읽기" 라서 리렌더 없음

  // 1) 무기/패시브가 바뀌었으면 능력치 다시 계산
  if (store.buildVersion !== world.buildVersion) {
    const oldMax = world.stats.maxHp;
    world.stats = computeStats(store.passives);
    world.player.hp += Math.max(0, world.stats.maxHp - oldMax); // 최대 체력이 늘면 그만큼 채움
    world.player.hp = Math.min(world.stats.maxHp, world.player.hp + store.consumeHeal());
    world.buildVersion = store.buildVersion;
  }

  world.elapsed += dt;
  const { player } = world;

  // 2) 플레이어 이동 (플레이어가 하는 일은 이것뿐)
  player.x += axis.x * world.stats.moveSpeed * dt;
  player.y += axis.y * world.stats.moveSpeed * dt;
  if (axis.x !== 0 || axis.y !== 0) {
    player.facingX = axis.x;
    player.facingY = axis.y;
  }

  // 3) 적
  spawnEnemies(world, dt);
  updateEnemies(world, dt);

  // 4) 격자 다시 만들기 → 이후 충돌은 전부 격자로 찾는다
  grid.clear();
  for (const e of world.enemies) grid.insert(e);

  // 5) 무기 자동 발사 + 투사체
  updateWeapons(world, store.weapons, grid, dt);
  updateProjectiles(world, grid, dt);

  // 6) 적 ↔ 플레이어 접촉 피해
  for (const e of grid.query(player.x, player.y, player.radius + 30, contactBuf)) {
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const r = e.radius + player.radius;
    if (dx * dx + dy * dy <= r * r) player.hp -= e.damage * dt;
  }

  // 7) 죽은 적 → 보석
  removeDeadEnemies(world);

  // 8) 보석 자석/줍기/병합
  updateGems(world, dt);

  // 9) 프레임 끝: 중요한 이벤트만 Zustand 로
  if (world.pendingExp > 0) {
    store.addExp(world.pendingExp);
    world.pendingExp = 0;
  }

  if (player.hp <= 0 && !world.dead) {
    world.dead = true;
    player.hp = 0;
    syncHud(world);
    store.gameOver();
    return;
  }

  world.hudTimer -= dt;
  if (world.hudTimer <= 0) {
    world.hudTimer = CONFIG.HUD_SYNC_INTERVAL;
    syncHud(world);
  }
}

function syncHud(world: GameWorld) {
  useGameStore.getState().syncHud({
    hp: Math.ceil(world.player.hp),
    maxHp: world.stats.maxHp,
    elapsed: world.elapsed,
    wave: getWave(world.elapsed),
    kills: world.kills,
    enemyCount: world.enemies.length,
    gemCount: world.gems.length,
  });
}
