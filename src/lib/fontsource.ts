export interface FontsourceFont {
  id: string;
  family: string;
  category: string;
  subsets: string[];
  weights: number[];
  variable: boolean;
}

let catalogPromise: Promise<FontsourceFont[]> | undefined;
const stylesheetPromises = new Map<string, Promise<void>>();

function isFontsourceFont(value: unknown): value is FontsourceFont {
  if (!value || typeof value !== 'object') return false;
  const font = value as Partial<FontsourceFont>;
  return (
    typeof font.id === 'string' &&
    typeof font.family === 'string' &&
    typeof font.category === 'string' &&
    Array.isArray(font.subsets) &&
    Array.isArray(font.weights) &&
    typeof font.variable === 'boolean'
  );
}

export function getFontCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch('https://api.fontsource.org/v1/fonts?subsets=latin')
      .then((response) => {
        if (!response.ok) throw new Error('Font catalog unavailable.');
        return response.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Invalid font catalog response.');
        return data
          .filter(isFontsourceFont)
          .filter((font) => font.category !== 'icons')
          .sort((a, b) => a.family.localeCompare(b.family));
      })
      .catch((error: unknown) => {
        catalogPromise = undefined;
        throw error;
      });
  }
  return catalogPromise;
}

function loadStylesheet(url: string) {
  const existing = stylesheetPromises.get(url);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => {
      link.remove();
      stylesheetPromises.delete(url);
      reject(new Error('Font could not be loaded.'));
    };
    document.head.append(link);
  });
  stylesheetPromises.set(url, promise);
  return promise;
}

export async function loadFontsourceFont(font: FontsourceFont) {
  if (!/^[a-z0-9-]+$/.test(font.id)) throw new Error('Invalid font ID.');

  const weights = font.variable
    ? [400]
    : [font.weights.includes(400) ? 400 : font.weights[0], ...(font.weights.includes(700) ? [700] : [])];
  const packageName = font.variable ? '@fontsource-variable' : '@fontsource';
  const cssFile = font.variable ? 'index.css' : `${weights[0]}.css`;
  const urls = [`https://cdn.jsdelivr.net/npm/${packageName}/${font.id}/${cssFile}`];
  if (!font.variable && weights.includes(700) && weights[0] !== 700) {
    urls.push(`https://cdn.jsdelivr.net/npm/${packageName}/${font.id}/700.css`);
  }

  await Promise.all(urls.map(loadStylesheet));
  await Promise.all(weights.map((weight) => document.fonts.load(`${weight} 16px "${font.family}"`)));
}