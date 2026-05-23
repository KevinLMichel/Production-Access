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
npm run extract:steam
npm run extract:subconscious
npm run extract:kindness-algorithm
npm run extract:mental-toughness-dreams
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

## Steam Over Cold Steel PDF

Regenerate the downloadable Steam Over Cold Steel interior PDF after section changes:

```powershell
npm run book:pdf:steam
```

The generated file is committed at `public/downloads/steam-over-cold-steel-kevin-l-michel.pdf`.
Run `npm run build` before pushing so Render publishes the current static site and PDF asset.

Current generated interior: 46 pages at 5.5 x 8.5 inches.

## The Subconscious Advantage PDF

Regenerate the downloadable The Subconscious Advantage interior PDF after chapter changes:

```powershell
npm run book:pdf:subconscious
```

The generated file is committed at `public/downloads/the-subconscious-advantage-kevin-l-michel.pdf`.
Run `npm run build` before pushing so Render publishes the current static site and PDF asset.

Current generated interior: 180 pages at 5.5 x 8.5 inches.

## The Kindness Algorithm PDF

Regenerate the downloadable The Kindness Algorithm interior PDF after chapter changes:

```powershell
npm run book:pdf:kindness
```

The generated file is committed at `public/downloads/the-kindness-algorithm-kevin-l-michel.pdf`.
Run `npm run build` before pushing so Render publishes the current static site and PDF asset.

Current generated interior: 199 pages at 5.5 x 8.5 inches.

## Mental Toughness PDF

Regenerate the downloadable Mental Toughness interior PDF after chapter changes:

```powershell
npm run book:pdf:mental-toughness
```

The generated file is committed at `public/downloads/mental-toughness-kevin-l-michel.pdf`.
Run `npm run build` before pushing so Render publishes the current static site and PDF asset.

Current generated interior: 185 pages at 5.5 x 8.5 inches.

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

## Steam Over Cold Steel Cover

Regenerate the KDP paperback cover wrap after the paperback page count/template changes:

```powershell
npm run book:cover:steam
```

The generated release asset is written to `production/covers/output/steam-over-cold-steel-cover-wrap.pdf`.
It uses the 46-page, black-and-white groundwood KDP template MediaBox geometry: `11.3611 x 8.75` inches with a `0.1111` inch blank spine.

## The Subconscious Advantage Cover

Regenerate the KDP paperback cover wrap after the paperback page count/template changes:

```powershell
npm run book:cover:subconscious
```

The generated release asset is written to `production/covers/output/the-subconscious-advantage-cover-wrap.pdf`.
It uses the 180-page, black-and-white groundwood KDP template PDF MediaBox geometry: `11.6667 x 8.75` inches with a `0.423` inch spine.

## The Kindness Algorithm Cover

Regenerate the KDP paperback cover wrap after the paperback page count/template changes:

```powershell
npm run book:cover:kindness
```

The generated release asset is written to `production/covers/output/the-kindness-algorithm-cover-wrap.pdf`.
It uses the 199-page, black-and-white groundwood KDP template PDF MediaBox geometry: `11.722222 x 8.75` inches with a `0.472222` inch spine.

## Mental Toughness Cover

Regenerate the KDP paperback cover wrap after the paperback page count/template changes:

```powershell
npm run book:cover:mental-toughness
```

The generated release asset is written to `production/covers/output/mental-toughness-cover-wrap.pdf`.
It uses the 185-page, black-and-white groundwood KDP template PDF MediaBox geometry: `11.680556 x 8.75` inches with a `0.430556` inch spine.

## Render

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- No database or environment variables required for v1.
