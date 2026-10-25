import { Show } from 'solid-js';
import { editor } from '@/store/editor';
import { loadImageFile } from '@/lib/image';
import Dropzone from '@/components/ui/Dropzone';
import NavigationBar from '@/components/ui/NavigationBar';
import CanvasStage from '@/components/CanvasStage';
import SpreadsheetPanel from '@/components/panels/SpreadsheetPanel';
import AnchorPanel from '@/components/panels/AnchorPanel';
import ExportPanel from '@/components/panels/ExportPanel';

export default function StudioPage() {
  const onImage = async (file: File) => editor.setImage(await loadImageFile(file));

  return (
    <div class="flex h-screen flex-col">
      <NavigationBar themePosition="first">
        <Show when={editor.image()}>
          <div class="app-navbar__studio-action w-56">
            <Dropzone compact accept="image/*" title="Replace image" onFile={onImage} />
          </div>
        </Show>
      </NavigationBar>

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