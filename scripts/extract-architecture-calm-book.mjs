import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_ARCHITECTURE_CALM_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "The Architecture of Calm by Kevin_L_Michel.md");
const outputDir = path.join(root, "src", "content", "book-chapters", "architecture-of-calm");
const updated = "2026-05-24";

const sections = [
  {
    marker: "INTRODUCTION",
    title: "The House You Keep Setting on Fire",
    subtitle: "Introduction",
    part: "The House Crisis Built"
  },
  { marker: "CHAPTER ONE", title: "Your Chaos Baseline", subtitle: "Chapter 1", part: "Part I - Your Chaos Baseline" },
  {
    marker: "CHAPTER TWO",
    title: "When Peace Feels Dangerous",
    subtitle: "Chapter 2",
    part: "Part I - Your Chaos Baseline"
  },
  { marker: "CHAPTER THREE", title: "The Inner Weather", subtitle: "Chapter 3", part: "Part I - Your Chaos Baseline" },
  {
    marker: "CHAPTER FOUR",
    title: "The Thermostat of the Self",
    subtitle: "Chapter 4",
    part: "Part I - Your Chaos Baseline"
  },
  { marker: "CHAPTER FIVE", title: "The Hidden Invoice", subtitle: "Chapter 5", part: "Part I - Your Chaos Baseline" },
  {
    marker: "CHAPTER SIX",
    title: "The Foundation: Sleep, Breath, Body",
    subtitle: "Chapter 6",
    part: "Part II - The House Calm Builds"
  },
  {
    marker: "CHAPTER SEVEN",
    title: "Thresholds: Morning, Midday, Evening",
    subtitle: "Chapter 7",
    part: "Part II - The House Calm Builds"
  },
  {
    marker: "CHAPTER EIGHT",
    title: "Rooms: Designing the Spaces You Live Inside",
    subtitle: "Chapter 8",
    part: "Part II - The House Calm Builds"
  },
  {
    marker: "CHAPTER NINE",
    title: "Load-Bearing Walls: Boundaries, Buffers, and Plans",
    subtitle: "Chapter 9",
    part: "Part II - The House Calm Builds"
  },
  {
    marker: "CHAPTER TEN",
    title: "Windows: Attention, Perspective, and the Art of Seeing",
    subtitle: "Chapter 10",
    part: "Part II - The House Calm Builds"
  },
  {
    marker: "CHAPTER ELEVEN",
    title: "The Forge: Challenge Without Burnout",
    subtitle: "Chapter 11",
    part: "Part II - The House Calm Builds"
  },
  {
    marker: "CHAPTER TWELVE",
    title: "The Quiet House: A 30-Day Build",
    subtitle: "Chapter 12",
    part: "Part II - The House Calm Builds"
  },
  { marker: "CODA", title: "The Steady Climb", subtitle: "Coda", part: "Coda" },
  { marker: "APPENDIX", title: "Worksheets for Building Calm", subtitle: "Appendix", part: "Appendix" },
  { marker: "## References", title: "References", subtitle: "References", part: "References" }
];

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function frontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    lines.push(typeof value === "number" ? `${key}: ${value}` : `${key}: ${JSON.stringify(value)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

function stripCitationArtifacts(value) {
  return value
    .replace(/\uE200[\s\S]*?\uE201/g, "")
    .replace(/\s+\./g, ".")
    .replace(/\s+,/g, ",");
}

function cleanText(value) {
  return stripCitationArtifacts(value)
    .replace(/\[Page Break\]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markerPattern(marker) {
  if (marker === "## References") return /^## References\s*$/m;
  return new RegExp(`^${marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
}

function findSectionBounds(text, index) {
  const current = sections[index];
  const currentMatch = text.match(markerPattern(current.marker));
  if (!currentMatch || currentMatch.index === undefined) {
    throw new Error(`Unable to find ${current.marker}`);
  }

  const nextMarkers = sections.slice(index + 1).map((section) => markerPattern(section.marker));
  const nextPositions = nextMarkers
    .map((pattern) => {
      const slice = text.slice(currentMatch.index + currentMatch[0].length);
      const match = slice.match(pattern);
      return match?.index === undefined ? undefined : currentMatch.index + currentMatch[0].length + match.index;
    })
    .filter((position) => position !== undefined);

  return {
    start: currentMatch.index + currentMatch[0].length,
    end: nextPositions.length ? Math.min(...nextPositions) : text.length
  };
}

function removeSectionTitle(body, title) {
  const lines = body.split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines[0]?.trim() === title) lines.shift();
  return lines.join("\n").trim();
}

