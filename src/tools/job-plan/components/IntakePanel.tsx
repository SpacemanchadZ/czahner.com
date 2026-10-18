import { useRef, useState, type DragEvent } from 'react';
import type { Attachment, DraftInput } from '../types';

export type IntakeState = Omit<DraftInput, 'attachmentIds'>;

const WORK_CENTERS = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Cutting', 'Tempering', 'Fabrication', 'Shipping'];

export function IntakePanel({ value, onChange, attachments, onAddFiles, onRemove, onGenerate, busy }: {
  value: IntakeState;
  onChange: (next: IntakeState) => void;
  attachments: Attachment[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onGenerate: () => void;
  busy: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const set = (k: keyof IntakeState) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    onAddFiles([...e.dataTransfer.files]);
  };

  return (
    <section className="jp-panel intake no-print" aria-labelledby="intake-h">
      <h2 id="intake-h"><span className="stepnum">1</span>Describe the job</h2>

      <label className="lbl" htmlFor="jp-desc">What needs to be done?</label>
      <textarea
        id="jp-desc"
        rows={5}
        value={value.description}
        onChange={set('description')}
        placeholder="Replace the 4 air cylinders on the Line 2 infeed conveyor with #AC-1625. Check the mounting brackets for cracks."
      />
      <p className="hint">Mention quantities, part numbers (#AC-1625), and anything special. Each extra sentence becomes a step.</p>

      <div className="row2">
        <div>
          <label className="lbl" htmlFor="jp-wc">Equipment / work center</label>
          <input id="jp-wc" list="jp-wcs" value={value.workCenter} onChange={set('workCenter')} placeholder="Line 2 Infeed Conveyor" />
          <datalist id="jp-wcs">{WORK_CENTERS.map((w) => <option key={w} value={w} />)}</datalist>
        </div>
        <div>
          <label className="lbl" htmlFor="jp-crew">Crew</label>
          <input id="jp-crew" value={value.crew} onChange={set('crew')} placeholder="2 techs" />
        </div>
      </div>

      <label className="lbl" htmlFor="jp-notes">Must-know notes <span className="opt">optional, one per line</span></label>
      <textarea id="jp-notes" rows={2} value={value.notes} onChange={set('notes')} placeholder="Fittings must face the drive side" />

      <label className="lbl" htmlFor="jp-orig">Originator</label>
      <input id="jp-orig" value={value.originator} onChange={set('originator')} />

      <span className="lbl">Drawings &amp; photos</span>
      <div
        className={`drop${over ? ' over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => fileInput.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fileInput.current?.click())}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <strong>Drop PDFs or images</strong> or click to browse
        <span className="hint">PDF pages are rendered and their text is read. Files stay on your computer.</span>
      </div>
      <input
        ref={fileInput}
        type="file"
        hidden
        multiple
        accept=".pdf,image/png,image/jpeg,image/webp"
        onChange={(e) => { onAddFiles([...(e.target.files ?? [])]); e.target.value = ''; }}
      />
      {attachments.length > 0 && (
        <ul className="thumbs">
          {attachments.map((a, i) => (
            <li key={a.id} className="thumb">
              <img src={a.url} alt={a.name} />
              <span className="cap">{i + 1} · {a.name}</span>
              <button type="button" aria-label={`Remove ${a.name}`} onClick={() => onRemove(a.id)}>×</button>
            </li>
          ))}
        </ul>
      )}

      <button className="go" type="button" onClick={onGenerate} disabled={busy}>
        {busy ? 'Reading files…' : 'Write the job plan'}
      </button>
    </section>
  );
}
