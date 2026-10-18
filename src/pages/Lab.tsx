import { Layout } from '../components/Layout';
import { ProjectCard } from '../components/ProjectCard';
import { projects } from '../content/projects';
import { site } from '../content/site';

export function Lab() {
  return (
    <Layout active="lab">
      <div className="band">
        <div className="wrap page-hero">
          <span className="eyebrow">The Lab</span>
          <h1>Things I'm <em>building.</em></h1>
          <p>Tools, experiments, and AI projects aimed at one question: how do we make maintenance planning faster, smarter, and more reliable?</p>
        </div>
      </div>
      <section className="section">
        <div className="wrap">
          <div className="grid-3">
            {projects.map((p) => <ProjectCard project={p} key={p.title} />)}
          </div>
          <p className="note">
            Live demos use sample data — no plant names, people, or real numbers. This site and its tools are written in
            React and TypeScript; the <a href={site.repo} target="_blank" rel="noopener">source is on GitHub</a>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
