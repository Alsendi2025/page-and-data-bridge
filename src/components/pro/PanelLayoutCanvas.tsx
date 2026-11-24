import { useRef, useState, useCallback, useEffect } from 'react';
import { Grid3x3, Trash2, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import type { ProPanel } from '@/lib/proEngine';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface PanelLayoutResult {
  areaW: number;
  areaH: number;
  panelW: number;
  panelH: number;
  rows: number;
  cols: number;
  panelsFit: number;
  placedPanels: number;
  fits: boolean;
  coveragePct: number;
  obstacles: Obstacle[];
  placements: { row: number; col: number; x: number; y: number; w: number; h: number }[];
}

/** Spacing between panels in meters */
const PANEL_GAP = 0.02;
/** Margin from edges in meters */
const EDGE_MARGIN = 0.5;

/**
 * Lay out panels on the available area, skipping obstacles.
 * Uses a greedy row-by-row placement algorithm.
 */
export function computeLayout(
  areaW: number,
  areaH: number,
  panel: ProPanel,
  obstacles: Obstacle[],
  orientation: 'portrait' | 'landscape' = 'portrait',
): PanelLayoutResult {
  const pw = orientation === 'portrait' ? panel.width : panel.length;
  const ph = orientation === 'portrait' ? panel.length : panel.width;
  const cellW = pw + PANEL_GAP;
  const cellH = ph + PANEL_GAP;
  const usableW = areaW - 2 * EDGE_MARGIN;
  const usableH = areaH - 2 * EDGE_MARGIN;

  const cols = Math.floor(usableW / cellW);
  const rows = Math.floor(usableH / cellH);
  const panelsFit = rows * cols;

  const placements: PanelLayoutResult['placements'] = [];
  let placed = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = EDGE_MARGIN + c * cellW;
      const y = EDGE_MARGIN + r * cellH;
      const cx = x + pw / 2;
      const cy = y + ph / 2;

      const blocked = obstacles.some(
        (o) =>
          cx >= o.x &&
          cx <= o.x + o.w &&
          cy >= o.y &&
          cy <= o.y + o.h,
      );
      if (!blocked) {
        placements.push({ row: r, col: c, x, y, w: pw, h: ph });
        placed++;
      }
    }
  }

  const totalArea = areaW * areaH;
  const panelArea = placed * pw * ph;
  const coveragePct = totalArea > 0 ? (panelArea / totalArea) * 100 : 0;

  return {
    areaW,
    areaH,
    panelW: pw,
    panelH: ph,
    rows,
    cols,
    panelsFit,
    placedPanels: placed,
    fits: placed > 0,
    coveragePct: Math.round(coveragePct * 10) / 10,
    obstacles,
    placements,
  };
}

