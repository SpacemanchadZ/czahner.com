/**
 * CSV import/export. Accepts typical CMMS export headers ("Work Type",
 * "Actual Hours", "Equipment"...) by matching each field against a list of
 * aliases, and normalizes values like "Preventive" → PM or "Emergency" → BD.
 * Rows that can't be used are counted and reported, not silently dropped.
 */
import Papa from 'papaparse';
import type { WorkOrder, WorkType } from './types';

type Field = keyof WorkOrder;

const ALIASES: Record<Field, string[]> = {
  id: ['id', 'wo', 'wo #', 'wo number', 'work order', 'work order #', 'work order number'],
  date: ['date', 'completed', 'completion date', 'date completed', 'work date', 'closed date', 'created'],
  dueDate: ['due', 'due date', 'scheduled date', 'target date'],
  line: ['line', 'area', 'department', 'location', 'work center'],
  asset: ['asset', 'equipment', 'machine', 'asset name', 'equipment name'],
  type: ['type', 'wo type', 'work type', 'order type', 'category'],
  shift: ['shift', 'crew'],
  laborHours: ['labor', 'labor hours', 'actual hours', 'hours', 'labor hrs'],
  downtimeHours: ['downtime', 'downtime hours', 'down hours', 'downtime hrs'],
  status: ['status', 'state'],
  scheduled: ['scheduled', 'on schedule list', 'planned'],
  onSchedule: ['on schedule', 'completed on schedule', 'schedule met', 'in window'],
};

const REQUIRED: Field[] = ['date', 'type', 'line'];

export function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[_\s]+/g, ' ').replace(/[^a-z0-9# ]/g, '').trim();
}

/** Maps each WorkOrder field to the CSV column that holds it. */
export function mapColumns(headers: string[]): Partial<Record<Field, string>> {
  const out: Partial<Record<Field, string>> = {};
  for (const [field, names] of Object.entries(ALIASES) as [Field, string[]][]) {
    const hit = headers.find((h) => names.includes(normalizeHeader(h)));
    if (hit) out[field] = hit;
  }
  return out;
}

export function parseType(v: string): WorkType | null {
  const s = v.trim().toLowerCase();
  if (/^(pm|prev|preventive|preventative|pdm|predictive)/.test(s)) return 'PM';
  if (/^(bd|break|emerg|em\b|em$|failure|reactive|unplanned)/.test(s)) return 'BD';
  if (/^(prj|proj|project|capital|improvement)/.test(s)) return 'PRJ';
  if (/^(cm|corrective|planned|repair|work request|wr)/.test(s)) return 'CM';
  return null;
}

const yes = (v: string | undefined) => /^(y|yes|true|1|x)$/i.test((v ?? '').trim());

export function parseDate(v: string): string | null {
  const s = v.trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2]!.padStart(2, '0')}-${iso[3]!.padStart(2, '0')}`;
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (us) {
    const y = us[3]!.length === 2 ? `20${us[3]}` : us[3]!;
    return `${y}-${us[1]!.padStart(2, '0')}-${us[2]!.padStart(2, '0')}`;
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

const num = (v: string | undefined) => {
  const n = parseFloat((v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export interface ImportResult {
  rows: WorkOrder[];
  skipped: number;
  missing: Field[];
  columns: Partial<Record<Field, string>>;
}

export function parseWorkOrders(csvText: string): ImportResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: 'greedy' });
  const headers = parsed.meta.fields ?? [];
  const columns = mapColumns(headers);
  const missing = REQUIRED.filter((f) => !columns[f]);
  if (missing.length) return { rows: [], skipped: parsed.data.length, missing, columns };

  const get = (row: Record<string, string>, f: Field) => (columns[f] ? row[columns[f]!] ?? '' : '');
  const rows: WorkOrder[] = [];
  let skipped = 0;
  parsed.data.forEach((row, i) => {
    const date = parseDate(get(row, 'date'));
    const type = parseType(get(row, 'type'));
    const line = get(row, 'line').trim();
    if (!date || !type || !line) {
      skipped += 1;
      return;
    }
    const status = /open|wip|progress|waiting|hold|new/i.test(get(row, 'status')) ? 'Open' : 'Closed';
    rows.push({
      id: get(row, 'id').trim() || `ROW-${i + 2}`,
      date,
      dueDate: parseDate(get(row, 'dueDate')) ?? undefined,
      line,
      asset: get(row, 'asset').trim() || 'Unspecified',
      type,
      shift: get(row, 'shift').trim() || 'Unassigned',
      laborHours: num(get(row, 'laborHours')),
      downtimeHours: num(get(row, 'downtimeHours')),
      status,
      scheduled: columns.scheduled ? yes(get(row, 'scheduled')) : type === 'PM' || type === 'CM',
      onSchedule: columns.onSchedule ? yes(get(row, 'onSchedule')) : status === 'Closed',
    });
  });
  return { rows, skipped, missing, columns };
}

export function toCsv(rows: WorkOrder[]): string {
  return Papa.unparse(
    rows.map((w) => ({
      'Work Order': w.id,
      Date: w.date,
      'Due Date': w.dueDate ?? '',
      Line: w.line,
      Asset: w.asset,
      'Work Type': w.type,
      Shift: w.shift,
      'Labor Hours': w.laborHours,
      'Downtime Hours': w.downtimeHours,
      Status: w.status,
      Scheduled: w.scheduled ? 'Y' : 'N',
      'On Schedule': w.onSchedule ? 'Y' : 'N',
    })),
  );
}
