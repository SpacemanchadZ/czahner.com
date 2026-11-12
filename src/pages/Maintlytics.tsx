import { Layout } from '../components/Layout';

const facts: [string, string][] = [
  ['4 platforms', 'Mac, iPhone, iPad, and Apple Watch, plus a Windows version and a browser view for the shop floor.'],
  ['18 screens', 'Dashboards, planning tools, reliability analysis, and printable reports — all from the same work order data.'],
  ['Every number checkable', 'Tap any KPI to see the work orders it was counted from.'],
  ['Stays in sync', 'Notes, plans, and analyses made on one device show up on the others.'],
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
                    <img src={`/assets/maintlytics/${f}.jpg`} alt={alt} loading="lazy" />
                    <figcaption>{alt}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
          <div className="shot-group">
            <h2>On the phone</h2>
            <p>The same screens on iPhone, for the walk through the plant.</p>
            <div className="shots phones">
              {phones.map(([f, alt]) => (
                <figure key={f}>
                  <img src={`/assets/maintlytics/${f}.jpg`} alt={`${alt} on iPhone`} loading="lazy" />
                  <figcaption>{alt}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <p className="note">
            Screenshots show a made-up demo plant — no real plant names, people, or numbers. Built in Swift and SwiftUI.
            More at <a href="https://maintlytics.com" target="_blank" rel="noopener">maintlytics.com</a>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
