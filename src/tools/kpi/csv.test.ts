import { describe, expect, it } from 'vitest';
import { mapColumns, parseDate, parseType, parseWorkOrders, toCsv } from './csv';
import { generateSample } from './sampleData';

describe('CSV import', () => {
  it('matches common CMMS header names', () => {
    const cols = mapColumns(['WO #', 'Date Completed', 'Department', 'Equipment', 'Work_Type', 'Actual Hours']);
    expect(cols).toMatchObject({ id: 'WO #', date: 'Date Completed', line: 'Department', asset: 'Equipment', type: 'Work_Type', laborHours: 'Actual Hours' });
  });

  it('normalizes work types and dates', () => {
    expect(['Preventive', 'Emergency', 'Corrective', 'Capital Project', 'Misc'].map(parseType)).toEqual(['PM', 'BD', 'CM', 'PRJ', null]);
    expect(parseDate('5/7/26')).toBe('2026-05-07');
    expect(parseDate('2026-5-7')).toBe('2026-05-07');
    expect(parseDate('nope')).toBeNull();
  });

  it('parses rows, defaults optional fields and reports skipped rows', () => {
    const csv = 'Work Order,Date,Line,Asset,Type,Labor Hours,Status\n1,2026-05-01,L1,Press,PM,2,Closed\n2,bad date,L1,Press,PM,1,Closed\n3,2026-05-02,L2,,Breakdown,3.5,Open';
    const res = parseWorkOrders(csv);
    expect(res.skipped).toBe(1);
    expect(res.rows).toHaveLength(2);
    expect(res.rows[1]).toMatchObject({ type: 'BD', asset: 'Unspecified', laborHours: 3.5, status: 'Open', scheduled: false });
  });

  it('refuses files without the required columns', () => {
    const res = parseWorkOrders('Name,Value\na,1');
    expect(res.missing).toEqual(['date', 'type', 'line']);
    expect(res.rows).toEqual([]);
  });

  it('round-trips the sample data through CSV', () => {
    const rows = generateSample().slice(0, 200);
    const back = parseWorkOrders(toCsv(rows));
    expect(back.skipped).toBe(0);
    expect(back.rows).toEqual(rows);
  });
});
