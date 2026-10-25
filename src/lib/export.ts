import { renderScene } from './render';
import type { Anchor, Row } from '@/types';

export function renderToBlob(
  img: HTMLImageElement,
  anchors: readonly Anchor[],
  row: Row,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  renderScene(canvas, img, anchors, row, { guides: false, selectedId: null });
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed.'))), 'image/png'),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilename(value: unknown, fallback: string) {
  const clean = String(value ?? '').trim().replace(/[^\w\-. ]+/g, '_');
  return `${clean || fallback}.png`;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
