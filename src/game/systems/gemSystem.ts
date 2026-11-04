import { CONFIG } from '../config';
import type { GemTier, IGem } from '../types';
import { newId, swapRemove, type GameWorld } from '../world';

export const GEM_COLORS: Record<GemTier, string> = {
  green: '#3ee86b',
  blue: '#3fa9ff',
  yellow: '#ffd23f',
  red: '#ff4d5e',
};

/** 1~9 초록, 10~49 파랑, 50+ 노랑. 병합된 보석은 값과 상관없이 빨강. */
export function getGemTier(value: number, merged = false): GemTier {
  if (merged) return 'red';
  if (value >= 50) return 'yellow';
  if (value >= 10) return 'blue';
  return 'green';
}

/** 값이 클수록 크게. log 를 써서 너무 커지지 않게 한다. */
export function getGemRadius(value: number, merged = false) {
  const r = 4 + Math.log2(value + 1) * 1.3;
  return merged ? Math.min(r + 4, 22) : Math.min(r, 14);
}

/**
 * 몬스터가 떨어뜨릴 보석 값.
 * 시간이 지날수록(분당 +60%) 웨이브가 높을수록 값이 오르고, 5% 확률로 5배 "대박" 보석.
 */
export function rollGemValue(expBase: number, elapsedSec: number, wave: number) {
  const timeMul = 1 + (elapsedSec / 60) * 0.6;
  const waveMul = 1 + (wave - 1) * 0.1;
  const jackpot = Math.random() < 0.05 ? 5 : 1;
  return Math.max(1, Math.round(expBase * timeMul * waveMul * jackpot));
}

export function createGem(world: GameWorld, x: number, y: number, value: number, merged = false): IGem {
  const gem: IGem = {
    id: newId(world),
    x,
    y,
    value,
    tier: getGemTier(value, merged),
    radius: getGemRadius(value, merged),
    magnetized: false,
    speed: 0,
    merged,
  };
  world.gems.push(gem);
  return gem;
}

/**
 * 자석 + 줍기.
 * pickupRange 안에 들어온 보석은 magnetized 가 되고, 매 프레임 속도가 빨라지며 플레이어에게 날아온다.
 * 플레이어에 닿으면 EXP 를 world.pendingExp 에 모은다 (Zustand 호출은 프레임 끝에 1번).
 */
export function updateGems(world: GameWorld, dt: number) {
  const { player, gems } = world;
  const range = world.stats.pickupRange;
  const range2 = range * range;

  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    const dx = player.x - g.x;
    const dy = player.y - g.y;
    const dist2 = dx * dx + dy * dy;

    const collectR = player.radius + g.radius;
    if (dist2 <= collectR * collectR) {
      world.pendingExp += g.value;
      swapRemove(gems, i);
      continue;
    }

    if (!g.magnetized && dist2 <= range2) {
      g.magnetized = true;
      g.speed = CONFIG.GEM_MAGNET_START_SPEED;
    }

    if (g.magnetized) {
      g.speed = Math.min(g.speed + CONFIG.GEM_MAGNET_ACCEL * dt, CONFIG.GEM_MAGNET_MAX_SPEED);
      const dist = Math.sqrt(dist2);
      const step = Math.min(g.speed * dt, dist); // 지나쳐 버리지 않게
      g.x += (dx / dist) * step;
      g.y += (dy / dist) * step;
    }
  }

  world.mergeTimer -= dt;
  if (world.mergeTimer <= 0) {
    world.mergeTimer = CONFIG.GEM_MERGE_CHECK_INTERVAL;
    mergeExcessGems(world);
  }
}

/**
 * 병합 최적화.
 * 보석이 GEM_MAX_COUNT(300) 를 넘으면, 플레이어에게서 가장 먼 보석들을 골라
 * EXP 합계를 가진 빨간 보석 1개로 합쳐 GEM_MERGE_TARGET 개까지 줄인다.
 *  - 끌려오는 중(magnetized)인 보석은 곧 먹히니까 건드리지 않는다.
 *  - 새 빨간 보석은 고른 보석 중 값이 가장 큰 자리에 둔다.
 *    → 이미 빨간 보석이 있으면 보통 그 자리에서 계속 커진다.
 */
export function mergeExcessGems(world: GameWorld) {
  const { gems, player } = world;
  if (gems.length <= CONFIG.GEM_MAX_COUNT) return;

  const candidates: { gem: IGem; d2: number }[] = [];
  for (const g of gems) {
    if (g.magnetized) continue;
    const dx = g.x - player.x;
    const dy = g.y - player.y;
    candidates.push({ gem: g, d2: dx * dx + dy * dy });
  }
  candidates.sort((a, b) => b.d2 - a.d2); // 먼 순서

  // n 개를 1개로 합치면 n-1 개가 줄어든다.
  const mergeCount = Math.min(candidates.length, gems.length - CONFIG.GEM_MERGE_TARGET + 1);
  if (mergeCount < 2) return;

  const picked = new Set<IGem>();
  let total = 0;
  let anchor = candidates[0].gem;
  for (let i = 0; i < mergeCount; i++) {
    const g = candidates[i].gem;
    picked.add(g);
    total += g.value;
    if (g.value > anchor.value) anchor = g;
  }

  const ax = anchor.x;
  const ay = anchor.y;
  world.gems = gems.filter((g) => !picked.has(g));
  createGem(world, ax, ay, total, true);
}
