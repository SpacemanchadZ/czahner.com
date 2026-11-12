import type { IconName } from '../components/Icon';

export type ProjectStatus = 'live' | 'demo' | 'proto' | 'build' | 'plan';

export interface Project {
  title: string;
  blurb: string;
  /** Shorter copy for the home-page teaser. */
  teaser?: string;
  icon: IconName;
  status: ProjectStatus;
  tags: string[];
  href?: string;
  code?: string;
  external?: boolean;
  /** Thumbnail tint variant (matches .thumb.t2 / .t3 in site.css). */
  tint?: 1 | 2 | 3;
  featured?: boolean;
}

export const statusLabel: Record<ProjectStatus, string> = {
  live: 'Live',
  demo: 'Live demo',
  proto: 'Prototype',
  build: 'In progress',
  plan: 'Planned',
};

export const projects: Project[] = [
  {
    title: 'CMRPstudy',
    blurb: 'A free study site for the CMRP exam — flashcards, a full practice exam, and a Ramsey Multicraft prep app.',
    teaser: 'Free CMRP exam prep — flashcards, a practice exam, and a Ramsey Multicraft prep app.',
    icon: 'cap',
    status: 'live',
    tags: ['HTML/JS', 'GitHub Pages'],
    href: 'https://cmrpstudy.com',
    external: true,
    featured: true,
  },
  {
    title: 'Maintlytics',
    blurb:
      'A maintenance KPI and planning app I built for Mac, iPhone, iPad, and Apple Watch. It turns CMMS work order data into a weekly schedule, a planning board, and reliability numbers a team can act on.',
    teaser: 'A maintenance KPI and planning app for Mac, iPhone, iPad, and Apple Watch.',
    icon: 'trend',
    status: 'live',
    tags: ['Swift', 'SwiftUI', 'macOS · iOS · watchOS'],
    href: '/lab/maintlytics/',
    tint: 2,
    featured: true,
  },
  {
    title: 'CompactLogix Lessons',
    blurb:
      'Eleven short, interactive lessons on PLCs, Studio 5000, VFDs and servo motion, written in plain language. Each one has an on-screen simulator, two quick questions, and a practice task to try in Studio 5000.',
    icon: 'chip',
    status: 'live',
    tags: ['HTML/JS', 'Allen-Bradley', 'Training'],
    href: '/lab/compactlogix/',
    tint: 2,
  },
];
