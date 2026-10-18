import type { IconName } from '../components/Icon';

export interface HeadlineKpi {
  value: number;
  unit?: string;
  label: string;
  /** Meter fill, 0–100. */
  meter: number;
}

export const headlineKpis: HeadlineKpi[] = [
  { value: 53, unit: '%', label: 'Less downtime on the top 5 breakdown assets', meter: 53 },
  { value: 80, unit: '%', label: 'Weekly schedule compliance', meter: 80 },
  { value: 182, label: 'PMs in a library built from scratch', meter: 82 },
  { value: 85, unit: '%', label: 'PM compliance across four crews', meter: 85 },
];

export const services: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'calendar',
    title: 'Planning & scheduling',
    body: 'PM programs built from the ground up, job plans and SOPs crews can follow, a backlog prioritized by criticality, and a weekly schedule production can count on.',
  },
  {
    icon: 'trend',
    title: 'Reliability & root cause',
    body: 'Chasing chronic bad actors with A3, 5-Why, FMEA, and Pareto. Tracking the KPIs that matter and turning emergency work into planned work.',
  },
  {
    icon: 'code',
    title: 'Tools that help',
    body: 'Dashboards, planner toolkits, study apps, and AI prototypes — built to save planners and technicians real time on the floor.',
  },
];

export const caseStudy = {
  eyebrow: 'Featured project · RMIC A3 capstone',
  title: 'Cutting downtime on the five worst breakdown assets in half.',
  body: "A structured A3 project for my RMIC certification, aimed at the plant's top five breakdown assets — the machines driving the most unplanned downtime.",
  steps: [
    'Targeted the worst offenders with Pareto analysis',
    'Dug into root causes of the chronic failures',
    'Shifted the work from emergency to planned',
    'Tracked the results week over week',
  ],
  downtimeBefore: 537,
  downtimeAfter: 250,
  emergencyBefore: 68,
  emergencyAfter: 54,
};

export const focusAreas = [
  'PM optimization',
  'CMMS data quality',
  'Backlog management',
  'KPI scorecards',
  'Root cause analysis',
  'Job plans & SOPs',
  'AI for maintenance',
];
