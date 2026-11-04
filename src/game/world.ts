import { CONFIG } from './config';
import { computeStats } from './data/passives';
import type { IEnemy, IGem, IOrbitBlade, IPlayer, IProjectile, PlayerStats, WeaponId } from './types';

/*
 * GameWorld = 60fps 로 바뀌는 모든 것.
 * React 상태가 아니라 평범한 객체/배열이라서, 값을 바꿔도 리렌더가 일어나지 않는다.
 * GameCanvas 가 useRef 로 하나를 들고 있고, 게임 루프가 직접 고친다.
 */
export interface GameWorld {
  player: IPlayer;
  enemies: IEnemy[];
  gems: IGem[];
  projectiles: IProjectile[];
  orbitBlades: IOrbitBlade[]; // 매 프레임 다시 계산 (그리기 + 충돌용)

  weaponTimers: Partial<Record<WeaponId, number>>; // 무기별 남은 쿨타임
  orbitAngle: number;

  elapsed: number; // 실제 플레이 시간 (레벨업 화면에서는 멈춤)
  kills: number;
  spawnTimer: number;
  mergeTimer: number;
  hudTimer: number;
  pendingExp: number; // 이번 프레임에 주운 EXP. 프레임 끝에 한 번만 Zustand 로 보낸다.

  stats: PlayerStats;
  buildVersion: number; // 마지막으로 반영한 store.buildVersion

  view: { w: number; h: number }; // CSS 픽셀 기준 화면 크기
  nextId: number;
  dead: boolean;
}

export function createWorld(): GameWorld {
  const stats = computeStats({});
  return {
    player: { x: 0, y: 0, radius: CONFIG.PLAYER_RADIUS, hp: stats.maxHp, facingX: 1, facingY: 0 },
    enemies: [],
    gems: [],
    projectiles: [],
    orbitBlades: [],
    weaponTimers: {},
    orbitAngle: 0,
    elapsed: 0,
    kills: 0,
    spawnTimer: 0,
    mergeTimer: 0,
    hudTimer: 0,
    pendingExp: 0,
    stats,
    buildVersion: -1,
    view: { w: 800, h: 600 },
    nextId: 1,
    dead: false,
  };
}

export function newId(world: GameWorld) {
  return world.nextId++;
}

/** 배열 순서가 중요하지 않을 때 O(1) 삭제 (마지막 원소를 그 자리로 옮김) */
export function swapRemove<T>(arr: T[], index: number) {
  const last = arr.length - 1;
  if (index !== last) arr[index] = arr[last];
  arr.pop();
}
