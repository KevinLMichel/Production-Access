import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath =
  process.env.BOOK_ACCESS_SKYBORN_MUST_FALL_INPUT ??
  path.join(process.env.USERPROFILE ?? "", "Downloads", "Book Downlo", "the_skyborn_must_fall_full_draft.md");
const outputDir = path.join(root, "src", "content", "book-chapters", "skyborn-must-fall");
const updated = "2026-05-24";

const sections = [
  {
    marker: "## Chapter One: The Law of Altitude",
    title: "The Law of Altitude",
    subtitle: "Chapter One",
    part: "I - Altitude and Distance"
  },
  {
    marker: "## Chapter Two: The Man Who Would Not Beg",
    title: "The Man Who Would Not Beg",
    subtitle: "Chapter Two",
    part: "I - Altitude and Distance"
  },
  {
    marker: "## Chapter Three: Aurel Touches Dust",
    title: "Aurel Touches Dust",
    subtitle: "Chapter Three",
    part: "I - Altitude and Distance"
  },
  {
    marker: "## Chapter Four: The Court Below",
    title: "The Court Below",
    subtitle: "Chapter Four",
    part: "II - Court, Question, and Summons"
  },
  {
    marker: "## Chapter Five: The Philosopher's Last Question",
    title: "The Philosopher's Last Question",
    subtitle: "Chapter Five",
    part: "II - Court, Question, and Summons"
  },
  {
    marker: "## Chapter Six: The Summons of Clear Air",
    title: "The Summons of Clear Air",
    subtitle: "Chapter Six",
    part: "II - Court, Question, and Summons"
  },
  {
    marker: "## Chapter Seven: Trial Above the Clouds",
    title: "Trial Above the Clouds",
    subtitle: "Chapter Seven",
    part: "III - Witness and Origin"
  },
  {
    marker: "## Chapter Eight: Witnesses of Dust",
    title: "Witnesses of Dust",
    subtitle: "Chapter Eight",
    part: "III - Witness and Origin"
  },
  {
    marker: "## Chapter Nine: The Origin of the Skyborn",
    title: "The Origin of the Skyborn",
    subtitle: "Chapter Nine",
    part: "III - Witness and Origin"
  },
  {
    marker: "## Chapter Ten: The Verdict of Weight",
    title: "The Verdict of Weight",
    subtitle: "Chapter Ten",
    part: "IV - Weight and Rain"
  },
  {
    marker: "## Chapter Eleven: The Descent of Heaven",
    title: "The Descent of Heaven",
    subtitle: "Chapter Eleven",
    part: "IV - Weight and Rain"
  },
  {
    marker: "## Chapter Twelve: After the First Rain",
    title: "After the First Rain",
    subtitle: "Chapter Twelve",
    part: "IV - Weight and Rain",
    truncateAt: "# End"
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

function markerPattern(marker) {
  return new RegExp(`^${escapeRegex(marker)}\\s*$`, "m");
}

function cleanText(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
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
    const next = sections[index + 1];
    if (next) {
      const nextMatch = findMarker(text, next.marker);
      bodyEnd = nextMatch.index;
    }
  }

  return { start: bodyStart, end: bodyEnd };
}

function summarize(body, fallbackTitle) {
  const compact = body
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
    const body = cleanText(source.slice(start, end));
    return { ...section, order: index, body, summary: summarize(body, section.title) };
  });

  if (generated.length !== 12) {
    throw new Error(`Expected 12 sections, generated ${generated.length}`);
  }

  for (const section of generated) {
    const filename = `${String(section.order).padStart(2, "0")}-${slugify(section.title)}.md`;
    const markdown = [
      frontmatter({
        bookSlug: "skyborn-must-fall",
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

  console.log(`skyborn-must-fall: ${generated.length} sections`);
}

await main();
