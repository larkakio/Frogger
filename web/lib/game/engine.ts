import { generateLevel, spawnEntities } from "./levels";
import {
  COLS,
  ROWS,
  type Direction,
  type Entity,
  type GamePhase,
  type GameState,
  type LevelConfig,
} from "./types";

export const START_COL = Math.floor(COLS / 2);
export const START_ROW = ROWS - 1;
export const MOVE_COOLDOWN_MS = 120;
export const LEVEL_COMPLETE_DELAY_MS = 1800;

function overlaps(col: number, x: number, length: number): boolean {
  const left = Math.floor(x);
  const right = left + length - 1;
  return col >= left && col <= right;
}

export function createInitialState(level = 1): GameState {
  const levelConfig = generateLevel(level);
  return {
    phase: "menu",
    level,
    lives: 3,
    score: 0,
    frogCol: START_COL,
    frogRow: START_ROW,
    filledDocks: new Set(),
    entities: spawnEntities(levelConfig),
    levelConfig,
    timeLeft: levelConfig.timeLimitSec,
    moveCooldownMs: MOVE_COOLDOWN_MS,
    lastMoveAt: 0,
    levelCompleteAt: null,
  };
}

export function startGame(state: GameState): GameState {
  return { ...state, phase: "playing", levelCompleteAt: null };
}

function resetFrog(state: GameState): GameState {
  return {
    ...state,
    frogCol: START_COL,
    frogRow: START_ROW,
  };
}

function killFrog(state: GameState): GameState {
  const lives = state.lives - 1;
  if (lives <= 0) {
    return {
      ...createInitialState(1),
      phase: "gameOver",
      score: state.score,
    };
  }
  return {
    ...resetFrog(state),
    lives,
    entities: spawnEntities(state.levelConfig),
  };
}

function entitySpans(entity: Entity): number[] {
  const cols: number[] = [];
  const start = Math.floor(entity.x);
  for (let i = 0; i < entity.length; i++) {
    let c = start + i;
    if (c < 0) c += COLS;
    if (c >= COLS) c -= COLS;
    cols.push(c);
  }
  return cols;
}

function onPlatform(state: GameState): boolean {
  return state.entities.some(
    (e) =>
      e.row === state.frogRow &&
      e.kind === "platform" &&
      entitySpans(e).includes(state.frogCol),
  );
}

function hitByCar(state: GameState): boolean {
  return state.entities.some(
    (e) =>
      e.row === state.frogRow &&
      e.kind === "car" &&
      entitySpans(e).includes(state.frogCol),
  );
}

function checkHazards(state: GameState): GameState {
  const rowKind = state.levelConfig.rows[state.frogRow]?.kind;
  if (rowKind === "road" && hitByCar(state)) return killFrog(state);
  if (rowKind === "water" && !onPlatform(state)) return killFrog(state);
  return state;
}

function tryDock(state: GameState): GameState {
  if (state.frogRow !== 0) return state;
  const dockIndex = state.levelConfig.dockCols.indexOf(state.frogCol);
  if (dockIndex === -1) return killFrog(state);
  if (state.filledDocks.has(dockIndex)) return killFrog(state);

  const filledDocks = new Set(state.filledDocks);
  filledDocks.add(dockIndex);
  const score = state.score + 100 * state.level;

  if (filledDocks.size >= state.levelConfig.dockCols.length) {
    return {
      ...resetFrog({ ...state, filledDocks, score }),
      phase: "levelComplete",
      levelCompleteAt: Date.now(),
    };
  }

  return resetFrog({ ...state, filledDocks, score });
}

export function moveFrog(state: GameState, dir: Direction, now: number): GameState {
  if (state.phase !== "playing") return state;
  if (now - state.lastMoveAt < state.moveCooldownMs) return state;

  let { frogCol, frogRow } = state;
  switch (dir) {
    case "up":
      frogRow = Math.max(0, frogRow - 1);
      break;
    case "down":
      frogRow = Math.min(ROWS - 1, frogRow + 1);
      break;
    case "left":
      frogCol = Math.max(0, frogCol - 1);
      break;
    case "right":
      frogCol = Math.min(COLS - 1, frogCol + 1);
      break;
  }

  let next: GameState = {
    ...state,
    frogCol,
    frogRow,
    lastMoveAt: now,
    score: state.score + (dir === "up" ? 10 : 0),
  };

  next = checkHazards(next);
  if (next.lives !== state.lives) return next;
  return tryDock(next);
}

export function tickEntities(state: GameState, dt: number): GameState {
  if (state.phase !== "playing") return state;

  const entities = state.entities.map((e) => {
    let x = e.x + e.direction * e.speed * dt;
    while (x < -e.length) x += COLS + e.length;
    while (x >= COLS) x -= COLS + e.length;
    return { ...e, x };
  });

  let next: GameState = { ...state, entities };
  const rowKind = state.levelConfig.rows[state.frogRow]?.kind;
  if (rowKind === "road" || rowKind === "water") {
    next = checkHazards({ ...next, entities });
  }

  if (state.timeLeft != null) {
    const timeLeft = Math.max(0, state.timeLeft - dt);
    if (timeLeft === 0 && next.phase === "playing") {
      return killFrog({ ...next, timeLeft: 0 });
    }
    next = { ...next, timeLeft };
  }

  return next;
}

export function advanceAfterLevelComplete(state: GameState, now: number): GameState {
  if (state.phase !== "levelComplete" || state.levelCompleteAt == null) return state;
  if (now - state.levelCompleteAt < LEVEL_COMPLETE_DELAY_MS) return state;

  const nextLevel = state.level + 1;
  const levelConfig = generateLevel(nextLevel);
  return {
    ...state,
    level: nextLevel,
    levelConfig,
    entities: spawnEntities(levelConfig),
    filledDocks: new Set(),
    frogCol: START_COL,
    frogRow: START_ROW,
    phase: "playing",
    levelCompleteAt: null,
    timeLeft: levelConfig.timeLimitSec,
  };
}

export function restartFromGameOver(score: number): GameState {
  return { ...createInitialState(1), phase: "menu", score };
}

export type { GamePhase, GameState, LevelConfig };
