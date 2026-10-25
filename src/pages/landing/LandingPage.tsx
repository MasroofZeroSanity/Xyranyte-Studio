import { A } from '@solidjs/router';
import NavigationBar from '@/components/ui/NavigationBar';
import './landing.css';

const workflow = [
  {
    number: '01',
    title: 'Place the text',
    detail: 'Click the template where a name or detail should land.',
    result: 'An anchor in image coordinates',
  },
  {
    number: '02',
    title: 'Choose a column',
    detail: 'Connect that anchor to a spreadsheet header.',
    result: 'A field for every row',
  },
  {
    number: '03',
    title: 'Check a row',
    detail: 'Move through the records and tune the type in place.',
    result: 'A preview on the real image',
  },
  {
    number: '04',
    title: 'Export the batch',
    detail: 'Download one PNG or every row together as a ZIP.',
    result: 'Files named from your first anchor',
  },
];

export default function LandingPage() {
  return (
    <div class="landing-shell">
      <a class="skip-link" href="#main">Skip to content</a>

      <NavigationBar>
        <a href="#workflow">The workflow</a>
        <a href="#controls">Text controls</a>
        <A class="app-navbar__action" href="/studio">Open the Studio</A>
      </NavigationBar>

      <main id="main">
        <section class="hero" aria-labelledby="hero-title">
          <svg class="hero__texture" aria-hidden="true">
            <defs>
              <pattern id="hero-plus-pattern" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M14 10v8M10 14h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-plus-pattern)" />
          </svg>
          <div class="container hero__grid">
            <div class="hero__copy">
              <h1 id="hero-title">Place once<br />Print Everything</h1>
              <p class="hero__lead">Map spreadsheet columns onto a template and export one image per row.</p>
              <div class="hero__actions">
                <A class="button button--primary" href="/studio">Open the Studio</A>
                <a class="button button--quiet" href="#workflow">See the workflow</a>
              </div>
              <p class="hero__note">Your image. Your spreadsheet. Your layout.</p>
            </div>

            <figure class="hero-product">
              <img
                src="images/6264630433593102859.jpg"
                width="1480"
                height="740"
                fetchpriority="high"
                alt="Xyranyte Studio with a template, positioned text anchors, and spreadsheet controls"
              />
              <figcaption>The live editor, with an example template and sample rows.</figcaption>
            </figure>
          </div>
          <div class="container hero__rail" aria-label="Studio workflow summary">
            <span>Template image</span>
            <span>Mapped columns</span>
            <span>One PNG per row</span>
          </div>
        </section>

        <section class="workflow section-space" id="workflow" aria-labelledby="workflow-title">
          <div class="container">
            <div class="section-heading">
              <h2 id="workflow-title">From one layout to a full batch.</h2>
              <p>Place the text once. Let each row supply its own values.</p>
            </div>
            <ol class="workflow-list">
              {workflow.map((step) => (
                <li class="workflow-row">
                  <span class="workflow-row__number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                  <span class="workflow-row__result">{step.result}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section class="controls-band" id="controls" aria-labelledby="controls-title">
          <div class="container controls-band__grid">
            <div>
              <h2 id="controls-title">The details stay in your hands.</h2>
              <p>Adjust the placement, type, alignment, color, and overflow for every anchor.</p>
            </div>
            <dl class="control-list">
              <div><dt>Placement</dt><dd>Move and resize on the image</dd></div>
              <div><dt>Typography</dt><dd>Font, size, weight, and color</dd></div>
              <div><dt>Long text</dt><dd>Shrink to fit or wrap to lines</dd></div>
              <div><dt>Output</dt><dd>Preview a row or download the batch</dd></div>
            </dl>
          </div>
        </section>

        <section class="close-band" aria-labelledby="close-title">
          <div class="container close-band__inner">
            <div>
              <h2 id="close-title">Start with the image.</h2>
              <p>Add a template and spreadsheet in the Studio.</p>
            </div>
            <A class="button button--primary" href="/studio">Open the Studio</A>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="container site-footer__inner">
          <A class="wordmark" href="/">Xyranyte <span>Studio</span></A>
          <a href="/studio">Open the Studio</a>
          <p class="photo-credit">
            Made with love by @xyranyte, 2026.<br />
            {/* Template photograph by <a href="https://commons.wikimedia.org/wiki/File:Akalla_metro_station_August_2014_01.jpg" rel="noreferrer">Arild Vågen</a>, licensed under CC BY-SA 4.0. */}
          </p>
        </div>
      </footer>
    </div>
  );
}