/**
 * Saving and loading plans: autosave of the current draft, a small library of
 * named plans in this browser, and JSON files for sharing between computers.
 * Browser storage can be unavailable (private mode, blocked cookies), so every
 * access is wrapped and failures fall back quietly.
 */
import { uid } from '../../lib/id';
import { emptyPlan } from './plan';
import { TEXT_FIELDS, type JobPlan } from './types';

const DRAFT_KEY = 'czahner.jobplan.draft.v1';
const LIBRARY_KEY = 'czahner.jobplan.library.v1';
export const FILE_FORMAT = 'czahner-job-plan';

export interface SavedPlan {
  id: string;
  name: string;
  savedAt: string;
  plan: JobPlan;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

/**
 * Turns anything (a saved draft, an imported file) into a valid JobPlan.
 * Unknown keys are dropped, missing ones filled in, ids regenerated.
 * Throws if the input is not plan-shaped at all.
 */
export function parsePlan(input: unknown): JobPlan {
  const obj = (input && typeof input === 'object' && 'plan' in input ? (input as { plan: unknown }).plan : input) as Record<string, unknown> | null;
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.steps)) {
    throw new Error('This file is not a job plan.');
  }
  const plan = emptyPlan();
  for (const f of TEXT_FIELDS) if (f in obj) plan[f] = str(obj[f]);
  plan.parts = (Array.isArray(obj.parts) ? obj.parts : []).map((p: Record<string, unknown>) => ({
    id: uid('part'),
    stores: str(p?.stores),
    description: str(p?.description),
    qty: str(p?.qty),
    remarks: str(p?.remarks),
  }));
  plan.steps = (obj.steps as Record<string, unknown>[]).map((s) => ({
    id: uid('step'),
    text: str(s?.text).replace(/^\s*\d+\.\s*/, ''),
    key: Boolean(s?.key),
    imageId: null, // attachments are not stored with the plan
  }));
  return plan;
}

export function toFile(plan: JobPlan): string {
  const { parts, steps, ...fields } = plan;
  return JSON.stringify(
    {
      format: FILE_FORMAT,
      version: 1,
      exportedAt: new Date().toISOString(),
      plan: { ...fields, parts: parts.map(({ id: _id, ...p }) => p), steps: steps.map(({ text, key }) => ({ text, key })) },
    },
    null,
    2,
  );
}

export const loadDraft = (): JobPlan | null => {
  const raw = read<unknown>(DRAFT_KEY);
  if (!raw) return null;
  try {
    return parsePlan(raw);
  } catch {
    return null;
  }
};
export const saveDraft = (plan: JobPlan) => write(DRAFT_KEY, plan);

export const listSaved = (): SavedPlan[] => read<SavedPlan[]>(LIBRARY_KEY) ?? [];

export function savePlan(plan: JobPlan, name: string): SavedPlan[] {
  const list = listSaved().filter((p) => p.name !== name);
  const entry: SavedPlan = { id: uid('saved'), name, savedAt: new Date().toISOString(), plan };
  const next = [entry, ...list].slice(0, 25);
  write(LIBRARY_KEY, next);
  return next;
}

export function deleteSaved(id: string): SavedPlan[] {
  const next = listSaved().filter((p) => p.id !== id);
  write(LIBRARY_KEY, next);
  return next;
}
