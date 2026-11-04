import { GEM_COLORS } from './systems/gemSystem';
import type { GameWorld } from './world';

const GRID = 80;

/** 월드를 캔버스에 그린다. 카메라는 항상 플레이어 가운데. 화면 밖 물체는 건너뛴다(컬링). */
export function renderWorld(ctx: CanvasRenderingContext2D, world: GameWorld, dpr: number) {
  const { w, h } = world.view;
  const { player } = world;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#14121f';
  ctx.fillRect(0, 0, w, h);

  const camX = player.x - w / 2;
  const camY = player.y - h / 2;
  ctx.translate(-camX, -camY);

  // 바닥 격자 (움직이는 느낌)
  ctx.strokeStyle = '#221f33';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = Math.floor(camX / GRID) * GRID; x < camX + w; x += GRID) {
    ctx.moveTo(x, camY);
    ctx.lineTo(x, camY + h);
  }
  for (let y = Math.floor(camY / GRID) * GRID; y < camY + h; y += GRID) {
    ctx.moveTo(camX, y);
    ctx.lineTo(camX + w, y);
  }
  ctx.stroke();

  const inView = (x: number, y: number, r: number) => x + r > camX && x - r < camX + w && y + r > camY && y - r < camY + h;

  // 보석 (다이아몬드 모양)
  for (const g of world.gems) {
    if (!inView(g.x, g.y, g.radius)) continue;
    if (g.merged) {
      ctx.fillStyle = 'rgba(255, 77, 94, 0.25)';
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius * 1.8 + Math.sin(world.elapsed * 6) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = GEM_COLORS[g.tier];
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - g.radius);
    ctx.lineTo(g.x + g.radius * 0.7, g.y);
    ctx.lineTo(g.x, g.y + g.radius);
    ctx.lineTo(g.x - g.radius * 0.7, g.y);
    ctx.closePath();
    ctx.fill();
  }

  // 적
  for (const e of world.enemies) {
    if (!inView(e.x, e.y, e.radius)) continue;
    ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
    // 눈 두 개
    ctx.fillStyle = '#14121f';
    const eye = e.radius * 0.18;
    ctx.fillRect(e.x - e.radius * 0.4, e.y - e.radius * 0.25, eye, eye);
    ctx.fillRect(e.x + e.radius * 0.25, e.y - e.radius * 0.25, eye, eye);
  }

  // 투사체
  for (const p of world.projectiles) {
    if (!inView(p.x, p.y, p.radius)) continue;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 회전 칼날
  for (const b of world.orbitBlades) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 자석 범위 (옅은 원)
  ctx.strokeStyle = 'rgba(120, 200, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(player.x, player.y, world.stats.pickupRange, 0, Math.PI * 2);
  ctx.stroke();

  // 플레이어
  ctx.fillStyle = '#f4f1ff';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a5cff';
  ctx.beginPath();
  ctx.arc(player.x + player.facingX * 7, player.y + player.facingY * 7, 5, 0, Math.PI * 2);
  ctx.fill();
}
