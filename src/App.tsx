import { GameCanvas } from './components/GameCanvas';
import { Hud } from './components/Hud';
import { GameOverScreen, LevelUpModal, TitleScreen } from './components/Overlays';
import { useGameStore } from './store/gameStore';

export default function App() {
  const status = useGameStore((s) => s.status);

  return (
    <div className="app">
      <GameCanvas />
      {status !== 'title' && <Hud />}
      {status === 'title' && <TitleScreen />}
      {status === 'levelup' && <LevelUpModal />}
      {status === 'gameover' && <GameOverScreen />}
    </div>
  );
}
