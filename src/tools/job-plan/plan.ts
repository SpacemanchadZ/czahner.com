import { uid } from '../../lib/id';
import { TEXT_FIELDS, type JobPlan, type Part, type Step } from './types';

export const blankPart = (p: Partial<Part> = {}): Part => ({ id: uid('part'), stores: '', description: '', qty: '', remarks: '', ...p });
export const makeStep = (text = '', key = false, imageId: string | null = null): Step => ({ id: uid('step'), text, key, imageId });

export function emptyPlan(): JobPlan {
  const base = Object.fromEntries(TEXT_FIELDS.map((f) => [f, ''])) as Record<(typeof TEXT_FIELDS)[number], string>;
  return { ...base, serviceRoutine: 'Corrective Maintenance / As Needed', parts: [], steps: [] };
}

/** Sample plan shown on first load so visitors can see the finished format. */
export function examplePlan(): JobPlan {
  return {
    ...emptyPlan(),
    workCenter: 'Line 2 — Infeed Conveyor',
    equipmentClass: 'Infeed Conveyor — Lift Air Cylinders',
    serviceRoutine: 'Corrective Maintenance / As Needed',
    title: 'INFEED CONVEYOR AIR CYLINDER & WASHER REPLACEMENT',
    summary:
      'Replace the four lift air cylinders and their vibration damping washers on the Line 2 infeed conveyor. Lock out electrical and air, label and disconnect the air lines, swap the cylinders one at a time, then leak-check and cycle the conveyor before returning it to production.',
    frequency: 'Corrective / As Needed',
    elapsedTime: '2.5 hr',
    downtime: '2.5 hr',
    laborHours: '2 Techs x 2.5 hr',
    ppe: 'Standard PPE (safety glasses, gloves, steel-toe boots); hearing protection; personal lock and tag',
    parts: [
      blankPart({ stores: 'AC-1625', description: 'Air cylinder, double rod end, 1-5/8" bore, 1/2" stroke', qty: '4', remarks: 'Sample part number' }),
      blankPart({ stores: 'NW-0750', description: 'Washer, neoprene, vibration damping, 2" OD x 3/4" ID', qty: '4', remarks: 'One per cylinder' }),
    ],
    consumables: 'Thread sealant for fittings, blue threadlocker, shop rags',
    specialTools: 'Allen wrench set, labeler (to label air lines)',
    mobileEquipment: 'None',
    coordination: 'Line Operator (before taking the conveyor down), Maintenance Team',
    procedures: 'LOTO procedure posted at machine; conveyor assembly drawing',
    originator: 'Chad Zahner',
    steps: [
      makeStep('Notify the Line Operator and get permission to take the infeed conveyor down. Confirm no product is on the conveyor.', true),
      makeStep('LOCKOUT (10 min): Lock out the conveyor per the LOTO procedure at the machine. Isolate ELECTRICAL and AIR — close and lock the main air supply, then bleed the air down at the valve manifold. Verify 0 psi on the gauge and try to cycle the conveyor to confirm zero energy.', true),
      makeStep('Stage the 4 new cylinders (#AC-1625) and 4 neoprene washers (#NW-0750) at the machine and check them against the drawing.'),
      makeStep('LABEL BEFORE YOU DISCONNECT: Use the labeler to label every air line with its cylinder position and port. Lines must go back to the same ports.', true),
      makeStep('Disconnect the air lines from the first cylinder — push in the collar on the fitting and pull the tubing out.'),
      makeStep('Remove the cylinder mounting screws and pull the cylinder off the plate. Remove the old washer from the rod. Note which way the fittings face.'),
      makeStep('Inspect the mounting plate and bracket for cracks, wear, or elongated holes. Clean the mounting surface.'),
      makeStep('Transfer the fittings to the new cylinder (#AC-1625) using thread sealant, aimed the same way as the originals.'),
      makeStep('Install a new washer (#NW-0750) and mount the new cylinder in the same orientation. Apply blue threadlocker to the screws and tighten.'),
      makeStep('Reconnect the air lines to their labeled ports. Push the tubing fully into each fitting and tug to confirm it is locked.'),
      makeStep('Repeat steps 5–10 for the remaining three cylinders, one at a time.'),
      makeStep('Remove all tools, rags, and old parts from the machine and confirm the tool count.'),
      makeStep('Announce startup to everyone in the area, remove locks and tags, and restore air.'),
      makeStep('LEAK CHECK (10 min): With air on, check every cylinder and fitting for leaks. Correct any leaks found.'),
      makeStep('OPERATIONAL & CYCLE CHECK (15 min): Restore power and cycle the conveyor several times. Verify all four cylinders stroke fully and evenly with no binding.'),
      makeStep('Notify the Operator the conveyor is production ready, then close out the work order in the CMMS — parts used (#AC-1625 x4, #NW-0750 x4), labor time, and notes on what was found and replaced.', true),
    ],
  };
}
