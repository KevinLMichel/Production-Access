import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSource = path.join(
  os.homedir(),
  "Downloads",
  "Book Downlo",
  "A_Book_for_the_Fragmented_Who_Seek_to_Become_Whole_extracted_from_KDP.docx"
);
const sourceDocx = process.env.FRAGMENTED_DOCX ? path.resolve(process.env.FRAGMENTED_DOCX) : defaultSource;
const outputDir = path.join(root, "src", "content", "book-chapters", "fragmented-become-whole");
const updated = "2026-05-21";

const summaries = new Map([
  ["the-shattered-mirror", "The prologue enters the fractured mirror and introduces the voices seeking a deeper wholeness."],
  ["the-whisper-of-wholeness", "The first chapter hears wholeness as a quiet presence beneath divided thoughts, fear, and longing."],
  ["the-underground-resistance", "The divided self meets resistance, cynicism, and the fragile courage required to begin."],
  ["the-alchemists-counsel", "The Alchemist teaches healing as tending, listening, and welcoming the exiled parts of the self."],
  ["across-the-threshold-of-change", "The journey crosses from insight into action, relationship, and the risk of living more truthfully."],
  ["shadows-and-storms-within", "The book turns toward shame, old fear, and the storms that reveal what still asks to be held."],
  ["the-world-as-mirror", "Outer life becomes a mirror for inner alignment, testing whether wholeness can stand in ordinary pressure."],
  ["the-deepest-cave-confronting-the-shadow-self", "The self descends to meet the Shadow not as an enemy to destroy, but as pain asking to come home."],
  ["the-alchemy-of-transformation", "Transformation begins to remake fracture into material for a truer and more compassionate self."],
  ["rebirth-the-union-of-opposites", "Opposing voices learn to belong together, and the self emerges through integration rather than erasure."],
  ["wholeness-in-the-world-the-elixir-shared", "The inner work returns to the world as steadier presence, service, and lived example."],
  ["the-journey-of-one-the-journey-of-all", "The epilogue closes with a letter from the gathered self and a blessing for the path ahead."]
]);

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function textFromParagraph(paragraph) {
  const pieces = [];
  const tokenPattern = /<w:t[^>]*>([\s\S]*?)<\/w:t>|<w:br\b[^>]*\/>|<w:tab\b[^>]*\/>/g;

  for (const match of paragraph.matchAll(tokenPattern)) {
    if (match[1] !== undefined) {
      pieces.push(decodeXml(match[1]));
    } else if (match[0].startsWith("<w:br")) {
      pieces.push("\n");
    } else {
      pieces.push("\t");
    }
  }

  return pieces.join("").replace(/\u00a0/g, " ").trim();
}

function textFromDocumentXml(xml) {
  const paragraphMatches = xml.match(/<w:p[\s\S]*?<\/w:p>/g) ?? [];
  return paragraphMatches.map(textFromParagraph).filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function partForSection(order) {
  if (order === 0) return "Opening - The Shattered Mirror";
  if (order <= 2) return "Movement I - Fracture and First Light";
  if (order <= 4) return "Movement II - Inner Council and Threshold";
  if (order <= 7) return "Movement III - Shadow and Mirror";
  if (order <= 9) return "Movement IV - Alchemy and Rebirth";
  return "Movement V - The Elixir Shared";
}

function parseHeading(paragraph) {
  const normalized = paragraph.replace(/\s+/g, " ").trim();

  if (/^Prologue:/i.test(normalized)) {
    return {
      order: 0,
      title: normalized.replace(/^Prologue:\s*/i, ""),
      heading: "Prologue"
    };
  }

  const chapterMatch = normalized.match(/^Chapter\s+(\d+):\s*(.+)$/i);
  if (chapterMatch) {
    return {
      order: Number(chapterMatch[1]),
      title: chapterMatch[2].trim(),
      heading: `Chapter ${chapterMatch[1]}`
    };
  }

  if (/^Epilogue:/i.test(normalized)) {
    return {
      order: 11,
      title: normalized.replace(/^Epilogue:\s*/i, ""),
      heading: "Epilogue"
    };
  }

  return null;
}

function formatParagraph(paragraph) {
  const lines = paragraph
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return "";

  const speakerEndIndex = lines.findIndex((line, index) => index < 4 && line.endsWith(":"));
  if (speakerEndIndex >= 0) {
    const speaker = lines
      .slice(0, speakerEndIndex + 1)
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/:$/, "");

    if (/^(?:The\s+)?[A-Z][A-Za-z ]+(?:\s+\([^)]+\))?$/.test(speaker)) {
      const rest = lines.slice(speakerEndIndex + 1);
      if (!rest.length) return `**${speaker}:**`;
      return [`**${speaker}:**`, ...rest].join("<br />\n");
    }
  }

  if (lines.length > 1) {
    return lines.join("<br />\n");
  }

  return lines[0];
}

function bodyToMarkdown(paragraphs) {
  return paragraphs.map(formatParagraph).filter(Boolean).join("\n\n");
}

function frontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

const zip = new AdmZip(sourceDocx);
const documentEntry = zip.getEntry("word/document.xml");

if (!documentEntry) {
  throw new Error(`Unable to read ${sourceDocx}`);
}

const paragraphs = textFromDocumentXml(documentEntry.getData().toString("utf8"));
const sections = [];
let current = null;

for (const paragraph of paragraphs) {
  const heading = parseHeading(paragraph);

  if (heading) {
    if (current) sections.push(current);
    current = { ...heading, paragraphs: [] };
    continue;
  }

  if (
    current &&
    paragraph !== "A Book for the Fragmented Who Seek to Become Whole" &&
    paragraph !== "by Kevin L. Michel"
  ) {
    current.paragraphs.push(paragraph);
  }
}

if (current) sections.push(current);

if (sections.length !== 12) {
  throw new Error(`Expected 12 sections, found ${sections.length}.`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

for (const section of sections) {
  const slug = slugify(section.title);
  const filename = `${String(section.order).padStart(2, "0")}-${slug}.md`;
  const markdown = [
    frontmatter({
      bookSlug: "fragmented-become-whole",
      title: section.title,
      subtitle: section.heading,
      part: partForSection(section.order),
      order: section.order,
      summary: summaries.get(slug) ?? `A section from A Book for the Fragmented Who Seek to Become Whole: ${section.title}.`,
      updated
    }),
    "",
    bodyToMarkdown(section.paragraphs),
    ""
  ].join("\n");

  await fs.writeFile(path.join(outputDir, filename), markdown, "utf8");
}

console.log(`Extracted ${sections.length} sections to ${outputDir}`);