export default function PanelLayoutCanvas({
  areaW,
  areaH,
  panel,
  onChange,
}: {
  areaW: number;
  areaH: number;
  panel: ProPanel;
  onChange: (result: PanelLayoutResult | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [tempObstacle, setTempObstacle] = useState<Obstacle | null>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [hovering, setHovering] = useState<string | null>(null);

  const CANVAS_W = 700;
  const CANVAS_H = 460;
  const scale = Math.min((CANVAS_W * zoom) / Math.max(areaW, 1), (CANVAS_H * zoom) / Math.max(areaH, 1));
  const ox = (CANVAS_W - areaW * scale) / 2;
  const oy = (CANVAS_H - areaH * scale) / 2;

  const layout = computeLayout(areaW, areaH, panel, obstacles, orientation);

  useEffect(() => {
    onChange(layout);
  }, [areaW, areaH, panel, obstacles, orientation, onChange]);

  const toWorld = useCallback(
    (sx: number, sy: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const px = ((sx - rect.left) / rect.width) * canvas.width;
      const py = ((sy - rect.top) / rect.height) * canvas.height;
      return { x: (px - ox) / scale, y: (py - oy) / scale };
    },
    [ox, oy, scale],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Area background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(ox, oy, areaW * scale, areaH * scale);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      const gridStep = 1 * scale; // 1m grid
      for (let gx = ox; gx < ox + areaW * scale; gx += gridStep) {
        ctx.beginPath();
        ctx.moveTo(gx, oy);
        ctx.lineTo(gx, oy + areaH * scale);
        ctx.stroke();
      }
      for (let gy = oy; gy < oy + areaH * scale; gy += gridStep) {
        ctx.beginPath();
        ctx.moveTo(ox, gy);
        ctx.lineTo(ox + areaW * scale, gy);
        ctx.stroke();
      }
    }

    // Area border
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, areaW * scale, areaH * scale);

    // Obstacles
    for (const obs of obstacles) {
      const oxObs = ox + obs.x * scale;
      const oyObs = oy + obs.y * scale;
      ctx.fillStyle = hovering === obs.id ? '#dc2626aa' : '#dc262699';
      ctx.fillRect(oxObs, oyObs, obs.w * scale, obs.h * scale);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(oxObs, oyObs, obs.w * scale, obs.h * scale);
      ctx.fillStyle = '#fff';
      ctx.font = '11px Tajawal, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obs.label, oxObs + (obs.w * scale) / 2, oyObs + (obs.h * scale) / 2 + 4);
    }

    // Temp obstacle while drawing
    if (tempObstacle) {
      const oxT = ox + tempObstacle.x * scale;
      const oyT = oy + tempObstacle.y * scale;
      ctx.fillStyle = '#fbbf2466';
      ctx.fillRect(oxT, oyT, tempObstacle.w * scale, tempObstacle.h * scale);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(oxT, oyT, tempObstacle.w * scale, tempObstacle.h * scale);
      ctx.setLineDash([]);
    }

    // Panels
    const pw = layout.panelW * scale;
    const ph = layout.panelH * scale;
    for (const p of layout.placements) {
      const px = ox + p.x * scale;
      const py = oy + p.y * scale;
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(px, py, pw, ph);
      // Cell line indicator
      ctx.fillStyle = '#5eead4';
      ctx.fillRect(px + pw * 0.4, py + ph * 0.35, pw * 0.2, ph * 0.3);
    }

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Tajawal, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${areaW}م × ${areaH}م`, ox + areaW * scale - 4, oy + areaH * scale + 14);
  }, [ox, oy, scale, areaW, areaH, obstacles, tempObstacle, showGrid, hovering, layout]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = toWorld(e.clientX, e.clientY);
    if (x < 0 || x > areaW || y < 0 || y > areaH) return;
    setDrawing(true);
    setDrawStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing || !drawStart) {
      // Hover detection for obstacles
      const { x, y } = toWorld(e.clientX, e.clientY);
      const found = obstacles.find(
        (o) => x >= o.x && x <= o.x + o.w && y >= o.y && y <= o.y + o.h,
      );
      setHovering(found?.id ?? null);
      return;
    }
    const { x, y } = toWorld(e.clientX, e.clientY);
    const cx = Math.min(x, drawStart.x);
    const cy = Math.min(y, drawStart.y);
    const cw = Math.abs(x - drawStart.x);
    const ch = Math.abs(y - drawStart.y);
    setTempObstacle({
      id: 'temp',
      x: Math.max(0, cx),
      y: Math.max(0, cy),
      w: Math.min(cw, areaW - cx),
      h: Math.min(ch, areaH - cy),
      label: 'عائق',
    });
  };

  const handleMouseUp = () => {
    if (drawing && tempObstacle && tempObstacle.w > 0.3 && tempObstacle.h > 0.3) {
      setObstacles((prev) => [
        ...prev,
        { ...tempObstacle, id: `obs-${Date.now()}`, label: `عائق ${prev.length + 1}` },
      ]);
    }
    setDrawing(false);
    setDrawStart(null);
    setTempObstacle(null);
  };

  const removeObstacle = (id: string) => {
    setObstacles((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOrientation((o) => (o === 'portrait' ? 'landscape' : 'portrait'))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            {orientation === 'portrait' ? 'توجيه طولي' : 'توجيه عرضي'}
          </button>
          <button
            onClick={() => setShowGrid((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
          >
            {showGrid ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            الشبكة
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:border-teal-300"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:border-teal-300"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
        {obstacles.length > 0 && (
          <button
            onClick={() => setObstacles([])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> مسح العوائق
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full cursor-crosshair rounded-xl border border-slate-700"
        style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
      />

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="inline-block h-3 w-3 rounded bg-teal-600" /> ألواح شمسية ({layout.placedPanels})
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="inline-block h-3 w-3 rounded bg-red-500" /> عوائق ({obstacles.length})
        </span>
        <span className="text-slate-500">
          ارسم على المساحة لتحديد عائق (دقيقتين لرسم مستطيل)
        </span>
      </div>

      {obstacles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {obstacles.map((o) => (
            <button
              key={o.id}
              onClick={() => removeObstacle(o.id)}
              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
            >
              {o.label} ({o.w.toFixed(1)}×{o.h.toFixed(1)}م)
              <Trash2 className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
        <div>
          <p className="text-lg font-bold text-slate-800" dir="ltr">{layout.placedPanels}</p>
          <p className="text-[11px] text-slate-500">لوح يمكن وضعه</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800" dir="ltr">
            {layout.rows}×{layout.cols}
          </p>
          <p className="text-[11px] text-slate-500">صفوف × أعمدة</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800" dir="ltr">{layout.coveragePct}%</p>
          <p className="text-[11px] text-slate-500">نسبة التغطية</p>
        </div>
      </div>
    </div>
  );
}
