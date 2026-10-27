import { Layout } from '../components/Layout';
import { Icon } from '../components/Icon';
import { additional, education, expertise, headline, highlights, jobs } from '../content/career';
import { site } from '../content/site';

const PHONE = '540-493-6940';

export function Resume() {
  return (
    <Layout active="resume">
      <div className="band">
        <div className="wrap page-hero" style={{ paddingBottom: 110 }}>
          <span className="eyebrow">Resume</span>
          <h1>Experience &amp; <em>skills.</em></h1>
          <p>Maintenance planning, reliability, and hands-on technical work — from the Navy to the plant floor.</p>
          <div className="actions no-print" style={{ marginTop: 28 }}>
            <button className="btn btn-amber" type="button" onClick={() => window.print()}><Icon name="download" />Save as PDF</button>
            <a className="btn btn-ghost" href="/assets/Chad_Zahner_Resume.docx" download><Icon name="file" />Download Word</a>
            <a className="btn btn-ghost" href={`mailto:${site.email}`}>Email me</a>
          </div>
        </div>
      </div>
      <div className="resume-area">
        <div className="wrap">
          <article className="paper">
            <header className="r-bar">
              <h1>{site.name}</h1>
              <div className="r-contact">
                <span>Rocky Mount, VA</span>
                <a href={`tel:${PHONE.replace(/-/g, '')}`}>{PHONE}</a>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <a href={site.linkedin}>linkedin.com/in/czahner</a>
                <a href="https://czahner.com">czahner.com</a>
              </div>
            </header>

            <div className="r-band">{headline.join('  |  ')}</div>

            <div className="r-section">
              <h2>Areas of Expertise</h2>
              <ul className="r-expertise">{expertise.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>

            <div className="r-section">
              <h2>Career Highlights</h2>
              {highlights.map(([k, v]) => <p className="r-hl" key={k}><b>{k}:</b> {v}</p>)}
            </div>

            <div className="r-section">
              <h2>Professional Experience</h2>
              {jobs.map((j) => (
                <div className="job" key={j.title}>
                  <div className="job-bar">
                    <b>{j.title},</b> {j.org}, <i>{j.where}</i> <span className="job-when">|  {j.when}</span>
                  </div>
                  <p className="job-scope">{j.scope}</p>
                  <h4>Responsibilities</h4>
                  <ul>{j.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
                  {j.accomplishments.length > 0 && (
                    <>
                      <h4>Accomplishments</h4>
                      <ul>{j.accomplishments.map((r) => <li key={r}>{r}</li>)}</ul>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="r-section">
              <h2>Additional Experience</h2>
              {additional.map((x) => <p className="r-line" key={x.title}><b>{x.title},</b> {x.org}  |  {x.when}</p>)}
            </div>

            <div className="r-section">
              <h2>Education &amp; Certifications</h2>
              {education.map((x) => (
                <p className="r-line" key={x.name}><b>{x.name},</b> {x.org}{x.where && <>, <i>{x.where}</i></>}</p>
              ))}
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
}
