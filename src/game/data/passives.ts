import { CONFIG } from '../config';
import type { PassiveId, PlayerStats } from '../types';

export interface PassiveDef {
  id: PassiveId;
  name: string;
  desc: string;
}

export const PASSIVES: Record<PassiveId, PassiveDef> = {
  focusLens: { id: 'focusLens', name: '집중 렌즈', desc: '공격력 +10%' },
  swiftGear: { id: 'swiftGear', name: '신속 톱니', desc: '무기 쿨타임 -8%' },
  magnetCore: { id: 'magnetCore', name: '자력 코어', desc: '보석 끌어당기는 범위 +25%' },
  vitalHeart: { id: 'vitalHeart', name: '생명 심장', desc: '최대 체력 +20' },
};

export function computeStats(passives: Partial<Record<PassiveId, number>>): PlayerStats {
  const lv = (id: PassiveId) => passives[id] ?? 0;
  return {
    damageMul: 1 + 0.1 * lv('focusLens'),
    cooldownMul: 1 - 0.08 * lv('swiftGear'),
    pickupRange: CONFIG.BASE_PICKUP_RANGE * (1 + 0.25 * lv('magnetCore')),
    maxHp: CONFIG.PLAYER_MAX_HP + 20 * lv('vitalHeart'),
    moveSpeed: CONFIG.PLAYER_SPEED,
  };
}
