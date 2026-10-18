export function NotFound() {
  return (
    <main className="band" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="wrap cta">
        <span className="eyebrow" style={{ color: 'var(--amber)' }}>Error 404</span>
        <h2>Unplanned downtime.</h2>
        <p>That page doesn't exist. Let's get you back on schedule.</p>
        <div className="actions"><a className="btn btn-amber" href="/">Back to home</a></div>
      </div>
    </main>
  );
}
