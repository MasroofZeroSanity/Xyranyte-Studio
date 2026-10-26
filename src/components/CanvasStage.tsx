import { createEffect, createSignal } from 'solid-js';
import { editor } from '@/store/editor';
import { getAnchorBounds, renderScene } from '@/lib/render';

export default function CanvasStage() {
  let canvas!: HTMLCanvasElement;
  const [zoom, setZoom] = createSignal(1);
  const [pan, setPan] = createSignal({ x: 0, y: 0 });
  const [panMode, setPanMode] = createSignal(false);
  let drag:
    | { id: string; mode: 'move'; pointerX: number; pointerY: number; anchorX: number; anchorY: number }
    | { id: string; mode: 'resize'; startX: number; startWidth: number }
    | { mode: 'pan'; pointerX: number; pointerY: number; panX: number; panY: number }
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
    const threshold = (16 * canvas.width) / canvas.getBoundingClientRect().width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const bounds = getAnchorBounds(ctx, selected, editor.currentRow());
    const edgeX = selected.align === 'right' ? bounds.left : bounds.left + bounds.width;
    return Math.hypot(edgeX - p.x, selected.y - p.y) <= threshold;
  };

  const onDown = (e: PointerEvent) => {
    if (panMode() || e.button === 1) {
      drag = {
        mode: 'pan',
        pointerX: e.clientX,
        pointerY: e.clientY,
        panX: pan().x,
        panY: pan().y,
      };
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }

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
    if (drag?.mode === 'pan') {
      setPan({
        x: drag.panX + e.clientX - drag.pointerX,
        y: drag.panY + e.clientY - drag.pointerY,
      });
      return;
    }

    const p = toImagePoint(e);
    if (drag) {
      if (drag.mode === 'move') {
        editor.updateAnchor(drag.id, {
          x: Math.round(drag.anchorX + p.x - drag.pointerX),
          y: Math.round(drag.anchorY + p.y - drag.pointerY),
        });
      } else if (drag.mode === 'resize') {
        const resize = drag;
        const anchor = editor.anchors.find((a) => a.id === resize.id);
        const direction = anchor?.align === 'right' ? -1 : anchor?.align === 'center' ? 2 : 1;
        const maxWidth = Math.max(1, Math.round(resize.startWidth + (p.x - resize.startX) * direction));
        editor.updateAnchor(resize.id, { maxWidth });
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

  const zoomTo = (next: number, clientX?: number, clientY?: number) => {
    const previous = zoom();
    const bounded = Math.min(4, Math.max(0.25, next));
    if (clientX !== undefined && clientY !== undefined && bounded !== previous) {
      const rect = canvas.getBoundingClientRect();
      const ratio = bounded / previous;
      setPan((current) => ({
        x: current.x + (clientX - rect.left - rect.width / 2) * (1 - ratio),
        y: current.y + (clientY - rect.top - rect.height / 2) * (1 - ratio),
      }));
    }
    setZoom(bounded);
  };

  const fitCanvas = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div class="studio-canvas-stage">
      <div class="studio-canvas-toolbar" role="toolbar" aria-label="Canvas controls">
        <button
          type="button"
          class="studio-canvas-tool"
          classList={{ 'studio-canvas-tool--active': panMode() }}
          aria-pressed={panMode()}
          aria-label="Toggle pan mode"
          title="Pan"
          onClick={() => setPanMode((active) => !active)}
        >
          Pan
        </button>
        <span class="studio-canvas-zoom" aria-live="polite">{Math.round(zoom() * 100)}%</span>
        <button
          type="button"
          class="studio-canvas-tool studio-canvas-tool--symbol"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={zoom() <= 0.25}
          onClick={() => zoomTo(zoom() / 1.2)}
        >
          −
        </button>
        <button
          type="button"
          class="studio-canvas-tool studio-canvas-tool--symbol"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={zoom() >= 4}
          onClick={() => zoomTo(zoom() * 1.2)}
        >
          +
        </button>
        <button type="button" class="studio-canvas-tool" aria-label="Fit canvas" title="Fit canvas" onClick={fitCanvas}>
          Fit
        </button>
      </div>
      <div class="studio-canvas-viewport">
        <canvas
          ref={canvas}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onWheel={(e) => {
            e.preventDefault();
            zoomTo(zoom() * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientX, e.clientY);
          }}
          class="studio-canvas block h-auto max-h-full w-auto max-w-full touch-none border-2 border-ink bg-white"
          style={{ transform: `translate(${pan().x}px, ${pan().y}px) scale(${zoom()})` }}
        />
      </div>
    </div>
  );
}
