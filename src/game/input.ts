import type { Vec2 } from './types';

const KEY_DIRS: Record<string, Vec2> = {
  ArrowUp: { x: 0, y: -1 },
  KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

/** 키보드 입력. 눌린 키를 Set 에 담아 두고, 루프가 매 프레임 getAxis() 로 읽는다. */
export function createInput() {
  const pressed = new Set<string>();
  const axis: Vec2 = { x: 0, y: 0 };

  const onDown = (e: KeyboardEvent) => {
    if (KEY_DIRS[e.code]) {
      pressed.add(e.code);
      e.preventDefault();
    }
  };
  const onUp = (e: KeyboardEvent) => pressed.delete(e.code);
  const onBlur = () => pressed.clear();

  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  window.addEventListener('blur', onBlur);

  return {
    /** 길이 0 또는 1 로 정규화된 이동 방향 (대각선이 더 빠르지 않게) */
    getAxis(): Vec2 {
      let x = 0;
      let y = 0;
      for (const code of pressed) {
        x += KEY_DIRS[code].x;
        y += KEY_DIRS[code].y;
      }
      const len = Math.hypot(x, y);
      axis.x = len > 0 ? x / len : 0;
      axis.y = len > 0 ? y / len : 0;
      return axis;
    },
    dispose() {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    },
  };
}

export type GameInput = ReturnType<typeof createInput>;
