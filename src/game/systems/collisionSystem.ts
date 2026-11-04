import { CONFIG } from '../config';
import type { IEnemy } from '../types';

export function circlesOverlap(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

/**
 * 공간 해시 격자. 적을 64px 칸에 나눠 담아 두면
 * "이 점 근처 적" 을 찾을 때 400마리 전부가 아니라 주변 몇 칸만 보면 된다.
 * 매 프레임 clear → insert 로 다시 만든다 (적이 계속 움직이므로).
 */
export class SpatialGrid {
  private cells = new Map<number, IEnemy[]>();
  private readonly size: number;

  constructor(cellSize: number = CONFIG.GRID_CELL_SIZE) {
    this.size = cellSize;
  }

  private key(cx: number, cy: number) {
    // 두 정수를 하나의 숫자 키로 (좌표 범위 ±32767 칸 가정)
    return (cx + 32768) * 65536 + (cy + 32768);
  }

  clear() {
    for (const list of this.cells.values()) list.length = 0;
  }

  insert(e: IEnemy) {
    const k = this.key(Math.floor(e.x / this.size), Math.floor(e.y / this.size));
    let list = this.cells.get(k);
    if (!list) {
      list = [];
      this.cells.set(k, list);
    }
    list.push(e);
  }

  /** (x, y) 반경 r 안에 "있을 수도 있는" 적을 out 에 담는다. 정확한 판정은 호출하는 쪽에서. */
  query(x: number, y: number, r: number, out: IEnemy[]) {
    out.length = 0;
    const s = this.size;
    const x0 = Math.floor((x - r) / s);
    const x1 = Math.floor((x + r) / s);
    const y0 = Math.floor((y - r) / s);
    const y1 = Math.floor((y + r) / s);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const list = this.cells.get(this.key(cx, cy));
        if (list) for (const e of list) out.push(e);
      }
    }
    return out;
  }
}

export function damageEnemy(e: IEnemy, amount: number) {
  e.hp -= amount;
  e.hitFlash = 0.08;
}
