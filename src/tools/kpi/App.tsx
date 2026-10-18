import { useMemo, useRef, useState } from 'react';
import { ToolShell } from '../../components/ToolShell';
import { Icon } from '../../components/Icon';
import { addMonths, monthLabel, monthRange } from './dates';
import { applyFilter, badActors, byLine, byShift, lines as listLines, months as listMonths, previousFilter, summarize, trend } from './metrics';
import { buildAlerts } from './alerts';
import { generateSample } from './sampleData';
import { parseWorkOrders, toCsv } from './csv';
import { DEFAULT_SETTINGS, type Filter, type Settings, type WorkOrder } from './types';
import { KpiTiles } from './components/KpiTiles';
import { LineBars, ParetoChart, TrendChart, WorkMixChart } from './components/Charts';
import { Alerts, BadActorTable, LineTable, ShiftTable } from './components/Tables';

type Period = 'last1' | 'last3' | 'last6' | 'all' | `m:${string}`;

function rangeFor(period: Period, available: string[]): { from: string; to: string } {
  const last = available[available.length - 1] ?? '2026-09';
  const first = available[0] ?? last;
  if (period.startsWith('m:')) { const m = period.slice(2); return { from: m, to: m }; }
  const n = period === 'last1' ? 1 : period === 'last3' ? 3 : period === 'last6' ? 6 : available.length;
  const from = addMonths(last, -(n - 1));
  return { from: from < first ? first : from, to: last };
}

