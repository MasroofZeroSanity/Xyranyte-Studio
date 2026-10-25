import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { editor } from '@/store/editor';
import { loadImageFile } from '@/lib/image';
import Dropzone from '@/components/ui/Dropzone';
import CanvasStage from '@/components/CanvasStage';
import SpreadsheetPanel from '@/components/panels/SpreadsheetPanel';
import AnchorPanel from '@/components/panels/AnchorPanel';
import ExportPanel from '@/components/panels/ExportPanel';

export default function StudioPage() {
  const [darkMode, setDarkMode] = createSignal(localStorage.getItem('anchor-text-theme') === 'dark');

  createEffect(() => {
    const enabled = darkMode();
    document.documentElement.classList.toggle('dark', enabled);
    localStorage.setItem('anchor-text-theme', enabled ? 'dark' : 'light');
  });

  onCleanup(() => document.documentElement.classList.remove('dark'));

  const onImage = async (file: File) => editor.setImage(await loadImageFile(file));

  return (
    <div class="flex h-screen flex-col">
      <header class="flex items-center justify-between border-b border-line bg-white px-5 py-3">
        <a href="/">
            <h1 class="text-base font-semibold">Xyranyte Studio</h1>
        </a>
        <div class="flex items-center gap-4">
          <button
            type="button"
            role="switch"
            aria-label="Toggle dark mode"
            aria-checked={darkMode()}
            title={darkMode() ? 'Dark mode' : 'Light mode'}
            onClick={() => setDarkMode((enabled) => !enabled)}
            class="relative flex h-8 w-16 items-center rounded-full border border-line bg-paper p-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span
              aria-hidden="true"
              class="absolute left-[3px] top-[3px] h-6 w-7 rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: darkMode() ? 'translateX(28px)' : 'translateX(0)' }}
            />
            <span
              class="relative z-10 flex h-6 w-7 items-center justify-center"
              classList={{ 'text-accent': !darkMode(), 'text-ink/50': darkMode() }}
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            </span>
            <span
              class="relative z-10 flex h-6 w-7 items-center justify-center"
              classList={{ 'text-accent': darkMode(), 'text-ink/50': !darkMode() }}
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
              </svg>
            </span>
          </button>
          <Show when={editor.image()}>
            <div class="w-56">
              <Dropzone compact accept="image/*" title="Replace image" onFile={onImage} />
            </div>
          </Show>
        </div>
      </header>

      <div class="flex min-h-0 flex-1 flex-col md:flex-row">
        <main class="min-h-0 flex-1 overflow-auto p-5">
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
            <CanvasStage />
          </Show>
        </main>

        <Show when={editor.image()}>
          <aside class="w-full overflow-y-auto border-t border-line bg-paper md:w-96 md:border-t-0 md:border-l">
            <SpreadsheetPanel />
            <AnchorPanel />
            <ExportPanel />
          </aside>
        </Show>
      </div>
    </div>
  );
}