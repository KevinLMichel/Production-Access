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

## Book Text Extraction

Regenerate committed Markdown chapters from local DOCX source files when a source manuscript changes:

```powershell
npm run extract:freedom
npm run extract:fragmented
npm run extract:subconscious
```

Raw DOCX folders remain local inputs and are ignored by Git.

## Freedom by Design PDF

Regenerate the downloadable Freedom by Design interior PDF after chapter changes:

```powershell
npm run book:pdf:freedom
```

The generated file is committed at `public/downloads/freedom-by-design-kevin-l-michel.pdf`.
Run `npm run build` before pushing so Render publishes the current static site and PDF asset.

Current generated interior: 225 pages at 5.5 x 8.5 inches.

## A Book for the Fragmented PDF

Regenerate the downloadable A Book for the Fragmented Who Seek to Become Whole interior PDF after chapter changes:

```powershell
npm run book:pdf:fragmented
```

The generated file is committed at `public/downloads/a-book-for-the-fragmented-kevin-l-michel.pdf`.
Run `npm run build` before pushing so Render publishes the current static site and PDF asset.

Current generated interior: 405 pages at 5.5 x 8.5 inches.

## Freedom by Design Cover

Regenerate the KDP paperback cover wrap after the paperback page count/template changes:

```powershell
npm run book:cover:freedom
```

The generated release asset is written to `production/covers/output/freedom-by-design-cover-wrap.pdf`.
It uses the 230-page, black-and-white groundwood KDP template geometry: `11.7916667 x 8.75` inches with a `0.5416667` inch spine.

## A Book for the Fragmented Cover

Regenerate the KDP paperback cover wrap after the paperback page count/template changes:

```powershell
npm run book:cover:fragmented
```

The generated release asset is written to `production/covers/output/a-book-for-the-fragmented-cover-wrap.pdf`.
It uses the 405-page, black-and-white groundwood KDP template geometry: `12.202 x 8.75` inches with a `0.952` inch spine.

## Render

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- No database or environment variables required for v1.
