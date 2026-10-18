import { StrictMode, type ReactElement } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

/**
 * Mount a page. Static pages are pre-rendered to HTML at build time
 * (see scripts/prerender.tsx), so we hydrate them; interactive tools
 * render on the client only.
 */
export function mount(app: ReactElement) {
  const el = document.getElementById('root');
  if (!el) throw new Error('#root element missing');
  const tree = <StrictMode>{app}</StrictMode>;
  if (el.firstElementChild) hydrateRoot(el, tree);
  else createRoot(el).render(tree);
}
