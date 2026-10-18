import { describe, expect, it } from 'vitest';
import { detectAction, detectEnergy, detectObject, detectPartNumbers, detectTarget, estimateHours, generateDraft, parseCrew } from './generator';
import { checkPlan } from './lint';

const input = (description: string, extra: Partial<Parameters<typeof generateDraft>[0]> = {}) => ({
  description, workCenter: '', crew: '', notes: '', originator: 'Test', attachmentIds: [], ...extra,
});

describe('detection', () => {
  it('always isolates electrical and adds energy sources mentioned in the text', () => {
    expect(detectEnergy('Replace the hydraulic hose on the lift table')).toEqual(['electrical', 'hydraulic', 'gravity']);
    expect(detectEnergy('Swap the 4 air cylinders')).toEqual(['electrical', 'pneumatic']);
    expect(detectEnergy('Tighten the drive chain')).toContain('tension');
  });

  it('finds the main action', () => {
    expect(detectAction('Replace the bearing')).toBe('replace');
    expect(detectAction('Grease the idler')).toBe('lubricate');
    expect(detectAction('Align the motor coupling')).toBe('adjust');
    expect(detectAction('Something is wrong with it')).toBe('repair');
  });

  it('extracts part numbers in common formats', () => {
    expect(detectPartNumbers('Use #ac-1625 and P/N 88231, part number BRG-6205')).toEqual(['AC-1625', '88231', 'BRG-6205']);
    expect(detectPartNumbers('#line2 is not a part')).toEqual(['LINE2']);
    expect(detectPartNumbers('no parts here')).toEqual([]);
  });

  it('reads quantity and item from the description', () => {
    expect(detectTarget('Replace the 4 air cylinders on the infeed')).toEqual({ qty: 4, noun: 'air cylinders' });
    expect(detectTarget('Change both drive belts')).toEqual({ qty: 2, noun: 'drive belts' });
    expect(detectTarget('Fix it')).toBeNull();
  });

  it('finds the item when no count is given', () => {
    expect(detectObject('Replace the drive chain on the quench idler')).toBe('drive chain');
    expect(detectObject('Grease the main bearing, part #B-100')).toBe('main bearing');
    expect(detectObject('Do something')).toBeNull();
  });

  it('parses crew size', () => {
    expect(parseCrew('3 techs')).toBe(3);
    expect(parseCrew('two technicians')).toBe(2);
    expect(parseCrew('')).toBe(2);
  });

  it('scales the time estimate with job size', () => {
    expect(estimateHours('replace', 4, ['electrical', 'pneumatic'])).toBeGreaterThan(estimateHours('replace', 1, ['electrical']));
    expect(estimateHours('inspect', 1, ['electrical']) % 0.25).toBe(0);
  });
});

describe('generateDraft', () => {
  const plan = generateDraft(
    input('Replace the 4 air cylinders on the infeed conveyor with #AC-1625. Check the brackets for cracks.', {
      workCenter: 'Line 2 Infeed', crew: '2 techs', notes: 'Fittings must face the drive side',
    }),
  );
  const texts = plan.steps.map((s) => s.text);

  it('follows the standard sequence', () => {
    expect(texts[0]).toMatch(/^Notify/);
    expect(texts[1]).toMatch(/^LOCKOUT/);
    expect(texts[1]).toMatch(/0 psi/);
    expect(texts.at(-1)).toMatch(/close out the work order/);
    expect(plan.steps[0]!.key && plan.steps[1]!.key && plan.steps.at(-1)!.key).toBe(true);
  });

  it('labels lines, leak-checks air, and repeats steps for identical parts', () => {
    expect(texts.some((t) => t.startsWith('LABEL BEFORE YOU DISCONNECT'))).toBe(true);
    expect(texts.some((t) => t.startsWith('LEAK CHECK'))).toBe(true);
    const repeat = texts.find((t) => t.startsWith('Repeat steps'));
    expect(repeat).toMatch(/remaining three air cylinders/);
  });

  it('carries details into the header fields and parts list', () => {
    expect(plan.workCenter).toBe('Line 2 Infeed');
    expect(plan.laborHours).toMatch(/^2 Techs x /);
    expect(plan.parts).toHaveLength(1);
    expect(plan.parts[0]).toMatchObject({ stores: 'AC-1625', qty: '4' });
    expect(texts.some((t) => t.startsWith('CAUTION: Fittings must face'))).toBe(true);
    expect(texts.some((t) => t.startsWith('Check the brackets'))).toBe(true);
  });

  it('produces a plan that passes its own plan check with no errors', () => {
    const errors = checkPlan(plan).filter((i) => i.severity === 'error');
    expect(errors).toEqual([]);
  });

  it('writes a valid repeat range', () => {
    const idx = texts.findIndex((t) => t.startsWith('Repeat steps'));
    const [, from, to] = texts[idx]!.match(/(\d+)–(\d+)/)!.map(Number);
    expect(from).toBeGreaterThan(2);
    expect(to).toBeLessThan(idx + 1);
  });
});
