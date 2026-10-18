/**
 * Maintenance KPI calculations from work-order rows. Every number on the
 * dashboard comes from here, so the definitions live in one tested place.
 *
 *   Planned work %       = labor hours on PM + planned corrective / all labor hours
 *   Breakdown labor mix  = breakdown labor hours / all labor hours
 *   PM compliance        = PMs done within the grace window of their due date / PMs due
 *   Schedule compliance  = scheduled jobs done in their scheduled week / scheduled jobs
 *   MTBF (per line)      = run hours in the period / breakdowns
 *   MTTR (per line)      = breakdown downtime hours / breakdowns
 *   Backlog weeks        = open planned labor hours / crew hours per week
 */
import { daysBetween, daysInMonth, monthOf, monthRange } from './dates';
import type { Filter, Settings, WorkOrder, WorkType } from './types';

export const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const sum = (rows: WorkOrder[], f: (w: WorkOrder) => number) => rows.reduce((s, w) => s + f(w), 0);
const round1 = (n: number) => Math.round(n * 10) / 10;

export function applyFilter(rows: WorkOrder[], f: Filter): WorkOrder[] {
  return rows.filter((w) => {
    const m = monthOf(w.date);
    return m >= f.from && m <= f.to && (f.line === 'All' || w.line === f.line);
  });
}

export function lines(rows: WorkOrder[]): string[] {
  return [...new Set(rows.map((w) => w.line))].sort();
}

export function months(rows: WorkOrder[]): string[] {
  return [...new Set(rows.map((w) => monthOf(w.date)))].sort();
}

export interface Summary {
  workOrders: number;
  breakdowns: number;
  laborHours: number;
  downtimeHours: number;
  plannedWork: number;
  breakdownMix: number;
  breakdownShare: number;
  pmCompliance: number;
  pmsDue: number;
  scheduleCompliance: number;
  backlogHours: number;
  backlogWeeks: number;
  mtbf: number;
  mttr: number;
}

export function runHours(monthsInPeriod: string[], lineCount: number, s: Settings): number {
  return monthsInPeriod.reduce((h, m) => h + daysInMonth(m) * s.runHoursPerDay, 0) * Math.max(1, lineCount);
}

export function summarize(rows: WorkOrder[], filter: Filter, s: Settings, allLines: string[]): Summary {
  const closed = rows.filter((w) => w.status === 'Closed');
  const bd = rows.filter((w) => w.type === 'BD');
  const labor = sum(closed, (w) => w.laborHours);
  const planned = sum(closed.filter((w) => w.type === 'PM' || w.type === 'CM'), (w) => w.laborHours);
  const bdLabor = sum(closed.filter((w) => w.type === 'BD'), (w) => w.laborHours);

  const pms = rows.filter((w) => w.type === 'PM');
  const pmOnTime = pms.filter((w) => w.status === 'Closed' && (!w.dueDate || daysBetween(w.dueDate, w.date) <= s.pmGraceDays)).length;

  const scheduled = rows.filter((w) => w.scheduled);
  const backlog = rows.filter((w) => w.status === 'Open' && w.type !== 'BD');
  const backlogHours = sum(backlog, (w) => w.laborHours);
  const lineCount = filter.line === 'All' ? allLines.length : 1;
  const hours = runHours(monthRange(filter.from, filter.to), lineCount, s);
  const downtime = sum(bd, (w) => w.downtimeHours);

  return {
    workOrders: rows.length,
    breakdowns: bd.length,
    laborHours: round1(labor),
    downtimeHours: round1(downtime),
    plannedWork: round1(pct(planned, labor)),
    breakdownMix: round1(pct(bdLabor, labor)),
    breakdownShare: round1(pct(bd.length, rows.length)),
    pmCompliance: round1(pct(pmOnTime, pms.length)),
    pmsDue: pms.length,
    scheduleCompliance: round1(pct(scheduled.filter((w) => w.onSchedule).length, scheduled.length)),
    backlogHours: round1(backlogHours),
    backlogWeeks: round1(backlogHours / Math.max(1, s.crewHoursPerWeek)),
    mtbf: bd.length ? round1(hours / bd.length) : hours,
    mttr: bd.length ? Math.round((downtime / bd.length) * 100) / 100 : 0,
  };
}

