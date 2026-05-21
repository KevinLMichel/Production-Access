# Kevin L. Michel - The Library

An Astro-powered catalogue hub for books by Kevin L. Michel.

## Local Development

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## Freedom by Design PDF

Regenerate the downloadable Freedom by Design interior PDF after chapter changes:

```powershell
npm run book:pdf:freedom
```

The generated file is committed at `public/downloads/freedom-by-design-kevin-l-michel.pdf`.
Run `npm run build` before pushing so Render publishes the current static site and PDF asset.

Current generated interior: 225 pages at 5.5 x 8.5 inches.

## Render

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- No database or environment variables required for v1.
