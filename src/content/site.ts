export const site = {
  name: 'Chad Zahner',
  title: 'Maintenance Planner & Scheduler',
  email: 'chad@czahner.com',
  linkedin: 'https://www.linkedin.com/in/czahner',
  repo: 'https://github.com/SpacemanchadZ/czahner.com',
} as const;

export type NavKey = 'home' | 'resume' | 'lab' | 'none';

export const nav: { key: NavKey; label: string; href: string }[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'resume', label: 'Résumé', href: '/resume/' },
  { key: 'lab', label: 'Lab', href: '/lab/' },
];

/** Link to a file in the public GitHub repo. */
export const codeUrl = (path: string) => `${site.repo}/tree/main/${path}`;
