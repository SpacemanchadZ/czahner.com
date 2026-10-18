/**
 * Build step: render the static pages to HTML so they load instantly,
 * work without JavaScript, and are readable by search engines and
 * link previews. The client bundle then hydrates the same markup.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Home } from '../src/pages/Home';
import { Resume } from '../src/pages/Resume';
import { Lab } from '../src/pages/Lab';
import { NotFound } from '../src/pages/NotFound';

const MARKER = '<!--prerender-->';
const pages: [string, ReactElement][] = [
  ['index.html', <Home />],
  ['resume/index.html', <Resume />],
  ['lab/index.html', <Lab />],
  ['404.html', <NotFound />],
];

for (const [file, element] of pages) {
  const path = resolve('dist', file);
  const html = readFileSync(path, 'utf8');
  if (!html.includes(MARKER)) throw new Error(`No prerender marker in ${file}`);
  writeFileSync(path, html.replace(MARKER, renderToString(element)));
  console.log(`prerendered ${file}`);
}
