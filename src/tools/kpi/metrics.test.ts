import { describe, expect, it } from 'vitest';
import { applyFilter, badActors, byLine, byShift, previousFilter, summarize, trend } from './metrics';
import { addMonths, monthRange } from './dates';
import { generateSample } from './sampleData';
import { buildAlerts } from './alerts';
import { DEFAULT_SETTINGS, type WorkOrder } from './types';

const wo = (p: Partial<WorkOrder>): WorkOrder => ({
  id: 'x', date: '2026-05-10', line: 'L1', asset: 'A', type: 'CM', shift: 'A', laborHours: 1, downtimeHours: 0,
  status: 'Closed', scheduled: false, onSchedule: false, ...p,
});
const S = DEFAULT_SETTINGS;
const MAY = { from: '2026-05', to: '2026-05', line: 'All' as const };

describe('summarize', () => {
  it('computes labor mix and planned work from closed orders only', () => {
    const rows = [
      wo({ type: 'PM', laborHours: 6, dueDate: '2026-05-10' }),
      wo({ type: 'CM', laborHours: 2 }),
      wo({ type: 'BD', laborHours: 2, downtimeHours: 3 }),
      wo({ type: 'CM', laborHours: 50, status: 'Open' }),
    ];
    const s = summarize(rows, MAY, S, ['L1']);
    expect(s.plannedWork).toBe(80);
    expect(s.breakdownMix).toBe(20);
    expect(s.breakdownShare).toBe(25);
    expect(s.backlogHours).toBe(50);
  });

  it('counts PMs done within the grace window as compliant', () => {
    const rows = [
      wo({ type: 'PM', dueDate: '2026-05-01', date: '2026-05-08' }), // 7 days late: ok
      wo({ type: 'PM', dueDate: '2026-05-01', date: '2026-05-09' }), // 8 days late: miss
      wo({ type: 'PM', dueDate: '2026-05-20', date: '2026-05-18' }), // early: ok
      wo({ type: 'PM', dueDate: '2026-05-20', status: 'Open' }), // not done: miss
    ];
    expect(summarize(rows, MAY, S, ['L1']).pmCompliance).toBe(50);
  });

  it('derives MTBF from run hours and MTTR from downtime', () => {
    const rows = [wo({ type: 'BD', downtimeHours: 2 }), wo({ type: 'BD', downtimeHours: 4 })];
    const s = summarize(rows, { ...MAY, line: 'L1' }, S, ['L1', 'L2']);
    expect(s.mtbf).toBe((31 * 20) / 2);
    expect(s.mttr).toBe(3);
  });

  it('handles an empty period without dividing by zero', () => {
    const s = summarize([], MAY, S, ['L1']);
    expect(s.plannedWork).toBe(0);
    expect(s.mttr).toBe(0);
  });
});

describe('breakdowns and grouping', () => {
  it('ranks bad actors by downtime with a running Pareto share', () => {
    const rows = [
      wo({ type: 'BD', asset: 'Robot', downtimeHours: 6 }),
      wo({ type: 'BD', asset: 'Robot', downtimeHours: 2 }),
      wo({ type: 'BD', asset: 'Washer', downtimeHours: 2 }),
    ];
    const list = badActors(rows);
    expect(list.map((a) => a.asset)).toEqual(['Robot', 'Washer']);
    expect(list[0]).toMatchObject({ breakdowns: 2, downtimeHours: 8, cumulativePct: 80 });
    expect(list[1]!.cumulativePct).toBe(100);
  });

  it('builds the previous comparison window', () => {
    expect(previousFilter({ from: '2026-04', to: '2026-06', line: 'All' })).toMatchObject({ from: '2026-01', to: '2026-03' });
    expect(previousFilter({ from: '2026-01', to: '2026-01', line: 'All' })).toMatchObject({ from: '2025-12', to: '2025-12' });
  });

  it('walks month ranges across year boundaries', () => {
    expect(monthRange('2025-11', '2026-02')).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
    expect(addMonths('2026-12', 1)).toBe('2027-01');
  });
});

describe('sample plant', () => {
  const rows = generateSample();
  const all = { from: '2026-04', to: '2026-09', line: 'All' as const };
  const lines = ['L1', 'L2', 'L3', 'L4'];

  it('is deterministic', () => {
    expect(generateSample().length).toBe(rows.length);
    expect(generateSample()[100]).toEqual(rows[100]);
  });

  it('shows improvement over the period', () => {
    const t = trend(applyFilter(rows, all), all, S, lines);
    expect(t).toHaveLength(6);
    expect(t[5]!.breakdownMix).toBeLessThan(t[0]!.breakdownMix);
    expect(t[5]!.pmCompliance).toBeGreaterThan(t[0]!.pmCompliance);
  });

  it('has realistic headline numbers and a clear worst asset', () => {
    const s = summarize(applyFilter(rows, all), all, S, lines);
    expect(s.plannedWork).toBeGreaterThan(55);
    expect(s.plannedWork).toBeLessThan(95);
    expect(s.backlogWeeks).toBeGreaterThan(1);
    const top = badActors(applyFilter(rows, all))[0]!;
    expect(`${top.line} ${top.asset}`).toBe('L3 Robot Cell');
    expect(byLine(applyFilter(rows, all), all, S).find((l) => l.line === 'L3')!.mtbf).toBeLessThan(
      byLine(applyFilter(rows, all), all, S).find((l) => l.line === 'L2')!.mtbf,
    );
  });

  it('raises a repeat-failure alert for the worst asset', () => {
    const f = { from: '2026-09', to: '2026-09', line: 'All' as const };
    const r = applyFilter(rows, f);
    const alerts = buildAlerts(summarize(r, f, S, lines), badActors(r), byShift(r, S), 1);
    expect(alerts.some((a) => a.level === 'critical' && a.title.includes('Robot Cell'))).toBe(true);
  });
});
