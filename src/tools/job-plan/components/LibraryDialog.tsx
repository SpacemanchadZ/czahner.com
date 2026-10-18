import { useEffect, useRef, useState } from 'react';
import type { SavedPlan } from '../storage';

export function LibraryDialog({ open, saved, defaultName, onClose, onSave, onLoad, onDelete }: {
  open: boolean;
  saved: SavedPlan[];
  defaultName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  onLoad: (entry: SavedPlan) => void;
  onDelete: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setName(defaultName);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open, defaultName]);

  return (
    <dialog ref={ref} className="library" onClose={onClose} aria-labelledby="lib-h">
      <div className="lib-head">
        <h2 id="lib-h">Saved plans</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <form className="lib-save" onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim()); }}>
        <label className="lbl" htmlFor="lib-name">Save the current plan as</label>
        <div className="row-inline">
          <input id="lib-name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="tbtn primary" type="submit">Save</button>
        </div>
        <p className="hint">Saved in this browser only. Use Export to move a plan to another computer.</p>
      </form>
      {saved.length === 0 ? (
        <p className="hint">Nothing saved yet.</p>
      ) : (
        <ul className="lib-list">
          {saved.map((s) => (
            <li key={s.id}>
              <div>
                <b>{s.name}</b>
                <span>{s.plan.steps.length} steps · {new Date(s.savedAt).toLocaleString()}</span>
              </div>
              <button type="button" className="tbtn line sm" onClick={() => onLoad(s)}>Open</button>
              <button type="button" className="tbtn line sm danger" onClick={() => onDelete(s.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </dialog>
  );
}
