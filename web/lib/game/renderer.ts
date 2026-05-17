import { COLS, ROWS, type Entity, type GameState } from "./types";

const COLORS = {
  bg0: "#050508",
  bg1: "#12001f",
  cyan: "#00f5ff",
  magenta: "#ff2bd6",
  lime: "#b8ff00",
  purple: "#7b61ff",
  road: "#1a1030",
  water: "#0a1a2e",
  safe: "#0d0d14",
  grid: "rgba(0, 245, 255, 0.08)",
};

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  pulse: number,
  dpr = 1,
) {
  const cellW = width / COLS;
  const cellH = height / ROWS;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.3,
    0,
    width * 0.5,
    height * 0.5,
    width,
  );
  grad.addColorStop(0, COLORS.bg1);
  grad.addColorStop(1, COLORS.bg0);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  for (let r = 0; r < ROWS; r++) {
    const kind = state.levelConfig.rows[r]?.kind ?? "safe";
    const y = r * cellH;
    if (kind === "road") {
      ctx.fillStyle = COLORS.road;
      ctx.fillRect(0, y, width, cellH);
      ctx.strokeStyle = "rgba(255, 43, 214, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, y + cellH / 2);
      ctx.lineTo(width, y + cellH / 2);
      ctx.stroke();
    } else if (kind === "water") {
      ctx.fillStyle = COLORS.water;
      ctx.fillRect(0, y, width, cellH);
      ctx.fillStyle = `rgba(0, 245, 255, ${0.05 + pulse * 0.03})`;
      for (let x = 0; x < width; x += 24) {
        ctx.fillRect(x + (pulse * 40) % 24, y + 4, 12, 2);
      }
    } else {
      ctx.fillStyle = COLORS.safe;
      ctx.fillRect(0, y, width, cellH);
    }
  }

  ctx.strokeStyle = COLORS.grid;
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, height);
    ctx.stroke();
  }

  state.levelConfig.dockCols.forEach((col, i) => {
    const filled = state.filledDocks.has(i);
    const x = col * cellW + cellW * 0.15;
    const y = cellH * 0.15;
    const w = cellW * 0.7;
    const h = cellH * 0.7;
    ctx.strokeStyle = filled ? COLORS.lime : COLORS.cyan;
    ctx.lineWidth = 2;
    ctx.shadowColor = filled ? COLORS.lime : COLORS.cyan;
    ctx.shadowBlur = filled ? 14 : 8 + pulse * 6;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;
    if (filled) {
      ctx.fillStyle = "rgba(184, 255, 0, 0.35)";
      ctx.fillRect(x, y, w, h);
    }
  });

  state.entities.forEach((e) => drawEntity(ctx, e, cellW, cellH));

  drawFrog(ctx, state.frogCol, state.frogRow, cellW, cellH, pulse);

  ctx.restore();
}

function drawEntity(
  ctx: CanvasRenderingContext2D,
  e: Entity,
  cellW: number,
  cellH: number,
) {
  const y = e.row * cellH + cellH * 0.2;
  const h = cellH * 0.6;
  const x = e.x * cellW;
  const w = e.length * cellW;

  if (e.kind === "car") {
    ctx.fillStyle = COLORS.magenta;
    ctx.shadowColor = COLORS.magenta;
    ctx.shadowBlur = 12;
    roundRect(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(x + w * 0.2, y + h * 0.35, w * 0.25, h * 0.3);
  } else {
    ctx.fillStyle = "rgba(123, 97, 255, 0.85)";
    ctx.shadowColor = COLORS.purple;
    ctx.shadowBlur = 10;
    roundRect(ctx, x, y, w, h, 3);
    ctx.fill();
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
}

function drawFrog(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  cellW: number,
  cellH: number,
  pulse: number,
) {
  const cx = col * cellW + cellW / 2;
  const cy = row * cellH + cellH / 2;
  const r = Math.min(cellW, cellH) * 0.32;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(pulse * 0.1);
  ctx.fillStyle = COLORS.cyan;
  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 16 + pulse * 8;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.magenta;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
