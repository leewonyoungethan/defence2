import { useShallow } from 'zustand/react/shallow';
import { describeChoice } from '../game/data/upgrades';
import { useGameStore } from '../store/gameStore';

export function LevelUpModal() {
  const { choices, weapons, passives, chooseUpgrade, level } = useGameStore(
    useShallow((s) => ({ choices: s.choices, weapons: s.weapons, passives: s.passives, chooseUpgrade: s.chooseUpgrade, level: s.level })),
  );

  return (
    <div className="overlay">
      <div className="panel">
        <h2>레벨 업! (Lv {level})</h2>
        <p className="sub">하나를 고르세요</p>
        <div className="choices">
          {choices.map((c, i) => {
            const d = describeChoice(c, weapons, passives);
            return (
              <button key={i} className={c.kind === 'evolve' ? 'choice evolve' : 'choice'} onClick={() => chooseUpgrade(c)}>
                <span className="badge">{d.badge}</span>
                <strong>{d.title}</strong>
                <span className="desc">{d.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TitleScreen() {
  const startGame = useGameStore((s) => s.startGame);
  return (
    <div className="overlay">
      <div className="panel">
        <h1>별빛 표류자</h1>
        <p className="sub">방향키 / WASD 로 움직이기만 하세요. 무기는 알아서 쏩니다.</p>
        <ul className="legend">
          <li>
            <i style={{ background: '#3ee86b' }} /> 1~9 EXP
          </li>
          <li>
            <i style={{ background: '#3fa9ff' }} /> 10~49 EXP
          </li>
          <li>
            <i style={{ background: '#ffd23f' }} /> 50+ EXP
          </li>
          <li>
            <i style={{ background: '#ff4d5e' }} /> 합쳐진 보석
          </li>
        </ul>
        <button className="primary" onClick={startGame}>
          시작
        </button>
      </div>
    </div>
  );
}

export function GameOverScreen() {
  const { hud, level, startGame } = useGameStore(useShallow((s) => ({ hud: s.hud, level: s.level, startGame: s.startGame })));
  return (
    <div className="overlay">
      <div className="panel">
        <h2>쓰러졌다…</h2>
        <p className="sub">
          {Math.floor(hud.elapsed)}초 버팀 · Lv {level} · 처치 {hud.kills}
        </p>
        <button className="primary" onClick={startGame}>
          다시 하기
        </button>
      </div>
    </div>
  );
}
