# 별빛 표류자 (Starlight Drifter)

위에서 내려다보는 서바이버 로그라이크. 플레이어는 움직이기만 하고, 무기는 알아서 쏜다.
React + TypeScript + Zustand + Canvas + 직접 만든 `requestAnimationFrame` 루프.

```bash
npm install
npm run dev     # 개발 서버
npm run build   # 빌드 확인
```

## 1단계 — 폴더 구조

```
src/
├─ main.tsx, App.tsx          화면 전환 (타이틀 / 플레이 / 레벨업 / 게임오버)
├─ index.css
├─ store/
│  └─ gameStore.ts            ★ Zustand: 레벨, EXP, 무기/패시브, 게임 상태, HUD 스냅샷
├─ components/                React UI (가끔만 리렌더)
│  ├─ GameCanvas.tsx          ★ 캔버스 + 게임 루프 시작/정지, world 는 useRef
│  ├─ Hud.tsx                 EXP 바, 체력, 시간, 무기 목록
│  └─ Overlays.tsx            레벨업 선택창, 타이틀, 게임오버
└─ game/                      React 와 상관없는 순수 게임 코드
   ├─ config.ts               밸런스 숫자 모음
   ├─ types.ts                IGem, IEnemy, IProjectile ...
   ├─ world.ts                ★ GameWorld: 60fps 로 바뀌는 배열들 (React 밖)
   ├─ loop.ts                 requestAnimationFrame 루프
   ├─ input.ts                키보드 → 이동 방향
   ├─ update.ts               한 프레임 진행 순서 (시스템들을 차례로 호출)
   ├─ render.ts               캔버스 그리기 + 카메라 + 화면 밖 생략
   ├─ data/                   "무엇" (수치/이름) — 로직 없음
   │  ├─ weapons.ts           무기 정의, 레벨별 수치, 진화 짝
   │  ├─ passives.ts          패시브 정의, 능력치 계산
   │  ├─ enemies.ts           적 종류, 웨이브별 등장
   │  └─ upgrades.ts          레벨업 선택지 뽑기, 진화 조건
   └─ systems/                "어떻게" (매 프레임 로직)
      ├─ gemSystem.ts         ★ 보석 생성 / 자석 / 병합
      ├─ enemySystem.ts       스폰, 추적, 사망 → 보석 드롭
      ├─ weaponSystem.ts      자동 발사, 투사체, 회전 칼날
      └─ collisionSystem.ts   원 충돌 + 공간 해시 격자
```

핵심 규칙: **좌표처럼 매 프레임 바뀌는 값 → `game/world.ts` (일반 배열)**,
**레벨업처럼 가끔 일어나는 일 → `store/gameStore.ts` (Zustand)**.

## 오리지널 콘텐츠

| 종류 | 이름 | 진화 |
|---|---|---|
| 무기 | 불꽃 화살 (가까운 적 자동 조준) | Lv5 + 집중 렌즈 → **프리즘 창** (무한 관통 5갈래) |
| 무기 | 궤도 칼날 (몸 주위 회전) | Lv5 + 신속 톱니 → **후광 폭풍** (8개, 출렁이는 궤도) |
| 패시브 | 집중 렌즈 / 신속 톱니 / 자력 코어 / 생명 심장 | |
| 적 | 이끼뭉치 / 불씨 정령(웨이브2~) / 돌판 골렘(웨이브3~) | |

다음 단계는 [docs/ROADMAP.md](docs/ROADMAP.md).
