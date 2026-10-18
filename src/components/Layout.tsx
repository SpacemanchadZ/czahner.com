import type { ReactNode } from 'react';
import { nav, site, type NavKey } from '../content/site';

export function Header({ active }: { active: NavKey }) {
  return (
    <header className="site-header">
      <nav className="wrap nav" aria-label="Main">
        <a className="brand" href="/" aria-label={`${site.name} — home`}>
          <span className="brand-mark"><img src="/assets/logo-mark.png" alt="" /></span>
        </a>
        <ul className="nav-links">
          {nav.map((item) => (
            <li key={item.key}>
              <a href={item.href} aria-current={item.key === active ? 'page' : undefined}>{item.label}</a>
            </li>
          ))}
          <li><a href={active === 'home' ? '#contact' : '/#contact'}>Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

export function Footer({ active }: { active: NavKey }) {
  const links = nav.filter((n) => n.key !== active);
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>
          {links.map((l) => (
            <span key={l.key}><a href={l.href}>{l.label}</a> · </span>
          ))}
          <a href={site.linkedin} target="_blank" rel="noopener">LinkedIn</a>
        </span>
      </div>
    </footer>
  );
}

export function Layout({ active, children }: { active: NavKey; children: ReactNode }) {
  return (
    <>
      <Header active={active} />
      <main>{children}</main>
      <Footer active={active} />
    </>
  );
}
