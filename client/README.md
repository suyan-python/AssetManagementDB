# Company Asset Dashboard — Frontend

React + Vite frontend conversion of the supplied single-file prototype.

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project structure

```text
src/
  components/
    common/       Reusable badges, cards, modal, tables, form fields
    layout/       App header and navigation
  data/           Sample data and initial state
  hooks/          App state and asset workflows
  pages/          Dashboard, assets, employees, repairs, activity, settings, notes
  utils/          Date, formatting and asset helpers
  App.jsx
  main.jsx
  styles.css
```

## Current scope

- Frontend only. All records are held in React state and reset when the page reloads.
- Sample companies, employees and assets are included.
- Company and role selectors are demonstrations, not authentication or authorization.
- Finance/MD cost visibility is a frontend presentation rule only. It must be enforced again by the backend.
- Excel import/export, file uploads, authentication, persistence, audit security and API integration are intentionally not implemented yet.

## Backend-ready direction

The UI is separated from sample data and state workflows. Later, replace the in-memory functions in `src/hooks/useAssetStore.js` with API calls and move validation/business rules to Express services. Do not treat frontend checks as security controls.
