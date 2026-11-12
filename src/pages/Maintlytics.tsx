import { Layout } from '../components/Layout';

const features: [string, string][] = [
  ['KPIs that explain themselves', 'Schedule compliance, PM compliance, backlog, emergency work, MTBF and MTTR — each with the work orders behind the number.'],
  ['Weekly schedule and board', 'Plan the week by crew and shift, see what moved, and track every job from planned to done.'],
  ['Reliability tools', 'Bad-actor ranking, Weibull analysis, FMEA, and root cause records tied to the equipment history.'],
  ['Every device', 'A native Mac app with iPhone, iPad, and Apple Watch companions that stay in sync.'],
];

const shots: [string, string][] = [
  ['overview', 'Overview: the week’s KPIs at a glance'],
  ['board', 'Shop-floor KPI board for the plant TV'],
  ['reliability', 'Reliability: MTBF, MTTR, and bad actors'],
  ['fmea', 'FMEA worksheet'],
];

const phones: [string, string][] = [
  ['phone-overview', 'Overview on iPhone'],
  ['phone-today', 'Today on iPhone'],
  ['phone-board', 'Shop-floor board on iPhone'],
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
            {features.map(([t, d]) => (
              <article className="card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <div className="shots">
            {shots.map(([f, alt]) => (
              <figure key={f}>
                <img src={`/assets/maintlytics/${f}.jpg`} alt={alt} loading="lazy" width={1600} height={1000} />
                <figcaption>{alt}</figcaption>
              </figure>
            ))}
          </div>
          <div className="shots phones">
            {phones.map(([f, alt]) => (
              <figure key={f}>
                <img src={`/assets/maintlytics/${f}.jpg`} alt={alt} loading="lazy" width={780} height={1688} />
                <figcaption>{alt}</figcaption>
              </figure>
            ))}
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
