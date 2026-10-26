export interface Job {
  title: string;
  org: string;
  /** Location, shown in italics after the employer. */
  where: string;
  /** Date range as printed on the résumé. */
  when: string;
  current?: boolean;
  /** One-line italic description of the role's scope. */
  scope: string;
  responsibilities: string[];
  accomplishments: string[];
}

export const headline = [
  'Maintenance Planner & Scheduler',
  'Reliability Practitioner',
  'CMMS Administrator',
  'Navy Veteran',
];

export const expertise = [
  'Maintenance Planning', 'CMMS Administration', 'Root Cause Analysis', 'Hydraulics & Pneumatics',
  'Work Scheduling', 'KPI Tracking', 'A3 & FMEA', 'Conveyors & Drives',
  'Backlog Management', 'Job Plans & SOPs', 'LOTO & Safety', 'PLC & VFD Diagnostics',
  'PM Program Design', 'Equipment Criticality', 'Spare Parts Coordination', 'Technician Training',
];

export const highlights: [string, string][] = [
  ['Downtime Reduction', 'Led an A3 project that cut downtime on the plant’s top five breakdown assets by 53%, from 537 to 250 hours.'],
  ['Proactive Maintenance', 'Reduced the emergency work rate from 68% to 54% by moving reactive repairs into planned, scheduled work.'],
  ['PM Program', 'Built a 182-PM library and 13-week rotation calendar covering about 1,862 work order line items across four crews.'],
  ['Schedule Performance', 'Sustain 95% schedule compliance and 90% PM compliance across four 12-hour rotating maintenance crews.'],
];

export const jobs: Job[] = [
  {
    title: 'Maintenance Planner & Scheduler',
    org: 'Cardinal IG',
    where: 'Vinton, VA',
    when: 'Nov 2024 – Present',
    current: true,
    scope: 'Reporting to the Maintenance Manager, the role plans and schedules all maintenance for an insulating glass plant with four production lines, supporting four rotating crews across the IG, Cutting, Tempering, and Mezzanine departments.',
    responsibilities: [
      'Build and publish the weekly maintenance schedule to production, prioritizing the backlog by equipment criticality.',
      'Administer the PMware CMMS end to end, including PM scheduling, work order standards, and data quality for every department.',
      'Write PM job plans, SOPs, and one-point lessons, and coordinate parts so corrective work is ready before it is scheduled.',
      'Track and report weekly KPIs: schedule compliance, PM compliance, backlog, rework, and reactive vs. proactive work.',
    ],
    accomplishments: [
      'Built the site’s planning system from scratch: QR-coded equipment registry, LOTO asset list, and PM gap analysis.',
      'Authored the ROIG-MRS-001 Maintenance & Reliability Standard defining planning, scheduling, and PM practices for the plant.',
      'Audited 156 duplicate PM completions plant-wide and fixed the root scheduling defect by converting PMs to floating intervals.',
      'Completed A3 and root cause analyses on chronic bad-actor equipment using 5-Why, FMEA, and Pareto methods.',
    ],
  },
  {
    title: 'Maintenance Technician Lead',
    org: 'Cardinal Glass Industries',
    where: 'Vinton, VA',
    when: 'Jun 2021 – Nov 2024',
    scope: 'Led a crew of three maintenance technicians supporting glass cutting, tempering, and insulating glass production equipment.',
    responsibilities: [
      'Troubleshot and repaired Billco cutting tables and washers, Glasstech furnace, conveyors, and Allen-Bradley drives and PLCs.',
      'Maintained bearings, gearboxes, chains, belts, and hydraulic and pneumatic systems across the plant.',
      'Assigned daily work to the crew and trained new-hire technicians on equipment, procedures, and safe work practices.',
    ],
    accomplishments: [],
  },
  {
    title: 'Gas Turbine Systems Technician (GSM3) / Lead Oil King',
    org: 'U.S. Navy',
    where: 'USS Mahan (DDG-72)',
    when: 'Oct 2003 – Nov 2011',
    scope: 'Engineering department of a guided-missile destroyer, operating and maintaining gas turbine propulsion and auxiliary systems.',
    responsibilities: [
      'Performed and tracked 3-M Planned Maintenance System (PMS) checks on pumps, purifiers, valves, and fuel and lube oil systems.',
      'As Lead Oil King, managed fuel and lube oil inventory, sampling, and transfers, and kept the sampling and inventory logs.',
      'Performed gas turbine inspections and stood watch as an engine room operator, monitoring propulsion and auxiliary equipment.',
      'Supervised and trained junior sailors on equipment, maintenance procedures, and watch standing.',
    ],
    accomplishments: ['Awarded three Navy Achievement Medals and one Army Achievement Medal.'],
  },
];

/** Earlier roles listed one line each. */
export const additional: { title: string; org: string; when: string }[] = [
  { title: 'Customer Service Representative', org: 'Anthem Blue Cross Blue Shield (Federal Employee Program)', when: 'Jun 2017 – Mar 2020' },
  { title: 'Production Assembler & Quality Auditor', org: 'Altec', when: 'Nov 2011 – Mar 2017' },
];

export const education: { name: string; org: string; where?: string }[] = [
  { name: 'RMIC Planning & Scheduling Certification', org: 'Reliability & Maintainability Center, University of Tennessee', where: 'Knoxville, TN' },
  { name: 'Gas Turbine Systems Technician “A” School', org: 'U.S. Navy' },
];

/** Shorter titles/orgs used on the home-page timeline. */
export const timeline = [
  { when: '2024 — Now', title: 'Maintenance Planner & Scheduler', org: 'Cardinal IG · Roanoke, VA', current: true },
  { when: '2021 — 2024', title: 'Maintenance Technician Lead', org: 'Cardinal Glass' },
  { when: '2017 — 2020', title: 'Customer Service Representative', org: 'Anthem Blue Cross Blue Shield · Federal Employee Program' },
  { when: '2011 — 2017', title: 'Production Assembler · Quality Auditor', org: 'Altec' },
  { when: '2003 — 2011', title: 'Gas Turbine Systems Technician · Lead Oil King', org: 'U.S. Navy · USS Mahan (DDG-72)' },
];
