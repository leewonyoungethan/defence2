export interface Vec2 {
  x: number;
  y: number;
}

export type WeaponId = 'sparkBolt' | 'orbitBlade' | 'prismLance' | 'haloStorm';
export type PassiveId = 'focusLens' | 'swiftGear' | 'magnetCore' | 'vitalHeart';
export type EnemyTypeId = 'mossling' | 'emberWisp' | 'shaleGolem';

/** 보석 색 단계. red 는 병합으로만 생긴다. */
export type GemTier = 'green' | 'blue' | 'yellow' | 'red';

export interface IGem {
  id: number;
  x: number;
  y: number;
  value: number; // 이 보석이 주는 EXP
  tier: GemTier;
  radius: number; // 값에 따라 커진다
  magnetized: boolean; // 한 번 끌려오기 시작하면 끝까지 따라온다
  speed: number; // 자석으로 끌려올 때 현재 속도 (가속)
  merged: boolean; // 병합으로 생긴 빨간 보석인지
}

export interface IEnemy {
  id: number;
  typeId: EnemyTypeId;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  damage: number; // 닿아 있는 동안 초당 피해
  expBase: number;
  color: string;
  hitFlash: number; // 맞았을 때 하얗게 깜빡이는 남은 시간
  orbitHitAt: number; // 회전 칼날에 마지막으로 맞은 시각 (연속 타격 방지)
}

export interface IProjectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  pierce: number; // 남은 관통 수. 0 이 되면 사라짐
  life: number; // 남은 수명(초)
  color: string;
  hitIds: number[]; // 이미 맞힌 적 (관통 중 같은 적 중복 타격 방지)
}

export interface IOrbitBlade {
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface IPlayer {
  x: number;
  y: number;
  radius: number;
  hp: number;
  facingX: number;
  facingY: number;
}

/** 패시브로 계산되는 최종 능력치 */
export interface PlayerStats {
  damageMul: number;
  cooldownMul: number;
  pickupRange: number;
  maxHp: number;
  moveSpeed: number;
}

export type UpgradeChoice =
  | { kind: 'newWeapon'; weaponId: WeaponId }
  | { kind: 'weaponUp'; weaponId: WeaponId }
  | { kind: 'passive'; passiveId: PassiveId }
  | { kind: 'evolve'; from: WeaponId; to: WeaponId }
  | { kind: 'heal' };
