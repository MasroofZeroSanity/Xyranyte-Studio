import type { JSX } from 'solid-js';

export const inputClass =
  'w-full border-2 border-ink bg-white px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-accent';

export function Field(props: { label: string; children: JSX.Element }) {
  return (
    <label class="block">
      <span class="mb-1 block text-xs font-medium text-ink/70">{props.label}</span>
      {props.children}
    </label>
  );
}

export function Section(props: { title: string; children: JSX.Element; aside?: JSX.Element }) {
  return (
    <section class="studio-section">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold">{props.title}</h2>
        {props.aside}
      </div>
      {props.children}
    </section>
  );
}
