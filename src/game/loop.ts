import { CONFIG } from './config';

/**
 * requestAnimationFrame 기반 게임 루프.
 * 매 프레임 tick(dt) 를 부른다. dt 는 초 단위이고 MAX_DT 로 잘라서,
 * 탭을 갔다 와도 적이 순간이동하지 않게 한다.
 * 돌려주는 함수를 부르면 루프가 멈춘다 (useEffect cleanup 에서 사용).
 */
export function startGameLoop(tick: (dt: number) => void): () => void {
  let rafId = 0;
  let last = performance.now();
  let running = true;

  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, CONFIG.MAX_DT);
    last = now;
    tick(dt);
    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);
  return () => {
    running = false;
    cancelAnimationFrame(rafId);
  };
}
