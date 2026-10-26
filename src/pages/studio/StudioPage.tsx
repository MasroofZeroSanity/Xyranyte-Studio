import { createSignal, Show } from 'solid-js';
import { editor } from '@/store/editor';
import { loadImageFile } from '@/lib/image';
import Dropzone from '@/components/ui/Dropzone';
import NavigationBar from '@/components/ui/NavigationBar';
import CanvasStage from '@/components/CanvasStage';
import SpreadsheetPanel from '@/components/panels/SpreadsheetPanel';
import AnchorPanel from '@/components/panels/AnchorPanel';
import ExportPanel, { type ExportProgress } from '@/components/panels/ExportPanel';
import './studio.css';

export default function StudioPage() {
  const [exportProgress, setExportProgress] = createSignal<ExportProgress | null>(null);
  const onImage = async (file: File) => editor.setImage(await loadImageFile(file));

  return (
    <div class="studio-shell relative min-h-screen md:h-screen">
      <div class="flex min-h-screen flex-col md:h-full" inert={!!exportProgress()}>
        <NavigationBar themePosition="first">
          <Show when={editor.image()}>
            <div class="app-navbar__studio-action w-56">
              <Dropzone compact accept="image/*" title="Replace image" onFile={onImage} />
            </div>
          </Show>
        </NavigationBar>

        <div class="flex min-h-0 flex-1 flex-col md:flex-row">
          <main class="studio-workspace min-h-[55vh] flex-none overflow-hidden p-3 md:min-h-0 md:flex-1 md:p-6">
            <Show
              when={editor.image()}
              fallback={
                <div class="mx-auto max-w-xl pt-10">
                  <Dropzone
                    accept="image/*"
                    title="Drop your template image here"
                    hint="or click to browse. PNG, JPG or WebP."
                    onFile={onImage}
                  />
                </div>
              }
            >
              <div class="studio-canvas-wrap">
                <div class="studio-canvas-meta">
                  <span style={{color: "black!important"}}>LIVE PREVIEW</span>
                  <span>{editor.rows().length ? `ROW ${String(editor.previewIndex() + 1).padStart(2, '0')} / ${String(editor.rows().length).padStart(2, '0')}` : 'NO DATA'}</span>
                </div>
                <CanvasStage />
              </div>
            </Show>
          </main>

          <Show when={editor.image()}>
            <aside class="studio-sidebar w-full overflow-y-auto border-t-2 border-ink bg-paper-3 md:w-96 md:border-t-0 md:border-l-2 lg:w-[28rem] lg:flex-none">
              <SpreadsheetPanel />
              <AnchorPanel />
              <ExportPanel onProgress={setExportProgress} />
            </aside>
          </Show>
        </div>
      </div>

      <Show when={exportProgress()}>
        {(progress) => {
          const percent = () => Math.round((progress().current / progress().total) * 100);
          return (
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
              <section
                class="w-full max-w-sm border-2 border-ink bg-white p-5 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="export-progress-title"
              >
                <h2 id="export-progress-title" class="text-base font-semibold">Exporting images</h2>
                <p class="mt-2 text-sm text-ink/70">{progress().phase}</p>
                <div
                  class="mt-4 h-2 overflow-hidden rounded-full bg-paper"
                  role="progressbar"
                  aria-label="Export progress"
                  aria-valuemin={0}
                  aria-valuemax={progress().total}
                  aria-valuenow={progress().current}
                >
                  <div
                    class="h-full bg-accent-2 transition-[width] duration-150"
                    style={{ width: `${percent()}%` }}
                  />
                </div>
                <p class="mt-2 text-right text-xs tabular-nums text-ink/60">
                  {progress().current} / {progress().total} images
                </p>
              </section>
            </div>
          );
        }}
      </Show>
    </div>
  );
}