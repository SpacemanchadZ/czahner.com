# czahner.com

[![Build and deploy](https://github.com/SpacemanchadZ/czahner.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/SpacemanchadZ/czahner.com/actions/workflows/deploy.yml)

Personal site of **Chad Zahner** — maintenance planner & scheduler, RMIC, U.S. Navy veteran — and the planning tools I build.
Live at **[czahner.com](https://czahner.com)**.

## What's here

| Path | What it is |
|---|---|
| [`/`](https://czahner.com) | Home — results, background, featured projects |
| [`/resume/`](https://czahner.com/resume/) | Résumé with print-to-PDF styling |
| [`/lab/`](https://czahner.com/lab/) | Project index |
| [`/lab/job-plan-builder/`](https://czahner.com/lab/job-plan-builder/) | **Job Plan Builder** — drafts a maintenance job plan from a plain-English description, checks it against a job plan standard, exports to Word |
| [`/lab/kpi-dashboard/`](https://czahner.com/lab/kpi-dashboard/) | **Maintenance KPI Dashboard** — computes planning and reliability KPIs from raw work-order data (sample plant or your own CSV) |

All demos run entirely in the browser. Nothing is uploaded anywhere; sample data is fictional.

## Tech

- **React 18 + TypeScript (strict)**, bundled by **Vite** as a multi-page app
- Static pages are **pre-rendered to HTML at build time** (`scripts/prerender.tsx`) and hydrated on load — fast first paint, readable without JavaScript, good link previews
- **Vitest** unit tests for all business logic (KPI math, job plan generation, plan checks, CSV parsing, Word export)
- **GitHub Actions** type-checks, tests, builds, and deploys to GitHub Pages on every push to `main`
- Libraries: `recharts` (charts), `docx` (Word export), `papaparse` (CSV), `pdfjs-dist` (reading drawings, lazy-loaded), `@dnd-kit` (drag-to-reorder steps)

## Project layout

```
src/
  components/        shared layout, nav, icons, tool frame
  content/           site copy as typed data (career, projects, KPIs)
  pages/             Home, Résumé, Lab, 404
  entries/           one entry per HTML page
  tools/
    job-plan/        Job Plan Builder
      generator.ts     rule-based drafting (energy sources, quantities, part numbers, repeat steps)
      lint.ts          plan check: LOTO, sequence, placeholders, parts cross-check
      reducer.ts       every edit as a typed action
      docx.ts          Word document builder
      storage.ts       autosave, saved plans, JSON import/export
    kpi/             Maintenance KPI Dashboard
      metrics.ts       KPI definitions (planned work, PM/schedule compliance, MTBF, MTTR, backlog)
      csv.ts           CMMS export import with header aliasing
      alerts.ts        rule-based weekly callouts
      sampleData.ts    seeded generator for the demo plant
scripts/prerender.tsx  build-time HTML rendering
public/                images, CNAME, redirects for old URLs
```

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests
npm run ci         # typecheck + tests + production build
```

## KPI definitions

| KPI | Formula |
|---|---|
| Planned work | PM + planned corrective labor hours ÷ all closed labor hours |
| PM compliance | PMs completed within the grace window (default 7 days) of their due date ÷ PMs due |
| Schedule compliance | Scheduled jobs completed in their scheduled week ÷ scheduled jobs |
| Breakdown labor | Breakdown labor hours ÷ all closed labor hours |
| Backlog | Open planned labor hours ÷ crew hours per week |
| MTBF / MTTR | Run hours ÷ breakdowns · breakdown downtime ÷ breakdowns |

---
© Chad Zahner
