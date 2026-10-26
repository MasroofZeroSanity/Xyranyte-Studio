import { createSignal } from 'solid-js';

interface Props {
  accept: string;
  title: string;
  hint?: string;
  compact?: boolean;
  onFile: (file: File) => void;
}

export default function Dropzone(props: Props) {
  const [over, setOver] = createSignal(false);
  let input!: HTMLInputElement;

  const pick = (files: FileList | null | undefined) => {
    const file = files?.[0];
    if (file) props.onFile(file);
  };

  return (
    <div
      role="button"
      tabindex="0"
      onClick={() => input.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer?.files);
      }}
      class="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      classList={{
        'border-accent bg-accent-soft': over(),
        'border-ink-rule bg-white hover:border-accent': !over(),
        'px-4 py-2': props.compact,
        'px-6 py-20': !props.compact,
      }}
    >
      <input
        ref={input}
        type="file"
        accept={props.accept}
        class="hidden"
        onChange={(e) => {
          pick(e.currentTarget.files);
          e.currentTarget.value = '';
        }}
      />
      <p class="font-medium">{props.title}</p>
      {props.hint && <p class="mt-1 text-sm text-ink/60">{props.hint}</p>}
    </div>
  );
}
