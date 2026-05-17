import { COLS, type LevelConfig, type RowDef } from "./types";

function roadSpawns(
  count: number,
  speed: number,
  direction: 1 | -1,
  length: number,
): RowDef["spawns"] {
  return Array.from({ length: count }, (_, i) => ({
    length,
    speed,
    direction,
    kind: "car" as const,
    offset: (i * (COLS / count)) % COLS,
  }));
}

function waterSpawns(
  count: number,
  speed: number,
  direction: 1 | -1,
  length: number,
): RowDef["spawns"] {
  return Array.from({ length: count }, (_, i) => ({
    length,
    speed,
    direction,
    kind: "platform" as const,
    offset: (i * 2.5) % COLS,
  }));
}

const BASE_ROWS: RowDef[] = [
  { kind: "dock", spawns: [] },
  { kind: "safe", spawns: [] },
  {
    kind: "water",
    spawns: waterSpawns(2, 0.55, 1, 3),
  },
  {
    kind: "water",
    spawns: waterSpawns(2, 0.7, -1, 2),
  },
  {
    kind: "water",
    spawns: waterSpawns(3, 0.85, 1, 2),
  },
  { kind: "safe", spawns: [] },
  {
    kind: "road",
    spawns: roadSpawns(2, 0.9, 1, 2),
  },
  {
    kind: "road",
    spawns: roadSpawns(3, 1.05, -1, 2),
  },
  {
    kind: "road",
    spawns: roadSpawns(2, 1.2, 1, 3),
  },
  {
    kind: "road",
    spawns: roadSpawns(3, 1.35, -1, 2),
  },
  { kind: "safe", spawns: [] },
  { kind: "safe", spawns: [] },
  { kind: "safe", spawns: [] },
  { kind: "safe", spawns: [] },
];

function dockColsForLevel(level: number): number[] {
  if (level >= 4) return [1, 3, 5, 7, 9];
  return [3, 6, 9];
}

export function generateLevel(level: number): LevelConfig {
  const speedMultiplier = 1 + (level - 1) * 0.12;
  const rows = BASE_ROWS.map((row) => ({
    ...row,
    spawns: row.spawns.map((s) => ({
      ...s,
      speed: s.speed * speedMultiplier,
      length: Math.max(1, s.length - (level > 3 ? 1 : 0)),
    })),
  }));

  return {
    level,
    dockCols: dockColsForLevel(level),
    rows,
    speedMultiplier,
    timeLimitSec: level >= 3 ? 60 : null,
  };
}

export function spawnEntities(config: LevelConfig): import("./types").Entity[] {
  const entities: import("./types").Entity[] = [];
  let id = 0;

  config.rows.forEach((row, rowIndex) => {
    row.spawns.forEach((spawn) => {
      entities.push({
        id: `e-${id++}`,
        row: rowIndex,
        x: spawn.offset,
        length: spawn.length,
        speed: spawn.speed,
        direction: spawn.direction,
        kind: spawn.kind,
      });
    });
  });

  return entities;
}
