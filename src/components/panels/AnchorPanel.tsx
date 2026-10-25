import { createResource, createSignal, For, Show } from 'solid-js';
import { editor } from '@/store/editor';
import type { Align, Overflow } from '@/types';
import { getFontCatalog, loadFontsourceFont } from '@/lib/fontsource';
import type { FontsourceFont } from '@/lib/fontsource';
import { Field, Section, inputClass } from '../ui/Field';


const num = (v: string, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export default function AnchorPanel() {
  const [fontCatalog] = createResource(getFontCatalog);
  const [fontSearch, setFontSearch] = createSignal('');
  const [fontStatus, setFontStatus] = createSignal('');

  const filteredFonts = () => {
    const search = fontSearch().trim().toLowerCase();
    return (fontCatalog() ?? [])
      .filter((font) => !search || font.family.toLowerCase().includes(search))
      .slice(0, 100);
  };

  const selectFont = async (font: FontsourceFont, update: (fontFamily: string) => void) => {
    setFontStatus(`Loading ${font.family}...`);
    try {
      await loadFontsourceFont(font);
      update(font.family);
      setFontStatus('');
    } catch {
      setFontStatus(`Could not load ${font.family}.`);
    }
  };

  return (
    <Section
      title="Anchors"
      aside={
        <label class="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={editor.addMode()}
            onChange={(e) => editor.setAddMode(e.currentTarget.checked)}
          />
          Click image to add
        </label>
      }
    >
      <Show
        when={editor.anchors.length}
        fallback={<p class="text-sm text-ink/60">Click anywhere on the image to place your first anchor.</p>}
      >
        <ul class="mb-3 space-y-1">
          <For each={editor.anchors}>
            {(a, i) => (
              <li>
                <button
                  class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm"
                  classList={{
                    'bg-accent-soft font-medium': editor.selectedId() === a.id,
                    'hover:bg-paper': editor.selectedId() !== a.id,
                  }}
                  onClick={() => editor.setSelectedId(a.id)}
                >
                  <span>Anchor {i() + 1}</span>
                  <span class="text-ink/60">{a.column || 'no column'}</span>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>

      <Show when={editor.selected()}>
        {(sel) => {
          const a = sel;
          const set = (patch: Parameters<typeof editor.updateAnchor>[1]) =>
            editor.updateAnchor(a().id, patch);
          return (
            <div class="space-y-3 rounded-lg border border-line bg-white p-3">
              <Field label="Spreadsheet column">
                <Show
                  when={editor.columns().length}
                  fallback={
                    <input
                      class={inputClass}
                      value={a().column}
                      placeholder="Upload a spreadsheet or type a header"
                      onInput={(e) => set({ column: e.currentTarget.value })}
                    />
                  }
                >
                  <select class={inputClass} onChange={(e) => set({ column: e.currentTarget.value })}>
                    <option value="" selected={!a().column}>
                      (none)
                    </option>
                    <For each={editor.columns()}>
                      {(c) => (
                        <option value={c} selected={c === a().column}>
                          {c}
                        </option>
                      )}
                    </For>
                  </select>
                </Show>
              </Field>

              <div class="grid grid-cols-2 gap-3">
                <Field label="Max width (px)">
                  <input
                    type="number"
                    class={inputClass}
                    value={a().maxWidth}
                    onInput={(e) => set({ maxWidth: num(e.currentTarget.value, a().maxWidth) })}
                  />
                </Field>
                <Field label="Font size (px)">
                  <input
                    type="number"
                    class={inputClass}
                    value={a().fontSize}
                    onInput={(e) => set({ fontSize: num(e.currentTarget.value, a().fontSize) })}
                  />
                </Field>
                <Field label="X (px)">
                  <input
                    type="number"
                    class={inputClass}
                    value={a().x}
                    onInput={(e) => set({ x: Number(e.currentTarget.value) || 0 })}
                  />
                </Field>
                <Field label="Y (px)">
                  <input
                    type="number"
                    class={inputClass}
                    value={a().y}
                    onInput={(e) => set({ y: Number(e.currentTarget.value) || 0 })}
                  />
                </Field>
              </div>

              <Field label="Font">
                <div class="space-y-2">
                  <input
                    type="search"
                    class={inputClass}
                    value={fontSearch()}
                    placeholder="Search Fontsource fonts"
                    onInput={(e) => setFontSearch(e.currentTarget.value)}
                  />
                  <select
                    class={inputClass}
                    value={a().fontFamily}
                    disabled={!fontCatalog() || filteredFonts().length === 0}
                    onChange={(e) => {
                      const font = fontCatalog()?.find((item) => item.family === e.currentTarget.value);
                      if (font) {
                        const anchorId = a().id;
                        void selectFont(font, (fontFamily) =>
                          editor.updateAnchor(anchorId, { fontFamily }),
                        );
                      }
                    }}
                  >
                    <option value="Georgia">Georgia (system)</option>
                    <For each={filteredFonts()}>
                      {(font) => <option value={font.family}>{font.family}</option>}
                    </For>
                  </select>
                  <Show when={fontCatalog.loading}>
                    <p class="text-xs text-ink/60">Loading font catalog...</p>
                  </Show>
                  <Show when={fontCatalog.error}>
                    <p class="text-xs text-red-600">Font catalog unavailable.</p>
                  </Show>
                  <Show when={fontStatus()}>
                    <p class="text-xs text-ink/60">{fontStatus()}</p>
                  </Show>
                </div>
              </Field>

              <div class="grid grid-cols-2 gap-3">
                <Field label="Align on anchor">
                  <select
                    class={inputClass}
                    onChange={(e) => set({ align: e.currentTarget.value as Align })}
                  >
                    <For each={['left', 'center', 'right'] as Align[]}>
                      {(v) => (
                        <option value={v} selected={v === a().align}>
                          {v}
                        </option>
                      )}
                    </For>
                  </select>
                </Field>
                <Field label="When text is too long">
                  <select
                    class={inputClass}
                    onChange={(e) => set({ overflow: e.currentTarget.value as Overflow })}
                  >
                    <option value="shrink" selected={a().overflow === 'shrink'}>
                      Shrink to fit
                    </option>
                    <option value="wrap" selected={a().overflow === 'wrap'}>
                      Wrap lines
                    </option>
                  </select>
                </Field>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3">
                <label class="flex items-center gap-2 text-sm">
                  Color
                  <input
                    type="color"
                    value={a().color}
                    onInput={(e) => set({ color: e.currentTarget.value })}
                    class="h-7 w-10 cursor-pointer rounded border border-line"
                  />
                </label>
                <label class="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={a().bold}
                    onChange={(e) => set({ bold: e.currentTarget.checked })}
                  />
                  Bold
                </label>
                <label class="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={a().shadowEnabled}
                    onChange={(e) => set({ shadowEnabled: e.currentTarget.checked })}
                  />
                  Shadow
                </label>
                <button
                  class="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => editor.removeAnchor(a().id)}
                >
                  Delete anchor
                </button>
              </div>

              <Show when={a().shadowEnabled}>
                <div class="grid grid-cols-2 gap-3 border-t border-line pt-3">
                  <Field label="Shadow color">
                    <input
                      type="color"
                      value={a().shadowColor}
                      onInput={(e) => set({ shadowColor: e.currentTarget.value })}
                      class="h-8 w-full cursor-pointer rounded border border-line"
                    />
                  </Field>
                  <Field label="Blur (px)">
                    <input
                      type="number"
                      min="0"
                      class={inputClass}
                      value={a().shadowBlur}
                      onInput={(e) => set({ shadowBlur: Math.max(0, Number(e.currentTarget.value) || 0) })}
                    />
                  </Field>
                  <Field label="Offset X (px)">
                    <input
                      type="number"
                      class={inputClass}
                      value={a().shadowX}
                      onInput={(e) => set({ shadowX: Number(e.currentTarget.value) || 0 })}
                    />
                  </Field>
                  <Field label="Offset Y (px)">
                    <input
                      type="number"
                      class={inputClass}
                      value={a().shadowY}
                      onInput={(e) => set({ shadowY: Number(e.currentTarget.value) || 0 })}
                    />
                  </Field>
                </div>
              </Show>
            </div>
          );
        }}
      </Show>
    </Section>
  );
}
