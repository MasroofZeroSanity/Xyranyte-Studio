import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { Anchor, Row } from '@/types';

const [image, setImageSignal] = createSignal<HTMLImageElement | null>(null);
const [anchors, setAnchors] = createStore<Anchor[]>([]);
const [selectedId, setSelectedId] = createSignal<string | null>(null);
const [columns, setColumns] = createSignal<string[]>([]);
const [rows, setRows] = createSignal<Row[]>([]);
const [previewIndex, setPreviewIndex] = createSignal(0);
const [addMode, setAddMode] = createSignal(true);

export const editor = {
  // state
  image,
  anchors,
  selectedId,
  columns,
  rows,
  previewIndex,
  addMode,

  // derived
  currentRow: () => rows()[previewIndex()] ?? null,
  selected: () => anchors.find((a) => a.id === selectedId()),

  // actions
  setSelectedId,
  setPreviewIndex,
  setAddMode,

  setImage(img: HTMLImageElement) {
    setImageSignal(img);
    setAnchors([]);
    setSelectedId(null);
  },

  setData(cols: string[], data: Row[]) {
    setColumns(cols);
    setRows(data);
    setPreviewIndex(0);
    // keep anchors, but drop mappings to columns that no longer exist
    setAnchors((a) => !cols.includes(a.column), 'column', '');
  },

  addAnchor(x: number, y: number) {
    const img = image();
    if (!img) return;
    const anchor: Anchor = {
      id: crypto.randomUUID(),
      column: columns()[anchors.length] ?? columns()[0] ?? '',
      x: Math.round(x),
      y: Math.round(y),
      maxWidth: Math.round(img.naturalWidth * 0.4),
      fontSize: Math.max(12, Math.round(img.naturalWidth / 25)),
      fontFamily: 'Georgia',
      bold: false,
      color: '#1d2433',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 4,
      shadowX: 2,
      shadowY: 2,
      align: 'center',
      overflow: 'shrink',
    };
    setAnchors([...anchors, anchor]);
    setSelectedId(anchor.id);
  },

  updateAnchor(id: string, patch: Partial<Anchor>) {
    setAnchors((a) => a.id === id, patch);
  },

  removeAnchor(id: string) {
    setAnchors((list) => list.filter((a) => a.id !== id));
    if (selectedId() === id) setSelectedId(null);
  },
};
