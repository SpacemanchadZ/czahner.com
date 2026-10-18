import type { Summary } from '../metrics';
import { TARGETS } from '../types';

type Status = 'good' | 'warning' | 'critical';
const ICON: Record<Status, string> = { good: '✓', warning: '!', critical: '✕' };
const LABEL: Record<Status, string> = { good: 'On target', warning: 'Near target', critical: 'Off target' };

interface Tile {
  label: string;
  value: number;
  unit: string;
  target: string;
  status: Status;
  /** Positive = better than the previous period. */
  delta: number | null;
  digits?: number;
  hint: string;
}

/** Status for a "higher is better" metric: within 10% of target is a warning. */
function higher(v: number, t: number): Status {
  return v >= t ? 'good' : v >= t * 0.9 ? 'warning' : 'critical';
}
function lower(v: number, t: number): Status {
  return v <= t ? 'good' : v <= t * 1.25 ? 'warning' : 'critical';
}

export function buildTiles(s: Summary, prev: Summary | null): Tile[] {
  const d = (k: keyof Summary, better: 1 | -1) => (prev && prev.workOrders ? ((s[k] as number) - (prev[k] as number)) * better : null);
  const backlogStatus: Status = s.backlogWeeks >= TARGETS.backlogWeeksMin && s.backlogWeeks <= TARGETS.backlogWeeksMax ? 'good' : s.backlogWeeks > 6 || s.backlogWeeks < 1 ? 'critical' : 'warning';
  return [
    { label: 'Planned work', value: s.plannedWork, unit: '%', target: `≥ ${TARGETS.plannedWork}%`, status: higher(s.plannedWork, TARGETS.plannedWork), delta: d('plannedWork', 1), hint: 'Labor hours on PM and planned corrective work' },
    { label: 'PM compliance', value: s.pmCompliance, unit: '%', target: `≥ ${TARGETS.pmCompliance}%`, status: higher(s.pmCompliance, TARGETS.pmCompliance), delta: d('pmCompliance', 1), hint: `${s.pmsDue} PMs due · done within the grace window` },
    { label: 'Schedule compliance', value: s.scheduleCompliance, unit: '%', target: `≥ ${TARGETS.scheduleCompliance}%`, status: higher(s.scheduleCompliance, TARGETS.scheduleCompliance), delta: d('scheduleCompliance', 1), hint: 'Scheduled jobs finished in their week' },
    { label: 'Breakdown labor', value: s.breakdownMix, unit: '%', target: `≤ ${TARGETS.breakdownMix}%`, status: lower(s.breakdownMix, TARGETS.breakdownMix), delta: d('breakdownMix', -1), hint: `${s.breakdowns} breakdowns · ${s.downtimeHours} h downtime` },
    { label: 'Backlog', value: s.backlogWeeks, unit: ' wk', target: `${TARGETS.backlogWeeksMin}–${TARGETS.backlogWeeksMax} wk`, status: backlogStatus, delta: null, hint: `${s.backlogHours} open planned hours` },
    { label: 'MTBF', value: s.mtbf, unit: ' h', target: 'Higher is better', status: 'good', delta: d('mtbf', 1), digits: 0, hint: `MTTR ${s.mttr} h per breakdown` },
  ];
}

export function KpiTiles({ summary, previous }: { summary: Summary; previous: Summary | null }) {
  const tiles = buildTiles(summary, previous);
  return (
    <div className="tiles">
      {tiles.map((t) => {
        const showStatus = t.label !== 'MTBF';
        return (
          <article className="tile" key={t.label}>
            <span className="tile-label">{t.label}</span>
            <div className="tile-value">{t.value.toFixed(t.digits ?? 1)}<small>{t.unit}</small></div>
            <div className="tile-meta">
              {showStatus && <span className={`chip ${t.status}`}><i aria-hidden="true">{ICON[t.status]}</i>{LABEL[t.status]}</span>}
              <span>Target {t.target}</span>
            </div>
            <div className="tile-meta">
              {t.delta !== null && Math.abs(t.delta) >= 0.05 && (
                <span className={t.delta > 0 ? 'up' : 'down'}>
                  {t.delta > 0 ? '▲ better' : '▼ worse'} by {Math.abs(t.delta).toFixed(t.digits ?? 1)}{t.unit.trim() === '%' ? ' pts' : t.unit}
                </span>
              )}
            </div>
            <p className="tile-hint">{t.hint}</p>
          </article>
        );
      })}
    </div>
  );
}
