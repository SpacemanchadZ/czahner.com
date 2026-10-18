import type { Alert } from '../alerts';
import type { BadActor, LineStats, ShiftStats } from '../metrics';

const ICON = { critical: '✕', warning: '!', good: '✓' } as const;
const LEVEL = { critical: 'Act now', warning: 'Watch', good: 'Win' } as const;

export function Alerts({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;
  return (
    <section className="card-k alerts" aria-labelledby="alerts-h">
      <h3 id="alerts-h">What to talk about this week</h3>
      <ul>
        {alerts.map((a) => (
          <li key={a.title} className={a.level}>
            <span className={`chip ${a.level === 'critical' ? 'critical' : a.level === 'warning' ? 'warning' : 'good'}`}><i aria-hidden="true">{ICON[a.level]}</i>{LEVEL[a.level]}</span>
            <div><b>{a.title}</b><span>{a.detail}</span></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BadActorTable({ rows }: { rows: BadActor[] }) {
  return (
    <div className="tblwrap">
      <table className="data">
        <caption className="visually-hidden">Bad actors by breakdown downtime</caption>
        <thead><tr><th>Asset</th><th className="r">Breakdowns</th><th className="r">Downtime</th><th className="r">Labor</th><th className="r">Cum. share</th></tr></thead>
        <tbody>
          {rows.map((a) => (
            <tr key={`${a.line}-${a.asset}`}>
              <td>{a.line} {a.asset}</td><td className="r">{a.breakdowns}</td><td className="r">{a.downtimeHours} h</td><td className="r">{a.laborHours} h</td><td className="r">{a.cumulativePct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LineTable({ rows }: { rows: LineStats[] }) {
  return (
    <div className="tblwrap">
      <table className="data">
        <caption className="visually-hidden">Reliability by line</caption>
        <thead><tr><th>Line</th><th className="r">Breakdowns</th><th className="r">MTBF</th><th className="r">MTTR</th><th className="r">Downtime</th><th className="r">Planned work</th></tr></thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.line}><td>{l.line}</td><td className="r">{l.breakdowns}</td><td className="r">{l.mtbf} h</td><td className="r">{l.mttr} h</td><td className="r">{l.downtimeHours} h</td><td className="r">{l.plannedWork}%</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ShiftTable({ rows }: { rows: ShiftStats[] }) {
  const worst = Math.max(...rows.map((r) => r.breakdownShare));
  return (
    <div className="tblwrap">
      <table className="data">
        <caption className="visually-hidden">Performance by shift</caption>
        <thead><tr><th>Shift</th><th className="r">Work orders</th><th className="r">Breakdowns</th><th className="r">Breakdown share</th><th className="r">PM compliance</th></tr></thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.shift}>
              <td>{s.shift}</td><td className="r">{s.workOrders}</td><td className="r">{s.breakdowns}</td>
              <td className="r"><span className="cellbar"><i style={{ width: `${worst ? (s.breakdownShare / worst) * 100 : 0}%` }} /></span>{s.breakdownShare}%</td>
              <td className="r">{s.pmCompliance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
