import { useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';

const facts: [string, string][] = [
  ['4 platforms', 'Mac, iPhone, iPad, and Apple Watch, plus a Windows version and a browser view for the shop floor.'],
  ['18 screens', 'Dashboards, planning tools, reliability analysis, and printable reports — all from the same work order data.'],
  ['Every number checkable', 'Tap any KPI to see the work orders it was counted from.'],
  ['Stays in sync', 'Notes, plans, and analyses made on one device show up on the others.'],
];

const built: [string, string][] = [
  ['One engine, every device', 'All the KPI math lives in a single Swift package, so the Mac, iPhone, iPad, Watch, and browser views always show the same number.'],
  ['No server to run', 'The Mac app keeps the data in a local SQLite database and serves the browser view on the plant network. Other devices sync through iCloud.'],
  ['Reads what the CMMS already exports', 'Saved report pages and CSV files are parsed on import — no database access or IT project needed.'],
  ['Tested like production software', 'About 270 automated tests cover the calculations, the importers, and the sync.'],
];

const devices: [string, string, string][] = [
  ['ipad-overview.jpg', 'Overview on iPad', 'wide'],
  ['ipad-reliability.jpg', 'Reliability on iPad', 'wide'],
  ['watch-board.png', 'This week’s KPIs on Apple Watch', 'watch'],
  ['watch-today.png', 'What needs attention, on the wrist', 'watch'],
];

interface Group { title: string; text: string; shots: [string, string][] }

const groups: Group[] = [
  {
    title: 'Dashboard',
    text: 'The week and the year at a glance: schedule and PM compliance, proactive vs. reactive work, backlog health, and where labor hours went.',
    shots: [
      ['overview', 'Overview: this week’s KPIs and the year to date'],
      ['backlog', 'Backlog: open correctives by line, status, priority, and age'],
      ['labor', 'Labor: hours and work orders by technician, and estimate accuracy'],
      ['equipment', 'Equipment & PMs: every machine with its PMs and breakdown history'],
    ],
  },
  {
    title: 'Planning',
    text: 'Tools for the planner’s week: move each job from request to ready, build next week’s schedule against crew capacity, and keep job plans in one place.',
    shots: [
      ['workbench', 'Workbench: every open job by planning stage, with the next action'],
      ['schedule', 'Schedule Builder: load next week against crew hours'],
      ['jobplans', 'Job Plans: step-by-step plans that export to Word'],
      ['board', 'Shop-floor KPI board for the plant TV'],
    ],
  },
  {
    title: 'Reliability',
    text: 'Find the bad actors and fix them for good: breakdown ranking, MTBF and MTTR, Weibull failure patterns, root cause analysis, and FMEA started from the machine’s own history.',
    shots: [
      ['reliability', 'Bad actors: breakdown hours and events by machine'],
      ['weibull', 'Weibull: which machines wear out and which fail at random'],
      ['rca', 'Root cause: a fishbone pre-filled from breakdown history'],
      ['fmea', 'FMEA: failure modes scored from real breakdown data'],
      ['missingpms', 'Missing PMs: machines breaking down with no PM covering them'],
    ],
  },
  {
    title: 'Reports and data health',
    text: 'A weekly and monthly report ready to print for leadership, and a check on the data itself so the numbers can be trusted.',
    shots: [
      ['report', 'Weekly report: one page for leadership'],
      ['datahealth', 'Data health: what could make the numbers wrong'],
    ],
  },
];

const phones: [string, string][] = [
  ['phone-today', 'Today'],
  ['phone-overview', 'Overview'],
  ['phone-board', 'Shop-floor board'],
  ['phone-fmea', 'FMEA'],
];

export function Maintlytics() {
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true; // browsers only allow autoplay without sound
    v.play().catch(() => {});
  }, []);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);
  const shot = (file: string, alt: string) => {
    const src = `/assets/maintlytics/${file}`;
    return (
      <button type="button" className="shot-btn" onClick={() => setZoom({ src, alt })} aria-label={`Enlarge: ${alt}`}>
        <img src={src} alt={alt} loading="lazy" />
      </button>
    );
  };
  return (
    <Layout active="lab">
      <div className="band">
        <div className="wrap page-hero">
          <span className="eyebrow">The Lab · Live</span>
          <h1>Maint<em>lytics.</em></h1>
          <p>A maintenance KPI and planning app I designed and built for Mac, iPhone, iPad, and Apple Watch. It turns CMMS work order data into a weekly schedule, a planning board, and reliability numbers a team can act on.</p>
        </div>
      </div>
      <section className="section">
        <div className="wrap">
          <div className="demo-video">
            <video ref={video} controls autoPlay muted loop playsInline preload="auto" poster="/assets/maintlytics/demo-poster.jpg">
              <source src="/assets/maintlytics/demo.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="why">
            <span className="eyebrow">Why I built it</span>
            <h2>The numbers took hours, and nobody could check them.</h2>
            <p>
              As a maintenance planner I was rebuilding the same KPIs by hand every week — schedule compliance, PM compliance,
              backlog, breakdowns — from CMMS reports and spreadsheets. When a number looked wrong, there was no quick way to see
              which work orders were behind it. Maintlytics does the import and the math in seconds, and every figure opens the
              list of work orders it was counted from.
            </p>
          </div>
          <div className="grid-2">
            {facts.map(([t, d]) => (
              <article className="card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          {groups.map((g) => (
            <div className="shot-group" key={g.title}>
              <h2>{g.title}</h2>
              <p>{g.text}</p>
              <div className="shots">
                {g.shots.map(([f, alt]) => (
                  <figure key={f}>
                    {shot(`${f}.jpg`, alt)}
                    <figcaption>{alt}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
          <div className="shot-group">
            <h2>iPad and Apple Watch</h2>
            <p>Native apps, not a web page in a wrapper: the iPad gets the full dashboard and the Watch shows the week at a glance.</p>
            <div className="shots devices">
              {devices.map(([f, alt, kind]) => (
                <figure key={f} className={kind}>
                  {shot(f, alt)}
                  <figcaption>{alt}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="shot-group">
            <h2>On the phone</h2>
            <p>The same screens on iPhone, for the walk through the plant.</p>
            <div className="shots phones">
              {phones.map(([f, alt]) => (
                <figure key={f}>
                  {shot(`${f}.jpg`, `${alt} on iPhone`)}
                  <figcaption>{alt}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="shot-group">
            <h2>How it’s built</h2>
            <p>Swift and SwiftUI throughout, designed so a plant can run it without a server or an IT project.</p>
            <div className="grid-2" style={{ marginTop: 28 }}>
              {built.map(([t, d]) => (
                <article className="card" key={t}>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="note">
            More at <a href="https://maintlytics.com" target="_blank" rel="noopener">maintlytics.com</a>.
          </p>
        </div>
      </section>
      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={() => setZoom(null)}>
          <img src={zoom.src} alt={zoom.alt} />
          <button type="button" aria-label="Close">×</button>
        </div>
      )}
    </Layout>
  );
}
