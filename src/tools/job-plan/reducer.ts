import { blankPart, makeStep } from './plan';
import type { JobPlan, Part, Step, TextField } from './types';

export type PlanAction =
  | { type: 'replace'; plan: JobPlan }
  | { type: 'setField'; field: TextField; value: string }
  | { type: 'addPart' }
  | { type: 'updatePart'; id: string; patch: Partial<Omit<Part, 'id'>> }
  | { type: 'removePart'; id: string }
  | { type: 'addStep'; afterId?: string }
  | { type: 'updateStep'; id: string; patch: Partial<Omit<Step, 'id'>> }
  | { type: 'removeStep'; id: string }
  | { type: 'moveStep'; from: number; to: number }
  | { type: 'detachImage'; imageId: string };

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

/** All plan edits go through here, so the editor is predictable and testable. */
export function planReducer(plan: JobPlan, action: PlanAction): JobPlan {
  switch (action.type) {
    case 'replace':
      return action.plan;
    case 'setField':
      return { ...plan, [action.field]: action.value };
    case 'addPart':
      return { ...plan, parts: [...plan.parts, blankPart()] };
    case 'updatePart':
      return { ...plan, parts: plan.parts.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };
    case 'removePart':
      return { ...plan, parts: plan.parts.filter((p) => p.id !== action.id) };
    case 'addStep': {
      const at = action.afterId ? plan.steps.findIndex((s) => s.id === action.afterId) + 1 : plan.steps.length;
      const steps = plan.steps.slice();
      steps.splice(at, 0, makeStep());
      return { ...plan, steps };
    }
    case 'updateStep':
      return { ...plan, steps: plan.steps.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)) };
    case 'removeStep':
      return { ...plan, steps: plan.steps.filter((s) => s.id !== action.id) };
    case 'moveStep':
      return { ...plan, steps: moveItem(plan.steps, action.from, action.to) };
    case 'detachImage':
      return { ...plan, steps: plan.steps.map((s) => (s.imageId === action.imageId ? { ...s, imageId: null } : s)) };
  }
}
