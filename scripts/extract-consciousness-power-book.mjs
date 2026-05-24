import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_CONSCIOUSNESS_POWER_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "The Consciousness of Power.md");
const outputDir = path.join(root, "src", "content", "book-chapters", "consciousness-of-power");
const updated = "2026-05-24";

const sections = [
  {
    marker: "### Power Is Not What You Think",
    title: "Power Is Not What You Think",
    subtitle: "Introduction",
    part: "Introduction"
  },
  {
    marker: "### Awakening the Operator",
    title: "Awakening the Operator",
    subtitle: "Part I",
    part: "Part I - Awakening the Operator"
  },
  {
    marker: "#### The Self Before It Speaks",
    title: "The Self Before It Speaks",
    subtitle: "Chapter 1",
    part: "Part I - Awakening the Operator"
  },
  {
    marker: "#### Presence as a Nervous-System Signal",
    title: "Presence as a Nervous-System Signal",
    subtitle: "Chapter 2",
    part: "Part I - Awakening the Operator"
  },
  {
    marker: "### Choice Under Pressure",
    title: "Choice Under Pressure",
    subtitle: "Part II",
    part: "Part II - Choice Under Pressure"
  },
  {
    marker: "#### Why Stories Hijack Power",
    title: "Why Stories Hijack Power",
    subtitle: "Chapter 3",
    part: "Part II - Choice Under Pressure"
  },
  {
    marker: "#### The Person Who Can Pause",
    title: "The Person Who Can Pause",
    subtitle: "Chapter 4",
    part: "Part II - Choice Under Pressure"
  },
  {
    marker: "### Influence Without Performance",
    title: "Influence Without Performance",
    subtitle: "Part III",
    part: "Part III - Influence Without Performance"
  },
  {
    marker: "#### Influence Without Performance",
    title: "Influence Without Performance",
    subtitle: "Chapter 5",
    part: "Part III - Influence Without Performance"
  },
  {
    marker: "#### Conscious Defaults",
    title: "Conscious Defaults",
    subtitle: "Chapter 6",
    part: "Part III - Influence Without Performance"
  },
  {
    marker: "#### The Will That Watches Itself",
    title: "The Will That Watches Itself",
    subtitle: "Chapter 7",
    part: "Part III - Influence Without Performance"
  },
  {
    marker: "### The Awakened Instrument",
    title: "The Awakened Instrument",
    subtitle: "Coda",
    part: "Coda"
  },
  {
    marker: "### Appendix",
    title: "Reader Tools and Practices",
    subtitle: "Appendix",
    part: "Back Matter",
    truncateAt: "#### Production Notes for Final Edition"
  },
  {
    marker: "### Bibliography",
    title: "Bibliography",
    subtitle: "Bibliography",
    part: "Back Matter",
    truncateAt: "### Draft Index"
  },
  {
    marker: "### Author Bio",
    title: "Author Bio",
    subtitle: "Author Bio",
    part: "Back Matter"
  }
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripPrivateCitations(value) {
  return value.replace(/\s*\uE200[\s\S]*?\uE201/g, "");
}

function cleanText(value) {
  return stripPrivateCitations(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function markerPattern(marker) {
  return new RegExp(`^${escapeRegex(marker)}\\s*$`, "m");
}

function findMarker(text, marker) {
  const match = text.match(markerPattern(marker));
  if (!match || match.index === undefined) {
    throw new Error(`Unable to find marker: ${marker}`);
  }
  return { index: match.index, length: match[0].length };
}

function findSectionBounds(text, index) {
  const current = sections[index];
  const currentMatch = findMarker(text, current.marker);
  const bodyStart = currentMatch.index + currentMatch.length;

  let bodyEnd = text.length;
  if (current.truncateAt) {
    const slice = text.slice(bodyStart);
    const truncateMatch = slice.match(markerPattern(current.truncateAt));
    if (truncateMatch?.index !== undefined) bodyEnd = bodyStart + truncateMatch.index;
  } else {
    const nextMarkers = sections.slice(index + 1).map((section) => section.marker);
    const nextPositions = nextMarkers
      .map((marker) => {
        const slice = text.slice(bodyStart);
        const match = slice.match(markerPattern(marker));
        return match?.index === undefined ? undefined : bodyStart + match.index;
      })
      .filter((position) => position !== undefined);
    if (nextPositions.length) bodyEnd = Math.min(...nextPositions);
  }

  return { start: bodyStart, end: bodyEnd };
}

function powerFigureHtml(kind) {
  if (kind === "pre-speech") {
    return `<figure class="power-figure power-figure--sequence">
  <div class="power-figure__label">Figure</div>
  <svg viewBox="0 0 980 420" role="img" aria-labelledby="power-figure-2-title power-figure-2-desc">
    <title id="power-figure-2-title">The pre-speech sequence</title>
    <desc id="power-figure-2-desc">Challenge, body response, interpretation, motive, and speech arranged as a sequence with a conscious pause before words.</desc>
    <defs>
      <marker id="power-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
        <path d="M0,0 L0,6 L7,3 z" />
      </marker>
    </defs>
    <path class="power-path" d="M110 210 H850" marker-end="url(#power-arrow)" />
    <g class="power-node"><circle cx="120" cy="210" r="54" /><text x="120" y="204">Challenge</text><text x="120" y="226">arrives</text></g>
    <g class="power-node"><circle cx="300" cy="210" r="54" /><text x="300" y="204">Body</text><text x="300" y="226">signal</text></g>
    <g class="power-node"><circle cx="480" cy="210" r="54" /><text x="480" y="204">Story</text><text x="480" y="226">forms</text></g>
    <g class="power-node"><circle cx="660" cy="210" r="54" /><text x="660" y="204">Motive</text><text x="660" y="226">moves</text></g>
    <g class="power-node power-node--speech"><circle cx="840" cy="210" r="54" /><text x="840" y="204">Speech</text><text x="840" y="226">leaves</text></g>
    <path class="power-pause" d="M385 92 C430 50 540 50 590 92" />
    <text class="power-pause-text" x="488" y="76">conscious pause</text>
    <path class="power-drop" d="M488 94 V152" />
  </svg>
  <figcaption>A simple diagram of challenge to body response to interpretation to motive to speech, showing where consciousness can intervene before words are spoken.</figcaption>
</figure>`;
  }

  return `<figure class="power-figure power-figure--comparison">
  <div class="power-figure__label">Figure</div>
  <svg viewBox="0 0 980 460" role="img" aria-labelledby="power-figure-1-title power-figure-1-desc">
    <title id="power-figure-1-title">Performative power versus conscious power</title>
    <desc id="power-figure-1-desc">Two panels contrast image-management, status, and immediate control with perception, regulation, and chosen response.</desc>
    <rect class="power-panel power-panel--dark" x="72" y="70" width="370" height="300" rx="28" />
    <rect class="power-panel power-panel--light" x="538" y="70" width="370" height="300" rx="28" />
    <text class="power-title" x="257" y="128">Performative Power</text>
    <text class="power-title" x="723" y="128">Conscious Power</text>
    <path class="power-orbit" d="M152 206 C210 150 302 150 360 206 C302 260 210 260 152 206Z" />
    <circle class="power-eye" cx="256" cy="206" r="22" />
    <path class="power-machine" d="M645 206 h92 m-46 -46 v92 m-70 -46 a70 70 0 1 0 140 0 a70 70 0 1 0 -140 0" />
    <text class="power-small" x="257" y="288">appearance • status • control</text>
    <text class="power-small" x="723" y="288">perception • regulation • response</text>
    <path class="power-rule" d="M492 92 V348" />
  </svg>
  <figcaption>Visual contrast between power as image-management and power as self-governance.</figcaption>
</figure>`;
}

function replaceFigurePlaceholders(body) {
  const lines = body.split("\n");
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!/^>\s*\*\*Figure placeholder:\*\*/.test(line.trim())) {
      output.push(line);
      continue;
    }

    const kind = /pre-speech/i.test(line) ? "pre-speech" : "comparison";
    while (index + 1 < lines.length && lines[index + 1].trim().startsWith(">")) {
      index += 1;
    }
    output.push(powerFigureHtml(kind));
  }

  return output.join("\n");
}

function cleanBody(body, section) {
  let cleaned = cleanText(body);
  cleaned = replaceFigurePlaceholders(cleaned);
  cleaned = cleaned.replace(/^####\s+/gm, "## ");
  cleaned = cleaned.replace(/^###\s+/gm, "## ");
  cleaned = cleaned.replace(/^##\s*Reader Tools and Practices\s*$/m, "");
  cleaned = cleaned.replace(
    /This author bio is drafted in publication-ready placeholder form[\s\S]*?as appropriate\.\s*$/m,
    ""
  );
  if (section.title === "Bibliography") cleaned = cleaned.replace(/^##\s*Bibliography\s*/m, "");
  if (section.title === "Reader Tools and Practices") cleaned = cleaned.replace(/^##\s*Appendix\s*/m, "");
  return cleanText(cleaned);
}

function summarize(body, fallbackTitle) {
  const compact = body
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = compact.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? compact.slice(0, 180);
  return sentence || fallbackTitle;
}

async function main() {
  const source = cleanText(await fs.readFile(sourcePath, "utf8"));
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const generated = sections.map((section, index) => {
    const { start, end } = findSectionBounds(source, index);
    const body = cleanBody(source.slice(start, end), section);
    return { ...section, order: index, body, summary: summarize(body, section.title) };
  });

  if (generated.length !== 15) {
    throw new Error(`Expected 15 sections, generated ${generated.length}`);
  }

  for (const section of generated) {
    const filename = `${String(section.order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const markdown = [
      frontmatter({
        bookSlug: "consciousness-of-power",
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

  console.log(`consciousness-of-power: ${generated.length} sections`);
}

await main();
