import assert from "node:assert/strict";
import {
  advanceAfterLevelComplete,
  createInitialState,
  LEVEL_COMPLETE_DELAY_MS,
  startGame,
} from "./engine";

const playing = startGame(createInitialState(1));
const levelComplete = {
  ...playing,
  phase: "levelComplete" as const,
  levelCompleteAt: 1000,
  score: 300,
};

const now = 1000 + LEVEL_COMPLETE_DELAY_MS + 1;
const level2 = advanceAfterLevelComplete(levelComplete, now);

assert.equal(level2.level, 2, "should advance to level 2");
assert.equal(level2.phase, "playing", "should resume playing");
assert.equal(level2.filledDocks.size, 0, "docks reset for new level");
assert.equal(level2.levelConfig.dockCols.length, 3, "level 2 still uses 3 docks until level 4");

console.log("engine.test.ts: all assertions passed");
