export type WorkType = 'PM' | 'CM' | 'BD' | 'PRJ';

export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  PM: 'Preventive (PM)',
  CM: 'Planned corrective',
  BD: 'Breakdown',
  PRJ: 'Project',
};

/** One row of a CMMS work order export, normalized. */
export interface WorkOrder {
  id: string;
  /** ISO date the work was done (or created, for open work). */
  date: string;
  /** For PMs: the date it was due. Used for PM compliance. */
  dueDate?: string;
  line: string;
  asset: string;
  type: WorkType;
  shift: string;
  laborHours: number;
  downtimeHours: number;
  status: 'Closed' | 'Open';
  /** On the weekly schedule. */
  scheduled: boolean;
  /** Scheduled work done in the week it was scheduled. */
  onSchedule: boolean;
}

export interface Settings {
  /** Production hours per day per line — the basis for MTBF. */
  runHoursPerDay: number;
  /** Craft hours available per week — the basis for backlog weeks. */
  crewHoursPerWeek: number;
  /** Days late a PM can be completed and still count as compliant. */
  pmGraceDays: number;
}

export const DEFAULT_SETTINGS: Settings = { runHoursPerDay: 20, crewHoursPerWeek: 360, pmGraceDays: 7 };

export interface Targets {
  plannedWork: number;
  pmCompliance: number;
  scheduleCompliance: number;
  breakdownMix: number;
  backlogWeeksMin: number;
  backlogWeeksMax: number;
}

export const TARGETS: Targets = {
  plannedWork: 85,
  pmCompliance: 90,
  scheduleCompliance: 80,
  breakdownMix: 20,
  backlogWeeksMin: 2,
  backlogWeeksMax: 4,
};

export interface Filter {
  /** Inclusive month range, 'YYYY-MM'. */
  from: string;
  to: string;
  line: string | 'All';
}
