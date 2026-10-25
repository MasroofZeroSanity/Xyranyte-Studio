import { A } from '@solidjs/router';

export default function NotFoundPage() {
  return (
    <main class="container min-h-screen py-20">
      <h1 class="text-4xl font-extrabold">This route is not mapped.</h1>
      <p class="mt-4 text-lg">Return to the start or open the Studio.</p>
      <A class="mt-8 inline-flex min-h-12 items-center border-2 border-ink bg-ink px-6 font-bold text-paper focus-visible:outline-2 focus-visible:outline-offset-4" href="/">
        Back to Xyranyte
      </A>
    </main>
  );
}