import type { Anchor, RenderOptions, Row } from '@/types';

const MIN_FONT = 6;

interface Layout {
  lines: string[];
  size: number;
  lineHeight: number;
}

export interface AnchorBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

function fontString(a: Anchor, size: number) {
  return `${a.bold ? 700 : 400} ${size}px "${a.fontFamily}", serif`;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    out.push(line);
  }
  return out;
}

function layoutText(ctx: CanvasRenderingContext2D, a: Anchor, text: string): Layout {
  let size = a.fontSize;
  ctx.font = fontString(a, size);

  let lines: string[];
  if (a.overflow === 'wrap') {
    lines = wrapText(ctx, text, a.maxWidth);
  } else {
    const w = ctx.measureText(text).width;
    if (w > a.maxWidth) {
      size = Math.max(MIN_FONT, Math.floor((size * a.maxWidth) / w));
      ctx.font = fontString(a, size);
    }
    lines = [text];
  }
  return { lines, size, lineHeight: size * 1.2 };
}

function boxLeft(a: Anchor) {
  if (a.align === 'left') return a.x;
  if (a.align === 'right') return a.x - a.maxWidth;
  return a.x - a.maxWidth / 2;
}

function textFor(a: Anchor, row: Row | null) {
  if (!row) return `{${a.column || 'text'}}`;
  return String(row[a.column] ?? '');
}

export function getAnchorBounds(
  ctx: CanvasRenderingContext2D,
  anchor: Anchor,
  row: Row | null,
): AnchorBounds {
  const { lines, lineHeight } = layoutText(ctx, anchor, textFor(anchor, row));
  const height = lines.length * lineHeight;
  return {
    left: boxLeft(anchor),
    top: anchor.y - height / 2,
    width: anchor.maxWidth,
    height,
  };
}

export function renderScene(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  anchors: readonly Anchor[],
  row: Row | null,
  opts: RenderOptions,
) {
  if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
  if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const unit = Math.max(1, canvas.width / 900);

  for (const a of anchors) {
    const { lines, lineHeight } = layoutText(ctx, a, textFor(a, row));
    const bounds = getAnchorBounds(ctx, a, row);

    ctx.textAlign = a.align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = a.color;
    if (a.shadowEnabled) {
      ctx.shadowColor = a.shadowColor;
      ctx.shadowBlur = a.shadowBlur;
      ctx.shadowOffsetX = a.shadowX;
      ctx.shadowOffsetY = a.shadowY;
    }
    lines.forEach((l, i) => ctx.fillText(l, a.x, bounds.top + lineHeight * (i + 0.5)));
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    if (!opts.guides) continue;

    const selected = a.id === opts.selectedId;
    const color = selected ? '#2f5bea' : '#e5484d';

    ctx.save();
    ctx.lineWidth = 1.5 * unit;
    ctx.strokeStyle = color;
    ctx.setLineDash([6 * unit, 4 * unit]);
    ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
    ctx.setLineDash([]);

    const r = 7 * unit;
    if (selected) {
      const resizeX = a.align === 'right' ? bounds.left : bounds.left + bounds.width;
      ctx.fillStyle = '#fff';
      ctx.fillRect(resizeX - r, a.y - r, r * 2, r * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 * unit;
      ctx.strokeRect(resizeX - r, a.y - r, r * 2, r * 2);
    }
    ctx.restore();
  }
}
