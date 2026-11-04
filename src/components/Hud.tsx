import { useShallow } from 'zustand/react/shallow';
import { WEAPONS } from '../game/data/weapons';
import { PASSIVES } from '../game/data/passives';
import type { PassiveId, WeaponId } from '../game/types';
import { useGameStore } from '../store/gameStore';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** HUD 는 Zustand 를 구독한다. hud 값은 0.1초마다만 바뀌므로 리렌더도 초당 최대 10번. */
export function Hud() {
  const { level, exp, expToNext, hud, weapons, passives } = useGameStore(
    useShallow((s) => ({ level: s.level, exp: s.exp, expToNext: s.expToNext, hud: s.hud, weapons: s.weapons, passives: s.passives })),
  );

  return (
    <div className="hud">
      <div className="exp-bar">
        <div className="exp-fill" style={{ width: `${(exp / expToNext) * 100}%` }} />
        <span className="exp-label">Lv {level}</span>
      </div>
      <div className="hud-row">
        <div className="hp-bar">
          <div className="hp-fill" style={{ width: `${(hud.hp / hud.maxHp) * 100}%` }} />
          <span>
            {hud.hp} / {hud.maxHp}
          </span>
        </div>
        <div className="hud-stat">⏱ {formatTime(hud.elapsed)}</div>
        <div className="hud-stat">🌊 웨이브 {hud.wave}</div>
        <div className="hud-stat">💀 {hud.kills}</div>
        <div className="hud-stat dim">
          적 {hud.enemyCount} · 보석 {hud.gemCount}
        </div>
      </div>
      <div className="loadout">
        {(Object.entries(weapons) as [WeaponId, number][]).map(([id, lv]) => (
          <span key={id} className={WEAPONS[id].evolved ? 'chip evolved' : 'chip'}>
            {WEAPONS[id].name} {WEAPONS[id].evolved ? '★' : `Lv${lv}`}
          </span>
        ))}
        {(Object.entries(passives) as [PassiveId, number][]).map(([id, lv]) => (
          <span key={id} className="chip passive">
            {PASSIVES[id].name} Lv{lv}
          </span>
        ))}
      </div>
    </div>
  );
}
