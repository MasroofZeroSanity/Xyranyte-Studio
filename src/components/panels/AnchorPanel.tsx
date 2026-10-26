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
                  class="flex w-full items-center justify-between border-l-2 px-2 py-1.5 text-left text-sm"
                  classList={{
                    'border-accent-2 bg-paper-2 font-bold': editor.selectedId() === a.id,
                    'border-transparent hover:border-ink hover:bg-paper-2': editor.selectedId() !== a.id,
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
          let fontPicker!: HTMLDetailsElement;
          const set = (patch: Parameters<typeof editor.updateAnchor>[1]) =>
            editor.updateAnchor(a().id, patch);
          const chooseFont = (fontFamily: string, font?: FontsourceFont) => {
            fontPicker.open = false;
            setFontSearch('');
            if (font) {
              const anchorId = a().id;
              void selectFont(font, (loadedFont) =>
                editor.updateAnchor(anchorId, { fontFamily: loadedFont }),
              );
            } else {
              set({ fontFamily });
            }
          };
          return (
            <div class="space-y-3 border-2 border-ink bg-white p-3">
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

              <div class="block">
                <span class="mb-1 block text-xs font-medium text-ink/70">Font</span>
                <details
                  ref={fontPicker}
                  class="relative"
                  onToggle={(e) => e.currentTarget.open && setFontSearch('')}
                >
                  <summary class="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 border-2 border-ink bg-white px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-accent">
                    <span class="truncate">{a().fontFamily}</span>
                    <svg class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="m3 6 5 5 5-5" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                  </summary>
                  <div class="absolute inset-x-0 top-full z-30 mt-1 border-2 border-ink bg-white p-2 shadow-[4px_4px_0_var(--color-ink)]">
                    <input
                      type="search"
                      class={inputClass}
                      value={fontSearch()}
                      placeholder="Search fonts"
                      aria-label="Search fonts"
                      onInput={(e) => setFontSearch(e.currentTarget.value)}
                    />
                    <Show when={fontCatalog.loading}>
                      <p class="px-1 py-2 text-xs text-ink/60">Loading font catalog...</p>
                    </Show>
                    <Show when={fontCatalog.error}>
                      <p class="px-1 py-2 text-xs text-red-600">Font catalog unavailable.</p>
                    </Show>
                    <div class="mt-2 max-h-48 overflow-y-auto" role="listbox" aria-label="Fonts">
                      <Show when={'georgia'.includes(fontSearch().trim().toLowerCase())}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={a().fontFamily === 'Georgia'}
                          class="flex w-full items-center px-2 py-1.5 text-left text-sm hover:bg-paper-2"
                          classList={{ 'bg-paper-2 font-bold': a().fontFamily === 'Georgia' }}
                          onClick={() => chooseFont('Georgia')}
                        >
                          Georgia (system)
                        </button>
                      </Show>
                      <For each={filteredFonts()}>
                        {(font) => (
                          <button
                            type="button"
                            role="option"
                            aria-selected={a().fontFamily === font.family}
                            class="flex w-full items-center px-2 py-1.5 text-left text-sm hover:bg-paper-2"
                            classList={{ 'bg-paper-2 font-bold': a().fontFamily === font.family }}
                            onClick={() => chooseFont(font.family, font)}
                          >
                            {font.family}
                          </button>
                        )}
                      </For>
                    </div>
                    <Show when={fontStatus()}>
                      <p class="px-1 pt-2 text-xs text-ink/60">{fontStatus()}</p>
                    </Show>
                  </div>
                </details>
              </div>

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
                    class="h-7 w-10 cursor-pointer border-2 border-ink"
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
                  class="border-2 border-transparent px-2 py-1 text-sm text-red-600 hover:border-red-600 hover:bg-red-50"
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
                      class="h-8 w-full cursor-pointer border-2 border-ink"
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
