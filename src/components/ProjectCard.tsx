import { Icon } from './Icon';
import { statusLabel, type Project } from '../content/projects';

/** Lab card. Whole card is a link when the project only has one destination. */
export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const { title, icon, status, tags, href, code, external, tint } = project;
  const blurb = compact ? (project.teaser ?? project.blurb) : project.blurb;
  const thumbClass = `thumb${tint && tint > 1 ? ` t${tint}` : ''}`;
  const badgeClass = status === 'demo' ? 'live' : status;
  const linkProps = external ? { target: '_blank', rel: 'noopener' } : {};

  const thumb = (
    <div className={thumbClass}>
      <span className={`badge ${badgeClass}`}>{statusLabel[status]}</span>
      <Icon name={icon} />
    </div>
  );

  // Single destination (or compact teaser): make the entire card clickable.
  if (href && (!code || compact)) {
    return (
      <a className="card project card-link" href={href} {...linkProps}>
        {thumb}
        <div className="body">
          <h3>{title}</h3>
          <p>{blurb}</p>
          {!compact && <Tags tags={tags} />}
          <span className="go">{external ? `${href.replace(/^https?:\/\//, '')} →` : status === 'demo' ? 'Try it →' : 'Open →'}</span>
        </div>
      </a>
    );
  }

  return (
    <article className="card project">
      {thumb}
      <div className="body">
        <h3>{title}</h3>
        <p>{blurb}</p>
        <Tags tags={tags} />
        {(href || code) && (
          <div className="links">
            {href && <a className="go" href={href} {...linkProps}>Open demo →</a>}
            {code && <a className="code" href={code} target="_blank" rel="noopener">View code</a>}
          </div>
        )}
      </div>
    </article>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div className="tags">
      {tags.map((t) => <span className="tag" key={t}>{t}</span>)}
    </div>
  );
}
