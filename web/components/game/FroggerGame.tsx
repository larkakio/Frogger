"use client";

import {
  advanceAfterLevelComplete,
  createInitialState,
  moveFrog,
  restartFromGameOver,
  startGame,
  tickEntities,
  type GameState,
} from "@/lib/game/engine";
import type { Direction } from "@/lib/game/types";
import { drawFrame } from "@/lib/game/renderer";
import { useCallback, useEffect, useRef, useState } from "react";

const SWIPE_THRESHOLD = 28;

export function FroggerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const stateRef = useRef<GameState>(createInitialState(1));
  const [, forceRender] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastFrame = useRef<number>(0);
  const pulseRef = useRef(0);

  const bump = useCallback(() => forceRender((n) => n + 1), []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    sizeRef.current = { w, h, dpr };
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    resizeCanvas();
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(container);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      const dt = lastFrame.current ? (t - lastFrame.current) / 1000 : 0;
      lastFrame.current = t;
      pulseRef.current = (Math.sin(t / 200) + 1) / 2;

      const prev = stateRef.current;
      let s = prev;
      if (s.phase === "playing") {
        s = tickEntities(s, dt);
      }
      if (s.phase === "levelComplete") {
        s = advanceAfterLevelComplete(s, Date.now());
      }
      stateRef.current = s;
      const hudTick =
        s.phase !== prev.phase ||
        s.lives !== prev.lives ||
        s.score !== prev.score ||
        s.level !== prev.level ||
        s.filledDocks.size !== prev.filledDocks.size ||
        (s.timeLeft != null &&
          Math.floor(s.timeLeft) !== Math.floor(prev.timeLeft ?? -1));
      if (hudTick) bump();

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const { w, h, dpr } = sizeRef.current;
      if (canvas && ctx && w > 0 && h > 0) {
        drawFrame(ctx, stateRef.current, w, h, pulseRef.current, dpr);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [bump]);

  const handleDirection = useCallback(
    (dir: Direction) => {
      const next = moveFrog(stateRef.current, dir, Date.now());
      if (next !== stateRef.current) {
        stateRef.current = next;
        bump();
        if (navigator.vibrate) navigator.vibrate(8);
      }
    },
    [bump],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        handleDirection(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDirection]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      handleDirection(dx > 0 ? "right" : "left");
    } else {
      handleDirection(dy > 0 ? "down" : "up");
    }
  };

  const s = stateRef.current;

  const start = () => {
    stateRef.current = startGame(createInitialState(s.level));
    bump();
  };

  const restart = () => {
    stateRef.current = restartFromGameOver(s.score);
    bump();
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col px-2 pb-2 sm:px-3">
      <div className="neon-hud mb-2 grid grid-cols-3 gap-1 px-3 py-2 font-mono text-xs sm:text-sm">
        <span className="text-cyan-300">
          LEVEL <span className="text-white">{s.level}</span>
        </span>
        <span className="text-center text-fuchsia-300">
          LIVES{" "}
          <span className="text-white">{"♥".repeat(Math.max(0, s.lives))}</span>
        </span>
        <span className="text-right text-lime-300">
          SCORE <span className="text-white">{s.score}</span>
        </span>
        {s.timeLeft != null && s.phase === "playing" && (
          <span className="col-span-3 text-center text-amber-300">
            TIME <span className="text-white">{Math.ceil(s.timeLeft)}</span>
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="game-stage relative mx-auto min-h-0 w-full overflow-hidden rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,245,255,0.15)]"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full touch-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchMove={(e) => e.preventDefault()}
        />
        {s.phase === "menu" && (
          <Overlay>
            <p className="font-display mb-4 text-center text-xl tracking-widest text-cyan-300 sm:text-2xl">
              GRIDRUNNER OVERPASS
            </p>
            <p className="mb-4 max-w-xs px-4 text-center font-mono text-xs text-white/50">
              Swipe on the field to move your hologlyph. Fill all neon docks to
              clear the level.
            </p>
            <button type="button" className="neon-btn text-sm" onClick={start}>
              PLAY
            </button>
          </Overlay>
        )}
        {s.phase === "levelComplete" && (
          <Overlay>
            <p className="font-display text-2xl tracking-widest text-lime-300">
              LEVEL {s.level} CLEARED
            </p>
            <p className="mt-2 px-4 text-center font-mono text-xs text-white/50">
              Claim today&apos;s run on Base below
            </p>
          </Overlay>
        )}
        {s.phase === "gameOver" && (
          <Overlay>
            <p className="font-display text-2xl tracking-widest text-fuchsia-400">
              GAME OVER
            </p>
            <p className="my-2 font-mono text-base text-white/60">
              Score: {s.score}
            </p>
            <button type="button" className="neon-btn text-sm" onClick={restart}>
              PLAY AGAIN
            </button>
          </Overlay>
        )}
      </div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 p-4 backdrop-blur-sm scanlines">
      {children}
    </div>
  );
}