function figureHtml(index) {
  const figures = [
    {
      modifier: "house-map",
      title: "The Architecture of Calm",
      caption: "The Architecture of Calm: a visual map of the life systems this book rebuilds.",
      body: `
<svg viewBox="0 0 900 520" role="img" aria-labelledby="calm-figure-1-title calm-figure-1-desc">
  <title id="calm-figure-1-title">House systems diagram</title>
  <desc id="calm-figure-1-desc">A calm house cross-section labeled foundation, frame, walls, rooms, thresholds, windows, roof, garden, maintenance, and fire plan.</desc>
  <path class="calm-stone" d="M130 258 L450 70 L770 258 Z" />
  <path class="calm-line" d="M180 250 L180 438 H720 V250" />
  <path class="calm-line thick" d="M130 258 L450 70 L770 258" />
  <path class="calm-line" d="M260 438 V288 H640 V438" />
  <path class="calm-line" d="M450 438 V120" />
  <path class="calm-line" d="M260 330 H640" />
  <rect class="calm-accent-box" x="286" y="344" width="120" height="78" rx="8" />
  <rect class="calm-accent-box" x="494" y="344" width="120" height="78" rx="8" />
  <rect class="calm-window" x="300" y="260" width="86" height="50" rx="8" />
  <rect class="calm-window" x="514" y="260" width="86" height="50" rx="8" />
  <path class="calm-garden" d="M110 438 C150 400 186 456 228 424 C264 396 282 448 320 430" />
  <path class="calm-garden" d="M580 430 C622 402 652 454 694 420 C732 390 760 446 804 424" />
  <text x="450" y="112">Roof</text>
  <text x="450" y="155">Frame</text>
  <text x="450" y="245">Thresholds</text>
  <text x="344" y="292">Windows</text>
  <text x="557" y="292">Rooms</text>
  <text x="345" y="388">Maintenance</text>
  <text x="555" y="388">Fire Plan</text>
  <text x="450" y="462">Foundation</text>
  <text x="204" y="366">Walls</text>
  <text x="716" y="404">Garden</text>
</svg>`
    },
    {
      modifier: "chaos-audit",
      title: "Chaos Baseline Audit",
      caption: "The Chaos Baseline Audit helps separate weather from design.",
      body: `
<svg viewBox="0 0 900 520" role="img" aria-labelledby="calm-figure-2-title calm-figure-2-desc">
  <title id="calm-figure-2-title">Seven-day chaos baseline worksheet</title>
  <desc id="calm-figure-2-desc">A seven-day audit grid with columns for rating, unavoidable chaos, preventable chaos, self-created strain, and response notes.</desc>
  <rect class="calm-paper" x="90" y="70" width="720" height="380" rx="22" />
  <text class="calm-heading" x="450" y="120">Seven-Day Chaos Baseline Audit</text>
  <g class="calm-grid">
    <path d="M130 154 H770 M130 205 H770 M130 256 H770 M130 307 H770 M130 358 H770 M130 409 H770" />
    <path d="M210 154 V430 M315 154 V430 M455 154 V430 M600 154 V430" />
  </g>
  <text x="168" y="184">Day</text>
  <text x="262" y="184">Rating</text>
  <text x="382" y="184">Real weather</text>
  <text x="528" y="184">Design fire</text>
  <text x="684" y="184">Repair note</text>
  <text x="168" y="235">1</text><text x="168" y="286">2</text><text x="168" y="337">3</text><text x="168" y="388">...</text>
  <path class="calm-gold-line" d="M250 232 h35 M250 283 h35 M250 334 h35 M250 385 h35" />
  <path class="calm-pencil" d="M350 232 h70 M500 232 h72 M642 232 h90 M350 283 h70 M500 283 h72 M642 283 h90 M350 334 h70 M500 334 h72 M642 334 h90 M350 385 h70 M500 385 h72 M642 385 h90" />
</svg>`
    },
    {
      modifier: "foundation-pillars",
      title: "Foundation Practices",
      caption: "Foundation practices are small, physical, and repeatable.",
      body: `
<svg viewBox="0 0 900 520" role="img" aria-labelledby="calm-figure-3-title calm-figure-3-desc">
  <title id="calm-figure-3-title">Three foundation pillars</title>
  <desc id="calm-figure-3-desc">Sleep, breath, and body scan as three pillars supporting a calm house foundation.</desc>
  <path class="calm-stone" d="M170 186 L450 78 L730 186 Z" />
  <path class="calm-line thick" d="M168 186 H732" />
  <rect class="calm-pillar" x="210" y="206" width="132" height="214" rx="12" />
  <rect class="calm-pillar" x="384" y="206" width="132" height="214" rx="12" />
  <rect class="calm-pillar" x="558" y="206" width="132" height="214" rx="12" />
  <path class="calm-line thick" d="M156 420 H744" />
  <path class="calm-icon" d="M248 268 h56 q18 0 18 18 v28 h-92 v-28 q0-18 18-18z M232 314 h88" />
  <path class="calm-icon" d="M450 254 C398 304 422 360 450 360 C478 360 502 304 450 254z" />
  <path class="calm-icon" d="M624 258 C582 290 584 342 624 366 C664 342 666 290 624 258z M624 288 v76" />
  <text x="276" y="388">Sleep</text>
  <text x="450" y="388">Breath</text>
  <text x="624" y="388">Body Scan</text>
  <text class="calm-heading" x="450" y="155">Stable Floor First</text>
</svg>`
    },
    {
      modifier: "room-reset",
      title: "Rooms Are Behavioral Teachers",
      caption: "Rooms are behavioral teachers.",
      body: `
<svg viewBox="0 0 900 520" role="img" aria-labelledby="calm-figure-4-title calm-figure-4-desc">
  <title id="calm-figure-4-title">Before and after room reset</title>
  <desc id="calm-figure-4-desc">A noisy desk and phone home screen simplified into a calmer one-task environment.</desc>
  <text class="calm-heading" x="255" y="82">Before</text>
  <text class="calm-heading" x="645" y="82">After</text>
  <rect class="calm-paper" x="100" y="112" width="310" height="300" rx="24" />
  <rect class="calm-paper" x="490" y="112" width="310" height="300" rx="24" />
  <path class="calm-desk" d="M140 336 H370 M170 266 h90 v58 h-90z M278 232 h52 v92 h-52z" />
  <path class="calm-chaos" d="M140 150 l70 54 M220 150 l-64 94 M286 154 l78 38 M350 240 l-90-56" />
  <circle class="calm-alert" cx="328" cy="210" r="14" />
  <circle class="calm-alert" cx="198" cy="230" r="10" />
  <path class="calm-desk" d="M532 336 H758 M564 270 h104 v54 h-104z M690 244 h42 v80 h-42z" />
  <path class="calm-gold-line" d="M586 196 H704 M586 222 H670" />
  <circle class="calm-window-dot" cx="730" cy="288" r="16" />
  <text x="255" y="456">noise, open loops, scattered cues</text>
  <text x="645" y="456">one task, clean cue, calmer entry</text>
</svg>`
    },
    {
      modifier: "load-bearing",
      title: "Load-Bearing Calm",
      caption: "Some structures protect freedom by limiting collapse.",
      body: `
<svg viewBox="0 0 900 520" role="img" aria-labelledby="calm-figure-5-title calm-figure-5-desc">
  <title id="calm-figure-5-title">Load-bearing calm supports</title>
  <desc id="calm-figure-5-desc">A house cutaway with three highlighted supports labeled boundaries, buffers, and plans.</desc>
  <path class="calm-stone" d="M146 208 L450 74 L754 208 Z" />
  <path class="calm-line thick" d="M146 208 H754" />
  <path class="calm-line" d="M184 208 V424 H716 V208" />
  <rect class="calm-support" x="244" y="230" width="126" height="194" rx="12" />
  <rect class="calm-support" x="388" y="230" width="126" height="194" rx="12" />
  <rect class="calm-support" x="532" y="230" width="126" height="194" rx="12" />
  <text x="307" y="306">Boundaries</text>
  <text x="451" y="306">Buffers</text>
  <text x="595" y="306">Plans</text>
  <text class="calm-small" x="307" y="348">clear yes/no</text>
  <text class="calm-small" x="451" y="348">room to absorb</text>
  <text class="calm-small" x="595" y="348">if-then repair</text>
  <path class="calm-gold-line" d="M220 424 H680" />
</svg>`
    },
    {
      modifier: "quiet-house-build",
      title: "30-Day Quiet House Build",
      caption: "Calm becomes durable when change follows a build order.",
      body: `
<svg viewBox="0 0 900 520" role="img" aria-labelledby="calm-figure-6-title calm-figure-6-desc">
  <title id="calm-figure-6-title">Thirty-day quiet house roadmap</title>
  <desc id="calm-figure-6-desc">A four-week roadmap labeled survey, foundation, structure, and integration.</desc>
  <text class="calm-heading" x="450" y="88">30-Day Quiet House Build</text>
  <path class="calm-road" d="M132 286 C250 136 340 410 450 258 C560 106 650 396 768 220" />
  <g class="calm-week">
    <circle cx="150" cy="282" r="54" /><text x="150" y="274">Week 1</text><text x="150" y="302">Survey</text>
    <circle cx="350" cy="330" r="54" /><text x="350" y="322">Week 2</text><text x="350" y="350">Foundation</text>
    <circle cx="550" cy="226" r="54" /><text x="550" y="218">Week 3</text><text x="550" y="246">Structure</text>
    <circle cx="750" cy="220" r="54" /><text x="750" y="212">Week 4</text><text x="750" y="240">Integration</text>
  </g>
  <path class="calm-pencil" d="M150 356 v50 M350 404 v38 M550 300 v58 M750 294 v58" />
  <text class="calm-small" x="150" y="430">notice patterns</text>
  <text class="calm-small" x="350" y="466">stabilize body</text>
  <text class="calm-small" x="550" y="382">install supports</text>
  <text class="calm-small" x="750" y="376">keep the blueprint</text>
</svg>`
    }
  ];

  const figure = figures[index - 1];
  if (!figure) throw new Error(`Unknown figure ${index}`);

  return `<figure class="calm-figure calm-figure--${figure.modifier}">
  <div class="calm-figure__label">Figure ${index}</div>
  ${figure.body}
  <figcaption>${figure.caption}</figcaption>
</figure>`;
}