function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function KpiDashboard() {
  const sample = useMemo(() => generateSample(), []);
  const [rows, setRows] = useState<WorkOrder[]>(sample);
  const [source, setSource] = useState('Sample plant · fictional data');
  const [period, setPeriod] = useState<Period>('last3');
  const [line, setLine] = useState<string>('All');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [showTables, setShowTables] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const available = useMemo(() => listMonths(rows), [rows]);
  const allLines = useMemo(() => listLines(rows), [rows]);
  const filter: Filter = { ...rangeFor(period, available), line };
  const prevFilter = previousFilter(filter);

  const view = useMemo(() => {
    const current = applyFilter(rows, filter);
    const prevRows = applyFilter(rows, prevFilter);
    const summary = summarize(current, filter, settings, allLines);
    const previous = prevRows.length ? summarize(prevRows, prevFilter, settings, allLines) : null;
    const actors = badActors(current);
    const shifts = byShift(current, settings);
    const monthsInRange = monthRange(filter.from, filter.to).length;
    return {
      summary,
      previous,
      trendData: trend(applyFilter(rows, { ...filter, from: available[0] ?? filter.from }), { ...filter, from: available[0] ?? filter.from }, settings, allLines),
      lineStats: byLine(current, filter, settings),
      actors,
      shifts,
      alerts: buildAlerts(summary, actors, shifts, monthsInRange),
    };
  }, [rows, filter.from, filter.to, filter.line, settings, allLines, available]);

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    const res = parseWorkOrders(await file.text());
    if (res.missing.length) {
      setMessage({ error: true, text: `Couldn't find columns for: ${res.missing.join(', ')}. Download the template to see the expected headers.` });
      return;
    }
    if (!res.rows.length) {
      setMessage({ error: true, text: 'No usable rows found in that file.' });
      return;
    }
    setRows(res.rows);
    setSource(`${file.name} · ${res.rows.length.toLocaleString()} work orders`);
    setPeriod('all');
    setLine('All');
    setMessage({ text: `Loaded ${res.rows.length.toLocaleString()} work orders${res.skipped ? ` — skipped ${res.skipped} row${res.skipped > 1 ? 's' : ''} missing a date, type, or line` : ''}. Your file never leaves this browser.` });
  };

  const rangeText = filter.from === filter.to ? monthLabel(filter.from, 'long') : `${monthLabel(filter.from, 'long')} – ${monthLabel(filter.to, 'long')}`;

  const actions = (
    <>
      <button className="tbtn ghost" type="button" onClick={() => fileInput.current?.click()}>Import CSV</button>
      <button className="tbtn ghost" type="button" onClick={() => download(toCsv(rows), 'work-orders.csv', 'text/csv')}>Download data</button>
      <button className="tbtn primary" type="button" onClick={() => void rootRef.current?.requestFullscreen?.()}>TV mode</button>
      <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={(e) => { void onImport(e.target.files?.[0]); e.target.value = ''; }} />
    </>
  );

  return (
    <ToolShell title="Maintenance KPI Dashboard" tag="Demo" codePath="src/tools/kpi" actions={actions}>
      <div className="kpi" ref={rootRef}>
        <div className="filters no-print" role="group" aria-label="Filters">
          <label>
            <span>Period</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="last1">Last month</option>
              <option value="last3">Last 3 months</option>
              <option value="last6">Last 6 months</option>
              <option value="all">All data</option>
              <optgroup label="Single month">
                {available.slice().reverse().map((m) => <option key={m} value={`m:${m}`}>{monthLabel(m, 'long')}</option>)}
              </optgroup>
            </select>
          </label>
          <label>
            <span>Line</span>
            <select value={line} onChange={(e) => setLine(e.target.value)}>
              <option value="All">All lines</option>
              {allLines.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label>
            <span>Run hours / day</span>
            <input type="number" min={1} max={24} value={settings.runHoursPerDay} onChange={(e) => setSettings({ ...settings, runHoursPerDay: Math.min(24, Math.max(1, Number(e.target.value) || 1)) })} />
          </label>
          <label>
            <span>Crew hours / week</span>
            <input type="number" min={40} step={40} value={settings.crewHoursPerWeek} onChange={(e) => setSettings({ ...settings, crewHoursPerWeek: Math.max(1, Number(e.target.value) || 1) })} />
          </label>
          <div className="source">
            <span>{source}</span>
            {rows !== sample && <button type="button" className="linkbtn" onClick={() => { setRows(sample); setSource('Sample plant · fictional data'); setPeriod('last3'); setMessage(null); }}>Use sample data</button>}
          </div>
        </div>

        {message && <p className={`banner${message.error ? ' err' : ''}`} role="status">{message.text}</p>}

        <div className="period">
          <h2>{rangeText}{line !== 'All' ? ` · ${line}` : ''}</h2>
          <span>{view.summary.workOrders.toLocaleString()} work orders · {view.summary.laborHours.toLocaleString()} labor hours · compared with the previous {monthRange(filter.from, filter.to).length === 1 ? 'month' : `${monthRange(filter.from, filter.to).length} months`}</span>
        </div>

        <KpiTiles summary={view.summary} previous={view.previous} />

        <div className="grid2">
          <section className="card-k"><TrendChart data={view.trendData} /></section>
          <section className="card-k"><WorkMixChart data={view.trendData} /></section>
        </div>

        <div className="grid3">
          <Alerts alerts={view.alerts} />
          <section className="card-k"><LineBars data={view.lineStats} metric="mtbf" title="MTBF by line" unit=" h" note="Hours · run hours ÷ breakdowns · higher is better" /></section>
          <section className="card-k"><LineBars data={view.lineStats} metric="mttr" title="MTTR by line" unit=" h" note="Hours · downtime ÷ breakdowns · lower is better" /></section>
        </div>

        <div className="grid2">
          <section className="card-k"><ParetoChart data={view.actors} /></section>
          <section className="card-k">
            <div className="card-head"><h3>Shift performance</h3></div>
            <ShiftTable rows={view.shifts} />
          </section>
        </div>

        <section className="card-k no-print">
          <div className="card-head">
            <h3>Data tables</h3>
            <button type="button" className="tbtn line sm" aria-expanded={showTables} onClick={() => setShowTables((v) => !v)}>{showTables ? 'Hide' : 'Show'} tables</button>
          </div>
          {showTables && (
            <div className="grid2 tight">
              <div><h4>Bad actors</h4><BadActorTable rows={view.actors} /></div>
              <div><h4>Reliability by line</h4><LineTable rows={view.lineStats} /></div>
            </div>
          )}
        </section>

        <details className="card-k defs">
          <summary>How these numbers are calculated</summary>
          <dl>
            <dt>Planned work</dt><dd>Labor hours on PM and planned corrective work ÷ all closed labor hours.</dd>
            <dt>PM compliance</dt><dd>PMs completed within {settings.pmGraceDays} days of their due date ÷ PMs due in the period.</dd>
            <dt>Schedule compliance</dt><dd>Scheduled jobs completed in the week they were scheduled ÷ scheduled jobs.</dd>
            <dt>Breakdown labor</dt><dd>Breakdown labor hours ÷ all closed labor hours.</dd>
            <dt>Backlog</dt><dd>Open planned labor hours ÷ crew hours per week ({settings.crewHoursPerWeek}).</dd>
            <dt>MTBF / MTTR</dt><dd>Run hours ({settings.runHoursPerDay} h/day per line) ÷ breakdowns, and breakdown downtime ÷ breakdowns.</dd>
          </dl>
          <p className="hint">CSV columns recognized: Work Order, Date, Due Date, Line, Asset, Work Type, Shift, Labor Hours, Downtime Hours, Status, Scheduled, On Schedule — common CMMS names like “Equipment” or “Actual Hours” work too. Only Date, Work Type, and Line are required.</p>
          <button type="button" className="tbtn line sm" onClick={() => download(toCsv(sample.slice(0, 40)), 'work-order-template.csv', 'text/csv')}><Icon name="download" />Download CSV template</button>
        </details>
      </div>
    </ToolShell>
  );
}
