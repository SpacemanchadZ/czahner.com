export interface Part {
  id: string;
  stores: string;
  description: string;
  qty: string;
  remarks: string;
}

export interface Step {
  id: string;
  text: string;
  /** Key steps print bold — safety-critical or easy-to-get-wrong actions. */
  key: boolean;
  /** Attachment shown with this step, if any. */
  imageId: string | null;
}

/** Single-line header and summary fields, in the order they appear on the form. */
export const TEXT_FIELDS = [
  'workCenter',
  'equipmentClass',
  'serviceRoutine',
  'title',
  'summary',
  'frequency',
  'elapsedTime',
  'downtime',
  'laborHours',
  'ppe',
  'consumables',
  'specialTools',
  'mobileEquipment',
  'coordination',
  'procedures',
  'originator',
  'approver',
] as const;

export type TextField = (typeof TEXT_FIELDS)[number];

export type JobPlan = Record<TextField, string> & {
  parts: Part[];
  steps: Step[];
};

export interface Attachment {
  id: string;
  name: string;
  /** JPEG bytes, used for previews and the Word export. */
  blob: Blob;
  url: string;
  width: number;
  height: number;
  /** Text pulled from a PDF page (drawing BOMs, notes). */
  text: string;
}

export interface DraftInput {
  description: string;
  workCenter: string;
  crew: string;
  notes: string;
  originator: string;
  attachmentIds: string[];
}

export type Severity = 'error' | 'warn' | 'info';

export interface Issue {
  id: string;
  severity: Severity;
  message: string;
  /** Index of the step the issue points at, when it is about one step. */
  step?: number;
}
