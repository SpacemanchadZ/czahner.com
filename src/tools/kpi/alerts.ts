/** Rule-based callouts — the things a planner would point at in the Monday meeting. */
import type { BadActor, ShiftStats, Summary } from './metrics';
import { TARGETS, type Targets } from './types';

export type AlertLevel = 'critical' | 'warning' | 'good';
export interface Alert { level: AlertLevel; title: string; detail: string }

export function buildAlerts(s: Summary, actors: BadActor[], shifts: ShiftStats[], months: number, t: Targets = TARGETS): Alert[] {
  const out: Alert[] = [];
  const repeatThreshold = 3 * months;
  const repeats = actors.filter((x) => x.breakdowns >= repeatThreshold).sort((a, b) => b.breakdowns - a.breakdowns);
  for (const a of repeats.slice(0, 2)) {
    out.push({
      level: 'critical',
      title: `${a.line} ${a.asset}: repeat failures`,
      detail: `${a.breakdowns} breakdowns and ${a.downtimeHours} h of downtime. Open an RCA and review its PM content.`,
    });
  }
  if (actors[0] && actors.length >= 5 && actors[2]!.cumulativePct >= 50) {
    out.push({ level: 'warning', title: 'Downtime is concentrated', detail: `The top 3 assets cause ${actors[2]!.cumulativePct}% of breakdown downtime — focus reliability work there first.` });
  }
  if (s.pmsDue && s.pmCompliance < t.pmCompliance) {
    out.push({ level: 'warning', title: `PM compliance ${s.pmCompliance}%`, detail: `Below the ${t.pmCompliance}% target. Late PMs are the leading indicator for next month's breakdowns.` });
  }
  if (s.backlogWeeks > t.backlogWeeksMax) {
    out.push({ level: 'warning', title: `Backlog at ${s.backlogWeeks} weeks`, detail: `Above the ${t.backlogWeeksMax}-week ceiling. Review priorities, overtime, or contractor support.` });
  } else if (s.backlogWeeks < t.backlogWeeksMin) {
    out.push({ level: 'warning', title: `Backlog at ${s.backlogWeeks} weeks`, detail: `Under ${t.backlogWeeksMin} weeks — make sure work requests are being written and planned.` });
  }
  const ranked = shifts.filter((x) => x.workOrders >= 20).sort((a, b) => a.breakdownShare - b.breakdownShare);
  const best = ranked[0];
  if (best && ranked.length > 1) out.push({ level: 'good', title: `${best.shift} leads`, detail: `Lowest breakdown share at ${best.breakdownShare}% of its work orders.` });
  if (s.plannedWork >= t.plannedWork) out.push({ level: 'good', title: `Planned work ${s.plannedWork}%`, detail: `At or above the ${t.plannedWork}% target.` });
  return out;
}