export interface MonthPoint {
  month: string;
  plannedWork: number;
  pmCompliance: number;
  scheduleCompliance: number;
  breakdownMix: number;
  /** Labor hours by work type, for the work-mix chart. */
  PM: number;
  CM: number;
  BD: number;
  PRJ: number;
}

export function trend(rows: WorkOrder[], filter: Filter, s: Settings, allLines: string[]): MonthPoint[] {
  return monthRange(filter.from, filter.to).map((m) => {
    const inMonth = rows.filter((w) => monthOf(w.date) === m);
    const sm = summarize(inMonth, { ...filter, from: m, to: m }, s, allLines);
    const byType = (t: WorkType) => round1(sum(inMonth.filter((w) => w.type === t && w.status === 'Closed'), (w) => w.laborHours));
    return {
      month: m,
      plannedWork: sm.plannedWork,
      pmCompliance: sm.pmCompliance,
      scheduleCompliance: sm.scheduleCompliance,
      breakdownMix: sm.breakdownMix,
      PM: byType('PM'),
      CM: byType('CM'),
      BD: byType('BD'),
      PRJ: byType('PRJ'),
    };
  });
}

export interface LineStats {
  line: string;
  breakdowns: number;
  mtbf: number;
  mttr: number;
  downtimeHours: number;
  plannedWork: number;
}

export function byLine(rows: WorkOrder[], filter: Filter, s: Settings): LineStats[] {
  const names = filter.line === 'All' ? lines(rows) : [filter.line];
  return names.map((line) => {
    const r = rows.filter((w) => w.line === line);
    const sm = summarize(r, { ...filter, line }, s, [line]);
    return { line, breakdowns: sm.breakdowns, mtbf: sm.mtbf, mttr: sm.mttr, downtimeHours: sm.downtimeHours, plannedWork: sm.plannedWork };
  });
}

export interface BadActor {
  asset: string;
  line: string;
  breakdowns: number;
  downtimeHours: number;
  laborHours: number;
  /** Running share of all breakdown downtime, for the Pareto view. */
  cumulativePct: number;
}

export function badActors(rows: WorkOrder[], limit = 10): BadActor[] {
  const map = new Map<string, BadActor>();
  for (const w of rows) {
    if (w.type !== 'BD') continue;
    const key = `${w.line}|${w.asset}`;
    const a = map.get(key) ?? { asset: w.asset, line: w.line, breakdowns: 0, downtimeHours: 0, laborHours: 0, cumulativePct: 0 };
    a.breakdowns += 1;
    a.downtimeHours += w.downtimeHours;
    a.laborHours += w.laborHours;
    map.set(key, a);
  }
  const list = [...map.values()].sort((a, b) => b.downtimeHours - a.downtimeHours || b.breakdowns - a.breakdowns);
  const total = list.reduce((s, a) => s + a.downtimeHours, 0);
  let running = 0;
  return list.slice(0, limit).map((a) => {
    running += a.downtimeHours;
    return { ...a, downtimeHours: round1(a.downtimeHours), laborHours: round1(a.laborHours), cumulativePct: round1(pct(running, total)) };
  });
}

export interface ShiftStats {
  shift: string;
  workOrders: number;
  breakdowns: number;
  breakdownShare: number;
  pmCompliance: number;
}

export function byShift(rows: WorkOrder[], s: Settings): ShiftStats[] {
  const names = [...new Set(rows.map((w) => w.shift))].sort();
  return names.map((shift) => {
    const r = rows.filter((w) => w.shift === shift);
    const pms = r.filter((w) => w.type === 'PM');
    const onTime = pms.filter((w) => w.status === 'Closed' && (!w.dueDate || daysBetween(w.dueDate, w.date) <= s.pmGraceDays)).length;
    const bd = r.filter((w) => w.type === 'BD').length;
    return { shift, workOrders: r.length, breakdowns: bd, breakdownShare: round1(pct(bd, r.length)), pmCompliance: round1(pct(onTime, pms.length)) };
  });
}

/** Same-length window immediately before the filter's range, for deltas. */
export function previousFilter(f: Filter): Filter {
  const n = monthRange(f.from, f.to).length;
  const [y, m] = f.from.split('-').map(Number) as [number, number];
  const start = new Date(Date.UTC(y, m - 1 - n, 1));
  const end = new Date(Date.UTC(y, m - 2, 1));
  const fmt = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return { ...f, from: fmt(start), to: fmt(end) };
}
