import type { Dispatch } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoTextarea } from '../../../components/AutoTextarea';
import type { PlanAction } from '../reducer';
import type { Attachment, Issue, JobPlan, Step, TextField } from '../types';

type FieldDef = [TextField, string];

const HEADER: FieldDef[] = [['workCenter', 'Work center'], ['equipmentClass', 'Equipment class'], ['serviceRoutine', 'Service routine']];
const TIME: FieldDef[] = [['frequency', 'Frequency'], ['elapsedTime', 'Est. elapsed time'], ['downtime', 'Est. downtime'], ['laborHours', 'Labor hours']];
const NOTES: FieldDef[] = [
  ['ppe', 'Personal protective equipment'],
  ['consumables', 'Consumables'],
  ['specialTools', 'Special tools'],
  ['mobileEquipment', 'Mobile / special equipment'],
  ['coordination', 'Departmental coordination'],
  ['procedures', 'Other procedures referenced'],
];

interface Props {
  plan: JobPlan;
  dispatch: Dispatch<PlanAction>;
  attachments: Attachment[];
  issues: Issue[];
  isExample: boolean;
}

export function PlanEditor({ plan, dispatch, attachments, issues, isExample }: Props) {
  const setField = (field: TextField) => (e: { target: { value: string } }) => dispatch({ type: 'setField', field, value: e.target.value });
  const flagged = new Map<number, Issue['severity']>();
  for (const i of issues) if (i.step !== undefined && !flagged.has(i.step)) flagged.set(i.step, i.severity);

  const fieldGrid = (defs: FieldDef[]) => (
    <div className="fgrid">
      {defs.map(([k, label]) => (
        <div key={k}>
          <label className="flbl" htmlFor={`f-${k}`}>{label}</label>
          <AutoTextarea id={`f-${k}`} value={plan[k]} onChange={setField(k)} />
        </div>
      ))}
    </div>
  );

  return (
    <section className="jp-panel editor" aria-labelledby="editor-h">
      <div className="editor-head">
        <h2 id="editor-h"><span className="stepnum">2</span>Review &amp; edit</h2>
        <span className={`src ${isExample ? '' : 'mine'}`}>{isExample ? 'Example plan' : 'Your plan'}</span>
      </div>
      {isExample && (
        <p className="hint example-note">
          This is a sample plan. Describe your job on the left and click <b>Write the job plan</b> — or edit this one. Every
          field is editable, and steps can be dragged into a new order.
        </p>
      )}

      <div className="sheet">
        <input className="title-input" aria-label="Task title" value={plan.title} onChange={setField('title')} placeholder="TASK TITLE" />
        <Block title="Header">{fieldGrid(HEADER)}</Block>
        <Block title="Task description">
          <AutoTextarea aria-label="Task description" value={plan.summary} onChange={setField('summary')} />
        </Block>
        <Block title="Time & labor">{fieldGrid(TIME)}</Block>
        <Block title="Parts">
          <PartsTable plan={plan} dispatch={dispatch} />
        </Block>
        {NOTES.map(([k, label]) => (
          <Block key={k} title={label}>
            <AutoTextarea aria-label={label} value={plan[k]} onChange={setField(k)} />
          </Block>
        ))}
        <Block title={<>Job steps <span className="muted">· bold = key step · drag ⠿ to reorder</span></>}>
          <StepList plan={plan} dispatch={dispatch} attachments={attachments} flagged={flagged} />
        </Block>
        <Block title="Sign-off">{fieldGrid([['originator', 'Originator'], ['approver', 'Approver']])}</Block>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="block">
      <div className="block-h">{title}</div>
      <div className="block-b">{children}</div>
    </div>
  );
}

