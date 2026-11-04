// 게임 밸런스 숫자는 전부 여기 모아 둔다. (튜닝할 때 이 파일만 고치면 됨)
export const CONFIG = {
  MAX_DT: 0.05, // 탭 전환 등으로 프레임이 길어져도 한 번에 50ms 까지만 진행

  PLAYER_SPEED: 220,
  PLAYER_RADIUS: 14,
  PLAYER_MAX_HP: 100,
  BASE_PICKUP_RANGE: 90,

  // 보석: 이 개수를 넘으면 먼 보석들을 빨간 보석 하나로 합친다.
  GEM_MAX_COUNT: 300,
  GEM_MERGE_TARGET: 240, // 합친 뒤 남길 개수 (매 프레임 합치지 않도록 여유를 둔다)
  GEM_MERGE_CHECK_INTERVAL: 0.5, // 초
  GEM_MAGNET_START_SPEED: 60,
  GEM_MAGNET_ACCEL: 1600,
  GEM_MAGNET_MAX_SPEED: 1000,

  ENEMY_MAX: 400,
  WAVE_DURATION: 30, // 초마다 웨이브 +1
  SPAWN_MARGIN: 60, // 화면 밖 얼마나 멀리서 스폰할지

  MAX_WEAPON_LEVEL: 5,
  MAX_PASSIVE_LEVEL: 5,
  MAX_WEAPON_SLOTS: 4,

  HUD_SYNC_INTERVAL: 0.1, // HUD(체력/시간) 를 Zustand 로 보내는 주기
  GRID_CELL_SIZE: 64,
} as const;
