import { createSignal, Show } from 'solid-js';
import { editor } from '@/store/editor';
import { parseSpreadsheet } from '@/lib/xlsx';
import Dropzone from '../ui/Dropzone';
import { Section } from '../ui/Field';

export default function SpreadsheetPanel() {
  const [error, setError] = createSignal('');
  const [fileName, setFileName] = createSignal('');

  const load = async (file: File) => {
    try {
      const { columns, rows } = await parseSpreadsheet(file);
      editor.setData(columns, rows);
      setFileName(file.name);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that spreadsheet.');
    }
  };

  const last = () => editor.rows().length - 1;
  const step = (d: number) =>
    editor.setPreviewIndex(Math.min(last(), Math.max(0, editor.previewIndex() + d)));

  return (
    <Section title="Spreadsheet">
      <Dropzone
        compact
        accept=".xlsx,.xls,.csv"
        title={fileName() || 'Drop an .xlsx file'}
        hint={fileName() ? 'Drop another to replace it' : 'or click to browse. First row = headers.'}
        onFile={load}
      />
      <Show when={error()}>
        <p class="mt-2 text-sm text-red-600">{error()}</p>
      </Show>

      <Show when={editor.rows().length}>
        <p class="mt-3 text-xs text-ink/70">
          {editor.rows().length} rows · columns: {editor.columns().join(', ')}
        </p>
        <div class="mt-2 flex items-center gap-2">
          <button
            class="border-2 border-ink bg-white px-2 py-1 text-sm hover:bg-paper-2 disabled:opacity-40"
            disabled={editor.previewIndex() === 0}
            onClick={() => step(-1)}
          >
            Previous
          </button>
          <span class="flex-1 text-center text-sm">
            Previewing row {editor.previewIndex() + 1}
          </span>
          <button
            class="border-2 border-ink bg-white px-2 py-1 text-sm hover:bg-paper-2 disabled:opacity-40"
            disabled={editor.previewIndex() === last()}
            onClick={() => step(1)}
          >
            Next
          </button>
        </div>
      </Show>
    </Section>
  );
}
