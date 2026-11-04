# 5단계 — 충돌 처리 & 스킬 구현 로드맵

지금 뼈대에 이미 들어 있는 것: 원 충돌, 공간 해시 격자(`collisionSystem.ts`),
투사체 관통, 회전 칼날 연속타격 방지, 무기 2종 + 진화 2종, 패시브 4종.

## A. 충돌 처리

| 순서 | 할 일 | 파일 | 메모 |
|---|---|---|---|
| A1 ✅ | 원-원 충돌 `circlesOverlap` | collisionSystem.ts | 제곱 거리로 비교 (sqrt 없음) |
| A2 ✅ | 공간 해시 격자 | collisionSystem.ts | 매 프레임 clear → insert. 400마리도 주변 칸만 검사 |
| A3 ✅ | 투사체 ↔ 적, 관통(`pierce`, `hitIds`) | weaponSystem.ts | |
| A4 ✅ | 적 ↔ 플레이어 접촉 피해(초당) | update.ts | |
| A5 | **피격 무적 시간** (맞은 뒤 0.5초) + 화면 흔들림 | update.ts, render.ts | 지금은 닿는 동안 계속 깎임 |
| A6 | **적끼리 밀어내기** (겹침 방지) | enemySystem.ts | 격자로 이웃만 보고, 겹친 만큼 반씩 밀기. 2프레임에 1번만 해도 충분 |
| A7 | **넉백** — 맞은 적을 뒤로 밀기 | collisionSystem.ts `damageEnemy` | 적에 `vx, vy` 추가, 매 프레임 감속 |
| A8 | 보석도 격자에 넣기 | gemSystem.ts | 보석 300개면 지금 방식도 충분. 자력 범위가 커지면 고려 |
| A9 | **오브젝트 풀** (적/투사체/보석 재사용) | world.ts | `push`/`swapRemove` 대신 풀에서 꺼내기 → GC 끊김 방지 |

## B. 스킬(무기) 구현

새 무기를 넣는 공식 (예: "번개 사슬"):

1. `types.ts` 의 `WeaponId` 에 id 추가
2. `data/weapons.ts` 의 `WEAPONS` 에 이름/설명/진화 짝 추가 + `getXxxParams(level)` 작성
3. `systems/weaponSystem.ts` 의 `updateWeapons` switch 에 동작 추가
4. 그리기가 다르면 `render.ts` 에 추가
5. 레벨업 선택지는 `upgrades.ts` 가 `WEAPONS` 를 읽으므로 자동으로 나옴

| 순서 | 스킬 | 동작 아이디어 | 진화 |
|---|---|---|---|
| B1 | 번개 사슬 | 랜덤 적 1명 → 가까운 적에게 N번 튕김 | + 자력 코어 → 폭풍 그물 |
| B2 | 서리 장판 | 플레이어 발밑에 남는 둔화 장판 (지속 피해) | + 생명 심장 → 빙하 정원 |
| B3 | 부메랑 별 | 바라보는 방향으로 던지고 되돌아옴 (2번 타격) | |
| B4 | 패시브 추가 | 이동속도, 투사체 개수 +1, 지속시간 | |
| B5 | 진화 연출 | 진화 선택 시 화면 번쩍 + 무기 아이콘 교체 | |

## C. 게임 흐름

| 순서 | 할 일 |
|---|---|
| C1 | 보스 웨이브 (5분마다 큰 적 1마리, 처치 시 보물상자 → 무기 레벨업) |
| C2 | 일시정지(ESC), 사운드 |
| C3 | 모바일 조이스틱 (터치 → `input.ts` 의 axis 만 바꾸면 됨) |
| C4 | 스프라이트 그림으로 교체 (`render.ts` 만 수정) |
| C5 | 저장: 최고 기록, 영구 강화 (localStorage) |

## 성능 체크리스트

- [ ] 크롬 성능 탭에서 적 400 + 보석 300 일 때 60fps 유지
- [ ] React DevTools "Highlight updates" 로 프레임마다 리렌더되는 컴포넌트가 없는지 확인
- [ ] `ctx.shadowBlur` 같은 비싼 효과는 쓰지 않기 (지금은 반투명 원으로 빛 표현)
