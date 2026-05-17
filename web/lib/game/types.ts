export const COLS = 12;
export const ROWS = 14;

export type Direction = "up" | "down" | "left" | "right";
export type RowKind = "safe" | "road" | "water" | "dock";
export type GamePhase = "menu" | "playing" | "levelComplete" | "gameOver";

export type Entity = {
  id: string;
  row: number;
  x: number;
  length: number;
  speed: number;
  direction: 1 | -1;
  kind: "car" | "platform";
};

export type RowDef = {
  kind: RowKind;
  spawns: Array<{
    length: number;
    speed: number;
    direction: 1 | -1;
    kind: "car" | "platform";
    offset: number;
  }>;
};

export type LevelConfig = {
  level: number;
  dockCols: number[];
  rows: RowDef[];
  speedMultiplier: number;
  timeLimitSec: number | null;
};

export type GameState = {
  phase: GamePhase;
  level: number;
  lives: number;
  score: number;
  frogCol: number;
  frogRow: number;
  filledDocks: Set<number>;
  entities: Entity[];
  levelConfig: LevelConfig;
  timeLeft: number | null;
  moveCooldownMs: number;
  lastMoveAt: number;
  levelCompleteAt: number | null;
};
