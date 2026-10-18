import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { monthLabel } from '../dates';
import type { BadActor, LineStats, MonthPoint } from '../metrics';
import { INK, SERIES, WORK_TYPE_COLOR, WORK_TYPE_STACK } from '../theme';
import { WORK_TYPE_LABEL } from '../types';

const axis = { stroke: INK.axis, tick: { fill: INK.muted, fontSize: 12 }, tickLine: false } as const;
const grid = <CartesianGrid stroke={INK.grid} vertical={false} />;

/** Tooltip: value first and strong, series name secondary, keyed with a short line. */
function ChartTooltip({ active, payload, label, unit = '', labelFormat }: TooltipProps<number, string> & { unit?: string; labelFormat?: (l: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ctip">
      <div className="ctip-h">{labelFormat ? labelFormat(String(label)) : label}</div>
      {payload.slice().reverse().map((p) => (
        <div className="ctip-row" key={String(p.dataKey)}>
          <i style={{ background: p.color }} aria-hidden="true" />
          <b>{typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : p.value}{unit}</b>
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  );
}

function Legend({ items, shape }: { items: { label: string; color: string }[]; shape: 'line' | 'rect' }) {
  return (
    <ul className="legend">
      {items.map((i) => (
        <li key={i.label}><i className={shape} style={{ background: i.color }} aria-hidden="true" />{i.label}</li>
      ))}
    </ul>
  );
}

const TREND_SERIES = [
  { key: 'plannedWork', label: 'Planned work', color: SERIES.blue },
  { key: 'pmCompliance', label: 'PM compliance', color: SERIES.orange },
  { key: 'scheduleCompliance', label: 'Schedule compliance', color: SERIES.aqua },
] as const;

export function TrendChart({ data }: { data: MonthPoint[] }) {
  const last = data[data.length - 1];
  return (
    <figure className="chart">
      <figcaption>
        <h3>Planning KPIs by month</h3>
        <Legend shape="line" items={TREND_SERIES.map((s) => ({ label: last ? `${s.label} · ${last[s.key]}%` : s.label, color: s.color }))} />
      </figcaption>
      <div className="plot">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            {grid}
            <XAxis dataKey="month" tickFormatter={(m) => monthLabel(m)} {...axis} />
            <YAxis domain={[40, 100]} unit="%" {...axis} axisLine={false} />
            <Tooltip content={<ChartTooltip unit="%" labelFormat={(m) => monthLabel(m, 'long')} />} cursor={{ stroke: INK.axis, strokeWidth: 1 }} />
            {TREND_SERIES.map((s) => (
              <Line key={s.key} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function WorkMixChart({ data }: { data: MonthPoint[] }) {
  const top = WORK_TYPE_STACK[WORK_TYPE_STACK.length - 1];
  return (
    <figure className="chart">
      <figcaption>
        <h3>Labor hours by work type</h3>
        <Legend shape="rect" items={WORK_TYPE_STACK.slice().reverse().map((t) => ({ label: WORK_TYPE_LABEL[t], color: WORK_TYPE_COLOR[t] }))} />
      </figcaption>
      <div className="plot">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -6 }} barCategoryGap="28%">
            {grid}
            <XAxis dataKey="month" tickFormatter={(m) => monthLabel(m)} {...axis} />
            <YAxis {...axis} axisLine={false} unit=" h" width={58} />
            <Tooltip content={<ChartTooltip unit=" h" labelFormat={(m) => monthLabel(m, 'long')} />} cursor={{ fill: 'rgba(15,26,42,.04)' }} />
            {WORK_TYPE_STACK.map((t) => (
              <Bar key={t} dataKey={t} name={WORK_TYPE_LABEL[t]} stackId="mix" fill={WORK_TYPE_COLOR[t]} stroke="#fff" strokeWidth={2} radius={t === top ? [4, 4, 0, 0] : 0} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function LineBars({ data, metric, title, unit, note }: { data: LineStats[]; metric: 'mtbf' | 'mttr'; title: string; unit: string; note: string }) {
  return (
    <figure className="chart">
      <figcaption>
        <h3>{title}</h3>
        <span className="cap-note">{note}</span>
      </figcaption>
      <div className="plot">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: -18 }} barCategoryGap="34%">
            {grid}
            <XAxis dataKey="line" {...axis} />
            <YAxis {...axis} axisLine={false} domain={[0, (max: number) => (metric === "mttr" ? Math.ceil(max * 1.2 * 2) / 2 : Math.ceil((max * 1.15) / 10) * 10)]} allowDecimals={metric === 'mttr'} />
            <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'rgba(15,26,42,.04)' }} />
            <Bar dataKey={metric} name={title} fill={SERIES.blue} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey={metric} position="top" fill={INK.secondary} fontSize={12} formatter={(v: number) => String(v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function ParetoChart({ data }: { data: BadActor[] }) {
  const rows = data.slice(0, 8).map((a) => ({ ...a, name: `${a.line} ${a.asset}` }));
  return (
    <figure className="chart">
      <figcaption>
        <h3>Bad actors — breakdown downtime</h3>
        <span className="cap-note">Running share of all breakdown downtime shown at the end of each bar</span>
      </figcaption>
      <div className="plot">
        <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 34 + 20)}>
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 64, bottom: 0, left: 8 }} barCategoryGap="22%">
            <CartesianGrid stroke={INK.grid} horizontal={false} />
            <XAxis type="number" {...axis} unit=" h" />
            <YAxis type="category" dataKey="name" {...axis} width={150} axisLine={false} />
            <Tooltip content={<ChartTooltip unit=" h" />} cursor={{ fill: 'rgba(15,26,42,.04)' }} />
            <Bar dataKey="downtimeHours" name="Downtime" fill={SERIES.orange} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="cumulativePct" position="right" fill={INK.secondary} fontSize={12} formatter={(v: number) => `${v}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
