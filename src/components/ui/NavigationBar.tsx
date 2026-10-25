import { A } from '@solidjs/router';
import { createEffect, createSignal, onCleanup, type JSX } from 'solid-js';
import './NavigationBar.css';

interface NavigationBarProps {
  children?: JSX.Element;
  themePosition?: 'first' | 'last';
}

export default function NavigationBar(props: NavigationBarProps) {
  const [darkMode, setDarkMode] = createSignal(localStorage.getItem('anchor-text-theme') === 'dark');

  createEffect(() => {
    const enabled = darkMode();
    document.documentElement.classList.toggle('dark', enabled);
    localStorage.setItem('anchor-text-theme', enabled ? 'dark' : 'light');
  });

  onCleanup(() => document.documentElement.classList.remove('dark'));

  const themeToggle = () => (
    <button
      type="button"
      role="switch"
      aria-label="Toggle dark mode"
      aria-checked={darkMode()}
      title={darkMode() ? 'Dark mode' : 'Light mode'}
      onClick={() => setDarkMode((enabled) => !enabled)}
      class="app-navbar__theme relative flex h-8 w-16 items-center rounded-full border border-line bg-paper p-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
          <path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2m-17.07 7.07 1.42-1.42m11.3-11.3 1.42-1.42" />
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
  );

  return (
    <header class="app-navbar">
      <div class="app-navbar__inner">
        <A class="app-navbar__brand" href="/" aria-label="Xyranyte Studio home">
          Xyranyte <span>Studio</span>
        </A>
        <nav
          class="app-navbar__actions"
          classList={{ 'app-navbar__actions--theme-first': props.themePosition === 'first' }}
          aria-label="Main navigation"
        >
          {props.themePosition === 'first' && themeToggle()}
          {props.children}
          {props.themePosition !== 'first' && themeToggle()}
        </nav>
      </div>
    </header>
  );
}