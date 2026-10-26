import { createSignal } from 'solid-js';
import JSZip from 'jszip';
import { editor } from '@/store/editor';
import { downloadBlob, renderToBlob, safeFilename } from '@/lib/export';
import type { Anchor, Row } from '@/types';
import { Section } from '../ui/Field';

const CHUNK_SIZE = 50;

export interface ExportProgress {
  current: number;
  total: number;
  phase: string;
}

export default function ExportPanel(props: {
  onProgress: (progress: ExportProgress | null) => void;
}) {
  const [busy, setBusy] = createSignal('');

  const nameFor = (i: number, anchors: readonly Anchor[], rows: readonly Row[]) => {
    const first = anchors[0]?.column;
    const row = rows[i];
    return safeFilename(first && row ? row[first] : '', `image-${i + 1}`);
  };

  const exportCurrent = async () => {
    const img = editor.image();
    const row = editor.currentRow();
    if (!img || !row) return;
    const anchors = editor.anchors.slice();
    const rows = editor.rows();
    const index = editor.previewIndex();

    try {
      setBusy('Rendering image 1 of 1');
      props.onProgress({ current: 1, total: 1, phase: 'Rendering image 1 of 1' });
      const blob = await renderToBlob(img, anchors, row);
      downloadBlob(blob, nameFor(index, anchors, rows));
    } finally {
      setBusy('');
      props.onProgress(null);
    }
  };

  const exportAll = async () => {
    const img = editor.image();
    if (!img) return;
    const all = editor.rows();
    const anchors = editor.anchors.slice();
    const filenames = new Set<string>();
    const totalChunks = Math.ceil(all.length / CHUNK_SIZE);

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const chunkStart = chunkIndex * CHUNK_SIZE;
        const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, all.length);
        const zip = new JSZip();

        for (let i = chunkStart; i < chunkEnd; i++) {
          const phase = `Rendering image ${i + 1} of ${all.length}`;
          setBusy(phase);
          props.onProgress({ current: i + 1, total: all.length, phase });

          const filename = nameFor(i, anchors, all);
          let uniqueFilename = filename;
          let suffix = 2;
          while (filenames.has(uniqueFilename)) {
            uniqueFilename = filename.replace(/\.png$/, `-${suffix++}.png`);
          }
          filenames.add(uniqueFilename);
          zip.file(uniqueFilename, await renderToBlob(img, anchors, all[i]));
        }

        const phase = `Creating ZIP ${chunkIndex + 1} of ${totalChunks}`;
        setBusy(phase);
        props.onProgress({ current: chunkEnd, total: all.length, phase });
        const archiveName = totalChunks === 1
          ? 'images.zip'
          : `images-part-${String(chunkIndex + 1).padStart(3, '0')}.zip`;
        downloadBlob(await zip.generateAsync({ type: 'blob' }), archiveName);
      }
    } finally {
      setBusy('');
      props.onProgress(null);
    }
  };

  const ready = () => editor.anchors.length > 0 && editor.rows().length > 0;

  return (
    <Section title="Export">
      <div class="flex gap-2">
        <button
          class="flex-1 border-2 border-ink bg-white px-3 py-2 text-sm font-bold hover:bg-paper-2 disabled:opacity-40"
          disabled={!ready() || !!busy()}
          onClick={exportCurrent}
        >
          Download this row
        </button>
        <button
          class="flex-1 border-2 border-ink bg-accent-2 px-3 py-2 text-sm font-extrabold text-ink hover:bg-white disabled:opacity-40"
          disabled={!ready() || !!busy()}
          onClick={exportAll}
        >
          Download all rows
        </button>
      </div>
      {/* <Show
        when={busy()}
        fallback={
          <p class="mt-2 text-xs text-ink/60">
            {ready()
              ? 'Images are named after the first anchor’s column and downloaded as a ZIP.'
              : 'Add an anchor and upload a spreadsheet to enable export.'}
          </p>
        }
      >
        <p class="mt-2 text-xs text-ink/70">{busy()}</p>
      </Show> */}
    </Section>
  );
}
