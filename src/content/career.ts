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
      "Built the plant's maintenance planning infrastructure from the ground up: a 182-PM library and 13-week PM rotation calendar covering about 1,862 work order line items across four rotating crews and all departments.",
      "Administer PMware, the plant's CMMS, day to day, including PM scheduling setup, asset and equipment records, and work order standards for every crew and department.",
      'Led an A3 capstone project that reduced downtime on the top five breakdown assets by 53% (537 → 250 hours) and lowered the emergency work rate from 68% to 54%.',
      'Sustain 90% PM compliance and 95% schedule compliance; built weekly KPI scorecards for schedule compliance, PM compliance, backlog, emergency work, and planned work.',
      'Diagnosed a plant-wide PMware scheduling defect that generated duplicate PM work orders, audited 156 duplicate completions, moved the PM program to floating schedules, and documented the change in one-point lessons.',
      'Traced unreliable maintenance data to incorrect PMs, missed work order entry, and a lack of training, then built a PMware cleanup plan and am developing PMware and iPad training for technicians.',
      'Authored the site Maintenance & Reliability Standard plus SOPs for each work order type, one-point lessons, and PM job plans; built the equipment registry with QR codes, LOTO asset list, and PM gap analysis.',
      'Ran root cause analysis (A3, 5-Why, FMEA, Pareto) on chronic bad-actor equipment and benchmarked PM content against sister facilities.',
      'Developed in-house tools including a KPI dashboard and a planner toolkit.',
    ],
  },
  {
    title: 'Maintenance Technician Lead',
    org: 'Cardinal Glass',
    when: 'Jun 2021 – Nov 2024',
    bullets: [
      'Led a crew of three maintenance technicians: assigned daily work, trained new hires, and directed troubleshooting and repair across glass processing lines, including Billco cutting tables and washers and a Glasstech tempering furnace.',
      'Repaired bearings, gearboxes, chains and belts, conveyors and drive systems, and hydraulic and pneumatic systems.',
      'Diagnosed Allen-Bradley drive and PLC faults to restore production quickly.',
    ],
  },
  {
    title: 'Customer Service Representative, Federal Employee Program',
    org: 'Anthem Blue Cross Blue Shield',
    when: 'Jun 2017 – Mar 2020',
    bullets: ['Resolved member benefit and claims questions for federal employees in a high-volume, metrics-driven environment.'],
  },
  {
    title: 'Quality Auditor',
    org: 'Altec',
    when: 'Nov 2011 – Mar 2017',
    bullets: ['Audited manufactured equipment against quality standards and documented nonconformances for correction.'],
  },
  {
    title: 'Gas Turbine Systems Technician (Mechanical) · Lead Oil King',
    org: 'U.S. Navy · USS Mahan (DDG-72)',
    when: 'Oct 2003 – Nov 2011',
    bullets: [
      "Maintained the ship's four GE LM2500 gas turbine engines, which together drive about 100,000 shaft horsepower of propulsion.",
      'Performed scheduled preventive and corrective maintenance on the turbines and their support systems, including compressor water washes, borescope inspections, fuel and lube oil filter changes, and start air, fuel and lube oil system servicing.',
      'Stood engine room watches, monitoring turbine and plant conditions and responding to alarms and casualties.',
      "As Lead Oil King, ran the engineering department's fuel and lube oil program: tracked inventory, directed transfers between tanks, sampled and tested fluids for quality, and kept the accountability records.",
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
  "Maintenance planner and U.S. Navy veteran with hands-on technician experience who built a plant's planning program from scratch and runs its CMMS. Built a 182-PM library and KPI system in PMware, led an A3 project that cut downtime on the top five breakdown assets by 53%, and keeps maintenance data trustworthy through work order standards, audits, and user training. Working toward Reliability Engineer and Maintenance Manager roles.";

export const skills: [string, string][] = [
  ['Planning', 'PM program design, weekly scheduling, backlog management, job plans, SOPs and OPLs, work order standards'],
  ['CMMS', 'PMware administration, PM scheduling setup (fixed vs. floating), asset and equipment records, data audits and cleanup, user training'],
  ['Reliability', 'A3, 5-Why, FMEA, Pareto analysis, criticality-based prioritization, KPI scorecards'],
  ['Mechanical', 'Bearings, gearboxes, chains and belts, hydraulics, pneumatics, conveyors and drives; Allen-Bradley drive and PLC fault diagnostics'],
  ['Systems & tools', 'Excel, HTML/CSS/JavaScript, React, Node.js, PostgreSQL, AI and LLM tools'],
];

export const certifications: [string, string][] = [
  ['RMIC', 'Planning & Scheduling Certification — Reliability & Maintainability Center, University of Tennessee'],
];
