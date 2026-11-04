import type { PassiveId, WeaponId } from '../types';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  desc: string;
  maxLevel: number;
  evolved: boolean;
  /** 최대 레벨 + 이 패시브 보유 → into 로 진화 */
  evolution?: { passive: PassiveId; into: WeaponId };
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  sparkBolt: {
    id: 'sparkBolt',
    name: '불꽃 화살',
    desc: '가장 가까운 적에게 빛 화살을 쏜다.',
    maxLevel: 5,
    evolved: false,
    evolution: { passive: 'focusLens', into: 'prismLance' },
  },
  orbitBlade: {
    id: 'orbitBlade',
    name: '궤도 칼날',
    desc: '몸 주위를 도는 칼날이 닿는 적을 벤다.',
    maxLevel: 5,
    evolved: false,
    evolution: { passive: 'swiftGear', into: 'haloStorm' },
  },
  prismLance: {
    id: 'prismLance',
    name: '프리즘 창',
    desc: '[진화] 모든 적을 꿰뚫는 무지개 창을 부채꼴로 쏜다.',
    maxLevel: 1,
    evolved: true,
  },
  haloStorm: {
    id: 'haloStorm',
    name: '후광 폭풍',
    desc: '[진화] 넓게 출렁이는 칼날 8개가 빠르게 돈다.',
    maxLevel: 1,
    evolved: true,
  },
};

// 레벨별 수치. 무기 시스템은 이 함수들만 보고 동작한다.
export type BoltWeaponId = 'sparkBolt' | 'prismLance';
export type OrbitWeaponId = 'orbitBlade' | 'haloStorm';

export function getBoltParams(id: BoltWeaponId, level: number) {
  if (id === 'prismLance') {
    return { cooldown: 0.45, count: 5, damage: 40, pierce: 99, speed: 720, radius: 8, spread: 0.22 };
  }
  return {
    cooldown: 1.0 - 0.1 * (level - 1),
    count: 1 + Math.floor((level - 1) / 2),
    damage: 12 + 4 * (level - 1),
    pierce: 1,
    speed: 520,
    radius: 5,
    spread: 0.15,
  };
}

export function getOrbitParams(id: OrbitWeaponId, level: number) {
  if (id === 'haloStorm') {
    return { blades: 8, orbitRadius: 110, damage: 30, spin: 5, bladeRadius: 14, hitCooldown: 0.25 };
  }
  return { blades: level + 1, orbitRadius: 70, damage: 8 + 3 * level, spin: 3, bladeRadius: 10, hitCooldown: 0.4 };
}
