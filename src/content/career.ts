export interface Job {
  title: string;
  org: string;
  /** Date range as printed on the résumé. */
  when: string;
  current?: boolean;
  bullets: string[];
}

export const jobs: Job[] = [
  {
    title: 'Maintenance Planner & Scheduler',
    org: 'Cardinal IG · Roanoke Facility, Vinton, VA',
    when: 'Nov 2024 – Present',
    current: true,
    bullets: [
      "Built the plant's maintenance planning infrastructure from the ground up: a 182-PM library and 13-week PM rotation calendar covering ~1,862 work order line items across four rotating crews and all departments.",
      'Led an A3 capstone project that reduced downtime on the top five breakdown assets by 53% (537 → 250 hours) and lowered the emergency work rate from 68% to 54%.',
      'Sustain 80% schedule compliance and 85% PM compliance; built weekly KPI scorecards for schedule compliance, PM compliance, backlog, emergency work, and planned work.',
      'Audited and resolved a plant-wide CMMS scheduling defect that generated duplicate PM work orders, reviewing 156 duplicate completions and moving the PM program to floating schedules.',
      'Authored the site Maintenance & Reliability Standard plus SOPs, one-point lessons, and PM job plans; built the equipment registry with QR codes, LOTO asset list, and PM gap analysis.',
      'Ran root cause analysis (A3, 5-Why, FMEA, Pareto) on chronic bad-actor equipment and benchmarked PM content against sister facilities.',
      'Developed in-house tools including a KPI dashboard, a planner toolkit, and a CMMS AI agent prototype.',
    ],
  },
  {
    title: 'Maintenance Technician Lead',
    org: 'Cardinal Glass',
    when: '2021 – 2024',
    bullets: [
      'Led maintenance technicians on troubleshooting and repair across glass processing lines, including Billco cutting tables and washers and a Glasstech tempering furnace.',
      'Repaired bearings, gearboxes, chains and belts, conveyors and drive systems, and hydraulic and pneumatic systems.',
      'Diagnosed Allen-Bradley drive and PLC faults to restore production quickly.',
    ],
  },
  {
    title: 'Customer Service Representative, Federal Employee Program',
    org: 'Anthem Blue Cross Blue Shield',
    when: '2017 – 2020',
    bullets: ['Resolved member benefit and claims questions for federal employees in a high-volume, metrics-driven environment.'],
  },
  {
    title: 'Quality Auditor',
    org: 'Altec',
    when: '2011 – 2017',
    bullets: ['Audited manufactured equipment against quality standards and documented nonconformances for correction.'],
  },
  {
    title: 'Gas Turbine Systems Technician (Mechanical) · Lead Oil King',
    org: 'U.S. Navy · USS Mahan (DDG-72)',
    when: '2003 – 2011',
    bullets: [
      'Operated and maintained gas turbine propulsion and engineering systems as an engine room operator aboard an Arleigh Burke-class destroyer.',
      'Served as Lead Oil King for the engineering department.',
    ],
  },
];

/** Shorter titles/orgs used on the home-page timeline. */
export const timeline = [
  { when: '2024 — Now', title: 'Maintenance Planner & Scheduler', org: 'Cardinal IG · Roanoke, VA', current: true },
  { when: '2021 — 2024', title: 'Maintenance Technician Lead', org: 'Cardinal Glass' },
  { when: '2017 — 2020', title: 'Customer Service Representative', org: 'Anthem Blue Cross Blue Shield · Federal Employee Program' },
  { when: '2011 — 2017', title: 'Quality Auditor', org: 'Altec' },
  { when: '2003 — 2011', title: 'Gas Turbine Systems Technician · Lead Oil King', org: 'U.S. Navy · USS Mahan (DDG-72)' },
];

export const summary =
  'Maintenance planner and U.S. Navy veteran with hands-on technician experience and a track record of building planning and reliability programs from scratch. Built a 182-PM library and KPI system, led an A3 project that cut downtime on the top five breakdown assets by 53%, and develops practical software and AI tools that make planning faster and maintenance data more trustworthy. Working toward Reliability Engineer and Maintenance Manager roles.';

export const skills: [string, string][] = [
  ['Planning', 'PM program design, weekly scheduling, backlog management, job plans, SOPs and OPLs, work order standards'],
  ['Reliability', 'A3, 5-Why, FMEA, Pareto analysis, criticality-based prioritization, KPI scorecards'],
  ['Mechanical', 'Bearings, gearboxes, chains and belts, hydraulics, pneumatics, conveyors and drives; Allen-Bradley drive and PLC fault diagnostics'],
  ['Systems & tools', 'PMware CMMS, Excel, HTML/CSS/JavaScript, React, Node.js, PostgreSQL, AI and LLM tools'],
];

export const certifications: [string, string][] = [
  ['RMIC', 'Planning & Scheduling Certification — Reliability & Maintainability Center, University of Tennessee'],
];
