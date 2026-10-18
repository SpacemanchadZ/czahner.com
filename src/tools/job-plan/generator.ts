/**
 * Rule-based job plan drafting.
 *
 * Reads a planner's plain-English description ("Replace the 4 air cylinders on
 * the Line 2 infeed conveyor, part #AC-1625") and produces a complete draft that
 * follows the plant's job plan standard: notify → lockout → stage → task steps →
 * inspect → restore → checks → close out. No network or AI needed, so it runs
 * anywhere and gives the same answer every time.
 */
import { blankPart, emptyPlan, makeStep } from './plan';
import type { DraftInput, JobPlan, Part, Step } from './types';

export type Energy = 'electrical' | 'pneumatic' | 'hydraulic' | 'gravity' | 'tension' | 'thermal';
export type Action = 'replace' | 'repair' | 'inspect' | 'adjust' | 'clean' | 'lubricate' | 'install' | 'remove';

const ENERGY_PATTERNS: Record<Exclude<Energy, 'electrical'>, RegExp> = {
  pneumatic: /\b(air|pneumatic|cylinders?|solenoid|valves?|psi|regulator|vacuum)\b/i,
  hydraulic: /\b(hydraulic|hoses?|pumps?|rams?|accumulator|oil pressure)\b/i,
  gravity: /\b(lift|raised|elevat\w*|overhead|counterweight|platen|hoist|tilt\w*|gantry)\b/i,
  tension: /\b(chains?|belts?|springs?|tension\w*|sprockets?)\b/i,
  thermal: /\b(furnace|oven|heaters?|quench|steam|hot|kiln|burner)\b/i,
};

const ACTION_PATTERNS: [Action, RegExp][] = [
  ['replace', /\b(replac\w*|swap\w*|change out|changeout|chang\w* the)\b/i],
  ['install', /\b(install\w*|add|mount\w*)\b/i],
  ['remove', /\b(remov\w*|pull out)\b/i],
  ['repair', /\b(repair\w*|fix\w*|rebuild\w*|weld\w*)\b/i],
  ['adjust', /\b(adjust\w*|align\w*|calibrat\w*|tension the|set the)\b/i],
  ['lubricate', /\b(lubricat\w*|grease|oil the)\b/i],
  ['clean', /\b(clean\w*|wash\w*|flush\w*)\b/i],
  ['inspect', /\b(inspect\w*|check\w*|test\w*|verify)\b/i],
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, pair: 2, both: 2,
};
const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** Energy sources implied by the job text. Electrical is always isolated. */
export function detectEnergy(text: string): Energy[] {
  const found: Energy[] = ['electrical'];
  for (const [energy, re] of Object.entries(ENERGY_PATTERNS) as [Energy, RegExp][]) {
    if (re.test(text)) found.push(energy);
  }
  return found;
}

/** Main verb of the job — decides which task steps get written. */
export function detectAction(text: string): Action {
  for (const [action, re] of ACTION_PATTERNS) if (re.test(text)) return action;
  return 'repair';
}

/** Part numbers written as "#AC-1625", "part AC-1625" or "P/N 12345". */
export function detectPartNumbers(text: string): string[] {
  const out = new Set<string>();
  const re = /(?:#|\bp\/n[:\s]*|\bpart(?:\s*(?:no\.?|number|#))?[:\s]+)([A-Z0-9][A-Z0-9-]{2,})/gi;
  for (const m of text.matchAll(re)) {
    const pn = m[1];
    if (pn && /\d/.test(pn)) out.add(pn.toUpperCase());
  }
  return [...out];
}

export interface Target {
  qty: number;
  /** Plural noun as written, e.g. "air cylinders". */
  noun: string;
}

/**
 * What is being worked on and how many: "the 4 air cylinders" → {qty: 4, noun: "air cylinders"}.
 * Looks for a count word or number followed by up to three words.
 */
export function detectTarget(text: string): Target | null {
  const re = /\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|twelve|both|pair of)\s+((?:[a-z][a-z-]*\s+){0,2}[a-z][a-z-]*?s)\b/i;
  const m = text.match(re);
  if (!m || !m[1] || !m[2]) return null;
  const raw = m[1].toLowerCase().replace(' of', '');
  const qty = /^\d+$/.test(raw) ? Number(raw) : (NUMBER_WORDS[raw] ?? 1);
  const noun = m[2].toLowerCase().replace(/^(new|old|the)\s+/, '');
  return qty > 0 ? { qty, noun } : null;
}

