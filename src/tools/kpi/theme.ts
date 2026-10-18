/**
 * Chart colors. Categorical slots follow a fixed, validated order
 * (colorblind-safe for adjacent series); status colors are reserved for
 * good/warning/critical and always ship with an icon and a label.
 */
import type { WorkType } from './types';

export const SERIES = { blue: '#2a78d6', orange: '#eb6834', aqua: '#1baf7a', yellow: '#eda100' } as const;

export const WORK_TYPE_COLOR: Record<WorkType, string> = { PM: SERIES.blue, PRJ: SERIES.yellow, CM: SERIES.aqua, BD: SERIES.orange };
/** Stack order bottom → top. This adjacency passes the CVD and normal-vision checks. */
export const WORK_TYPE_STACK: WorkType[] = ['PM', 'PRJ', 'CM', 'BD'];

export const STATUS = { good: '#0ca30c', warning: '#fab219', critical: '#d03b3b' } as const;

export const INK = { primary: '#0f1a2a', secondary: '#475467', muted: '#8a94a6', grid: '#e9ebef', axis: '#c9ced6' } as const;
