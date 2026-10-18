import { describe, expect, it } from 'vitest';
import { checkPlan, partRefs, planScore } from './lint';
import { blankPart, emptyPlan, examplePlan, makeStep } from './plan';

const ids = (plan: ReturnType<typeof emptyPlan>) => checkPlan(plan).map((i) => i.id);

describe('checkPlan', () => {
  it('passes the built-in example with no errors or warnings', () => {
    const issues = checkPlan(examplePlan()).filter((i) => i.severity !== 'info');
    expect(issues).toEqual([]);
  });

  it('flags an empty plan', () => {
    expect(ids(emptyPlan())).toContain('no-steps');
  });

  it('requires a lockout that verifies zero energy', () => {
    const plan = { ...emptyPlan(), title: 'X', steps: [makeStep('Notify the operator.'), makeStep('Remove the guard.')] };
    expect(ids(plan)).toContain('no-loto');
    plan.steps.splice(1, 0, makeStep('LOCKOUT: lock out the machine.', true));
    expect(ids(plan)).toContain('loto-verify');
  });

  it('catches placeholders and broken repeat references', () => {
    const plan = examplePlan();
    plan.steps[3] = makeStep('Torque bolts to TBD ft-lb.');
    plan.steps[10] = makeStep('Repeat steps 5–14 for the rest.');
    const found = checkPlan(plan);
    expect(found.find((i) => i.message.includes('placeholder'))?.step).toBe(3);
    expect(found.find((i) => i.message.includes('repeats steps'))?.step).toBe(10);
  });

  it('cross-checks parts between steps and the parts list', () => {
    const plan = examplePlan();
    plan.parts = [blankPart({ stores: 'AC-1625', qty: '4' }), blankPart({ stores: 'ZZ-9999', qty: '1' })];
    const list = ids(plan);
    expect(list).toContain('unlisted-NW-0750');
    expect(list).toContain('unused-ZZ-9999');
  });

  it('wants a leak check when air lines are involved', () => {
    const plan = examplePlan();
    plan.steps = plan.steps.filter((s) => !s.text.startsWith('LEAK CHECK'));
    expect(ids(plan)).toContain('leak-check');
  });
});

describe('helpers', () => {
  it('finds part references', () => {
    expect(partRefs('Install #ab-12 and #CD-345, not #x')).toEqual(['AB-12', 'CD-345']);
  });
  it('scores issues', () => {
    expect(planScore([])).toBe(100);
    expect(planScore([{ id: 'a', severity: 'error', message: '' }, { id: 'b', severity: 'warn', message: '' }])).toBe(72);
  });
});
