import type { IconName } from '../components/Icon';
import { codeUrl } from './site';

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
    title: 'Job Plan Builder',
    blurb:
      'Describe the job, attach drawings, and get a structured job plan with LOTO, parts, and cycle checks. A built-in plan check flags missing steps before you export a Word document.',
    teaser: 'Describe the job, add drawings, and export a step-by-step job plan to Word.',
    icon: 'clipboard',
    status: 'demo',
    tags: ['React', 'TypeScript', 'Word export'],
    href: '/lab/job-plan-builder/',
    code: codeUrl('src/tools/job-plan'),
    tint: 3,
    featured: true,
  },
  {
    title: 'Maintenance KPI Dashboard',
    blurb:
      'KPIs calculated from raw work-order data: planned work, PM and schedule compliance, MTBF/MTTR by line, backlog weeks, and a bad-actor Pareto. Load your own CSV export or use the sample plant.',
    teaser: 'Planned work, PM compliance, MTBF/MTTR and bad actors — computed from work-order data.',
    icon: 'bars',
    status: 'demo',
    tags: ['React', 'TypeScript', 'Recharts'],
    href: '/lab/kpi-dashboard/',
    code: codeUrl('src/tools/kpi'),
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
  {
    title: 'CMMS AI Agent',
    blurb: 'An agent that imports CMMS work order exports and uses an LLM with tool calling to answer planning questions and flag data problems.',
    icon: 'chip',
    status: 'proto',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Claude'],
    tint: 3,
  },
  {
    title: 'Offline Maintenance Assistant',
    blurb: 'A local AI with no internet connection. Load drawings, SOPs, and manuals, then ask about procedures, part numbers, and images — documents stay private.',
    icon: 'docSearch',
    status: 'build',
    tags: ['Local LLM', 'NVIDIA GPU', 'Doc search'],
  },
  {
    title: 'Planner Toolkit',
    blurb: 'One hub for daily planning: job staging kits, parts requests, storeroom and PM quality audits, a job plan builder, spares criticality, and RCA. Adapted from the free Planner HQ tools.',
    icon: 'wrench',
    status: 'build',
    tags: ['Planning', 'RCA', 'HTML/JS'],
    tint: 2,
  },
  {
    title: 'Drawing Search',
    blurb: 'Find any mechanical drawing by drawing number, equipment tag, part number, or text inside the drawing — from a phone on the shop floor.',
    icon: 'search',
    status: 'plan',
    tags: ['Search', 'OCR', 'Mobile'],
  },
];
