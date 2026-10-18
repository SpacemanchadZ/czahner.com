import { describe, expect, it } from 'vitest';
import { moveItem, planReducer } from './reducer';
import { examplePlan } from './plan';
import { parsePlan, toFile } from './storage';

describe('planReducer', () => {
  it('adds a step after a given step', () => {
    const plan = examplePlan();
    const next = planReducer(plan, { type: 'addStep', afterId: plan.steps[0]!.id });
    expect(next.steps).toHaveLength(plan.steps.length + 1);
    expect(next.steps[1]!.text).toBe('');
    expect(plan.steps).toHaveLength(16); // original untouched
  });

  it('moves, edits and removes steps', () => {
    let plan = examplePlan();
    const first = plan.steps[0]!.id;
    plan = planReducer(plan, { type: 'moveStep', from: 0, to: 2 });
    expect(plan.steps[2]!.id).toBe(first);
    plan = planReducer(plan, { type: 'updateStep', id: first, patch: { key: false, text: 'Edited' } });
    expect(plan.steps[2]).toMatchObject({ key: false, text: 'Edited' });
    plan = planReducer(plan, { type: 'removeStep', id: first });
    expect(plan.steps.some((s) => s.id === first)).toBe(false);
  });

  it('detaches an image from every step that uses it', () => {
    let plan = examplePlan();
    plan = planReducer(plan, { type: 'updateStep', id: plan.steps[4]!.id, patch: { imageId: 'img1' } });
    plan = planReducer(plan, { type: 'detachImage', imageId: 'img1' });
    expect(plan.steps.every((s) => s.imageId === null)).toBe(true);
  });

  it('ignores out-of-range moves', () => {
    const list = [1, 2, 3];
    expect(moveItem(list, 0, 5)).toBe(list);
    expect(moveItem(list, 2, 0)).toEqual([3, 1, 2]);
  });
});

describe('storage', () => {
  it('round-trips a plan through the JSON file format', () => {
    const plan = examplePlan();
    const back = parsePlan(JSON.parse(toFile(plan)));
    expect(back.title).toBe(plan.title);
    expect(back.steps.map((s) => s.text)).toEqual(plan.steps.map((s) => s.text));
    expect(back.parts.map((p) => p.stores)).toEqual(['AC-1625', 'NW-0750']);
  });

  it('rejects files that are not plans and cleans up numbered steps', () => {
    expect(() => parsePlan({ hello: 'world' })).toThrow('not a job plan');
    const plan = parsePlan({ title: 7, steps: [{ text: '1. Do it', key: 'yes' }] });
    expect(plan.title).toBe('7');
    expect(plan.steps[0]).toMatchObject({ text: 'Do it', key: true, imageId: null });
  });
});
