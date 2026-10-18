import type { ReactNode } from 'react';
import { codeUrl } from '../content/site';

/** App frame shared by the Lab tools: slim branded bar, title, actions. */
export function ToolShell({ title, tag, codePath, actions, children }: {
  title: string;
  tag?: string;
  codePath: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="tool">
      <header className="tool-bar">
        <div className="tool-bar-inner">
          <a className="tool-home" href="/lab/" aria-label="Back to the Lab">
            <span className="brand-mark sm"><img src="/assets/logo-mark.png" alt="" /></span>
            <span className="crumb">Lab</span>
          </a>
          <span className="sep" aria-hidden="true">/</span>
          <h1 className="tool-title">{title}</h1>
          {tag && <span className="tool-tag">{tag}</span>}
          <div className="tool-actions">
            {actions}
            <a className="tbtn ghost" href={codeUrl(codePath)} target="_blank" rel="noopener">View code</a>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