function PartsTable({ plan, dispatch }: { plan: JobPlan; dispatch: Dispatch<PlanAction> }) {
  const cols = [['stores', 'Part # (Stores ID)'], ['description', 'Description'], ['qty', 'Qty'], ['remarks', 'Remarks']] as const;
  return (
    <>
      <div className="tblwrap">
        <table className="parts">
          <thead>
            <tr>{cols.map(([, l]) => <th key={l}>{l}</th>)}<th><span className="visually-hidden">Remove</span></th></tr>
          </thead>
          <tbody>
            {plan.parts.length === 0 && (
              <tr><td colSpan={5} className="empty">No parts yet.</td></tr>
            )}
            {plan.parts.map((p, i) => (
              <tr key={p.id}>
                {cols.map(([k, l]) => (
                  <td key={k} className={k}>
                    <input aria-label={`${l}, row ${i + 1}`} value={p[k]} onChange={(e) => dispatch({ type: 'updatePart', id: p.id, patch: { [k]: e.target.value } })} />
                  </td>
                ))}
                <td className="x">
                  <button type="button" className="icon-btn" aria-label={`Remove part row ${i + 1}`} onClick={() => dispatch({ type: 'removePart', id: p.id })}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="tbtn line sm" onClick={() => dispatch({ type: 'addPart' })}>+ Add part</button>
    </>
  );
}

function StepList({ plan, dispatch, attachments, flagged }: {
  plan: JobPlan;
  dispatch: Dispatch<PlanAction>;
  attachments: Attachment[];
  flagged: Map<number, Issue['severity']>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = plan.steps.findIndex((s) => s.id === active.id);
    const to = plan.steps.findIndex((s) => s.id === over.id);
    dispatch({ type: 'moveStep', from, to });
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={plan.steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ol className="steps">
            {plan.steps.map((s, i) => (
              <StepRow key={s.id} step={s} index={i} total={plan.steps.length} dispatch={dispatch} attachments={attachments} flag={flagged.get(i)} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <button type="button" className="tbtn line sm" onClick={() => dispatch({ type: 'addStep' })}>+ Add step</button>
    </>
  );
}

function StepRow({ step, index, total, dispatch, attachments, flag }: {
  step: Step;
  index: number;
  total: number;
  dispatch: Dispatch<PlanAction>;
  attachments: Attachment[];
  flag?: Issue['severity'];
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const img = step.imageId ? attachments.find((a) => a.id === step.imageId) : undefined;
  const update = (patch: Partial<Step>) => dispatch({ type: 'updateStep', id: step.id, patch });

  return (
    <li ref={setNodeRef} style={style} id={`step-${index}`} className={`step${step.key ? ' key' : ''}${isDragging ? ' dragging' : ''}${flag ? ` flag-${flag}` : ''}`}>
      <button type="button" className="handle" ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`Drag step ${index + 1}`}>⠿</button>
      <span className="n">{index + 1}.</span>
      <div className="step-body">
        <AutoTextarea aria-label={`Step ${index + 1}`} value={step.text} onChange={(e) => update({ text: e.target.value })} />
        {img && <img className="step-img" src={img.url} alt={`Attachment for step ${index + 1}`} />}
        <div className="step-ctl">
          <label><input type="checkbox" checked={step.key} onChange={(e) => update({ key: e.target.checked })} /> Key step</label>
          {attachments.length > 0 && (
            <select aria-label={`Photo for step ${index + 1}`} value={step.imageId ?? ''} onChange={(e) => update({ imageId: e.target.value || null })}>
              <option value="">No photo</option>
              {attachments.map((a, i) => <option key={a.id} value={a.id}>{i + 1} · {a.name}</option>)}
            </select>
          )}
          <span className="spacer" />
          <button type="button" className="icon-btn" aria-label="Move up" disabled={index === 0} onClick={() => dispatch({ type: 'moveStep', from: index, to: index - 1 })}>↑</button>
          <button type="button" className="icon-btn" aria-label="Move down" disabled={index === total - 1} onClick={() => dispatch({ type: 'moveStep', from: index, to: index + 1 })}>↓</button>
          <button type="button" className="tbtn line sm" onClick={() => dispatch({ type: 'addStep', afterId: step.id })}>+ Below</button>
          <button type="button" className="tbtn line sm danger" onClick={() => dispatch({ type: 'removeStep', id: step.id })}>Delete</button>
        </div>
      </div>
    </li>
  );
}
