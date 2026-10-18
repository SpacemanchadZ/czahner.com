import { Layout } from '../components/Layout';
import { Icon } from '../components/Icon';
import { certifications, jobs, skills, summary } from '../content/career';
import { site } from '../content/site';

export function Resume() {
  return (
    <Layout active="resume">
      <div className="band">
        <div className="wrap page-hero" style={{ paddingBottom: 110 }}>
          <span className="eyebrow">Résumé</span>
          <h1>Experience &amp; <em>skills.</em></h1>
          <p>Maintenance planning, reliability, and hands-on technical work — from the Navy to the plant floor.</p>
          <div className="actions no-print" style={{ marginTop: 28 }}>
            <button className="btn btn-amber" type="button" onClick={() => window.print()}><Icon name="download" />Save as PDF</button>
            <a className="btn btn-ghost" href={`mailto:${site.email}`}>Email me</a>
          </div>
        </div>
      </div>
      <div className="resume-area">
        <div className="wrap">
          <article className="paper">
            <header className="r-head">
              <div>
                <h1>{site.name}</h1>
                <div className="r-title">{site.title} · RMIC</div>
                <div className="r-contact">
                  <span>Rocky Mount, VA</span>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                  <a href={site.linkedin}>linkedin.com/in/czahner</a>
                  <a href="https://czahner.com">czahner.com</a>
                </div>
              </div>
            </header>

            <div className="r-section"><h2>Summary</h2><p>{summary}</p></div>

            <div className="r-section">
              <h2>Experience</h2>
              {jobs.map((j) => (
                <div className="job" key={j.title}>
                  <div className="job-top"><h3>{j.title}</h3><span className="job-when">{j.when}</span></div>
                  <div className="job-org">{j.org}</div>
                  <ul>{j.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
                </div>
              ))}
            </div>

            <DefinitionSection title="Skills" rows={skills} />
            <DefinitionSection title="Certifications" rows={certifications} />
          </article>
        </div>
      </div>
    </Layout>
  );
}

function DefinitionSection({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="r-section">
      <h2>{title}</h2>
      <dl className="skills-grid">
        {rows.map(([k, v]) => [<dt key={`${k}-t`}>{k}</dt>, <dd key={`${k}-d`}>{v}</dd>])}
      </dl>
    </div>
  );
}
