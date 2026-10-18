/**
 * Plan check: reviews a job plan against the plant's job plan standard and
 * flags problems a reviewer would catch — missing lockout, placeholder text,
 * parts used in steps but missing from the parts list, bad "repeat steps"
 * references, and so on. Pure function so it is easy to unit test.
 */
import type { Issue, JobPlan } from './types';

const PLACEHOLDER = /\b(TBD|TBA|XXX+|\?\?\?+|N\/A\?|fill in)\b|\[[^\]]*\]|<[^>]+>/i;
const PART_REF = /#([A-Z0-9][A-Z0-9-]{2,})/gi;

export function partRefs(text: string): string[] {
  return [...text.matchAll(PART_REF)].map((m) => (m[1] ?? '').toUpperCase()).filter((p) => /\d/.test(p));
}

const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

export function checkPlan(plan: JobPlan): Issue[] {
  const issues: Issue[] = [];
  const add = (id: string, severity: Issue['severity'], message: string, step?: number) => issues.push({ id, severity, message, step });
  const steps = plan.steps;
  const all = steps.map((s) => s.text).join('\n');

  if (!plan.title.trim()) add('title', 'warn', 'Add a task title so the plan can be found in the CMMS.');
  if (steps.length === 0) {
    add('no-steps', 'error', 'The plan has no steps yet.');
    return issues;
  }
  if (steps.length < 6) add('few-steps', 'info', `Only ${steps.length} steps — most corrective jobs need 12 or more to cover safety, the work, and checks.`);

  // Safety sequence
  if (!/\bnotify|permission\b/i.test(steps[0]?.text ?? '')) {
    add('notify-first', 'warn', 'Step 1 should notify the area operator and get permission to take the equipment down.', 0);
  }
  const lotoIndex = steps.findIndex((s) => /\b(lock ?out|LOTO)\b/i.test(s.text));
  if (lotoIndex === -1) {
    add('no-loto', 'error', 'No lockout step. Add energy isolation per the LOTO procedure before any hands-on work.');
  } else {
    const loto = steps[lotoIndex]!;
    if (!/(zero energy|verify|0 psi|try(ing)? to start)/i.test(loto.text)) {
      add('loto-verify', 'error', 'The lockout step does not verify zero energy (try-start, 0 psi, etc.).', lotoIndex);
    }
    if (!loto.key) add('loto-key', 'warn', 'Mark the lockout step as a key step so it prints bold.', lotoIndex);
    if (lotoIndex > 2) add('loto-late', 'warn', `Lockout is step ${lotoIndex + 1}. It should come right after notifying the operator.`, lotoIndex);
  }
  const usesAir = /\b(air|pneumatic|hydraulic|hoses?)\b/i.test(all + plan.title + plan.summary);
  if (usesAir && !/\bleak/i.test(all)) add('leak-check', 'warn', 'The job touches air or hydraulic lines but has no leak check after restoring pressure.');
  if (!/tool count|tools?.{0,40}(removed|accounted)/i.test(all)) add('tool-count', 'info', 'Add a step to remove tools and confirm the tool count before startup.');
  if (!/(cycle|operational|test run|run the)/i.test(all)) add('cycle-check', 'warn', 'No operational or cycle check before returning the equipment to production.');
  const last = steps[steps.length - 1]!;
  if (!/close (out|the work order)|production ready/i.test(last.text)) {
    add('close-out', 'warn', 'The last step should hand the equipment back and close out the work order.', steps.length - 1);
  }

  // Step quality
  const keyCount = steps.filter((s) => s.key).length;
  if (keyCount / steps.length > 0.4) add('too-many-key', 'info', `${keyCount} of ${steps.length} steps are key steps. Save bold for safety-critical steps so they stand out.`);
  steps.forEach((s, i) => {
    if (!s.text.trim()) add(`empty-${s.id}`, 'error', `Step ${i + 1} is empty.`, i);
    else if (PLACEHOLDER.test(s.text)) add(`ph-${s.id}`, 'error', `Step ${i + 1} contains placeholder text.`, i);
    else if (words(s.text) > 60) add(`long-${s.id}`, 'info', `Step ${i + 1} is ${words(s.text)} words. Consider splitting it so each step is one action.`, i);

    const rep = s.text.match(/repeat steps?\s+(\d+)\s*[–-]\s*(\d+)/i);
    if (rep) {
      const from = Number(rep[1]);
      const to = Number(rep[2]);
      if (from > to || to >= i + 1 || from < 1) {
        add(`rep-${s.id}`, 'error', `Step ${i + 1} repeats steps ${from}–${to}, which doesn't point at earlier steps.`, i);
      }
    }
  });

  // Parts cross-check
  const listed = new Set(plan.parts.map((p) => p.stores.trim().toUpperCase()).filter(Boolean));
  const referenced = new Set(partRefs(all));
  for (const pn of referenced) if (!listed.has(pn)) add(`unlisted-${pn}`, 'warn', `Part #${pn} is used in the steps but is not in the parts list.`);
  for (const pn of listed) if (!referenced.has(pn)) add(`unused-${pn}`, 'info', `Part #${pn} is in the parts list but no step says where it goes.`);
  plan.parts.forEach((p, i) => {
    if ((p.stores || p.description) && !p.qty.trim()) add(`qty-${p.id}`, 'warn', `Part row ${i + 1} has no quantity.`);
  });

  for (const f of ['title', 'summary', 'ppe', 'procedures'] as const) {
    if (PLACEHOLDER.test(plan[f])) add(`ph-${f}`, 'error', `The ${f} field contains placeholder text.`);
  }
  return issues;
}

/** 0–100 readiness score: errors cost 20, warnings 8, notes 2. */
export function planScore(issues: Issue[]): number {
  const cost = issues.reduce((sum, i) => sum + (i.severity === 'error' ? 20 : i.severity === 'warn' ? 8 : 2), 0);
  return Math.max(0, 100 - cost);
}
