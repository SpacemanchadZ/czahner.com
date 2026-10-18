import type { Issue } from '../types';
import { planScore } from '../lint';

const LABEL = { error: 'Fix', warn: 'Check', info: 'Tip' } as const;

export function PlanCheck({ issues, onJump }: { issues: Issue[]; onJump: (step: number) => void }) {
  const score = planScore(issues);
  const errors = issues.filter((i) => i.severity === 'error').length;
  const tone = errors ? 'bad' : score >= 85 ? 'good' : 'mid';
  const order = { error: 0, warn: 1, info: 2 };
  const sorted = issues.slice().sort((a, b) => order[a.severity] - order[b.severity]);

  return (
    <aside className="jp-panel check no-print" aria-labelledby="check-h">
      <h2 id="check-h"><span className="stepnum">3</span>Plan check</h2>
      <div className={`score ${tone}`}>
        <div className="ring" style={{ ['--p' as string]: score }}><span>{score}</span></div>
        <div>
          <b>{errors ? `${errors} must-fix item${errors > 1 ? 's' : ''}` : issues.length ? 'Ready with notes' : 'Ready to issue'}</b>
          <span>Checked against the job plan standard: lockout, sequence, parts, and wording.</span>
        </div>
      </div>
      {sorted.length === 0 ? (
        <p className="all-good">No issues found.</p>
      ) : (
        <ul className="issues">
          {sorted.map((i) => (
            <li key={i.id} className={i.severity}>
              <span className="sev">{LABEL[i.severity]}</span>
              {i.step !== undefined ? (
                <button type="button" className="link" onClick={() => onJump(i.step!)}>{i.message}</button>
              ) : (
                <span>{i.message}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
