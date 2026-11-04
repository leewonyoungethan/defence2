import { CONFIG } from '../config';
import type { PassiveId, UpgradeChoice, WeaponId } from '../types';
import { PASSIVES } from './passives';
import { WEAPONS } from './weapons';

type Levels<K extends string> = Partial<Record<K, number>>;

/** 진화 조건: 무기 최대 레벨 + 짝 패시브 1레벨 이상 */
export function findEvolutions(weapons: Levels<WeaponId>, passives: Levels<PassiveId>): UpgradeChoice[] {
  const result: UpgradeChoice[] = [];
  for (const [id, level] of Object.entries(weapons) as [WeaponId, number][]) {
    const evo = WEAPONS[id].evolution;
    if (evo && level >= WEAPONS[id].maxLevel && (passives[evo.passive] ?? 0) >= 1) {
      result.push({ kind: 'evolve', from: id, to: evo.into });
    }
  }
  return result;
}

/** 레벨업 때 보여줄 선택지 3개. 진화가 가능하면 항상 맨 앞에 넣는다. */
export function rollUpgradeChoices(weapons: Levels<WeaponId>, passives: Levels<PassiveId>, count = 3): UpgradeChoice[] {
  const evolutions = findEvolutions(weapons, passives);
  const pool: UpgradeChoice[] = [];

  const owned = Object.keys(weapons) as WeaponId[];
  for (const id of owned) {
    if ((weapons[id] ?? 0) < WEAPONS[id].maxLevel) pool.push({ kind: 'weaponUp', weaponId: id });
  }
  if (owned.length < CONFIG.MAX_WEAPON_SLOTS) {
    for (const def of Object.values(WEAPONS)) {
      // 진화 무기는 진화로만 얻는다. 진화 전/후 무기를 동시에 가지지 않는다.
      const evolvedFromOwned = owned.some((w) => WEAPONS[w].evolution?.into === def.id || def.evolution?.into === w);
      if (!def.evolved && !weapons[def.id] && !evolvedFromOwned) pool.push({ kind: 'newWeapon', weaponId: def.id });
    }
  }
  for (const id of Object.keys(PASSIVES) as PassiveId[]) {
    if ((passives[id] ?? 0) < CONFIG.MAX_PASSIVE_LEVEL) pool.push({ kind: 'passive', passiveId: id });
  }

  shuffle(pool);
  const choices = [...evolutions, ...pool].slice(0, count);
  return choices.length > 0 ? choices : [{ kind: 'heal' }];
}

export function describeChoice(c: UpgradeChoice, weapons: Levels<WeaponId>, passives: Levels<PassiveId>) {
  switch (c.kind) {
    case 'newWeapon':
      return { title: WEAPONS[c.weaponId].name, badge: '새 무기', desc: WEAPONS[c.weaponId].desc };
    case 'weaponUp':
      return { title: WEAPONS[c.weaponId].name, badge: `Lv ${(weapons[c.weaponId] ?? 0) + 1}`, desc: '피해량/개수/쿨타임 강화' };
    case 'passive':
      return { title: PASSIVES[c.passiveId].name, badge: `Lv ${(passives[c.passiveId] ?? 0) + 1}`, desc: PASSIVES[c.passiveId].desc };
    case 'evolve':
      return { title: WEAPONS[c.to].name, badge: '진화!', desc: WEAPONS[c.to].desc };
    case 'heal':
      return { title: '회복 물약', badge: '회복', desc: '체력 30 회복' };
  }
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