/** The thing being worked on when no count is given: "Replace the drive chain on…" → "drive chain". */
export function detectObject(text: string): string | null {
  const m = text.match(
    /\b(?:replac\w*|swap\w*|install\w*|remov\w*|repair\w*|fix\w*|rebuild\w*|adjust\w*|align\w*|lubricat\w*|grease|clean\w*|inspect\w*|check\w*)\s+(?:the\s+|a\s+|an\s+|all\s+)?((?:[a-z][a-z-]*\s*){1,4}?)(?=\s+(?:on|in|at|for|with|from|of|to|and|using|per)\b|[,.#(]|$)/i,
  );
  const obj = m?.[1]?.trim().toLowerCase();
  return obj && obj.length > 2 ? obj : null;
}

export function needsLabeling(text: string): boolean {
  return /\b(air lines?|lines|hoses?|wires?|wiring|cables?|tubing|fittings?|connectors?|leads)\b/i.test(text);
}

const singular = (noun: string) => noun.replace(/ies$/, 'y').replace(/(ss|sh|ch|x)es$/, '$1').replace(/s$/, '');
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "2 techs", "two technicians", "3" → 2 / 2 / 3. Defaults to 2. */
export function parseCrew(crew: string): number {
  const m = crew.match(/\d+/);
  if (m) return Math.max(1, Number(m[0]));
  const word = crew.toLowerCase().match(/\b(one|two|three|four|five|six)\b/);
  return word?.[1] ? (NUMBER_WORDS[word[1]] ?? 2) : 2;
}

/** Elapsed hours from the job size, rounded to the nearest quarter hour. */
export function estimateHours(action: Action, qty: number, energies: Energy[]): number {
  const base: Record<Action, number> = { replace: 1, install: 1, remove: 0.75, repair: 1.5, adjust: 0.75, lubricate: 0.5, clean: 0.75, inspect: 0.5 };
  const perItem: Record<Action, number> = { replace: 0.4, install: 0.4, remove: 0.25, repair: 0.5, adjust: 0.2, lubricate: 0.1, clean: 0.15, inspect: 0.1 };
  const isolation = 0.15 * (energies.length - 1);
  const hours = base[action] + perItem[action] * Math.max(0, qty - 1) + isolation + 0.5; // +0.5 for LOTO, checks, close-out
  return Math.round(hours * 4) / 4;
}

export const formatHours = (h: number) => (h < 1 ? `${Math.round(h * 60)} min` : `${Number(h.toFixed(2))} hr`);

function lockoutStep(equip: string, energies: Energy[]): string {
  const parts: string[] = [];
  if (energies.includes('electrical')) parts.push('open and lock the electrical disconnect');
  if (energies.includes('pneumatic')) parts.push('close and lock the main air supply, then bleed the air down and verify 0 psi on the gauge');
  if (energies.includes('hydraulic')) parts.push('shut off the hydraulic unit and relieve system pressure — verify 0 psi before opening any line');
  if (energies.includes('gravity')) parts.push('lower raised parts or block and pin them so they cannot drop');
  if (energies.includes('tension')) parts.push('release chain, belt, or spring tension before working near drives');
  if (energies.includes('thermal')) parts.push('let hot surfaces cool, or verify they are safe to touch');
  const names = energies.filter((e) => e !== 'gravity' && e !== 'tension').map((e) => (e === 'pneumatic' ? 'AIR' : e.toUpperCase()));
  return `LOCKOUT (10 min): Lock out ${equip} per the LOTO procedure posted at the machine. Isolate ${names.join(' and ')}: ${parts.join('; ')}. Try to start the equipment to verify zero energy.`;
}

function ppeFor(energies: Energy[]): string {
  const extra = ['personal lock and tag'];
  if (energies.includes('hydraulic')) extra.unshift('face shield when opening hydraulic lines');
  if (energies.includes('thermal')) extra.unshift('heat-resistant gloves');
  if (energies.includes('gravity')) extra.unshift('hard hat');
  if (energies.includes('pneumatic')) extra.unshift('hearing protection');
  return `Standard PPE (safety glasses, gloves, steel-toe boots); ${extra.join('; ')}`;
}

/**
 * Core task steps for the main action. Returns the steps plus the 0-based
 * range that repeats for each additional item, if any.
 */
function taskSteps(action: Action, item: string, several: boolean, partRef: string, label: boolean): { steps: string[]; repeat?: [number, number] } {
  const which = several ? `first ${item}` : item;
  const disconnect = label ? [`Disconnect the lines from the ${which} at their labeled ports. Cap or plug open ports to keep dirt out.`] : [];
  const reconnect = label ? ['Reconnect every line to its labeled port and tug-test each connection.'] : [];
  switch (action) {
    case 'replace':
    case 'remove':
    case 'install': {
      const steps = [
        ...(action !== 'install' ? disconnect : []),
        ...(action !== 'install'
          ? [`Remove the mounting hardware and take out the ${several && !label ? `first ${item}` : `old ${item}`}. Note its orientation and keep the hardware.`]
          : [`Locate the mounting position for the ${which} and check it against the drawing.`]),
        `Inspect the mounting surface and mating parts for wear, cracks, or damage. Clean the surface.`,
        ...(action !== 'remove'
          ? [`Install the new ${item}${partRef} in the same orientation. Tighten the hardware to spec and apply threadlocker where used.`]
          : []),
        ...(action !== 'remove' ? reconnect : []),
      ];
      return { steps, repeat: [0, steps.length - 1] };
    }
    case 'adjust':
      return { steps: [`Measure the current setting of the ${item} and record it on the work order.`, `Adjust the ${item} to spec, then lock the adjustment in place.`, 'Re-measure to confirm the setting held.'] };
    case 'lubricate':
      return { steps: [`Clean each grease point on the ${item} before applying lubricant.`, `Apply the specified lubricant to the ${item}. Wipe off excess.`] };
    case 'clean':
      return { steps: [`Remove debris and buildup from the ${item}. Do not use compressed air on electrical components.`, `Inspect the ${item} for wear or damage while it is clean.`] };
    case 'inspect':
      return { steps: [`Inspect the ${item} for wear, cracks, leaks, loose hardware, and unusual noise or heat. Record findings on the work order.`, 'Write a follow-up work order for any defect that cannot be corrected now.'] };
    case 'repair':
    default:
      return { steps: [...disconnect, `Disassemble the ${item} as far as needed to reach the failed component. Lay parts out in order.`, `Repair or replace the failed component${partRef}. Inspect mating parts while the assembly is apart.`, `Reassemble the ${item} and tighten hardware to spec.`, ...reconnect] };
  }
}

/** Splits the planner's description into sentences that aren't already covered by generated steps. */
function extraSentences(desc: string): string[] {
  return desc
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim().replace(/[.!?]+$/, ''))
    .filter((s) => s.length > 3)
    .slice(1);
}

export function generateDraft(input: DraftInput): JobPlan {
  const desc = input.description.trim();
  const text = `${desc} ${input.notes}`;
  const energies = detectEnergy(text);
  const action = detectAction(desc);
  const target = detectTarget(desc);
  const partNumbers = detectPartNumbers(desc);
  const label = needsLabeling(text) || energies.includes('pneumatic') || energies.includes('hydraulic');
  const crew = parseCrew(input.crew);
  const qty = target?.qty ?? 1;
  const object = target ? null : detectObject(desc);
  const itemPlural = target?.noun ?? object ?? 'component';
  const item = qty > 1 ? singular(itemPlural) : itemPlural;
  const replacing = ['replace', 'install', 'repair'].includes(action);
  const equip = input.workCenter.trim() || 'the equipment';
  const partRef = partNumbers.length ? ` (#${partNumbers[0]})` : '';

  const steps: Step[] = [];
  const add = (t: string, key = false) => steps.push(makeStep(t, key));

  add(`Notify the area Operator and get permission to take ${equip} down. Confirm no product is in the work area.`, true);
  add(lockoutStep(equip, energies), true);
  if (replacing || partNumbers.length) {
    add(`Stage the ${qty > 1 ? `${qty} new ${itemPlural}` : `new ${item}`}${partNumbers.length ? ` (${partNumbers.map((p) => `#${p}`).join(', ')})` : ''}, consumables, and tools at the machine. Check the parts against the drawing.`);
  } else {
    add('Stage the tools, consumables, and inspection sheet at the machine.');
  }
  if (label && ['replace', 'remove', 'repair'].includes(action)) {
    add('LABEL BEFORE YOU DISCONNECT: Label every line, hose, and wire with its position and port. Each one must go back to the same place.', true);
  }

  const task = taskSteps(action, item, qty > 1, partRef, label);
  const taskStart = steps.length;
  task.steps.forEach((t) => add(cap(t)));
  if (qty > 1 && task.repeat) {
    const from = taskStart + task.repeat[0] + 1;
    const to = taskStart + task.repeat[1] + 1;
    add(`Repeat steps ${from}–${to} for the remaining ${countWord(qty - 1)} ${qty - 1 === 1 ? item : itemPlural}, one at a time.`);
  }

  for (const s of extraSentences(desc)) add(cap(s) + '.');
  for (const n of input.notes.split(/\n+/).map((t) => t.trim()).filter(Boolean)) add(`CAUTION: ${n.replace(/[.!]+$/, '')}.`, true);
  if (input.attachmentIds.length) add('Compare the finished work against the drawings and photos attached to this job plan.');

  add('Remove all tools, rags, and old parts from the machine and confirm the tool count.');
  add('Announce startup to everyone in the area, remove locks and tags, and restore energy.');
  if (energies.includes('pneumatic') || energies.includes('hydraulic')) {
    add(`LEAK CHECK (10 min): With ${energies.includes('hydraulic') ? 'hydraulic pressure' : 'air'} restored, check every fitting and connection you touched for leaks. Correct any leaks found.`);
  }
  add(`OPERATIONAL & CYCLE CHECK (15 min): Run ${equip} through several full cycles. Verify normal operation with no leaks, binding, unusual noise, or vibration.`);
  const used = partNumbers.length ? ` — parts used (${partNumbers.map((p) => `#${p} x${qty}`).join(', ')})` : ' — parts used';
  add(`Notify the Operator that ${equip} is production ready, then close out the work order in the CMMS${used}, labor time, and notes on what was found and replaced.`, true);

  // Put the first attachment on the first task step so techs see it where it matters.
  const firstImage = input.attachmentIds[0];
  const firstTask = steps[taskStart];
  if (firstImage && firstTask) firstTask.imageId = firstImage;

  const hours = estimateHours(action, qty, energies);
  const firstSentence = (desc.split(/(?<=[.!?])\s+|\n+/)[0] ?? '').replace(/[.!?]+$/, '');
  const parts: Part[] = partNumbers.map((pn, i) =>
    blankPart({ stores: pn, description: i === 0 ? cap(singular(itemPlural)) : '', qty: i === 0 ? String(qty) : '1' }),
  );

  return {
    ...emptyPlan(),
    workCenter: input.workCenter.trim(),
    equipmentClass: target || object ? [input.workCenter.trim(), cap(itemPlural)].filter(Boolean).join(' — ') : '',
    title: (firstSentence || `${action} ${itemPlural}`).toUpperCase().slice(0, 90),
    summary: desc,
    frequency: 'Corrective / As Needed',
    elapsedTime: formatHours(hours),
    downtime: formatHours(hours),
    laborHours: `${crew} Tech${crew > 1 ? 's' : ''} x ${formatHours(hours)}`,
    ppe: ppeFor(energies),
    parts,
    consumables: [label ? 'Thread sealant for fittings' : '', 'blue threadlocker', 'shop rags'].filter(Boolean).join(', '),
    specialTools: label ? 'Labeler (to mark lines before disconnecting)' : '',
    mobileEquipment: energies.includes('gravity') ? 'Lift or blocking as needed to support raised parts' : 'None',
    coordination: 'Area Operator (before taking the equipment down), Maintenance Team',
    procedures: 'LOTO procedure posted at machine',
    originator: input.originator,
    steps,
  };
}
