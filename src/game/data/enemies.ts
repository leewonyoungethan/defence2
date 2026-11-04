import type { EnemyTypeId } from '../types';

export interface EnemyDef {
  id: EnemyTypeId;
  name: string;
  hp: number;
  speed: number;
  radius: number;
  damage: number; // 초당 접촉 피해
  expBase: number; // 보석 값의 기본치 (시간이 갈수록 배율이 붙음)
  color: string;
  minWave: number; // 이 웨이브부터 등장
  weight: number; // 등장 확률 가중치
}

export const ENEMY_TYPES: Record<EnemyTypeId, EnemyDef> = {
  mossling: { id: 'mossling', name: '이끼뭉치', hp: 14, speed: 70, radius: 12, damage: 10, expBase: 1, color: '#7bbf6a', minWave: 1, weight: 10 },
  emberWisp: { id: 'emberWisp', name: '불씨 정령', hp: 9, speed: 130, radius: 9, damage: 8, expBase: 2, color: '#ff9a3c', minWave: 2, weight: 6 },
  shaleGolem: { id: 'shaleGolem', name: '돌판 골렘', hp: 90, speed: 45, radius: 22, damage: 25, expBase: 8, color: '#8d8aa8', minWave: 3, weight: 2 },
};

const ENEMY_LIST = Object.values(ENEMY_TYPES);

/** 웨이브에 맞는 적 종류를 가중치 랜덤으로 고른다. */
export function pickEnemyType(wave: number): EnemyDef {
  const pool = ENEMY_LIST.filter((e) => e.minWave <= wave);
  const total = pool.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return pool[0];
}
