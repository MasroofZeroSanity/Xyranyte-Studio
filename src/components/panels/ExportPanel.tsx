import { createSignal, Show } from 'solid-js';
import JSZip from 'jszip';
import { editor } from '@/store/editor';
import { downloadBlob, renderToBlob, safeFilename } from '@/lib/export';
import { Section } from '../ui/Field';

export default function ExportPanel() {
  const [busy, setBusy] = createSignal('');

  const nameFor = (i: number) => {
    const first = editor.anchors[0]?.column;
    const row = editor.rows()[i];
    return safeFilename(first && row ? row[first] : '', `image-${i + 1}`);
  };

  const exportCurrent = async () => {
    const img = editor.image();
    const row = editor.currentRow();
    if (!img || !row) return;
    downloadBlob(await renderToBlob(img, editor.anchors, row), nameFor(editor.previewIndex()));
  };

  const exportAll = async () => {
    const img = editor.image();
    if (!img) return;
    const all = editor.rows();
    const zip = new JSZip();
    const filenames = new Set<string>();

    try {
      for (let i = 0; i < all.length; i++) {
        setBusy(`Exporting ${i + 1} of ${all.length}`);
        const filename = nameFor(i);
        let uniqueFilename = filename;
        let suffix = 2;
        while (filenames.has(uniqueFilename)) {
          uniqueFilename = filename.replace(/\.png$/, `-${suffix++}.png`);
        }
        filenames.add(uniqueFilename);
        zip.file(uniqueFilename, await renderToBlob(img, editor.anchors, all[i]));
      }

      setBusy('Creating ZIP file');
      downloadBlob(await zip.generateAsync({ type: 'blob' }), 'images.zip');
    } finally {
      setBusy('');
    }
  };

  const ready = () => editor.anchors.length > 0 && editor.rows().length > 0;

  return (
    <Section title="Export">
      <div class="flex gap-2">
        <button
          class="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
          disabled={!ready() || !!busy()}
          onClick={exportCurrent}
        >
          Download this row
        </button>
        <button
          class="flex-1 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          disabled={!ready() || !!busy()}
          onClick={exportAll}
        >
          Download all rows
        </button>
      </div>
      <Show
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
      </Show>
    </Section>
  );
}
