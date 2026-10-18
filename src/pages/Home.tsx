import { Layout } from '../components/Layout';
import { Icon } from '../components/Icon';
import { ProjectCard } from '../components/ProjectCard';
import { caseStudy, focusAreas, headlineKpis, services } from '../content/home';
import { timeline } from '../content/career';
import { projects } from '../content/projects';
import { site } from '../content/site';

export function Home() {
  const cs = caseStudy;
  const drop = Math.round((1 - cs.downtimeAfter / cs.downtimeBefore) * 100);

  return (
    <Layout active="home">
      <div className="band">
        <div className="wrap hero">
          <div>
            <div className="who">
              <img className="avatar" src="/assets/chad.jpg" alt={site.name} width={72} height={72} />
              <div className="who-text"><b>{site.name}</b><span>{site.title}</span></div>
            </div>
            <span className="pill"><span className="dot" />Open to reliability &amp; maintenance leadership roles</span>
            <h1>I keep plants <em>running.</em></h1>
            <p className="intro">
              I'm a maintenance planner, Navy veteran, and builder of practical tools. I turn reactive maintenance into
              planned work, and I build the systems that make it stick.
            </p>
            <div className="actions">
              <a className="btn btn-amber" href="/resume/"><Icon name="file" />View résumé</a>
              <a className="btn btn-ghost" href="/lab/">See what I'm building →</a>
            </div>
            <div className="creds">
              <span>RMIC · University of Tennessee</span>
              <span>U.S. Navy · USS Mahan</span>
            </div>
          </div>

          <div className="panel" aria-label="Results at a glance">
            <div className="panel-head"><span>Results at a glance</span><span className="live">● Plant floor</span></div>
            <div className="kpis">
              {headlineKpis.map((k) => (
                <div className="kpi" key={k.label}>
                  <div className="v">{k.value}{k.unit && <small>{k.unit}</small>}</div>
                  <div className="l">{k.label}</div>
                  <div className="meter"><i style={{ width: `${k.meter}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">What I do</span>
              <h2 className="h2">Planning, reliability,<br />and better tools.</h2>
            </div>
            <p className="lede">From a destroyer's engine room to the plant floor — now on the planning side that keeps it all running.</p>
          </div>
          <div className="grid-3">
            {services.map((s, i) => (
              <article className="card" key={s.title}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <div className="icon"><Icon name={s.icon} /></div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="case">
            <div className="case-text">
              <span className="eyebrow">{cs.eyebrow}</span>
              <h3>{cs.title}</h3>
              <p>{cs.body}</p>
              <ul className="case-list">{cs.steps.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div className="case-viz">
              <Bar label="Downtime — before" value={`${cs.downtimeBefore} hrs`} pct={100} tone="before" />
              <Bar label="Downtime — after" value={`${cs.downtimeAfter} hrs`} pct={(cs.downtimeAfter / cs.downtimeBefore) * 100} tone="after" />
              <Bar label="Emergency work rate" value={`${cs.emergencyBefore}% → ${cs.emergencyAfter}%`} pct={cs.emergencyAfter} tone="after" />
              <div className="big-stat"><span className="n">−{drop}%</span><span className="t">downtime on the<br />top 5 breakdown assets</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <span className="eyebrow">Background</span>
          <h2 className="h2" style={{ marginBottom: 36 }}>How I got here.</h2>
          <div className="career">
            <div className="timeline">
              {timeline.map((t) => (
                <div className={`tl${t.current ? ' now' : ''}`} key={t.when}>
                  <span className="tl-when">{t.when}</span>
                  <div><h3>{t.title}</h3><div className="org">{t.org}</div></div>
                </div>
              ))}
            </div>
            <aside>
              <div className="side-card">
                <h4>Certifications</h4>
                <img className="cert-logo" src="/assets/rmic-badge.png" width={220}
                  alt="University of Tennessee Reliability & Maintainability Center — RMIC Planning & Scheduling Certification" />
              </div>
              <div className="side-card">
                <h4>Focus areas</h4>
                <div className="tags">{focusAreas.map((f) => <span className="tag" key={f}>{f}</span>)}</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow">From the lab</span>
              <h2 className="h2">Things I'm building.</h2>
            </div>
            <a className="btn btn-line" href="/lab/">All projects →</a>
          </div>
          <div className="grid-3">
            {projects.filter((p) => p.featured).map((p) => <ProjectCard project={p} compact key={p.title} />)}
          </div>
        </div>
      </section>

      <div className="band" id="contact">
        <div className="wrap cta">
          <span className="eyebrow" style={{ color: 'var(--amber)' }}>Get in touch</span>
          <h2>Let's talk maintenance.</h2>
          <p>Open to conversations about planning, reliability, and maintenance leadership — or just comparing notes on PM programs.</p>
          <div className="actions">
            <a className="btn btn-amber" href={`mailto:${site.email}`}><Icon name="mail" />Email me</a>
            <a className="btn btn-ghost" href={site.linkedin} target="_blank" rel="noopener"><Icon name="linkedin" />LinkedIn</a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Bar({ label, value, pct, tone }: { label: string; value: string; pct: number; tone: 'before' | 'after' }) {
  return (
    <div className="bar-row">
      <div className="bar-top"><span>{label}</span><b>{value}</b></div>
      <div className="bar"><i className={tone} style={{ width: `${pct.toFixed(1)}%` }} /></div>
    </div>
  );
}
