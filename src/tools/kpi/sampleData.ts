/**
 * Generates a believable six months of work orders for a fictional four-line
 * plant: a fixed PM library, planned corrective work, breakdowns concentrated
 * on a few bad actors, and steady improvement month over month. Seeded, so the
 * demo shows the same numbers on every load (and in tests).
 */
import { addMonths, daysInMonth } from './dates';
import type { WorkOrder, WorkType } from './types';

/** Small, fast, seedable PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ASSETS: Record<string, string[]> = {
  L1: ['Infeed Conveyor', 'Washer', 'Cutting Table', 'Seamer', 'Unload Robot'],
  L2: ['Infeed Conveyor', 'Washer', 'Spacer Applicator', 'Press', 'Stacker'],
  L3: ['Robot Cell', 'Washer', 'Roller Bed', 'Sealer', 'Gas Fill'],
  L4: ['Infeed Conveyor', 'Robot Cell', 'Washer', 'Press', 'Sealer'],
};
const SHIFTS = ['A Shift', 'B Shift', 'C Shift', 'D Shift', 'Day Shift'];
/** Breakdown weights — a few assets cause most of the trouble. */
const BAD_ACTORS: Record<string, number> = { 'L3|Robot Cell': 12, 'L3|Roller Bed': 5, 'L1|Washer': 4, 'L4|Sealer': 3 };

export const SAMPLE_START = '2026-04';
export const SAMPLE_MONTHS = 6;

export function generateSample(seed = 42): WorkOrder[] {
  const r = rng(seed);
  const pick = <T,>(list: T[]) => list[Math.floor(r() * list.length)] as T;
  const between = (lo: number, hi: number) => lo + r() * (hi - lo);
  const rows: WorkOrder[] = [];
  let n = 10_000;

  const assets = Object.entries(ASSETS).flatMap(([line, list]) => list.map((asset) => ({ line, asset, w: BAD_ACTORS[`${line}|${asset}`] ?? 1 })));
  const totalWeight = assets.reduce((s, a) => s + a.w, 0);
  const weighted = () => {
    let x = r() * totalWeight;
    for (const a of assets) if ((x -= a.w) <= 0) return a;
    return assets[assets.length - 1]!;
  };

  for (let i = 0; i < SAMPLE_MONTHS; i++) {
    const month = addMonths(SAMPLE_START, i);
    const days = daysInMonth(month);
    const progress = i / (SAMPLE_MONTHS - 1); // 0 → 1 across the period
    const day = (d: number) => `${month}-${String(Math.min(days, Math.max(1, Math.round(d)))).padStart(2, '0')}`;
    const add = (type: WorkType, p: Partial<WorkOrder> & { line: string; asset: string; date: string }) =>
      rows.push({ id: `WO-${n++}`, type, shift: pick(SHIFTS), laborHours: 1, downtimeHours: 0, status: 'Closed', scheduled: false, onSchedule: false, ...p });

    // PM library: every asset gets ~5 PM tasks a month.
    for (const a of assets) {
      for (let k = 0; k < 5; k++) {
        const due = between(1, days);
        const late = r() > 0.76 + 0.15 * progress ? between(8, 20) : between(-3, 5);
        const missed = r() < 0.04;
        add('PM', {
          line: a.line, asset: a.asset, date: day(due + late), dueDate: day(due),
          laborHours: Math.round(between(0.5, 3) * 4) / 4, status: missed ? 'Open' : 'Closed',
          scheduled: true, onSchedule: !missed && late <= 5,
        });
      }
    }
    // Planned corrective work off the schedule.
    for (let k = 0; k < 70; k++) {
      const a = pick(assets);
      add('CM', { line: a.line, asset: a.asset, date: day(between(1, days)), laborHours: Math.round(between(1, 8) * 4) / 4, scheduled: true, onSchedule: r() < 0.68 + 0.16 * progress });
    }
    // Breakdowns: fewer each month as PM and bad-actor work pays off.
    const bdCount = Math.round(78 - 30 * progress + between(-4, 4));
    for (let k = 0; k < bdCount; k++) {
      const a = weighted();
      const down = Math.round(Math.min(10, -Math.log(1 - r()) * (a.w >= 10 ? 2.6 : a.w > 1 ? 1.8 : 1.1) + 0.25) * 4) / 4;
      add('BD', { line: a.line, asset: a.asset, date: day(between(1, days)), downtimeHours: down, laborHours: Math.round(down * between(1.1, 1.8) * 4) / 4 });
    }
    // Projects.
    for (let k = 0; k < 6; k++) {
      const a = pick(assets);
      add('PRJ', { line: a.line, asset: a.asset, date: day(between(1, days)), laborHours: Math.round(between(4, 16)) });
    }
    // Open backlog builds in the most recent months.
    if (i >= SAMPLE_MONTHS - 3) {
      for (let k = 0; k < 28; k++) {
        const a = pick(assets);
        add(r() < 0.8 ? 'CM' : 'PRJ', { line: a.line, asset: a.asset, date: day(between(1, days)), laborHours: Math.round(between(4, 22)), status: 'Open' });
      }
    }
  }
  return rows;
}
