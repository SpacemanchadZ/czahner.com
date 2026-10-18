import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Packer } from 'docx';
import { ToolShell } from '../../components/ToolShell';
import { Icon } from '../../components/Icon';
import { IntakePanel, type IntakeState } from './components/IntakePanel';
import { PlanEditor } from './components/PlanEditor';
import { PlanCheck } from './components/PlanCheck';
import { LibraryDialog } from './components/LibraryDialog';
import { planReducer } from './reducer';
import { blankPart, emptyPlan, examplePlan } from './plan';
import { detectPartNumbers, generateDraft } from './generator';
import { checkPlan } from './lint';
import { buildJobPlanDoc, fileName, type DocImage } from './docx';
import { readFiles, revoke } from './attachments';
import { deleteSaved, listSaved, loadDraft, parsePlan, saveDraft, savePlan, toFile, type SavedPlan } from './storage';
import type { Attachment } from './types';

type Toast = { text: string; error?: boolean } | null;

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function JobPlanBuilder() {
  const restored = useMemo(loadDraft, []);
  const [plan, dispatch] = useReducer(planReducer, restored ?? examplePlan());
  const [isExample, setIsExample] = useState(!restored);
  const [intake, setIntake] = useState<IntakeState>({ description: '', workCenter: '', crew: '', notes: '', originator: 'Chad Zahner' });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [saved, setSaved] = useState<SavedPlan[]>(() => listSaved());
  const importInput = useRef<HTMLInputElement>(null);
  const issues = useMemo(() => checkPlan(plan), [plan]);

  const notify = useCallback((text: string, error = false) => setToast({ text, error }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Autosave edits (debounced). The untouched example is not saved.
  const initialPlan = useRef(plan);
  useEffect(() => {
    if (plan === initialPlan.current) return;
    setIsExample(false);
    const t = setTimeout(() => saveDraft(plan), 400);
    return () => clearTimeout(t);
  }, [plan]);

  // Free image memory when the page goes away.
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  useEffect(() => () => revoke(attachmentsRef.current), []);

  const addFiles = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    const added = await readFiles(files, (name) => notify(`Couldn't read ${name}. Try a PDF, PNG, or JPG.`, true));
    setAttachments((prev) => [...prev, ...added]);
    setBusy(false);
    if (added.length) notify(`${added.length} page${added.length > 1 ? 's' : ''} added.`);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const gone = prev.filter((a) => a.id === id);
      revoke(gone);
      return prev.filter((a) => a.id !== id);
    });
    dispatch({ type: 'detachImage', imageId: id });
  };

  const generate = () => {
    if (!intake.description.trim()) {
      notify('Describe the job first — what needs to be done, and on what equipment.', true);
      document.getElementById('jp-desc')?.focus();
      return;
    }
    // Use text read from PDF drawings to find part numbers too.
    const pdfText = attachments.map((a) => a.text).filter(Boolean).join(' ');
    const draft = generateDraft({ ...intake, attachmentIds: attachments.map((a) => a.id) });
    if (pdfText && !draft.parts.length) {
      draft.parts = detectPartNumbers(pdfText).slice(0, 12).map((stores) => blankPart({ stores, remarks: 'Found on attached drawing — confirm qty' }));
    }
    dispatch({ type: 'replace', plan: draft });
    notify('Draft written. Review the plan check, edit anything, then export.');
    document.getElementById('editor-h')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportWord = async () => {
    try {
      const images: DocImage[] = await Promise.all(
        attachments.map(async (a) => ({ id: a.id, name: a.name, width: a.width, height: a.height, data: await a.blob.arrayBuffer() })),
      );
      const blob = await Packer.toBlob(buildJobPlanDoc(plan, images));
      download(blob, fileName(plan));
      const errors = issues.filter((i) => i.severity === 'error').length;
      notify(errors ? `Downloaded — note: ${errors} plan check item${errors > 1 ? 's' : ''} still need fixing.` : 'Word document downloaded.');
    } catch (err) {
      console.error(err);
      notify('Could not build the Word file. Try again.', true);
    }
  };

  const exportJson = () => {
    download(new Blob([toFile(plan)], { type: 'application/json' }), fileName(plan).replace(/\.docx$/, '.json'));
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      dispatch({ type: 'replace', plan: parsePlan(JSON.parse(await file.text())) });
      notify(`Opened ${file.name}.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'That file could not be opened.', true);
    }
  };

  const newPlan = () => {
    if (!confirmDiscard()) return;
    dispatch({ type: 'replace', plan: { ...emptyPlan(), originator: intake.originator } });
  };

  const confirmDiscard = () => plan.steps.length === 0 || window.confirm('Start over? Unsaved changes to the current plan will be lost.');

  const actions = (
    <>
      <button className="tbtn ghost" type="button" onClick={newPlan}>New</button>
      <button className="tbtn ghost" type="button" onClick={() => setLibraryOpen(true)}>Saved</button>
      <button className="tbtn ghost" type="button" onClick={() => importInput.current?.click()}>Import</button>
      <button className="tbtn ghost" type="button" onClick={exportJson}>Export</button>
      <button className="tbtn ghost" type="button" onClick={() => window.print()}>Print</button>
      <button className="tbtn primary" type="button" onClick={exportWord}><Icon name="download" />Download .docx</button>
      <input ref={importInput} type="file" accept="application/json,.json" hidden onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = ''; }} />
    </>
  );

  const jumpToStep = (i: number) => {
    const el = document.getElementById(`step-${i}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector('textarea')?.focus({ preventScroll: true });
  };

  return (
    <ToolShell title="Job Plan Builder" tag="Demo" codePath="src/tools/job-plan" actions={actions}>
      <div className="jp-layout">
        <IntakePanel
          value={intake}
          onChange={setIntake}
          attachments={attachments}
          onAddFiles={(f) => void addFiles(f)}
          onRemove={removeAttachment}
          onGenerate={generate}
          busy={busy}
        />
        <PlanEditor plan={plan} dispatch={dispatch} attachments={attachments} issues={issues} isExample={isExample} />
        <PlanCheck issues={issues} onJump={jumpToStep} />
      </div>
      <LibraryDialog
        open={libraryOpen}
        saved={saved}
        defaultName={plan.title || 'Untitled plan'}
        onClose={() => setLibraryOpen(false)}
        onSave={(name) => { setSaved(savePlan(plan, name)); notify(`Saved “${name}”.`); }}
        onLoad={(entry) => { dispatch({ type: 'replace', plan: parsePlan(entry.plan) }); setLibraryOpen(false); notify(`Opened “${entry.name}”.`); }}
        onDelete={(id) => setSaved(deleteSaved(id))}
      />
      {toast && <div className={`toast${toast.error ? ' err' : ''}`} role="status">{toast.text}</div>}
    </ToolShell>
  );
}
