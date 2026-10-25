import { createEffect } from 'solid-js';
import { editor } from '@/store/editor';
import { getAnchorBounds, renderScene } from '@/lib/render';

export default function CanvasStage() {
  let canvas!: HTMLCanvasElement;
  let drag:
    | { id: string; mode: 'move'; pointerX: number; pointerY: number; anchorX: number; anchorY: number }
    | { id: string; mode: 'resize'; startX: number; startWidth: number }
    | null = null;

  createEffect(() => {
    const img = editor.image();
    if (!img) return;
    // touch every anchor field so the effect re-runs on any change
    JSON.stringify(editor.anchors);
    renderScene(canvas, img, editor.anchors, editor.currentRow(), {
      guides: true,
      selectedId: editor.selectedId(),
    });
  });

  const toImagePoint = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: Math.min(canvas.width, Math.max(0, ((e.clientX - r.left) * canvas.width) / r.width)),
      y: Math.min(canvas.height, Math.max(0, ((e.clientY - r.top) * canvas.height) / r.height)),
    };
  };

  const hitTest = (p: { x: number; y: number }) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    return [...editor.anchors]
      .reverse()
      .find((anchor) => {
        const bounds = getAnchorBounds(ctx, anchor, editor.currentRow());
        return (
          p.x >= bounds.left &&
          p.x <= bounds.left + bounds.width &&
          p.y >= bounds.top &&
          p.y <= bounds.top + bounds.height
        );
      });
  };

  const resizeHandleHit = (p: { x: number; y: number }) => {
    const selected = editor.selected();
    if (!selected) return false;
    const threshold = (16 * canvas.width) / canvas.clientWidth;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const bounds = getAnchorBounds(ctx, selected, editor.currentRow());
    const edgeX = selected.align === 'right' ? bounds.left : bounds.left + bounds.width;
    return Math.hypot(edgeX - p.x, selected.y - p.y) <= threshold;
  };

  const onDown = (e: PointerEvent) => {
    const p = toImagePoint(e);
    if (resizeHandleHit(p)) {
      const selected = editor.selected()!;
      drag = { id: selected.id, mode: 'resize', startX: p.x, startWidth: selected.maxWidth };
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    const hit = hitTest(p);
    if (hit) {
      editor.setSelectedId(hit.id);
      drag = {
        id: hit.id,
        mode: 'move',
        pointerX: p.x,
        pointerY: p.y,
        anchorX: hit.x,
        anchorY: hit.y,
      };
      canvas.setPointerCapture(e.pointerId);
    } else if (editor.addMode()) {
      editor.addAnchor(p.x, p.y);
    } else {
      editor.setSelectedId(null);
    }
  };

  const onMove = (e: PointerEvent) => {
    const p = toImagePoint(e);
    if (drag) {
      if (drag.mode === 'move') {
        editor.updateAnchor(drag.id, {
          x: Math.round(drag.anchorX + p.x - drag.pointerX),
          y: Math.round(drag.anchorY + p.y - drag.pointerY),
        });
      } else {
        const anchor = editor.anchors.find((a) => a.id === drag?.id);
        const direction = anchor?.align === 'right' ? -1 : anchor?.align === 'center' ? 2 : 1;
        const maxWidth = Math.max(1, Math.round(drag.startWidth + (p.x - drag.startX) * direction));
        editor.updateAnchor(drag.id, { maxWidth });
      }
    } else {
      canvas.style.cursor = resizeHandleHit(p)
        ? 'ew-resize'
        : hitTest(p)
          ? 'grab'
          : editor.addMode()
            ? 'crosshair'
            : 'default';
    }
  };

  const onUp = () => {
    drag = null;
  };

  return (
    <canvas
      ref={canvas}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      class="block h-auto max-w-full touch-none rounded-md bg-white shadow-sm ring-1 ring-line"
    />
  );
}
