import { describe, expect, it } from 'vitest';
import { Packer } from 'docx';
import { buildJobPlanDoc, fileName, fit } from './docx';
import { examplePlan } from './plan';

describe('Word export', () => {
  it('builds a valid .docx containing the plan text', async () => {
    const plan = examplePlan();
    const buf = await Packer.toBuffer(buildJobPlanDoc(plan, [], new Date('2026-01-15')));
    expect(buf.subarray(0, 2).toString()).toBe('PK'); // .docx is a zip
    const xml = buf.toString('latin1');
    expect(buf.length).toBeGreaterThan(5000);
    expect(xml).toContain('word/document.xml');
  });

  it('scales images to fit without distortion', () => {
    expect(fit(1000, 500, 300, 300)).toEqual({ width: 300, height: 150 });
    expect(fit(100, 50, 300, 300)).toEqual({ width: 100, height: 50 });
  });

  it('makes a safe file name', () => {
    expect(fileName({ ...examplePlan(), title: 'Infeed / Air Cylinder: Swap!' })).toBe('infeed-air-cylinder-swap.docx');
    expect(fileName({ ...examplePlan(), title: '' })).toBe('job-plan.docx');
  });
});
