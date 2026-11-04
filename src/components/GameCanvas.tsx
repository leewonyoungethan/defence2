import { useEffect, useRef } from 'react';
import { createInput } from '../game/input';
import { startGameLoop } from '../game/loop';
import { renderWorld } from '../game/render';
import { updateWorld } from '../game/update';
import { createWorld, type GameWorld } from '../game/world';
import { useGameStore } from '../store/gameStore';

/**
 * 캔버스 + 게임 루프.
 * - 월드(적/보석/총알 좌표)는 useRef 안에만 있다 → 매 프레임 바뀌어도 React 리렌더 0번.
 * - 이 컴포넌트가 구독하는 Zustand 값은 runId 하나뿐 (새 게임 시작 때만 리렌더).
 * - 루프 안에서는 useGameStore.getState() 로 "읽기만" 한다.
 */
export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<GameWorld | null>(null);
  const runId = useGameStore((s) => s.runId);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const world = createWorld();
    worldRef.current = world;
    const input = createInput();
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      world.view.w = window.innerWidth;
      world.view.h = window.innerHeight;
      canvas.width = Math.floor(world.view.w * dpr);
      canvas.height = Math.floor(world.view.h * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // 개발 중 콘솔에서 월드를 들여다볼 수 있게 (window.__world)
    if (import.meta.env.DEV) (window as unknown as { __world: GameWorld }).__world = world;

    const stop = startGameLoop((dt) => {
      // 레벨업 선택 중/타이틀/게임오버에는 시뮬레이션을 멈추고 그리기만 한다.
      if (useGameStore.getState().status === 'playing') updateWorld(world, input.getAxis(), dt);
      renderWorld(ctx, world, dpr);
    });

    return () => {
      stop();
      input.dispose();
      window.removeEventListener('resize', resize);
      worldRef.current = null;
    };
  }, [runId]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}
