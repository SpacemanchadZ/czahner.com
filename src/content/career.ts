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
      'Led an A3 capstone project that cut downtime on the top five breakdown assets by 53% (537 → 250 hours) and lowered the emergency work rate from 68% to 54%.',
      "Built the plant's maintenance planning program from the ground up: a 182-PM library and 13-week rotation calendar covering about 1,862 work order line items across four rotating crews and all departments.",
      'Sustain 90% PM compliance and 95% schedule compliance through weekly scheduling, reported on weekly KPI scorecards covering backlog, emergency work, and planned work.',
      "Administer PMware, the plant's CMMS, including PM scheduling setup, asset and equipment records, and work order standards for every crew and department.",
      'Found and fixed a plant-wide PMware scheduling defect that generated duplicate PM work orders: audited 156 duplicate completions, moved the PM program to floating schedules, and documented the change for crews.',
      'Traced unreliable maintenance data to incorrect PMs, missed work order entry, and no user training; built a PMware cleanup plan, with PMware and iPad training for technicians now in development.',
      'Authored the site Maintenance & Reliability Standard, SOPs for each work order type, one-point lessons, and PM job plans; built the equipment registry with QR codes, LOTO asset list, and PM gap analysis.',
      'Ran root cause analysis (5-Why, FMEA, Pareto) on chronic bad-actor equipment and benchmarked PM content against sister facilities.',
    ],
  },
  {
    title: 'Maintenance Technician Lead',
    org: 'Cardinal Glass',
    when: 'Jun 2021 – Nov 2024',
    bullets: [
      'Led a crew of three maintenance technicians: assigned daily work and directed troubleshooting and repair across glass processing lines, including Billco cutting tables and washers and a Glasstech tempering furnace.',
      'Trained new hires on line equipment and repair procedures until they could take on troubleshooting and repairs on their own.',
      'Repaired bearings, gearboxes, chains and belts, conveyors and drive systems, and hydraulic and pneumatic systems.',
      'Diagnosed Allen-Bradley drive and PLC faults to restore production.',
    ],
  },
  {
    title: 'Customer Service Representative, Federal Employee Program',
    org: 'Anthem Blue Cross Blue Shield',
    when: 'Jun 2017 – Mar 2020',
    bullets: ['Resolved member benefit and claims questions for federal employees in a high-volume, metrics-driven environment.'],
  },
  {
    title: 'Production Assembler · Quality Auditor',
    org: 'Altec',
    when: 'Nov 2011 – Mar 2017',
    bullets: [
      'Built utility trucks on the production floor for three years: hung booms and hydraulic cylinders, connected hydraulic systems, and installed cabs.',
      'Moved into quality auditing for the final two years, inspecting finished units against quality standards and documenting nonconformances for correction.',
    ],
  },
  {
    title: 'Gas Turbine Systems Technician, Mechanical (GSM3) · Lead Oil King',
    org: 'U.S. Navy · USS Mahan (DDG-72)',
    when: 'Oct 2003 – Nov 2011',
    bullets: [
      "Maintained the ship's four GE LM2500 gas turbine engines, which together drive about 100,000 shaft horsepower of propulsion.",
      'Performed scheduled preventive and corrective maintenance on the turbines and their support systems, including compressor water washes, borescope inspections, fuel and lube oil filter changes, and start air, fuel and lube oil system servicing.',
      'Stood engine room watches, monitoring turbine and plant conditions and responding to alarms and casualties.',
      "As Lead Oil King, ran the engineering department's fuel and lube oil program: tracked inventory, directed transfers between tanks, sampled and tested fluids for quality, and kept the accountability records.",
      'Awarded three Navy and Marine Corps Achievement Medals and an Army Achievement Medal.',
    ],
  },
];

/** Shorter titles/orgs used on the home-page timeline. */
export const timeline = [
  { when: '2024 — Now', title: 'Maintenance Planner & Scheduler', org: 'Cardinal IG · Roanoke, VA', current: true },
  { when: '2021 — 2024', title: 'Maintenance Technician Lead', org: 'Cardinal Glass' },
  { when: '2017 — 2020', title: 'Customer Service Representative', org: 'Anthem Blue Cross Blue Shield · Federal Employee Program' },
  { when: '2011 — 2017', title: 'Production Assembler · Quality Auditor', org: 'Altec' },
  { when: '2003 — 2011', title: 'Gas Turbine Systems Technician · Lead Oil King', org: 'U.S. Navy · USS Mahan (DDG-72)' },
];

export const summary =
  "Maintenance planner and U.S. Navy veteran with nearly 20 years in maintenance, mechanical, and quality roles. Built a glass plant's planning and scheduling program from scratch, administer its PMware CMMS, and sustain 90% PM compliance and 95% schedule compliance. Turns unreliable maintenance data into a program crews can trust through root cause analysis, clear work standards, and hands-on training.";

export const skills: [string, string][] = [
  ['Planning', 'PM program design, weekly scheduling, backlog management, job plans, SOPs and OPLs, work order standards'],
  ['CMMS', 'PMware administration, PM scheduling setup (fixed vs. floating), asset and equipment records, data audits and cleanup, user training'],
  ['Reliability', 'A3, 5-Why, FMEA, Pareto analysis, criticality-based prioritization, KPI scorecards'],
  ['Mechanical', 'Bearings, gearboxes, chains and belts, hydraulics, pneumatics, conveyors and drives; Allen-Bradley drive and PLC fault diagnostics'],
  ['Software', 'PMware, Microsoft Excel and Word, HTML/CSS/JavaScript'],
];

export const certifications: [string, string][] = [
  ['RMIC', 'Planning & Scheduling Certification — Reliability & Maintainability Center, University of Tennessee'],
];

export const education: [string, string][] = [
  ['High school', 'Diploma — Pekin Community High School, Pekin, IL'],
];
