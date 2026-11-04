import { create } from 'zustand';
import { rollUpgradeChoices } from '../game/data/upgrades';
import type { PassiveId, UpgradeChoice, WeaponId } from '../game/types';

/*
 * Zustand 에는 "가끔 바뀌는 중요한 이벤트" 만 넣는다.
 *  - EXP 획득(프레임당 최대 1번 합쳐서), 레벨업, 무기/패시브 선택, 게임오버
 *  - HUD 숫자(체력·시간·처치 수)는 0.1초마다 한 번만 보낸다.
 * 적/보석/총알의 좌표처럼 60fps 로 바뀌는 값은 절대 여기 넣지 않는다.
 * (그건 game/world.ts 의 일반 배열에 있고, GameCanvas 가 useRef 로 들고 있다.)
 */

export type GameStatus = 'title' | 'playing' | 'levelup' | 'gameover';

export interface HudSnapshot {
  hp: number;
  maxHp: number;
  elapsed: number;
  wave: number;
  kills: number;
  enemyCount: number;
  gemCount: number;
}

export interface GameState {
  status: GameStatus;
  runId: number; // 새 게임마다 +1 → GameCanvas 가 월드를 새로 만든다

  level: number;
  exp: number;
  expToNext: number;
  pendingLevelUps: number; // 한 번에 여러 레벨 오를 때 남은 선택 횟수
  choices: UpgradeChoice[];

  weapons: Partial<Record<WeaponId, number>>; // 무기 id → 레벨
  passives: Partial<Record<PassiveId, number>>;
  buildVersion: number; // 무기/패시브가 바뀔 때마다 +1 → 월드가 능력치를 다시 계산
  healQueued: number; // 회복 선택지 → 다음 프레임에 월드가 가져간다

  hud: HudSnapshot;

  startGame: () => void;
  addExp: (amount: number) => void;
  chooseUpgrade: (choice: UpgradeChoice) => void;
  syncHud: (hud: HudSnapshot) => void;
  consumeHeal: () => number;
  gameOver: () => void;
}

export function expForLevel(level: number) {
  return Math.floor(5 + level * 8 + Math.pow(level, 1.6));
}

const initialHud: HudSnapshot = { hp: 100, maxHp: 100, elapsed: 0, wave: 1, kills: 0, enemyCount: 0, gemCount: 0 };

export const useGameStore = create<GameState>()((set, get) => ({
  status: 'title',
  runId: 0,
  level: 1,
  exp: 0,
  expToNext: expForLevel(1),
  pendingLevelUps: 0,
  choices: [],
  weapons: {},
  passives: {},
  buildVersion: 0,
  healQueued: 0,
  hud: initialHud,

  startGame: () =>
    set((s) => ({
      status: 'playing',
      runId: s.runId + 1,
      level: 1,
      exp: 0,
      expToNext: expForLevel(1),
      pendingLevelUps: 0,
      choices: [],
      weapons: { sparkBolt: 1 }, // 시작 무기
      passives: {},
      buildVersion: s.buildVersion + 1,
      healQueued: 0,
      hud: initialHud,
    })),

  addExp: (amount) => {
    const s = get();
    let { exp, level, expToNext, pendingLevelUps } = s;
    exp += amount;
    while (exp >= expToNext) {
      exp -= expToNext;
      level += 1;
      expToNext = expForLevel(level);
      pendingLevelUps += 1;
    }
    if (pendingLevelUps > 0 && s.status === 'playing') {
      set({ exp, level, expToNext, pendingLevelUps, status: 'levelup', choices: rollUpgradeChoices(s.weapons, s.passives) });
    } else {
      set({ exp, level, expToNext, pendingLevelUps });
    }
  },

  chooseUpgrade: (choice) => {
    const s = get();
    const weapons = { ...s.weapons };
    const passives = { ...s.passives };
    let healQueued = s.healQueued;

    switch (choice.kind) {
      case 'newWeapon':
        weapons[choice.weaponId] = 1;
        break;
      case 'weaponUp':
        weapons[choice.weaponId] = (weapons[choice.weaponId] ?? 0) + 1;
        break;
      case 'passive':
        passives[choice.passiveId] = (passives[choice.passiveId] ?? 0) + 1;
        break;
      case 'evolve':
        delete weapons[choice.from];
        weapons[choice.to] = 1;
        break;
      case 'heal':
        healQueued += 30;
        break;
    }

    const pendingLevelUps = s.pendingLevelUps - 1;
    set({
      weapons,
      passives,
      healQueued,
      pendingLevelUps,
      buildVersion: s.buildVersion + 1,
      status: pendingLevelUps > 0 ? 'levelup' : 'playing',
      choices: pendingLevelUps > 0 ? rollUpgradeChoices(weapons, passives) : [],
    });
  },

  syncHud: (hud) => set({ hud }),

  consumeHeal: () => {
    const amount = get().healQueued;
    if (amount > 0) set({ healQueued: 0 });
    return amount;
  },

  gameOver: () => set({ status: 'gameover' }),
}));