function replaceFigureBlocks(body, state) {
  const lines = body.split("\n");
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() !== "[Figure Placeholder]") {
      output.push(lines[index]);
      continue;
    }

    while (index + 1 < lines.length && lines[index + 1].trim()) {
      index += 1;
    }

    output.push(figureHtml(state.figureIndex));
    state.figureIndex += 1;
  }

  return output.join("\n");
}

function improveSubheads(body) {
  return body
    .replace(/^Research Note\s*$/gm, "### Research Note")
    .replace(/^Practice\s*$/gm, "### Practice")
    .replace(/^#{0,6}\s*Back Matter\s*$/gm, "")
    .replace(/^Worksheet (One|Two|Three|Four|Five|Six|Seven|Eight|Nine)\s*\n([^\n]+)$/gm, "## Worksheet $1: $2")
    .replace(/^APPENDIX\s*\n+Worksheets for Building Calm\s*/m, "")
    .replace(/^## References\s*/m, "");
}

function removeDraftBackMatterFromReferences(body) {
  return body
    .split("\n")
    .filter((line) => !/^Project Brief for \*The Architecture of Calm\*/.test(line.trim()))
    .join("\n");
}

function keepReaderCleanAppendix(body) {
  return body.split(/^Figure and Table Placements\s*$/m)[0].trim();
}

function summarize(body, fallbackTitle) {
  const compact = body
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = compact.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 180);
  return sentence || fallbackTitle;
}

async function main() {
  const source = cleanText(await fs.readFile(sourcePath, "utf8"));
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const figureState = { figureIndex: 1 };
  const generated = sections.map((section, index) => {
    const { start, end } = findSectionBounds(source, index);
    let body = cleanText(source.slice(start, end));
    body = removeSectionTitle(body, section.title);
    body = replaceFigureBlocks(body, figureState);
    body = improveSubheads(body);
    if (section.marker === "APPENDIX") body = keepReaderCleanAppendix(body);
    if (section.marker === "## References") body = removeDraftBackMatterFromReferences(body);
    body = cleanText(body);

    return { ...section, order: index, body, summary: summarize(body, section.title) };
  });

  if (figureState.figureIndex !== 7) {
    throw new Error(`Expected 6 figure placeholders, found ${figureState.figureIndex - 1}`);
  }

  if (generated.length !== 16) {
    throw new Error(`Expected 16 sections, generated ${generated.length}`);
  }

  for (const section of generated) {
    const filename = `${String(section.order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const markdown = [
      frontmatter({
        bookSlug: "architecture-of-calm",
        title: section.title,
        subtitle: section.subtitle,
        part: section.part,
        order: section.order,
        summary: section.summary,
        updated
      }),
      "",
      section.body,
      ""
    ].join("\n");
    await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
  }

  console.log(`architecture-of-calm: ${generated.length} sections`);
}

await main();
